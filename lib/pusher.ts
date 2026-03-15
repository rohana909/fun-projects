import Pusher from 'pusher';

// Singleton server Pusher instance
let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusherInstance;
}

// Helper: broadcast full sanitized room state on a channel
// Room channel name: `room-${code}`
export async function broadcastRoomState(
  room: any,
  event: string,
  extra?: Record<string, any>
): Promise<void> {
  const pusher = getPusher();
  const payload = {
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
    ...extra,
  };
  await pusher.trigger(`room-${room.code}`, event, payload);
}
