// Types
export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank =
  | 'A'
  | 'K'
  | 'Q'
  | 'J'
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | '2';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface TrickCard {
  seat: number;
  card: Card;
}

export interface CompletedTrick {
  winner: number; // seat number
  cards: TrickCard[];
}

export interface Player {
  id: string;
  name: string;
  seat: number;
  isBot?: boolean;
}

export interface HandResult {
  team0Tricks: number;
  team1Tricks: number;
  team0Tens: number;
  team1Tens: number;
  winner: 0 | 1;
  isMendikot: boolean;
  isWhitewash: boolean;
  winnerNames: string[];
}

export type GameStatus = 'waiting' | 'playing' | 'hand_complete';

export interface GameRoom {
  code: string;
  hostId: string;
  players: Player[];
  status: GameStatus;

  hands: Record<number, Card[]>; // seat -> remaining cards
  dealer: number; // seat of current dealer
  currentTurn: number; // seat whose turn it is
  ledSuit: Suit | null; // suit led this trick
  trumpSuit: Suit | null; // null until cut hukum triggered
  trumpSetBySeat: number | null; // who triggered trump

  currentTrick: TrickCard[];
  completedTricks: CompletedTrick[];
  trickCount: [number, number]; // [team0, team1]
  tensCount: [number, number]; // [team0, team1]
  capturedTens: Partial<Record<Suit, 0 | 1>>; // suit -> team index that captured it

  lastTrick: CompletedTrick | null; // for display after trick
  handResult: HandResult | null;

  score: [number, number]; // wins across hands

  // Seat assignments set by host before game starts: playerId -> seat (0-3)
  seatAssignments: Record<string, number>;
}

const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
const RANKS: Rank[] = [
  'A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2',
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns the next seat in anticlockwise order (right to left)
export function anticlockwiseNext(seat: number): number {
  return (seat + 3) % 4;
}

// Deal cards anticlockwise starting from player to dealer's right
// Batches: 5, 4, 4 cards per player
export function dealCards(dealer: number): Record<number, Card[]> {
  const deck = shuffle(createDeck());
  const hands: Record<number, Card[]> = { 0: [], 1: [], 2: [], 3: [] };

  // Start from the player to the dealer's right (anticlockwise)
  const startSeat = (dealer + 3) % 4;

  let deckIndex = 0;

  // Deal in batches: 5, 4, 4
  const batches = [5, 4, 4];

  for (const batchSize of batches) {
    let seat = startSeat;
    for (let p = 0; p < 4; p++) {
      for (let c = 0; c < batchSize; c++) {
        hands[seat].push(deck[deckIndex++]);
      }
      seat = (seat + 3) % 4; // anticlockwise
    }
  }

  return hands;
}

// Lower index = higher rank
export function rankValue(rank: Rank): number {
  return RANKS.indexOf(rank);
}

// Returns true if challenger beats current best card
export function isBetter(
  challenger: Card,
  current: Card,
  ledSuit: Suit,
  trumpSuit: Suit | null
): boolean {
  const challengerIsTrump = trumpSuit !== null && challenger.suit === trumpSuit;
  const currentIsTrump = trumpSuit !== null && current.suit === trumpSuit;
  const challengerIsLed = challenger.suit === ledSuit;
  const currentIsLed = current.suit === ledSuit;

  // Trump beats non-trump
  if (challengerIsTrump && !currentIsTrump) return true;
  if (!challengerIsTrump && currentIsTrump) return false;

  // Both trump: compare rank
  if (challengerIsTrump && currentIsTrump) {
    return rankValue(challenger.rank) < rankValue(current.rank);
  }

  // No trump involved: led suit beats off-suit
  if (challengerIsLed && !currentIsLed) return true;
  if (!challengerIsLed && currentIsLed) return false;

  // Both same suit: compare rank (lower index = higher rank)
  if (challenger.suit === current.suit) {
    return rankValue(challenger.rank) < rankValue(current.rank);
  }

  // Neither is trump nor led: challenger cannot win
  return false;
}

// Returns the seat number of the trick winner
export function determineTrickWinner(
  trick: TrickCard[],
  ledSuit: Suit,
  trumpSuit: Suit | null
): number {
  let best = trick[0];
  for (let i = 1; i < trick.length; i++) {
    if (isBetter(trick[i].card, best.card, ledSuit, trumpSuit)) {
      best = trick[i];
    }
  }
  return best.seat;
}

// Calculate the result of a completed hand
export function calculateHandResult(room: GameRoom): HandResult {
  const team0Tricks = room.trickCount[0];
  const team1Tricks = room.trickCount[1];
  const team0Tens = room.tensCount[0];
  const team1Tens = room.tensCount[1];

  let winner: 0 | 1;

  if (team0Tens > team1Tens) {
    winner = 0;
  } else if (team1Tens > team0Tens) {
    winner = 1;
  } else {
    // Tied on tens (2-2): team with 7+ tricks wins
    winner = team0Tricks >= 7 ? 0 : 1;
  }

  const isMendikot =
    (winner === 0 && team0Tens === 4) || (winner === 1 && team1Tens === 4);
  const isWhitewash =
    (winner === 0 && team0Tricks === 13) ||
    (winner === 1 && team1Tricks === 13);

  // Get winner team member names
  const winnerSeats = winner === 0 ? [0, 2] : [1, 3];
  const winnerNames = room.players
    .filter((p) => winnerSeats.includes(p.seat))
    .map((p) => p.name);

  return {
    team0Tricks,
    team1Tricks,
    team0Tens,
    team1Tens,
    winner,
    isMendikot,
    isWhitewash,
    winnerNames,
  };
}

export function getTeam(seat: number): 0 | 1 {
  return (seat % 2) as 0 | 1;
}

export function suitSymbol(suit: Suit): string {
  switch (suit) {
    case 'S': return '♠';
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
  }
}

export function suitColor(suit: Suit): string {
  return suit === 'H' || suit === 'D' ? '#dc2626' : '#111111';
}

export const SUIT_ORDER: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 };

export function sortBySuit(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const suitDiff = SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
    if (suitDiff !== 0) return suitDiff;
    return rankValue(a.rank) - rankValue(b.rank);
  });
}

export function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}
