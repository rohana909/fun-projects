import { Player, Suit, suitSymbol } from '@/lib/gameLogic';

interface SidebarProps {
  players: Player[];
  mySeat: number;
  currentTurn: number;
  trumpSuit: Suit | null;
  trumpSetBySeat: number | null;
  trickCount: [number, number];
  tensCount: [number, number];
  capturedTens: Partial<Record<Suit, 0 | 1>>;
  score: [number, number];
  dealer: number;
}

const TENS_SUITS: Suit[] = ['S', 'H', 'D', 'C'];

function tenSymbolColor(suit: Suit, captured: boolean): string {
  if (suit === 'H' || suit === 'D') return captured ? 'text-red-300' : 'text-red-600';
  return captured ? 'text-gray-100' : 'text-gray-500';
}

function trumpDisplayColor(suit: Suit): string {
  return suit === 'H' || suit === 'D' ? 'text-red-400' : 'text-gray-100';
}

export default function Sidebar({
  players,
  mySeat,
  currentTurn,
  trumpSuit,
  trumpSetBySeat,
  trickCount,
  tensCount,
  capturedTens,
  score,
  dealer,
}: SidebarProps) {
  const getPlayerName = (seat: number) => {
    const p = players.find((pl) => pl.seat === seat);
    return p ? p.name : `Seat ${seat}`;
  };

  const trumpSetter = trumpSetBySeat !== null ? getPlayerName(trumpSetBySeat) : null;

  const getTenOwner = (suit: Suit): 'A' | 'B' | null => {
    const team = capturedTens[suit];
    if (team === 0) return 'A';
    if (team === 1) return 'B';
    return null;
  };

  return (
    <div className="bg-felt-dark border-t border-green-800 p-3 text-sm text-green-300 w-full">
      <div className="max-w-4xl mx-auto space-y-3">

        {/* Tens tracker — most prominent section */}
        <div>
          <div className="text-center text-green-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Tens Captured
          </div>
          <div className="flex justify-center gap-3">
            {TENS_SUITS.map((suit) => {
              const owner = getTenOwner(suit);
              const captured = owner !== null;
              return (
                <div
                  key={suit}
                  className={[
                    'relative w-11 h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5',
                    'transition-all duration-500',
                    owner === 'A' ? 'bg-blue-900 border-blue-400 shadow-lg shadow-blue-500/40' : '',
                    owner === 'B' ? 'bg-orange-900 border-orange-400 shadow-lg shadow-orange-500/40' : '',
                    !owner ? 'bg-gray-900 border-gray-700 opacity-40' : '',
                  ].join(' ')}
                >
                  <span className={`text-base font-bold leading-none ${tenSymbolColor(suit, captured)}`}>
                    {suitSymbol(suit)}
                  </span>
                  <span className={`font-bold text-sm leading-none ${captured ? 'text-white' : 'text-gray-600'}`}>
                    10
                  </span>
                  {owner && (
                    <span className={`text-xs font-bold leading-none ${owner === 'A' ? 'text-blue-300' : 'text-orange-300'}`}>
                      {owner}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-8 mt-2 text-xs">
            <span className="text-blue-300 font-medium">Team A: {tensCount[0]}</span>
            <span className="text-orange-300 font-medium">Team B: {tensCount[1]}</span>
          </div>
        </div>

        <div className="border-t border-green-800/60" />

        {/* Stats row: trump, tricks, wins, players */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 items-start justify-between">

          {/* Trump */}
          <div className="flex flex-col items-center gap-0.5 min-w-12">
            <span className="text-green-500 text-xs font-semibold uppercase tracking-wide">Trump</span>
            {trumpSuit ? (
              <>
                <span className={`font-bold text-3xl leading-none ${trumpDisplayColor(trumpSuit)}`}>
                  {suitSymbol(trumpSuit)}
                </span>
                {trumpSetter && (
                  <span className="text-green-600 text-xs">by {trumpSetter}</span>
                )}
              </>
            ) : (
              <span className="text-green-700 italic text-xs text-center leading-tight">Cut<br />Hukum</span>
            )}
          </div>

          {/* Tricks */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-500 text-xs font-semibold uppercase tracking-wide">Tricks</span>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-blue-300 font-bold text-xl leading-none">{trickCount[0]}</div>
                <div className="text-blue-500 text-xs">Team A</div>
              </div>
              <div className="text-green-700 font-bold">–</div>
              <div className="text-center">
                <div className="text-orange-300 font-bold text-xl leading-none">{trickCount[1]}</div>
                <div className="text-orange-500 text-xs">Team B</div>
              </div>
            </div>
          </div>

          {/* Wins */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-500 text-xs font-semibold uppercase tracking-wide">Wins</span>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-blue-300 font-bold text-xl leading-none">{score[0]}</div>
                <div className="text-blue-500 text-xs">Team A</div>
              </div>
              <div className="text-green-700 font-bold">–</div>
              <div className="text-center">
                <div className="text-orange-300 font-bold text-xl leading-none">{score[1]}</div>
                <div className="text-orange-500 text-xs">Team B</div>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="flex flex-col gap-0.5">
            <span className="text-green-500 text-xs font-semibold uppercase tracking-wide mb-0.5">Players</span>
            {[0, 1, 2, 3].map((seat) => {
              const player = players.find((p) => p.seat === seat);
              const isCurrentTurn = seat === currentTurn;
              const isMe = seat === mySeat;
              const isDealer = seat === dealer;
              const team = seat % 2 === 0 ? 'A' : 'B';
              const teamColor = seat % 2 === 0 ? 'text-blue-400' : 'text-orange-400';

              return (
                <div
                  key={seat}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors ${
                    isCurrentTurn ? 'bg-green-800/50 ring-1 ring-green-500/50' : ''
                  }`}
                >
                  <span className={`font-bold ${teamColor}`}>{team}</span>
                  <span className={isMe ? 'text-yellow-300 font-semibold' : 'text-green-200'}>
                    {player ? player.name : '(empty)'}
                  </span>
                  {isMe && <span className="text-yellow-600 text-xs">(you)</span>}
                  {isDealer && <span className="text-yellow-500 text-xs" title="Dealer">D</span>}
                  {isCurrentTurn && <span className="text-green-300 animate-pulse text-xs">▶</span>}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
