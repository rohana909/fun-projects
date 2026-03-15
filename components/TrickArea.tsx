import { TrickCard, Player, Suit } from '@/lib/gameLogic';
import CardComponent from './CardComponent';

interface TrickAreaProps {
  currentTrick: TrickCard[];
  mySeat: number;
  players: Player[];
  trumpSuit: Suit | null;
  ledSuit: Suit | null;
}

export default function TrickArea({ currentTrick, mySeat, players, trumpSuit, ledSuit }: TrickAreaProps) {
  // Map seat -> trick card played
  const playedBySeat = new Map(currentTrick.map((tc) => [tc.seat, tc.card]));

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
    const name = getPlayerName(seat);

    const positionClasses: Record<string, string> = {
      top: 'top-0 left-1/2 -translate-x-1/2 flex-col items-center',
      bottom: 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
      left: 'left-0 top-1/2 -translate-y-1/2 flex-col items-center',
      right: 'right-0 top-1/2 -translate-y-1/2 flex-col items-center',
    };

    return (
      <div className={`absolute flex ${positionClasses[position]} gap-1`}>
        {position === 'bottom' && (
          <span className="text-green-300 text-xs font-medium truncate max-w-16 text-center">
            {name}
          </span>
        )}
        {card ? (
          <CardComponent card={card} size="sm" />
        ) : (
          <div className="w-10 h-14 rounded-lg border border-dashed border-green-700 opacity-40" />
        )}
        {position !== 'bottom' && (
          <span className="text-green-400 text-xs font-medium truncate max-w-16 text-center">
            {name}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Trump indicator above trick */}
      {trumpSuit && (
        <div className="text-yellow-300 text-xs font-semibold">
          Trump set
        </div>
      )}

      <div className="relative w-44 h-44 md:w-52 md:h-52">
        <CardSlot seat={topSeat} position="top" />
        <CardSlot seat={leftSeat} position="left" />
        <CardSlot seat={rightSeat} position="right" />
        <CardSlot seat={bottomSeat} position="bottom" />

        {/* Center: show trick number or empty indicator */}
        {currentTrick.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border border-green-700 opacity-30" />
          </div>
        )}
      </div>
    </div>
  );
}
