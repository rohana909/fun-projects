import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, saveRoom } from '@/lib/gameStore';
import {
  Card,
  Suit,
  TrickCard,
  CompletedTrick,
  GameRoom,
  anticlockwiseNext,
  determineTrickWinner,
  calculateHandResult,
  getTeam,
  rankValue,
} from '@/lib/gameLogic';

export const config = { api: { bodyParser: true } };

function countTens(cards: TrickCard[]): number {
  return cards.filter((tc) => tc.card.rank === '10').length;
}

function selectBotCard(
  hand: Card[],
  ledSuit: Suit | null,
  trumpSuit: Suit | null,
  isTrickEmpty: boolean
): Card {
  // Leading a trick: play highest card
  if (isTrickEmpty || !ledSuit) {
    return hand.reduce((best, card) =>
      rankValue(card.rank) < rankValue(best.rank) ? card : best
    );
  }

  // Following: prefer led suit with lowest card
  const ledSuitCards = hand.filter((c) => c.suit === ledSuit);
  if (ledSuitCards.length > 0) {
    return ledSuitCards.reduce((worst, card) =>
      rankValue(card.rank) > rankValue(worst.rank) ? card : worst
    );
  }

  // Can't follow suit — trump not yet set: play lowest card overall (triggers cut hukum)
  if (!trumpSuit) {
    return hand.reduce((worst, card) =>
      rankValue(card.rank) > rankValue(worst.rank) ? card : worst
    );
  }

  // Trump set: play lowest trump if available
  const trumpCards = hand.filter((c) => c.suit === trumpSuit);
  if (trumpCards.length > 0) {
    return trumpCards.reduce((worst, card) =>
      rankValue(card.rank) > rankValue(worst.rank) ? card : worst
    );
  }

  // No trump in hand: play lowest card
  return hand.reduce((worst, card) =>
    rankValue(card.rank) > rankValue(worst.rank) ? card : worst
  );
}

// Play one bot turn, mutating room in place
function playBotTurn(room: GameRoom): void {
  const botSeat = room.currentTurn;
  const hand = room.hands[botSeat];
  if (!hand || hand.length === 0) return;

  const isTrickEmpty = room.currentTrick.length === 0;
  const card = selectBotCard(hand, room.ledSuit, room.trumpSuit, isTrickEmpty);

  // Cut hukum: trump not set, not leading, and bot can't follow led suit
  if (!room.trumpSuit && !isTrickEmpty && room.ledSuit) {
    const hasLedSuit = hand.some((c) => c.suit === room.ledSuit);
    if (!hasLedSuit) {
      room.trumpSuit = card.suit;
      room.trumpSetBySeat = botSeat;
    }
  }

  // Remove card from hand
  const cardIndex = hand.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
  hand.splice(cardIndex, 1);
  room.hands[botSeat] = hand;

  // Set led suit if leading the trick
  if (isTrickEmpty) {
    room.ledSuit = card.suit;
  }

  // Add card to trick
  room.currentTrick.push({ seat: botSeat, card });

  // Trick not yet complete: advance turn
  if (room.currentTrick.length < 4) {
    room.currentTurn = anticlockwiseNext(botSeat);
    return;
  }

  // Trick complete
  const winner = determineTrickWinner(room.currentTrick, room.ledSuit!, room.trumpSuit);
  const winnerTeam = getTeam(winner);

  room.trickCount[winnerTeam]++;

  // Track captured tens by suit
  if (!room.capturedTens) room.capturedTens = {};
  for (const tc of room.currentTrick) {
    if (tc.card.rank === '10') {
      room.capturedTens[tc.card.suit] = winnerTeam;
    }
  }
  room.tensCount[0] = Object.values(room.capturedTens).filter((t) => t === 0).length;
  room.tensCount[1] = Object.values(room.capturedTens).filter((t) => t === 1).length;

  const completedTrick: CompletedTrick = { winner, cards: [...room.currentTrick] };
  room.completedTricks.push(completedTrick);
  room.lastTrick = completedTrick;

  // Hand complete (all 13 tricks played)
  if (room.completedTricks.length === 13) {
    const result = calculateHandResult(room);
    room.score[result.winner]++;
    room.status = 'hand_complete';
    room.handResult = result;
    room.ledSuit = null;
    return;
  }

  // Freeze — wait for host to ack
  room.trickPendingAck = true;
  room.currentTurn = winner;
}

function isBotSeat(room: GameRoom, seat: number): boolean {
  return room.players.some((p) => p.seat === seat && p.isBot === true);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  const room = await getRoom(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Auto-play bots until it is the human's turn (or hand is over)
  if (room.status === 'playing') {
    let changed = false;
    while (room.status === 'playing' && !room.trickPendingAck && isBotSeat(room, room.currentTurn)) {
      playBotTurn(room);
      changed = true;
    }
    if (changed) {
      await saveRoom(room.code, room);
    }
  }

  // Return sanitized state (without sensitive internal fields)
  return res.status(200).json({
    code: room.code,
    hostId: room.hostId,
    players: room.players,
    status: room.status,
    hands: room.hands,
    dealer: room.dealer,
    currentTurn: room.currentTurn,
    ledSuit: room.ledSuit,
    trumpSuit: room.trumpSuit,
    trumpSetBySeat: room.trumpSetBySeat,
    currentTrick: room.currentTrick,
    trickCount: room.trickCount,
    tensCount: room.tensCount,
    capturedTens: room.capturedTens || {},
    lastTrick: room.lastTrick,
    handResult: room.handResult,
    score: room.score,
    seatAssignments: room.seatAssignments,
    trickPendingAck: room.trickPendingAck || false,
  });
}
