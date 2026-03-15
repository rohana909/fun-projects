import { kv } from '@vercel/kv';
import { GameRoom } from './gameLogic';

export function createRoom(code: string, hostId: string): GameRoom {
  const room: GameRoom = {
    code,
    hostId,
    players: [],
    status: 'waiting',
    hands: {},
    dealer: 0,
    currentTurn: 0,
    ledSuit: null,
    trumpSuit: null,
    trumpSetBySeat: null,
    currentTrick: [],
    completedTricks: [],
    trickCount: [0, 0],
    tensCount: [0, 0],
    lastTrick: null,
    handResult: null,
    score: [0, 0],
    seatAssignments: {},
  };
  return room;
}

export async function getRoom(code: string): Promise<GameRoom | null> {
  return kv.get<GameRoom>(code);
}

export async function saveRoom(code: string, room: GameRoom): Promise<void> {
  await kv.set(code, room, { ex: 3600 });
}

// 6-char alphanumeric uppercase, no ambiguous chars (0, O, I, 1, L)
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return code;
}
