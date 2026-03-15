import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  // Create game state
  const [createName, setCreateName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join game state
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');

  // Play vs Bots state
  const [botName, setBotName] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const [botError, setBotError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError('Please enter your name');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: createName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setCreateError(data.error || 'Failed to create room');
        return;
      }

      const { code, playerId, seat } = await res.json();

      // Store player info in localStorage
      localStorage.setItem(
        `mendikot_player_${code}`,
        JSON.stringify({ playerId, name: createName.trim(), seat })
      );

      router.push(`/room/${code}`);
    } catch (err) {
      setCreateError('Network error. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handlePlayVsBots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim()) {
      setBotError('Please enter your name');
      return;
    }

    setBotLoading(true);
    setBotError('');

    try {
      const res = await fetch('/api/create-bot-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: botName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setBotError(data.error || 'Failed to create game');
        return;
      }

      const { code, playerId, seat } = await res.json();

      localStorage.setItem(
        `mendikot_player_${code}`,
        JSON.stringify({ playerId, name: botName.trim(), seat })
      );

      router.push(`/room/${code}`);
    } catch {
      setBotError('Network error. Please try again.');
    } finally {
      setBotLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setJoinError('Please enter a room code');
      return;
    }
    if (!joinName.trim()) {
      setJoinError('Please enter your name');
      return;
    }

    // Redirect to room page with name query param — join happens there
    router.push(
      `/room/${joinCode.trim().toUpperCase()}?name=${encodeURIComponent(joinName.trim())}`
    );
  };

  return (
    <div className="min-h-screen bg-felt flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-6xl font-bold text-white tracking-wide drop-shadow-lg">
          Mendikot
        </h1>
        <p className="text-green-300 text-xl mt-2 font-light">
          The Classic Indian Card Game
        </p>
        <div className="flex justify-center gap-4 mt-3 text-3xl">
          <span>♠</span>
          <span className="text-red-400">♥</span>
          <span className="text-red-400">♦</span>
          <span>♣</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Create Game */}
        <div className="flex-1 bg-felt-dark border border-green-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-white text-2xl font-bold mb-4">Create Game</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <label className="block text-green-300 text-sm mb-1">Your Name</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-2 rounded-lg bg-felt-light text-white placeholder-green-600 border border-green-600 focus:outline-none focus:border-green-400"
              />
            </div>
            {createError && (
              <p className="text-red-400 text-sm">{createError}</p>
            )}
            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-400 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {createLoading ? 'Creating...' : 'Create Game'}
            </button>
          </form>
          <p className="text-green-600 text-xs mt-3">
            You&apos;ll get a 6-letter code to share with friends.
          </p>
        </div>

        {/* Divider */}
        <div className="flex md:flex-col items-center justify-center">
          <div className="flex-1 border-t md:border-l border-green-700"></div>
          <span className="text-green-600 px-3 py-2 text-sm font-medium">OR</span>
          <div className="flex-1 border-t md:border-l border-green-700"></div>
        </div>

        {/* Join Game */}
        <div className="flex-1 bg-felt-dark border border-green-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-white text-2xl font-bold mb-4">Join Game</h2>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <div>
              <label className="block text-green-300 text-sm mb-1">Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-letter code"
                maxLength={6}
                className="w-full px-4 py-2 rounded-lg bg-felt-light text-white placeholder-green-600 border border-green-600 focus:outline-none focus:border-green-400 font-mono tracking-widest text-center uppercase"
              />
            </div>
            <div>
              <label className="block text-green-300 text-sm mb-1">Your Name</label>
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-2 rounded-lg bg-felt-light text-white placeholder-green-600 border border-green-600 focus:outline-none focus:border-green-400"
              />
            </div>
            {joinError && (
              <p className="text-red-400 text-sm">{joinError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              Join Game
            </button>
          </form>
          <p className="text-green-600 text-xs mt-3">
            Get the room code from the game creator.
          </p>
        </div>
      </div>

      {/* Play vs Bots */}
      <div className="w-full max-w-2xl mt-6">
        <div className="bg-felt-dark border border-green-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-white text-2xl font-bold mb-1">Play vs Bots</h2>
          <p className="text-green-500 text-sm mb-4">Solo practice — you play against 3 bots</p>
          <form onSubmit={handlePlayVsBots} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-green-300 text-sm mb-1">Your Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-2 rounded-lg bg-felt-light text-white placeholder-green-600 border border-green-600 focus:outline-none focus:border-green-400"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                disabled={botLoading}
                className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold transition-colors whitespace-nowrap"
              >
                {botLoading ? 'Starting...' : 'Play vs Bots'}
              </button>
            </div>
          </form>
          {botError && <p className="text-red-400 text-sm mt-2">{botError}</p>}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-green-700 text-xs mt-10 text-center">
        4 players required &bull; Teams: Seats 0 &amp; 2 vs Seats 1 &amp; 3
      </p>
    </div>
  );
}
