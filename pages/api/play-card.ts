import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, saveRoom } from '@/lib/gameStore';
import {
  Card,
  TrickCard,
  CompletedTrick,
  anticlockwiseNext,
  determineTrickWinner,
  calculateHandResult,
  getTeam,
} from '@/lib/gameLogic';

export const config = { api: { bodyParser: true } };

function countTens(cards: TrickCard[]): number {
  return cards.filter((tc) => tc.card.rank === '10').length;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, playerId, card } = req.body as {
    code: string;
    playerId: string;
    card: Card;
  };

  if (!code || !playerId || !card) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const room = await getRoom(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.status !== 'playing') {
    return res.status(400).json({ error: 'Game is not in progress' });
  }

  // Find the player
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return res.status(403).json({ error: 'Player not found in room' });
  }

  const seat = player.seat;

  // Check it's this player's turn
  if (seat !== room.currentTurn) {
    return res.status(400).json({ error: 'Not your turn' });
  }

  // Find card in player's hand
  const hand = room.hands[seat] || [];
  const cardIndex = hand.findIndex(
    (c) => c.suit === card.suit && c.rank === card.rank
  );

  if (cardIndex === -1) {
    return res.status(400).json({ error: 'Card not in hand' });
  }

  // Suit following validation
  if (room.currentTrick.length > 0 && room.ledSuit) {
    const hasLedSuit = hand.some((c) => c.suit === room.ledSuit);
    if (hasLedSuit && card.suit !== room.ledSuit) {
      return res.status(400).json({ error: 'Must follow suit' });
    }
  }

  // Cut Hukum detection: if no trump set and player is not following led suit
  // (already validated they have no led suit cards)
  if (!room.trumpSuit && room.currentTrick.length > 0 && room.ledSuit) {
    const hasLedSuit = hand.some((c) => c.suit === room.ledSuit);
    if (!hasLedSuit && card.suit !== room.ledSuit) {
      // This card's suit becomes trump
      room.trumpSuit = card.suit;
      room.trumpSetBySeat = seat;
    }
  }

  // Remove card from hand
  hand.splice(cardIndex, 1);
  room.hands[seat] = hand;

  // Set led suit if first card of trick
  if (room.currentTrick.length === 0) {
    room.ledSuit = card.suit;
  }

  // Add card to current trick
  const trickCard: TrickCard = { seat, card };
  room.currentTrick.push(trickCard);

  // Check if trick is complete
  if (room.currentTrick.length < 4) {
    // Trick not complete — advance turn anticlockwise
    room.currentTurn = anticlockwiseNext(seat);
    await saveRoom(room.code, room);
    return res.status(200).json({ success: true });
  }

  // Trick complete: determine winner
  const winner = determineTrickWinner(
    room.currentTrick,
    room.ledSuit!,
    room.trumpSuit
  );

  const trickTens = countTens(room.currentTrick);
  const winnerTeam = getTeam(winner);

  room.trickCount[winnerTeam]++;
  room.tensCount[winnerTeam] += trickTens;

  const completedTrick: CompletedTrick = {
    winner,
    cards: [...room.currentTrick],
  };

  room.completedTricks.push(completedTrick);
  room.lastTrick = completedTrick;

  // Check if hand is complete (all 13 tricks played)
  if (room.completedTricks.length === 13) {
    const result = calculateHandResult(room);
    room.score[result.winner]++;
    room.status = 'hand_complete';
    room.handResult = result;
    room.ledSuit = null;
    // Keep currentTrick for display

    await saveRoom(room.code, room);
    return res.status(200).json({ success: true });
  }

  // Not final trick: prepare for next trick
  room.currentTrick = [];
  room.ledSuit = null;
  room.currentTurn = winner;

  await saveRoom(room.code, room);
  return res.status(200).json({ success: true });
}
