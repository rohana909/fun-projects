import { TrickCard, CompletedTrick, Player, Suit, cardKey } from '@/lib/gameLogic';
import CardComponent from './CardComponent';

interface TrickAreaProps {
  currentTrick: TrickCard[];
  lastTrick: CompletedTrick | null;
  mySeat: number;
  players: Player[];
  trumpSuit: Suit | null;
  ledSuit: Suit | null;
  trickWinner: string | null;
}

export default function TrickArea({ currentTrick, lastTrick, mySeat, players, trumpSuit, ledSuit, trickWinner }: TrickAreaProps) {
  // Defensive: ensure currentTrick is always an array
  const safeTrick = currentTrick || [];
  // Show currentTrick cards; if empty (trick just completed), fall back to lastTrick for display
  const displayCards = safeTrick.length > 0 ? safeTrick : (lastTrick?.cards ?? []);
  const playedBySeat = new Map(displayCards.map((tc) => [tc.seat, tc.card]));

  // Relative positions for display
  const bottomSeat = mySeat;
  const leftSeat = (mySeat + 1) % 4;
  const topSeat = (mySeat + 2) % 4;
  const rightSeat = (mySeat + 3) % 4;

  const getPlayerName = (seat: number) => {
    const p = players.find((pl) => pl.seat === seat);
    return p ? p.name : `Seat ${seat}`;
  };

  const CardSlot = ({
    seat,
    position,
  }: {
    seat: number;
    position: 'top' | 'bottom' | 'left' | 'right';
  }) => {
    const card = playedBySeat.get(seat);
    const isMe = seat === mySeat;
    const label = isMe ? 'You' : getPlayerName(seat);

    const positionClasses: Record<string, string> = {
      top: 'top-0 left-1/2 -translate-x-1/2 flex-col items-center',
      bottom: 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
      left: 'left-0 top-1/2 -translate-y-1/2 flex-col items-center',
      right: 'right-0 top-1/2 -translate-y-1/2 flex-col items-center',
    };

    const labelColorClass = isMe ? 'text-yellow-300 font-semibold' : 'text-green-400 font-medium';

    return (
      <div className={`absolute flex ${positionClasses[position]} gap-1`}>
        {position === 'bottom' && (
          <span className={`text-xs truncate max-w-16 text-center ${labelColorClass}`}>
            {label}
          </span>
        )}
        {card ? (
          // key forces remount (and thus animation replay) when card changes
          <div key={cardKey(card)} className="card-play-in trick-area-card">
            <CardComponent card={card} size="sm" />
          </div>
        ) : (
          <div className="w-10 h-14 rounded-lg border-2 border-dashed border-green-700/50 opacity-50 bg-green-950/20" />
        )}
        {position !== 'bottom' && (
          <span className={`text-xs truncate max-w-16 text-center ${labelColorClass}`}>
            {label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-44 h-44 md:w-52 md:h-52">
        <CardSlot seat={topSeat} position="top" />
        <CardSlot seat={leftSeat} position="left" />
        <CardSlot seat={rightSeat} position="right" />
        <CardSlot seat={bottomSeat} position="bottom" />

        {/* Center: empty indicator or trick winner flash */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {trickWinner ? (
            <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center z-10">
              <div className="bg-gradient-to-br from-green-600 to-green-800 border-4 border-yellow-400 rounded-2xl px-6 py-4 text-center shadow-2xl transform scale-100 animate-bounce">
                <div className="text-white text-2xl font-extrabold drop-shadow-lg">{trickWinner}</div>
                <div className="text-yellow-300 text-xl font-bold">wins the trick!</div>
              </div>
            </div>
          ) : safeTrick.length === 0 ? (
            <div className="w-8 h-8 rounded-full border border-green-700 opacity-20" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
