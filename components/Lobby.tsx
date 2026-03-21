import { useState } from 'react';
import { Player } from '@/lib/gameLogic';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  myName: string;
  myPlayerId: string;
  onStartGame: () => void;
}

export default function Lobby({
  roomCode,
  players,
  isHost,
  myName,
  myPlayerId,
  onStartGame,
}: LobbyProps) {
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

  const fourPlayersJoined = players.length === 4;

  // Teams based on join order: seat 0&2 = Team A, seat 1&3 = Team B
  const playerAtSeat = (seat: number) => players.find((p) => p.seat === seat);
  const teamA = [playerAtSeat(0), playerAtSeat(2)];
  const teamB = [playerAtSeat(1), playerAtSeat(3)];

  return (
    <div className="min-h-screen bg-felt flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-felt-dark border border-green-700 rounded-2xl p-6 shadow-2xl">
        {/* Room code */}
        <div className="text-center mb-5">
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

        {/* Players list */}
        <div className="mb-5">
          <p className="text-green-500 text-xs mb-2 uppercase tracking-wide font-semibold">
            Players ({players.length}/4)
          </p>
          <div className="flex flex-col gap-2">
            {players.map((player) => {
              const isMe = player.id === myPlayerId;
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-2 bg-felt border border-green-700 rounded-lg px-3 py-2"
                >
                  <span className="text-white font-semibold text-sm">{player.name}</span>
                  {isMe && <span className="text-yellow-400 text-xs">(you)</span>}
                </div>
              );
            })}
            {Array.from({ length: 4 - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-2 bg-felt-dark border border-dashed border-green-800 rounded-lg px-3 py-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-700 animate-pulse" />
                <span className="text-green-700 text-sm italic">Waiting...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team summary — shown when 4 players joined */}
        {fourPlayersJoined && (
          <div className="bg-felt rounded-xl p-3 mb-5 text-sm">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-green-300 font-bold text-xs mb-1">TEAM A</p>
                {teamA.filter(Boolean).map((p) => (
                  <p key={p!.id} className="text-white text-xs">{p!.name}</p>
                ))}
              </div>
              <div className="text-green-700 self-center text-lg font-bold">vs</div>
              <div className="text-center">
                <p className="text-blue-300 font-bold text-xs mb-1">TEAM B</p>
                {teamB.filter(Boolean).map((p) => (
                  <p key={p!.id} className="text-white text-xs">{p!.name}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Start button / waiting */}
        {fourPlayersJoined ? (
          isHost ? (
            <button
              onClick={onStartGame}
              className="w-full py-3 rounded-xl font-bold text-lg bg-green-500 hover:bg-green-400 text-white shadow-lg transition-colors"
            >
              Start Game
            </button>
          ) : (
            <div className="text-center text-green-500 text-sm py-2">
              Waiting for host to start...
            </div>
          )
        ) : (
          <div className="text-center text-green-500 text-sm py-2">
            Waiting for {4 - players.length} more player{4 - players.length !== 1 ? 's' : ''}...
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
