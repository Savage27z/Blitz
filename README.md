# Blitz — Real-Time Prediction Markets for FIFA World Cup 2026

**Live micro-markets that open, trade, and settle on-chain in minutes — while the match is still playing.**

Built for the [TxODDS World Cup Hackathon](https://txline.txodds.com) — Track 1: Prediction Markets & Settlement.

---

## What is Blitz?

Traditional prediction markets make you wait 90 minutes for a match result. Blitz generates **short-lived binary micro-markets during live matches** — "Goal before 45'?", "Next corner: Team A or B?" — that resolve on-chain within minutes using TxODDS Merkle-verified match data.

### How It Works

1. **A match goes live** — TxODDS streams real-time events (goals, corners, cards, possession changes) via SSE
2. **Markets drop in real-time** — Blitz's engine generates binary micro-markets from each event
3. **Settle on-chain, instantly** — TxODDS Merkle proofs verify outcomes on Solana. Winners get paid before the next corner kick.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                    │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Fixtures │  │ Live Match   │  │ Market Engine     │  │
│  │ List     │  │ View (SSE)   │  │ (event→market)   │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
┌──────────────┐  ┌────────────┐  ┌──────────────────┐
│ TxODDS API   │  │ Solana     │  │ TxLINE Program   │
│ (SSE streams │  │ Devnet     │  │ (on-chain intents│
│  + fixtures) │  │            │  │  + settlement)   │
└──────────────┘  └────────────┘  └──────────────────┘
```

### Data Flow

```
TxODDS SSE → API Proxy → Zustand Store → Market Engine → UI
                                              │
                                              ▼
                                    Solana TxLINE Program
                                    (create_intent → match → claim_via_resolution)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand |
| Blockchain | Solana (Devnet) |
| Wallet | @solana/wallet-adapter (Phantom, Solflare) |
| Data Feed | TxODDS TxLINE API (SSE) |
| On-chain | TxLINE Program (`6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`) |

---

## Features

- **Real-time fixtures** from TxODDS World Cup 2026 data feed
- **Live SSE streaming** — scores, events, and odds update in real-time
- **Market generation engine** — automatically creates binary micro-markets from match events
- **On-chain staking** via TxLINE `create_intent` instruction
- **On-chain settlement** via `claim_via_resolution` with Merkle proof verification
- **Solana wallet integration** — connect Phantom or Solflare
- **Demo simulation mode** — test the full flow without waiting for a live match
- **Mini pitch visualization** — real-time ball position and match zones
- **Live stats dashboard** — possession, shots, corners, cards

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom or Solflare browser extension)

### Installation

```bash
git clone https://github.com/your-repo/blitz.git
cd blitz
npm install --legacy-peer-deps
```

### API Activation (one-time setup)

The activation script generates a devnet wallet, subscribes to TxODDS (free tier), and obtains API credentials:

```bash
# Fund a devnet wallet first (script generates one at .devnet-wallet.json)
npx ts-node scripts/activate-api.ts
```

This outputs credentials for `.env.local`. If the airdrop fails, manually send devnet SOL to the generated wallet address.

### Environment Variables

Create `.env.local`:

```env
TXODDS_JWT=<from activation script>
TXODDS_API_TOKEN=<from activation script>
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000/app](http://localhost:3000/app) to see the live dashboard.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── app/
│   │   ├── page.tsx             # Fixtures dashboard
│   │   ├── layout.tsx           # App shell with wallet provider
│   │   └── match/[fixtureId]/   # Live match view
│   ├── api/proxy/               # API proxy routes (auth, SSE, fixtures)
│   └── providers.tsx            # Solana wallet context
├── components/
│   ├── app/                     # App components (MatchCard, MarketCard, etc.)
│   └── landing/                 # Landing page components
├── hooks/
│   ├── useScoresStream.ts       # SSE hook for live scores
│   ├── useFixtures.ts           # Fetch & filter fixtures
│   ├── useMarkets.ts            # Market generation from events
│   └── useDemoSimulation.ts     # Demo mode simulation
├── stores/
│   └── marketStore.ts           # Zustand store
├── lib/
│   ├── txodds/                  # TxODDS client, types, auth
│   ├── solana/                  # Program interactions, constants
│   └── markets/                 # Market engine, types, resolver
└── scripts/
    └── activate-api.ts          # One-time API activation
```

---

## On-Chain Integration

### TxLINE Program

Blitz interacts with the TxLINE program on Solana devnet for:

1. **`create_intent`** — Place a prediction stake (YES/NO on a market outcome)
2. **`claim_via_resolution`** — Claim winnings using Merkle proofs from TxODDS stat validation API

### PDAs Used

- `order_intent` — Per-user prediction intent
- `intent_vault` — Escrow for staked tokens
- `token_treasury_v2` — Protocol treasury
- `pricing_matrix` — Subscription pricing
- `daily_scores_merkle_roots` — On-chain Merkle roots for stat verification

### Settlement Flow

```
1. Market resolves (match event confirms outcome)
2. Fetch Merkle proof from TxODDS /api/scores/stat-validation
3. Submit claim_via_resolution with proof to TxLINE program
4. Program verifies proof against on-chain Merkle root
5. Winner receives payout from intent vault
```

---

## Demo Mode

When no live match is available, toggle **Demo Simulation** on any match page to simulate:
- Real-time match events (goals, corners, cards)
- Market generation from those events
- Market countdown timers and resolution

---

## Hackathon Submission

**Track:** Prediction Markets & Settlement ($18K prize pool)

**Key differentiators:**
- Markets generated **during** a live match, not before kickoff
- Sub-minute settlement via Merkle proofs (no oracles, no delays)
- Real TxODDS data feed integration (not mock/simulated)
- Full on-chain flow: intent → match → settlement
- Production-quality UI with real World Cup 2026 fixtures

---

## License

MIT
