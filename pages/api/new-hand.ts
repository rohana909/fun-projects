import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, setRoom } from '@/lib/gameStore';
import { dealCards, anticlockwiseNext } from '@/lib/gameLogic';
import { broadcastRoomState } from '@/lib/pusher';

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    return res.status(403).json({ error: 'Only the host can start a new hand' });
  }

  if (room.status !== 'hand_complete') {
    return res.status(400).json({ error: 'Hand is not complete yet' });
  }

  // Rotate dealer anticlockwise
  const newDealer = anticlockwiseNext(room.dealer);
  const hands = dealCards(newDealer);

  room.dealer = newDealer;
  room.hands = hands;
  room.status = 'playing';
  room.currentTurn = (newDealer + 3) % 4; // player to new dealer's right
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

  await broadcastRoomState(room, 'game-started');

  return res.status(200).json({ success: true });
}
