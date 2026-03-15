import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, setRoom } from '@/lib/gameStore';
import { Player } from '@/lib/gameLogic';
import { getPusher } from '@/lib/pusher';

export const config = { api: { bodyParser: true } };

function generateId(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, name } = req.body as { code: string; name: string };

  if (!code || !name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Code and name are required' });
  }

  const room = getRoom(code.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.status !== 'waiting') {
    return res.status(400).json({ error: 'Game has already started' });
  }

  if (room.players.length >= 4) {
    return res.status(400).json({ error: 'Room is full' });
  }

  // Find the next available seat (0-3)
  const takenSeats = new Set(room.players.map((p) => p.seat));
  let seat = -1;
  for (let s = 0; s < 4; s++) {
    if (!takenSeats.has(s)) {
      seat = s;
      break;
    }
  }

  if (seat === -1) {
    return res.status(400).json({ error: 'Room is full' });
  }

  const playerId = generateId();

  const player: Player = {
    id: playerId,
    name: name.trim(),
    seat,
  };

  room.players.push(player);
  setRoom(code.toUpperCase(), room);

  // Notify other players
  const pusher = getPusher();
  await pusher.trigger(`room-${room.code}`, 'player-joined', {
    players: room.players,
  });

  return res.status(200).json({ playerId, seat, players: room.players });
}
