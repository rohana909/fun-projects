import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, saveRoom } from '@/lib/gameStore';

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, playerId, assignments } = req.body as {
    code: string;
    playerId: string;
    assignments: Record<string, number>;
  };

  if (!code || !playerId || !assignments || typeof assignments !== 'object') {
    return res.status(400).json({ error: 'code, playerId, and assignments are required' });
  }

  const room = await getRoom(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.hostId !== playerId) {
    return res.status(403).json({ error: 'Only the host can assign seats' });
  }

  if (room.status !== 'waiting') {
    return res.status(400).json({ error: 'Cannot assign seats after game has started' });
  }

  const playerIds = new Set(room.players.map((p) => p.id));

  // Validate all keys are valid player IDs in this room
  for (const pid of Object.keys(assignments)) {
    if (!playerIds.has(pid)) {
      return res.status(400).json({ error: `Unknown player: ${pid}` });
    }
  }

  // Validate seat values are 0-3 with no duplicates
  const usedSeats = new Set<number>();
  for (const seat of Object.values(assignments)) {
    if (typeof seat !== 'number' || seat < 0 || seat > 3 || !Number.isInteger(seat)) {
      return res.status(400).json({ error: 'Seat numbers must be integers 0-3' });
    }
    if (usedSeats.has(seat)) {
      return res.status(400).json({ error: 'Duplicate seat assignment' });
    }
    usedSeats.add(seat);
  }

  room.seatAssignments = assignments;
  await saveRoom(code.toUpperCase(), room);

  return res.status(200).json({ success: true });
}
