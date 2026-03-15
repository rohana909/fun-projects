# Mendikot — Multiplayer Card Game

A multiplayer implementation of Mendikot, the classic Indian trick-taking card game played by 4 players in two teams.

## Features

- Multiplayer for exactly 4 players using client-side polling (no external services needed)
- Full Mendikot rules: suit following, cut hukum (setting trump), trick counting
- Mendikot and Whitewash detection
- Persistent score across multiple hands
- Mobile-responsive design with a green felt card table aesthetic
- Room-based gameplay with shareable 6-character room codes
- Automatic seat/team assignment
- No account required — just a name

## Tech Stack

- **Framework**: Next.js 14 (Pages Router) with TypeScript
- **Real-time**: Client-side polling every 1 second (GET /api/room-state)
- **Styling**: Tailwind CSS
- **State**: Vercel KV (Redis) server-side; localStorage (client-side identity)
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd mendikot
```

### 2. Add Vercel KV to your project (free tier)

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → **Storage** → **Create KV Database** → link to your project. Vercel will auto-add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your project's environment variables.

For local development, copy `.env.example` to `.env.local` and fill in the values from your KV database settings.

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Create a game**: Enter your name and click "Create Game". You'll be taken to the room lobby.
2. **Share the link**: Share the room URL (or the 6-character code) with 3 friends.
3. **Join**: Friends go to the URL and enter their name to join.
4. **Start**: Once all 4 players have joined, the host (creator) clicks "Start Game".
5. **Play**: Take turns playing cards. The player to the dealer's right goes first.

### Rules Summary

- 4 players, 2 teams: **Team A** (seats 0 & 2) vs **Team B** (seats 1 & 3)
- Cards dealt in batches: 5, 4, 4
- **You must follow suit** if you have a card of the led suit
- **Cut Hukum**: If you cannot follow suit and no trump has been set, the suit of the card you play becomes trump for the rest of the hand
- **Tens are special**: The team that captures more tens (out of 4) wins the hand
  - If tied 2-2, the team with 7+ tricks wins
- **Mendikot**: Capturing all 4 tens
- **Whitewash**: Winning all 13 tricks (also called Bavni)
- Play continues until all 13 tricks are taken, then the hand result is shown
- The dealer rotates anticlockwise each hand

## Deployment to Vercel

### 1. Create a Vercel KV database

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → **Storage** → **Create KV Database** → link it to your project. The `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables will be added automatically.

### 2. Build locally (optional check)

```bash
npm run build
```

### 3. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel via the [Vercel dashboard](https://vercel.com).

## Project Structure

```
mendikot/
├── lib/
│   ├── gameLogic.ts      # Card game rules, deck, trick resolution
│   └── gameStore.ts      # Vercel KV room state (Redis)
├── pages/
│   ├── index.tsx         # Landing page (create/join)
│   ├── room/[code].tsx   # Game room page (polls /api/room-state every 1s)
│   └── api/              # REST API endpoints
├── components/           # React UI components
└── styles/globals.css
```

## License

MIT
