import { useEffect, useState } from 'react';
import { Card, Suit, sortBySuit } from '@/lib/gameLogic';
import CardComponent from './CardComponent';

interface HandProps {
  cards: Card[];
  isMyTurn: boolean;
  ledSuit: Suit | null;
  trumpSuit: Suit | null;
  onPlayCard: (card: Card) => void;
  lastError: string | null;
}

function isCardPlayable(card: Card, hand: Card[], ledSuit: Suit | null, isMyTurn: boolean): boolean {
  if (!isMyTurn) return false;
  if (ledSuit === null) return true;
  if (card.suit === ledSuit) return true;
  // If no card of led suit in hand, all cards are playable
  const hasLedSuit = hand.some((c) => c.suit === ledSuit);
  return !hasLedSuit;
}

export default function Hand({ cards, isMyTurn, ledSuit, trumpSuit, onPlayCard, lastError }: HandProps) {
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    if (lastError) {
      setErrorVisible(true);
      const timer = setTimeout(() => setErrorVisible(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setErrorVisible(false);
    }
  }, [lastError]);

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-green-600 text-sm">
        No cards in hand
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Error toast */}
      {errorVisible && lastError && (
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-bounce">
          {lastError}
        </div>
      )}

      {/* Turn indicator */}
      {isMyTurn && (
        <div className="text-green-300 text-sm font-semibold animate-pulse">
          Your turn — tap a card to play
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-row items-end justify-start gap-1 px-2 w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {sortBySuit(cards).map((card, idx) => {
          const playable = isCardPlayable(card, cards, ledSuit, isMyTurn);
          return (
            <CardComponent
              key={`${card.rank}${card.suit}`}
              card={card}
              highlight={playable}
              disabled={!playable}
              onClick={playable ? () => onPlayCard(card) : undefined}
              size="md"
            />
          );
        })}
      </div>
    </div>
  );
}
