import { Player, Suit, suitSymbol, suitColor } from '@/lib/gameLogic';

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

function trumpDisplayColor(suit: Suit): string {
  return suit === 'H' || suit === 'D' ? '#dc2626' : '#f1f5f9';
}

export default function Sidebar({
  players,
  mySeat,
  currentTurn,
  trumpSuit,
  tensCount,
  capturedTens,
  trickCount,
  score,
  dealer,
}: SidebarProps) {
  // Defensive null checks
  const safePlayers = players || [];
  const safeTensCount = tensCount || [0, 0];
  const safeCapturedTens = capturedTens || {};
  const safeTrickCount = trickCount || [0, 0];
  const safeScore = score || [0, 0];

  const getTenOwner = (suit: Suit): 'A' | 'B' | null => {
    const team = safeCapturedTens[suit];
    if (team === 0) return 'A';
    if (team === 1) return 'B';
    return null;
  };

  return (
    <div className="bg-felt-dark border-t border-green-800 px-3 py-2 text-xs text-green-300 w-full flex-shrink-0">

      {/* Row 1: Tens + Trump + Score */}
      <div className="flex items-center justify-between gap-2">

        {/* Tens */}
        <div className="flex items-center gap-1">
          {TENS_SUITS.map((suit) => {
            const owner = getTenOwner(suit);
            const isRed = suit === 'H' || suit === 'D';
            return (
              <div
                key={suit}
                className={[
                  'w-7 h-9 rounded border flex flex-col items-center justify-center gap-0',
                  owner === 'A' ? 'bg-blue-900 border-blue-400' : '',
                  owner === 'B' ? 'bg-orange-900 border-orange-400' : '',
                  !owner ? 'bg-gray-900 border-gray-700 opacity-40' : '',
                ].join(' ')}
              >
                <span style={{ color: isRed ? '#f87171' : (owner ? '#f1f5f9' : '#6b7280'), fontSize: '0.6rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {suitSymbol(suit)}
                </span>
                <span style={{ color: owner ? '#fff' : '#4b5563', fontSize: '0.55rem', fontWeight: 'bold', lineHeight: 1 }}>10</span>
                {owner && (
                  <span style={{ color: owner === 'A' ? '#93c5fd' : '#fdba74', fontSize: '0.5rem', lineHeight: 1 }}>{owner}</span>
                )}
              </div>
            );
          })}
          <div className="flex flex-col ml-1 leading-none">
            <span className="text-blue-300" style={{ fontSize: '0.6rem' }}>A:{safeTensCount[0]}</span>
            <span className="text-orange-300" style={{ fontSize: '0.6rem' }}>B:{safeTensCount[1]}</span>
          </div>
        </div>

        {/* Trump */}
        <div className="flex flex-col items-center">
          <span className="text-green-600 uppercase tracking-wide" style={{ fontSize: '0.5rem' }}>Trump</span>
          {trumpSuit ? (
            <span className="font-bold text-lg leading-none" style={{ color: trumpDisplayColor(trumpSuit) }}>
              {suitSymbol(trumpSuit)}
            </span>
          ) : (
            <span className="text-green-700 italic" style={{ fontSize: '0.55rem', textAlign: 'center' }}>Cut<br/>Hukum</span>
          )}
        </div>

        {/* Tricks */}
        <div className="flex flex-col items-center">
          <span className="text-green-600 uppercase tracking-wide" style={{ fontSize: '0.5rem' }}>Tricks</span>
          <span className="font-bold" style={{ fontSize: '0.75rem' }}>
            <span className="text-blue-300">{safeTrickCount[0]}</span>
            <span className="text-green-700">–</span>
            <span className="text-orange-300">{safeTrickCount[1]}</span>
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center">
          <span className="text-green-600 uppercase tracking-wide" style={{ fontSize: '0.5rem' }}>Wins</span>
          <span className="font-bold" style={{ fontSize: '0.75rem' }}>
            <span className="text-blue-300">{safeScore[0]}</span>
            <span className="text-green-700">–</span>
            <span className="text-orange-300">{safeScore[1]}</span>
          </span>
        </div>

        {/* Players */}
        <div className="flex flex-col gap-0.5">
          {[0, 1, 2, 3].map((seat) => {
            const player = safePlayers.find((p) => p.seat === seat);
            const isMe = seat === mySeat;
            const isCurrentTurn = seat === currentTurn;
            const isDealer = seat === dealer;
            const teamColor = seat % 2 === 0 ? '#93c5fd' : '#fdba74';
            return (
              <div key={seat} className="flex items-center gap-1 leading-none">
                <span style={{ color: teamColor, fontWeight: 'bold', fontSize: '0.55rem' }}>
                  {seat % 2 === 0 ? 'A' : 'B'}
                </span>
                <span style={{
                  color: isMe ? '#fde68a' : '#bbf7d0',
                  fontSize: '0.6rem',
                  fontWeight: isMe ? '600' : '400',
                }}>
                  {player ? player.name : '—'}
                </span>
                {isDealer && <span style={{ color: '#fbbf24', fontSize: '0.5rem' }}>D</span>}
                {isCurrentTurn && <span style={{ color: '#86efac', fontSize: '0.5rem' }}>▶</span>}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
