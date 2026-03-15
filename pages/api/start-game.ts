import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, setRoom } from '@/lib/gameStore';
import { dealCards } from '@/lib/gameLogic';

export const config = { api: { bodyParser: true } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, playerId } = req.body as { code: string; playerId: string };

  if (!code || !playerId) {
    return res.status(400).json({ error: 'Code and playerId are required' });
  }

  const room = getRoom(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.hostId !== playerId) {
    return res.status(403).json({ error: 'Only the host can start the game' });
  }

  if (room.players.length !== 4) {
    return res.status(400).json({ error: 'Need exactly 4 players to start' });
  }

  if (room.status !== 'waiting') {
    return res.status(400).json({ error: 'Game has already started' });
  }

  const hands = dealCards(room.dealer);

  room.hands = hands;
  room.status = 'playing';
  room.currentTurn = (room.dealer + 3) % 4; // player to dealer's right goes first
  room.currentTrick = [];
  room.completedTricks = [];
  room.trickCount = [0, 0];
  room.tensCount = [0, 0];
  room.ledSuit = null;
  room.trumpSuit = null;
  room.trumpSetBySeat = null;
  room.lastTrick = null;
  room.handResult = null;

  setRoom(room.code, room);

  return res.status(200).json({ success: true });
}
