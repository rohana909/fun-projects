import { GameRoom } from './gameLogic';

// Module-level singleton — works in dev (single process).
// On Vercel serverless, use a persistent store (Redis) for production.
const rooms = new Map<string, GameRoom>();

export function createRoom(code: string, hostId: string): GameRoom {
  const room: GameRoom = {
    code,
    hostId,
    players: [],
    status: 'waiting',
    hands: {},
    dealer: 0, // host is seat 0, dealer starts at 0
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
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): GameRoom | undefined {
  return rooms.get(code);
}

export function setRoom(code: string, room: GameRoom): void {
  rooms.set(code, room);
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
