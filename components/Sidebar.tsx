import { Player, Suit, suitSymbol, suitColor } from '@/lib/gameLogic';

interface SidebarProps {
  players: Player[];
  mySeat: number;
  currentTurn: number;
  trumpSuit: Suit | null;
  trumpSetBySeat: number | null;
  trickCount: [number, number];
  tensCount: [number, number];
  score: [number, number];
  dealer: number;
}

export default function Sidebar({
  players,
  mySeat,
  currentTurn,
  trumpSuit,
  trumpSetBySeat,
  trickCount,
  tensCount,
  score,
  dealer,
}: SidebarProps) {
  const getPlayerName = (seat: number) => {
    const p = players.find((pl) => pl.seat === seat);
    return p ? p.name : `Seat ${seat}`;
  };

  const trumpSetter = trumpSetBySeat !== null ? getPlayerName(trumpSetBySeat) : null;

  return (
    <div className="bg-felt-dark border-t border-green-800 p-2 text-xs text-green-300 w-full">
      <div className="flex flex-wrap gap-x-4 gap-y-1 items-start justify-between max-w-4xl mx-auto">
        {/* Trump */}
        <div className="flex items-center gap-1">
          <span className="text-green-500 font-semibold">Trump:</span>
          {trumpSuit ? (
            <span className={`font-bold text-sm ${suitColor(trumpSuit)}`}>
              {suitSymbol(trumpSuit)} {trumpSuit}
            </span>
          ) : (
            <span className="text-green-700 italic">Not set (cut hukum)</span>
          )}
          {trumpSetter && (
            <span className="text-green-600 ml-1">by {trumpSetter}</span>
          )}
        </div>

        {/* Tricks */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-semibold">Tricks:</span>
          <span className="text-blue-300">A: {trickCount[0]}</span>
          <span className="text-green-600">|</span>
          <span className="text-orange-300">B: {trickCount[1]}</span>
        </div>

        {/* Tens */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-semibold">Tens:</span>
          <span className="text-blue-300">A: {tensCount[0]}</span>
          <span className="text-green-600">|</span>
          <span className="text-orange-300">B: {tensCount[1]}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-semibold">Wins:</span>
          <span className="text-blue-300">A: {score[0]}</span>
          <span className="text-green-600">|</span>
          <span className="text-orange-300">B: {score[1]}</span>
        </div>

        {/* Players */}
        <div className="flex items-center gap-2 flex-wrap">
          {[0, 1, 2, 3].map((seat) => {
            const player = players.find((p) => p.seat === seat);
            const isCurrentTurn = seat === currentTurn;
            const isMe = seat === mySeat;
            const isDealer = seat === dealer;
            const team = seat % 2 === 0 ? 'A' : 'B';
            const teamColor = seat % 2 === 0 ? 'text-blue-300' : 'text-orange-300';

            return (
              <div
                key={seat}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                  isCurrentTurn ? 'bg-green-700 text-white' : ''
                }`}
              >
                <span className={`font-semibold ${teamColor}`}>{team}</span>
                <span className={isMe ? 'text-yellow-300' : 'text-green-200'}>
                  {player ? player.name : `(empty)`}
                </span>
                {isDealer && <span className="text-yellow-500 text-xs">D</span>}
                {isCurrentTurn && <span className="text-green-300 animate-pulse">▶</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
