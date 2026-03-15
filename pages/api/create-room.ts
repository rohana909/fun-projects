import type { NextApiRequest, NextApiResponse } from 'next';
import { createRoom, generateCode, getRoom, saveRoom } from '@/lib/gameStore';
import { Player } from '@/lib/gameLogic';

export const config = { api: { bodyParser: true } };

function generateId(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hostName } = req.body as { hostName: string };

  if (!hostName || typeof hostName !== 'string' || hostName.trim().length === 0) {
    return res.status(400).json({ error: 'Host name is required' });
  }

  // Generate a unique code (retry on collision)
  let code = generateCode();
  let attempts = 0;
  while ((await getRoom(code)) && attempts < 10) {
    code = generateCode();
    attempts++;
  }

  const hostId = generateId();

  const room = createRoom(code, hostId);

  const host: Player = {
    id: hostId,
    name: hostName.trim(),
    seat: 0,
  };

  room.players.push(host);
  room.seatAssignments[hostId] = 0;
  await saveRoom(code, room);

  return res.status(200).json({ code, playerId: hostId, seat: 0 });
}
