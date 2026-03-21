import { useState, useEffect, useRef } from 'react';
import { Card, Player, TrickCard, CompletedTrick, HandResult, Suit, suitSymbol, suitColor } from '@/lib/gameLogic';

import CardComponent from './CardComponent';
import Hand from './Hand';
import TrickArea from './TrickArea';
import Sidebar from './Sidebar';

export interface RoomState {
  code: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'hand_complete';
  hands: Record<number, Card[]>;
  dealer: number;
  currentTurn: number;
  ledSuit: Suit | null;
  trumpSuit: Suit | null;
  trumpSetBySeat: number | null;
  currentTrick: TrickCard[];
  trickCount: [number, number];
  tensCount: [number, number];
  capturedTens: Partial<Record<Suit, 0 | 1>>;
  lastTrick: CompletedTrick | null;
  handResult: HandResult | null;
  score: [number, number];
  seatAssignments: Record<string, number>;
}

interface GameBoardProps {
  gameState: RoomState;
  mySeat: number;
  myPlayerId: string;
  onPlayCard: (card: Card) => void;
  onNewHand: () => void;
  isHost: boolean;
  lastError: string | null;
}

function FaceDownHand({ count, name, isCurrentTurn, isMe }: { count: number; name: string; seat: number; isCurrentTurn: boolean; isMe?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-lg p-1 transition-all ${isCurrentTurn ? 'glow-pulse ring-2 ring-green-400' : ''}`}>
      <span className={`text-xs font-medium ${isCurrentTurn ? 'text-green-300' : isMe ? 'text-yellow-300' : 'text-green-400'}`}>
        {name} {isCurrentTurn ? '▶' : ''}
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
          <div
            key={i}
            className="w-6 h-9 rounded bg-blue-800 border border-blue-600 card-shadow"
            style={{ marginLeft: i > 0 ? '-12px' : '0' }}
          />
        ))}
        {count > 8 && (
          <span className="text-green-500 text-xs ml-1 self-end">+{count - 8}</span>
        )}
      </div>
      <span className="text-green-600 text-xs">{count} cards</span>
    </div>
  );
}

export default function GameBoard({
  gameState,
  mySeat,
  myPlayerId,
  onPlayCard,
  onNewHand,
  isHost,
  lastError,
}: GameBoardProps) {
  const {
    players,
    hands,
    currentTurn,
    ledSuit,
    trumpSuit,
    trumpSetBySeat,
    currentTrick,
    trickCount,
    tensCount,
    capturedTens,
    score,
    dealer,
    lastTrick,
  } = gameState;

  const myCards = hands[mySeat] || [];
  const isMyTurn = currentTurn === mySeat;

  // Track trick winner to display briefly in TrickArea
  const [trickWinner, setTrickWinner] = useState<string | null>(null);
  const prevTrickTotal = useRef<number>(0);

  const getPlayerName = (seat: number) => {
    const p = players.find((pl) => pl.seat === seat);
    return p ? p.name : `Seat ${seat}`;
  };

  useEffect(() => {
    const total = trickCount[0] + trickCount[1];
    if (total > prevTrickTotal.current && gameState.lastTrick) {
      const winnerName = getPlayerName(gameState.lastTrick.winner);
      setTrickWinner(winnerName);
      prevTrickTotal.current = total;
      const timer = setTimeout(() => setTrickWinner(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [trickCount, gameState.lastTrick]);

  // Other players relative to me
  const leftSeat = (mySeat + 1) % 4;
  const topSeat = (mySeat + 2) % 4;
  const rightSeat = (mySeat + 3) % 4;

  const getCardCount = (seat: number) => {
    const h = hands[seat];
    return h ? h.length : 0;
  };

  return (
    <div className="flex flex-col bg-felt overflow-hidden" style={{ height: '100svh' }}>
      {/* YOUR TURN banner */}
      {isMyTurn && (
        <div className="your-turn-banner flex items-center justify-center gap-2 py-2 bg-green-900 border-b-2 border-green-400 flex-shrink-0">
          <span className="text-green-100 font-bold text-base tracking-widest uppercase">Your Turn</span>
        </div>
      )}

      {/* Turn / Trump indicator bar */}
      <div className="flex items-center justify-center gap-3 py-1 bg-felt-dark border-b border-green-800 text-sm flex-shrink-0">
        <span className="text-green-500">Trump:</span>
        {trumpSuit ? (
          <span className={`font-bold ${suitColor(trumpSuit)}`}>
            {suitSymbol(trumpSuit)} {trumpSuit}
          </span>
        ) : (
          <span className="text-green-700 italic text-xs">Cut Hukum — not set yet</span>
        )}
        <span className="text-green-700 text-xs">|</span>
        {!isMyTurn && (
          <span className="text-green-400 text-xs font-medium">
            {getPlayerName(currentTurn)}&apos;s turn...
          </span>
        )}
      </div>

      {/* Main game area */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Top player */}
        <div className="flex justify-center pt-2 px-2 flex-shrink-0">
          <FaceDownHand
            count={getCardCount(topSeat)}
            name={getPlayerName(topSeat)}
            seat={topSeat}
            isCurrentTurn={currentTurn === topSeat}
          />
        </div>

        {/* Middle row: left player, trick area, right player */}
        <div className="flex items-center justify-between px-2 py-2 flex-1 min-h-0">
          {/* Left player */}
          <div className="flex-shrink-0">
            <FaceDownHand
              count={getCardCount(leftSeat)}
              name={getPlayerName(leftSeat)}
              seat={leftSeat}
              isCurrentTurn={currentTurn === leftSeat}
            />
          </div>

          {/* Center trick area */}
          <div className="flex-1 flex items-center justify-center">
            <TrickArea
              currentTrick={currentTrick}
              lastTrick={lastTrick}
              mySeat={mySeat}
              players={players}
              trumpSuit={trumpSuit}
              ledSuit={ledSuit}
              trickWinner={trickWinner}
            />
          </div>

          {/* Right player */}
          <div className="flex-shrink-0">
            <FaceDownHand
              count={getCardCount(rightSeat)}
              name={getPlayerName(rightSeat)}
              seat={rightSeat}
              isCurrentTurn={currentTurn === rightSeat}
            />
          </div>
        </div>

        {/* My hand at bottom */}
        <div className="pb-1 px-1 flex-shrink-0 overflow-x-auto">
          <Hand
            cards={myCards}
            isMyTurn={isMyTurn}
            ledSuit={ledSuit}
            trumpSuit={trumpSuit}
            onPlayCard={onPlayCard}
            lastError={lastError}
          />
        </div>
      </div>

      {/* Sidebar / info bar */}
      <div className="flex-shrink-0">
        <Sidebar
          players={players}
          mySeat={mySeat}
          currentTurn={currentTurn}
          trumpSuit={trumpSuit}
          trumpSetBySeat={trumpSetBySeat}
          trickCount={trickCount}
          tensCount={tensCount}
          capturedTens={capturedTens ?? {}}
          score={score}
          dealer={dealer}
        />
      </div>
    </div>
  );
}
