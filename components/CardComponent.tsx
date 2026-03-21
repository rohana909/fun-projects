import { Card, suitSymbol, suitColor } from '@/lib/gameLogic';


interface CardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-14 text-xs',
  md: 'w-14 h-20 text-sm',
  lg: 'w-16 h-24 text-base',
};

const symbolSizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export default function CardComponent({
  card,
  onClick,
  disabled = false,
  highlight = false,
  size = 'md',
  faceDown = false,
}: CardProps) {
  const sizeClass = sizeClasses[size];
  const symbolSize = symbolSizeClasses[size];
  const color = suitColor(card.suit);
  const symbol = suitSymbol(card.suit);

  const isClickable = !!onClick && !disabled;

  const baseClasses = `
    relative rounded-lg border select-none flex-shrink-0
    ${sizeClass}
    ${faceDown
      ? 'bg-blue-800 border-blue-600'
      : 'bg-white border-gray-200'
    }
    ${highlight ? 'glow-green border-green-400 border-2' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform active:scale-95' : ''}
    card-shadow
  `;

  if (faceDown) {
    return (
      <div className={baseClasses}>
        <div className="absolute inset-1 rounded border border-blue-500 opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-blue-300 text-xl">🂠</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Top-left rank + suit */}
      <div className="absolute top-0.5 left-1 leading-none" style={{ color }}>
        <div className="font-bold leading-none" style={{ fontSize: size === 'sm' ? '0.6rem' : '0.75rem' }}>
          {card.rank}
        </div>
        <div className="leading-none" style={{ fontSize: size === 'sm' ? '0.55rem' : '0.65rem' }}>
          {symbol}
        </div>
      </div>

      {/* Center symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${symbolSize} font-bold`} style={{ color }}>
        {symbol}
      </div>

      {/* Bottom-right rank + suit (rotated) */}
      <div
        className="absolute bottom-0.5 right-1 leading-none rotate-180"
        style={{ color }}
      >
        <div className="font-bold leading-none" style={{ fontSize: size === 'sm' ? '0.6rem' : '0.75rem' }}>
          {card.rank}
        </div>
        <div className="leading-none" style={{ fontSize: size === 'sm' ? '0.55rem' : '0.65rem' }}>
          {symbol}
        </div>
      </div>
    </div>
  );
}
