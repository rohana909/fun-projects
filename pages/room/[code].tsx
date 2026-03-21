import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Card, Player, TrickCard, CompletedTrick, HandResult, Suit } from '@/lib/gameLogic';
import Lobby from '@/components/Lobby';
import GameBoard, { RoomState } from '@/components/GameBoard';
import EndHandModal from '@/components/EndHandModal';

interface PlayerInfo {
  playerId: string;
  name: string;
  seat: number;
}

export default function RoomPage() {
  const router = useRouter();
  const { code, name: nameQuery } = router.query as { code?: string; name?: string };

  const [gameState, setGameState] = useState<RoomState | null>(null);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [loadError, setLoadError] = useState('');
  const hasAutoJoined = useRef(false);

  // Load player info from localStorage on mount or when code changes
  useEffect(() => {
    if (!code) return;
    const stored = localStorage.getItem(`mendikot_player_${code}`);
    if (stored) {
      try {
        setPlayerInfo(JSON.parse(stored));
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem(`mendikot_player_${code}`);
      }
    }
  }, [code]);

  // Fetch initial room state
  useEffect(() => {
    if (!code) return;
    fetch(`/api/room-state?code=${code}`)
      .then((res) => {
        if (!res.ok) throw new Error('Room not found');
        return res.json();
      })
      .then((data) => setGameState(data))
      .catch((err) => setLoadError(err.message || 'Failed to load room'));
  }, [code]);

  // Auto-join if name query param is present and not yet joined
  useEffect(() => {
    if (!code || !nameQuery || playerInfo || hasAutoJoined.current || joining) return;
    hasAutoJoined.current = true;
    handleJoin(nameQuery);
  }, [code, nameQuery, playerInfo]);

  // Polling: fetch room state every 1000ms
  useEffect(() => {
    if (!code) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/room-state?code=${code}`);
        if (!res.ok) return;
        const data = await res.json();
        setGameState(data);
      } catch {
        // Skip on error, try again next tick
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [code]);

  const handleJoin = async (name: string) => {
    if (!code || !name.trim()) return;
    setJoining(true);
    setJoinError('');

    try {
      const res = await fetch('/api/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setJoinError(data.error || 'Failed to join room');
        setJoining(false);
        return;
      }

      const info: PlayerInfo = {
        playerId: data.playerId,
        name: name.trim(),
        seat: data.seat,
      };

      localStorage.setItem(`mendikot_player_${code}`, JSON.stringify(info));
      setPlayerInfo(info);

      // Update local game state with new players list
      setGameState((prev) =>
        prev ? { ...prev, players: data.players } : prev
      );
    } catch (err) {
      setJoinError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleJoinForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleJoin(joinName);
  };

  const handleStartGame = async () => {
    if (!code || !playerInfo) return;
    const res = await fetch('/api/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, playerId: playerInfo.playerId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setLastError(data.error || 'Failed to start game');
      setTimeout(() => setLastError(null), 3000);
    }
  };

  const handlePlayCard = async (card: Card) => {
    if (!code || !playerInfo) return;
    const res = await fetch('/api/play-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, playerId: playerInfo.playerId, card }),
    });
    if (!res.ok) {
      const data = await res.json();
      setLastError(data.error || 'Invalid move');
      setTimeout(() => setLastError(null), 2500);
    }
  };

  const handleNewHand = async () => {
    if (!code || !playerInfo) return;
    const res = await fetch('/api/new-hand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, playerId: playerInfo.playerId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setLastError(data.error || 'Failed to start new hand');
      setTimeout(() => setLastError(null), 3000);
    }
  };

  // Sync playerInfo.seat when game starts (seat assignments may have changed)
  useEffect(() => {
    if (!gameState || !playerInfo || !code) return;
    if (gameState.status === 'playing') {
      const me = gameState.players.find((p) => p.id === playerInfo.playerId);
      if (me && me.seat !== playerInfo.seat) {
        const updated = { ...playerInfo, seat: me.seat };
        localStorage.setItem(`mendikot_player_${code}`, JSON.stringify(updated));
        setPlayerInfo(updated);
      }
    }
  }, [gameState?.status]);

  // Check if current player is the room host by playerId
  const isHost = !!playerInfo && !!gameState && (
    playerInfo.playerId === gameState.hostId ||
    gameState.players.find(p => p.id === playerInfo.playerId)?.seat === 0
  );

  // Loading state
  if (loadError) {
    return (
      <div className="min-h-screen bg-felt flex items-center justify-center">
        <div className="bg-felt-dark border border-red-700 rounded-2xl p-6 text-center max-w-sm">
          <p className="text-red-400 text-lg font-bold mb-2">Room not found</p>
          <p className="text-green-500 text-sm mb-4">{loadError}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-felt flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-green-300">Loading room...</p>
        </div>
      </div>
    );
  }

  // No player info: show join form
  if (!playerInfo) {
    return (
      <div className="min-h-screen bg-felt flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-felt-dark border border-green-700 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-white text-2xl font-bold mb-1">Join Room</h1>
          <p className="text-green-400 text-sm mb-4">
            Room code: <span className="font-mono font-bold text-white">{code}</span>
          </p>

          {gameState.status !== 'waiting' && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm">This game has already started.</p>
            </div>
          )}

          {gameState.players.length >= 4 && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm">This room is full.</p>
            </div>
          )}

          <form onSubmit={handleJoinForm} className="flex flex-col gap-3">
            <div>
              <label className="block text-green-300 text-sm mb-1">Your Name</label>
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                disabled={joining || gameState.status !== 'waiting' || gameState.players.length >= 4}
                className="w-full px-4 py-2 rounded-lg bg-felt-light text-white placeholder-green-600 border border-green-600 focus:outline-none focus:border-green-400 disabled:opacity-50"
              />
            </div>
            {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
            <button
              type="submit"
              disabled={joining || gameState.status !== 'waiting' || gameState.players.length >= 4}
              className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {joining ? 'Joining...' : 'Join Game'}
            </button>
          </form>

          <p className="text-green-600 text-xs mt-4 text-center">
            {gameState.players.length}/4 players joined
          </p>
        </div>
      </div>
    );
  }

  // Lobby
  if (gameState.status === 'waiting') {
    return (
      <>
        <Lobby
          roomCode={code!}
          players={gameState.players}
          isHost={isHost}
          myName={playerInfo.name}
          myPlayerId={playerInfo.playerId}
          onStartGame={handleStartGame}
        />
        {lastError && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {lastError}
          </div>
        )}
      </>
    );
  }

  const [showHandResult, setShowHandResult] = useState(false);

  // When hand completes, reset modal visibility so host can review the board first
  const prevStatus = useRef<string | null>(null);
  useEffect(() => {
    if (!gameState) return;
    if (prevStatus.current === 'playing' && gameState.status === 'hand_complete') {
      setShowHandResult(false); // hide modal — let players see last trick first
      // Non-hosts auto-reveal results after 4 seconds
      if (!isHost) {
        setTimeout(() => setShowHandResult(true), 4000);
      }
    }
    if (gameState.status === 'playing') {
      setShowHandResult(false);
    }
    prevStatus.current = gameState.status;
  }, [gameState?.status]);

  // Game in progress or hand complete
  return (
    <div className="flex flex-col min-h-screen">
      <GameBoard
        gameState={gameState}
        mySeat={playerInfo.seat}
        myPlayerId={playerInfo.playerId}
        onPlayCard={handlePlayCard}
        onNewHand={handleNewHand}
        isHost={isHost}
        lastError={lastError}
      />

      {/* Host "Hand Done" banner — shown when hand is complete, before result modal */}
      {gameState.status === 'hand_complete' && !showHandResult && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center gap-2 pb-4 pt-3 bg-felt-dark border-t border-green-700">
          <p className="text-green-300 text-sm">Hand is over — last trick shown above</p>
          {isHost ? (
            <button
              onClick={() => setShowHandResult(true)}
              className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-base transition-colors shadow-lg"
            >
              See Results →
            </button>
          ) : (
            <p className="text-green-600 text-xs">Results showing in a moment...</p>
          )}
        </div>
      )}

      {/* End hand modal overlay — only after host taps "See Results" */}
      {gameState.status === 'hand_complete' && gameState.handResult && showHandResult && (
        <EndHandModal
          result={gameState.handResult}
          score={gameState.score}
          players={gameState.players}
          isHost={isHost}
          onNewHand={handleNewHand}
        />
      )}
    </div>
  );
}
