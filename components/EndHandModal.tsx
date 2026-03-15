import { HandResult, Player } from '@/lib/gameLogic';

interface EndHandModalProps {
  result: HandResult;
  score: [number, number];
  players: Player[];
  isHost: boolean;
  onNewHand: () => void;
}

export default function EndHandModal({
  result,
  score,
  players,
  isHost,
  onNewHand,
}: EndHandModalProps) {
  const winnerTeamLabel = result.winner === 0 ? 'Team A' : 'Team B';
  const winnerColor = result.winner === 0 ? 'text-blue-300' : 'text-orange-300';

  const teamAPlayers = players.filter((p) => p.seat % 2 === 0).map((p) => p.name);
  const teamBPlayers = players.filter((p) => p.seat % 2 === 1).map((p) => p.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-felt-dark border border-green-700 rounded-2xl p-6 shadow-2xl w-full max-w-sm mx-4">
        {/* Title */}
        <h2 className="text-white text-2xl font-bold text-center mb-2">
          Hand Complete!
        </h2>

        {/* Special announcement */}
        {result.isWhitewash && (
          <div className="bg-purple-900 border border-purple-500 rounded-xl px-4 py-2 mb-3 text-center">
            <p className="text-purple-200 text-2xl font-black tracking-widest">WHITEWASH!</p>
            <p className="text-purple-300 text-xs">All 13 tricks!</p>
          </div>
        )}
        {!result.isWhitewash && result.isMendikot && (
          <div className="bg-yellow-900 border border-yellow-500 rounded-xl px-4 py-2 mb-3 text-center">
            <p className="text-yellow-200 text-2xl font-black tracking-widest">MENDIKOT!</p>
            <p className="text-yellow-300 text-xs">All 4 tens captured!</p>
          </div>
        )}

        {/* Winner */}
        <div className="text-center mb-4">
          <p className="text-green-300 text-sm mb-1">Winner</p>
          <p className={`text-3xl font-black ${winnerColor}`}>{winnerTeamLabel} wins!</p>
          <p className="text-green-400 text-sm mt-1">
            {result.winnerNames.join(' & ')}
          </p>
        </div>

        {/* Stats table */}
        <div className="bg-felt rounded-xl p-3 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-green-500 text-xs">
                <th className="text-left pb-1">Team</th>
                <th className="text-center pb-1">Players</th>
                <th className="text-center pb-1">Tricks</th>
                <th className="text-center pb-1">Tens</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-blue-300">
                <td className="font-bold py-0.5">Team A</td>
                <td className="text-center text-xs text-green-400">{teamAPlayers.join(', ')}</td>
                <td className="text-center font-bold">{result.team0Tricks}</td>
                <td className="text-center font-bold">{result.team0Tens}</td>
              </tr>
              <tr className="text-orange-300">
                <td className="font-bold py-0.5">Team B</td>
                <td className="text-center text-xs text-green-400">{teamBPlayers.join(', ')}</td>
                <td className="text-center font-bold">{result.team1Tricks}</td>
                <td className="text-center font-bold">{result.team1Tens}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Overall score */}
        <div className="bg-felt rounded-xl p-3 mb-5 flex justify-around">
          <div className="text-center">
            <p className="text-green-500 text-xs mb-0.5">Overall Score</p>
            <p className="text-blue-300 font-bold text-lg">
              Team A: <span className="text-white">{score[0]}</span>
            </p>
          </div>
          <div className="text-center border-l border-green-700 pl-4">
            <p className="text-green-500 text-xs mb-0.5">&nbsp;</p>
            <p className="text-orange-300 font-bold text-lg">
              Team B: <span className="text-white">{score[1]}</span>
            </p>
          </div>
        </div>

        {/* Action */}
        {isHost ? (
          <button
            onClick={onNewHand}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-lg transition-colors shadow-lg"
          >
            Deal New Hand
          </button>
        ) : (
          <div className="text-center text-green-500 text-sm py-2 border border-green-800 rounded-xl">
            Waiting for host to start new hand...
          </div>
        )}
      </div>
    </div>
  );
}
