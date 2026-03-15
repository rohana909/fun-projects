import { useState } from 'react';
import { Player } from '@/lib/gameLogic';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  myName: string;
  myPlayerId: string;
  seatAssignments: Record<string, number>; // playerId -> seat
  onStartGame: () => void;
  onAssignSeats: (assignments: Record<string, number>) => void;
}

const TEAM_A_SEATS = [0, 2];
const TEAM_B_SEATS = [1, 3];

function getSeatTeam(seat: number): 'A' | 'B' {
  return TEAM_A_SEATS.includes(seat) ? 'A' : 'B';
}

export default function Lobby({
  roomCode,
  players,
  isHost,
  myName,
  myPlayerId,
  seatAssignments,
  onStartGame,
  onAssignSeats,
}: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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

  const allSeatsAssigned =
    players.length === 4 &&
    Object.keys(seatAssignments).length === 4 &&
    [0, 1, 2, 3].every((s) => Object.values(seatAssignments).includes(s));

  const canStart = allSeatsAssigned;

  // Find who is assigned to a given seat
  const playerAtSeat = (seat: number): Player | undefined => {
    const pid = Object.entries(seatAssignments).find(([, s]) => s === seat)?.[0];
    return players.find((p) => p.id === pid);
  };

  // Seat of a given player
  const seatOfPlayer = (playerId: string): number | undefined =>
    seatAssignments[playerId];

  const handlePlayerClick = (playerId: string) => {
    if (!isHost) return;
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));
  };

  const handleSeatClick = (seat: number) => {
    if (!isHost || !selectedPlayerId) return;

    const newAssignments = { ...seatAssignments };

    // Remove selected player from their current seat if any
    delete newAssignments[selectedPlayerId];

    // If another player was in this seat, remove them too
    const existingPid = Object.entries(newAssignments).find(([, s]) => s === seat)?.[0];
    if (existingPid) {
      delete newAssignments[existingPid];
    }

    newAssignments[selectedPlayerId] = seat;
    setSelectedPlayerId(null);
    onAssignSeats(newAssignments);
  };

  const fourPlayersJoined = players.length === 4;

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

        {!fourPlayersJoined ? (
          /* Waiting for players */
          <>
            <div className="bg-felt rounded-xl p-3 mb-4 text-xs text-green-400">
              <p className="font-semibold mb-1">Teams:</p>
              <p>
                <span className="text-green-300 font-semibold">Team A</span> — Seats 0 &amp; 2
                &nbsp;|&nbsp;
                <span className="text-blue-300 font-semibold">Team B</span> — Seats 1 &amp; 3
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[0, 1, 2, 3].map((seat) => {
                const player = players.find((p) => p.seat === seat);
                const team = getSeatTeam(seat);
                const teamColor = team === 'A' ? 'text-green-300' : 'text-blue-300';
                const teamBorder = team === 'A' ? 'border-green-700' : 'border-blue-800';
                const isMe = player?.name === myName;
                return (
                  <div
                    key={seat}
                    className={`border rounded-lg p-3 ${
                      player ? 'bg-felt border-green-600' : 'bg-felt-dark border-dashed border-green-800'
                    } ${teamBorder}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-500 text-xs">Seat {seat}</span>
                      <span className={`text-xs font-bold ${teamColor}`}>Team {team}</span>
                    </div>
                    {player ? (
                      <div className="flex items-center gap-1">
                        <span className="text-white font-semibold text-sm truncate">{player.name}</span>
                        {isMe && <span className="text-yellow-400 text-xs">(you)</span>}
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
            <div className="text-center text-green-500 text-sm py-2">
              Waiting for {4 - players.length} more player{4 - players.length !== 1 ? 's' : ''}...
            </div>
          </>
        ) : (
          /* Pick Teams section — all 4 players joined */
          <>
            <div className="mb-4">
              <h2 className="text-white font-bold text-lg mb-1">Pick Teams</h2>
              {isHost ? (
                <p className="text-green-400 text-xs">
                  {selectedPlayerId
                    ? `Select a seat for ${players.find((p) => p.id === selectedPlayerId)?.name}...`
                    : 'Click a player to select, then click a seat to assign them.'}
                </p>
              ) : (
                <p className="text-green-500 text-xs italic">Waiting for host to assign seats...</p>
              )}
            </div>

            {/* Player cards */}
            <div className="mb-5">
              <p className="text-green-500 text-xs mb-2 uppercase tracking-wide font-semibold">Players</p>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player) => {
                  const assignedSeat = seatOfPlayer(player.id);
                  const isSelected = selectedPlayerId === player.id;
                  const isMe = player.id === myPlayerId;
                  return (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerClick(player.id)}
                      disabled={!isHost}
                      className={`text-left rounded-lg p-3 border transition-all ${
                        isSelected
                          ? 'bg-yellow-900 border-yellow-400 ring-1 ring-yellow-400'
                          : 'bg-felt border-green-700 hover:border-green-400'
                      } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm truncate">
                          {player.name}
                          {isMe && <span className="text-yellow-400 text-xs ml-1">(you)</span>}
                        </span>
                        {assignedSeat !== undefined ? (
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              getSeatTeam(assignedSeat) === 'A'
                                ? 'bg-green-800 text-green-300'
                                : 'bg-blue-900 text-blue-300'
                            }`}
                          >
                            S{assignedSeat}
                          </span>
                        ) : (
                          <span className="text-green-700 text-xs italic">unassigned</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seat slots */}
            <div className="mb-5">
              <p className="text-green-500 text-xs mb-2 uppercase tracking-wide font-semibold">Seats</p>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((seat) => {
                  const occupant = playerAtSeat(seat);
                  const team = getSeatTeam(seat);
                  const isClickable = isHost && selectedPlayerId !== null;
                  const teamBg = team === 'A' ? 'bg-green-900/40 border-green-600' : 'bg-blue-900/30 border-blue-700';
                  const teamLabel = team === 'A' ? 'text-green-300' : 'text-blue-300';
                  const hoverClass = isClickable ? 'hover:ring-1 hover:ring-yellow-400 cursor-pointer' : '';
                  return (
                    <div
                      key={seat}
                      onClick={() => handleSeatClick(seat)}
                      className={`border rounded-lg p-3 transition-all ${teamBg} ${hoverClass}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-green-500 text-xs">Seat {seat}</span>
                        <span className={`text-xs font-bold ${teamLabel}`}>Team {team}</span>
                      </div>
                      {occupant ? (
                        <div className="flex items-center gap-1">
                          <span className="text-white font-semibold text-sm truncate">{occupant.name}</span>
                          {occupant.id === myPlayerId && (
                            <span className="text-yellow-400 text-xs">(you)</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-green-700 text-sm italic">
                          {isClickable ? 'Click to assign' : 'Empty'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team summary */}
            <div className="bg-felt rounded-xl p-3 mb-5 text-sm">
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-green-300 font-bold text-xs mb-1">TEAM A</p>
                  <p className="text-white text-xs">{playerAtSeat(0)?.name ?? '—'}</p>
                  <p className="text-white text-xs">{playerAtSeat(2)?.name ?? '—'}</p>
                </div>
                <div className="text-green-700 self-center text-lg font-bold">vs</div>
                <div className="text-center">
                  <p className="text-blue-300 font-bold text-xs mb-1">TEAM B</p>
                  <p className="text-white text-xs">{playerAtSeat(1)?.name ?? '—'}</p>
                  <p className="text-white text-xs">{playerAtSeat(3)?.name ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Start button / waiting */}
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
                  canStart
                    ? 'bg-green-500 hover:bg-green-400 text-white shadow-lg'
                    : 'bg-green-900 text-green-700 cursor-not-allowed'
                }`}
              >
                {canStart ? 'Start Game' : 'Assign all 4 seats to start'}
              </button>
            ) : (
              <div className="text-center text-green-500 text-sm py-2">
                {canStart
                  ? 'All seats assigned! Waiting for host to start...'
                  : 'Waiting for host to assign seats...'}
              </div>
            )}
          </>
        )}

        <p className="text-green-700 text-xs text-center mt-4">
          Hello, <span className="text-green-400">{myName}</span>!
          {isHost ? " You're the host." : ''}
        </p>
      </div>
    </div>
  );
}
