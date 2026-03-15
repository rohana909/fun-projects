# Mendikot — Real-time Multiplayer Card Game

A real-time multiplayer implementation of Mendikot, the classic Indian trick-taking card game played by 4 players in two teams.

## Features

- Real-time multiplayer for exactly 4 players using Pusher WebSockets
- Full Mendikot rules: suit following, cut hukum (setting trump), trick counting
- Mendikot and Whitewash detection
- Persistent score across multiple hands
- Mobile-responsive design with a green felt card table aesthetic
- Room-based gameplay with shareable 6-character room codes
- Automatic seat/team assignment
- No account required — just a name

## Tech Stack

- **Framework**: Next.js 14 (Pages Router) with TypeScript
- **Real-time**: Pusher Channels (WebSockets)
- **Styling**: Tailwind CSS
- **State**: In-memory Map (server-side); localStorage (client-side identity)
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd mendikot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Pusher

1. Go to [pusher.com](https://pusher.com) and create a free account
2. From the dashboard, click **Create app**
3. Give it a name (e.g. "mendikot"), select a cluster close to you, choose **React** as frontend and **Node.js** as backend
4. Click **Create app**
5. Go to **App Keys** — you'll see `app_id`, `key`, `secret`, and `cluster`

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Pusher credentials:

```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

Note: `NEXT_PUBLIC_*` values are the same key/cluster — just duplicated so the browser can access them.

### 5. Run the development server

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

### 1. Build locally (optional check)

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel via the [Vercel dashboard](https://vercel.com).

### 3. Set environment variables in Vercel

In your Vercel project settings, under **Environment Variables**, add:

- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

> **Note**: The in-memory game store works on a single server process. For high-traffic production use, replace the Map in `lib/gameStore.ts` with Redis (e.g., Upstash) to persist state across Vercel serverless function invocations.

## Project Structure

```
mendikot/
├── lib/
│   ├── gameLogic.ts      # Card game rules, deck, trick resolution
│   ├── gameStore.ts      # In-memory room state (Map)
│   └── pusher.ts         # Server-side Pusher singleton
├── pages/
│   ├── index.tsx         # Landing page (create/join)
│   ├── room/[code].tsx   # Game room page
│   └── api/              # REST API endpoints
├── components/           # React UI components
└── styles/globals.css
```

## License

MIT
