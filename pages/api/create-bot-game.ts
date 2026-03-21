import type { NextApiRequest, NextApiResponse } from 'next';
import { createRoom, saveRoom, generateCode } from '@/lib/gameStore';
import { dealCards } from '@/lib/gameLogic';

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerName } = req.body as { playerName?: string };

  const code = generateCode();
  const playerId = `human-${Math.random().toString(36).slice(2, 10)}`;

  const room = createRoom(code, playerId);

  // Add human player at seat 0
  room.players.push({ id: playerId, name: playerName?.trim() || 'You', seat: 0 });
  room.seatAssignments[playerId] = 0;

  // Add 3 bot players at seats 1, 2, 3
  for (let i = 1; i <= 3; i++) {
    const botId = `bot-${i}`;
    room.players.push({ id: botId, name: `Bot${i}`, seat: i, isBot: true });
    room.seatAssignments[botId] = i;
  }

  // Start the game immediately — dealer is human (seat 0)
  room.dealer = 0;
  room.hands = dealCards(room.dealer);
  room.status = 'playing';
  room.currentTurn = (room.dealer + 3) % 4; // player to dealer's right goes first
  room.currentTrick = [];
  room.completedTricks = [];
  room.trickCount = [0, 0];
  room.tensCount = [0, 0];
  room.capturedTens = {};
  room.ledSuit = null;
  room.trumpSuit = null;
  room.trumpSetBySeat = null;
  room.lastTrick = null;
  room.handResult = null;

  await saveRoom(code, room);

  return res.status(200).json({ code, playerId, seat: 0 });
}
