import { useState } from 'react';
import { Player } from '@/lib/gameLogic';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  myName: string;
  onStartGame: () => void;
}

export default function Lobby({ roomCode, players, isHost, myName, onStartGame }: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const roomUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomCode}`
      : `/room/${roomCode}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const seats = [0, 1, 2, 3];
  const canStart = players.length === 4;

  return (
    <div className="min-h-screen bg-felt flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-felt-dark border border-green-700 rounded-2xl p-6 shadow-2xl">
        {/* Room code */}
        <div className="text-center mb-6">
          <p className="text-green-400 text-sm mb-1">Share this code:</p>
          <div className="text-4xl font-mono font-bold text-white tracking-widest bg-felt border border-green-600 rounded-xl py-3 px-6 inline-block">
            {roomCode}
          </div>
          <div className="mt-3 flex justify-center">
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy Room Link'}
            </button>
          </div>
          <p className="text-green-600 text-xs mt-2 break-all">{roomUrl}</p>
        </div>

        {/* Team info */}
        <div className="bg-felt rounded-xl p-3 mb-4 text-xs text-green-400">
          <p className="font-semibold mb-1">Teams:</p>
          <p>
            <span className="text-blue-300 font-semibold">Team A</span> — Seats 0 &amp; 2
            &nbsp;|&nbsp;
            <span className="text-orange-300 font-semibold">Team B</span> — Seats 1 &amp; 3
          </p>
        </div>

        {/* Player seats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {seats.map((seat) => {
            const player = players.find((p) => p.seat === seat);
            const team = seat % 2 === 0 ? 'A' : 'B';
            const teamColor = seat % 2 === 0 ? 'text-blue-300' : 'text-orange-300';
            const teamBg = seat % 2 === 0 ? 'border-blue-700' : 'border-orange-700';
            const isMe = player?.name === myName;

            return (
              <div
                key={seat}
                className={`border rounded-lg p-3 ${
                  player ? 'bg-felt border-green-600' : 'bg-felt-dark border-dashed border-green-800'
                } ${teamBg}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-green-500 text-xs">Seat {seat}</span>
                  <span className={`text-xs font-bold ${teamColor}`}>Team {team}</span>
                </div>
                {player ? (
                  <div className="flex items-center gap-1">
                    <span className="text-white font-semibold text-sm truncate">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-yellow-400 text-xs">(you)</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-700 animate-pulse" />
                    <span className="text-green-700 text-sm italic">Waiting...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start button or waiting message */}
        {isHost ? (
          <div>
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
                canStart
                  ? 'bg-green-500 hover:bg-green-400 text-white shadow-lg'
                  : 'bg-green-900 text-green-700 cursor-not-allowed'
              }`}
            >
              {canStart ? 'Start Game' : `Waiting for ${4 - players.length} more player${4 - players.length !== 1 ? 's' : ''}...`}
            </button>
            {!canStart && (
              <p className="text-green-600 text-xs text-center mt-2">
                Share the room code above with 3 friends
              </p>
            )}
          </div>
        ) : (
          <div className="text-center text-green-500 text-sm py-2">
            {canStart
              ? 'All players joined! Waiting for host to start...'
              : `Waiting for ${4 - players.length} more player${4 - players.length !== 1 ? 's' : ''}...`}
          </div>
        )}

        <p className="text-green-700 text-xs text-center mt-4">
          Hello, <span className="text-green-400">{myName}</span>!
          {isHost ? " You're the host." : ''}
        </p>
      </div>
    </div>
  );
}
