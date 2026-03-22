import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, saveRoom } from '@/lib/gameStore';

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, playerId } = req.body as { code: string; playerId: string };

  if (!code || !playerId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const room = await getRoom(code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });

  if (room.hostId !== playerId) {
    return res.status(403).json({ error: 'Only the host can advance the trick' });
  }

  if (!room.trickPendingAck) {
    return res.status(400).json({ error: 'No trick pending acknowledgement' });
  }

  // Clear the trick and advance
  room.trickPendingAck = false;
  room.currentTrick = [];
  room.ledSuit = null;
  // currentTurn is already set to the winner from play-card

  await saveRoom(room.code, room);
  return res.status(200).json({ success: true });
}
