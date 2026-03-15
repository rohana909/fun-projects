import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom } from '@/lib/gameStore';

export const config = { api: { bodyParser: true } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  const room = getRoom(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Return sanitized state (without sensitive internal fields)
  return res.status(200).json({
    code: room.code,
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
    lastTrick: room.lastTrick,
    handResult: room.handResult,
    score: room.score,
  });
}
