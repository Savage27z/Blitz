# Blitz

**Real-time prediction markets for FIFA World Cup 2026, built on Solana.**

Blitz generates short-lived binary micro-markets during live matches — markets that open, get traded, and auto-settle on-chain within minutes while the game is still playing. Powered by TxODDS TxLINE real-time data and Merkle-verified settlement on Solana.

---

## How It Works

| Step | What Happens |
|------|-------------|
| 1. Match goes live | TxODDS streams real-time events (goals, corners, cards, possession) via Server-Sent Events |
| 2. Markets generate | The market engine creates binary micro-markets from each event — e.g. "Goal before 45'? YES/NO", "Next corner: Team A or B?" |
| 3. Users stake | Connect a Solana wallet, pick YES or NO, stake USDT via TxLINE `create_intent` |
| 4. On-chain settlement | When the market resolves, TxODDS Merkle proofs verify the outcome on-chain via `claim_via_resolution` |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 15)                     │
│                                                              │
│  ┌────────────┐   ┌───────────────┐   ┌──────────────────┐  │
│  │ Fixtures   │   │ Live Match    │   │ Market Engine    │  │
│  │ Dashboard  │   │ View + SSE    │   │ (event→market)  │  │
│  └────────────┘   └───────────────┘   └──────────────────┘  │
│                                                              │
│  ┌────────────┐   ┌───────────────┐   ┌──────────────────┐  │
│  │ Wallet     │   │ Stake Modal   │   │ Settlement       │  │
│  │ Adapter    │   │ (create_intent│   │ (claim w/ proof) │  │
│  └────────────┘   └───────────────┘   └──────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
              ┌─────────────┼─────────────────┐
              ▼             ▼                 ▼
   ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐
   │ TxODDS API   │  │ Solana Devnet │  │ TxLINE Program       │
   │              │  │               │  │                      │
   │ • SSE scores │  │ • RPC         │  │ • create_intent      │
   │ • Fixtures   │  │ • Transactions│  │ • execute_match      │
   │ • Merkle     │  │               │  │ • claim_via_resolution│
   │   proofs     │  │               │  │                      │
   └──────────────┘  └───────────────┘  └──────────────────────┘
```

### Data Flow

```
TxODDS SSE Stream
    → Next.js API Proxy (server-side auth)
        → Zustand Store (client state)
            → Market Engine (generates micro-markets from events)
                → UI (market cards with YES/NO + countdown)
                    → Solana TxLINE Program (on-chain staking & settlement)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State Management | Zustand |
| Blockchain | Solana (Devnet) |
| Wallet | `@solana/wallet-adapter-react` (Phantom, Solflare) |
| On-chain Program | `@solana/web3.js` — direct instruction building against TxLINE IDL |
| Data Feed | TxODDS TxLINE API — SSE streams for live scores + REST for fixtures |
| Settlement | Merkle proof verification via TxODDS `/api/scores/stat-validation` |

---

## Features

- **Live World Cup 2026 fixtures** — real data from TxODDS (20+ upcoming matches with team names, flags, kickoff times)
- **SSE streaming** — real-time score updates, match events, and odds changes during live games
- **Market generation engine** — converts match events into tradeable binary micro-markets with countdown timers
- **On-chain staking** — `create_intent` instruction with SHA-256 terms hashing, PDA derivation, and escrow
- **On-chain settlement** — `claim_via_resolution` with Merkle proof fetching and verification
- **Solana wallet integration** — Phantom and Solflare via wallet adapter
- **Live match view** — mini pitch visualization, real-time stats (possession, shots, corners, cards), event feed
- **Demo simulation** — test the full flow without waiting for a live match
- **Cinematic landing page** — stadium-inspired design with parallax, scroll animations, and editorial typography

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet browser extension (Phantom or Solflare)

### Installation

```bash
git clone https://github.com/Savage27z/Blitz.git
cd Blitz
npm install --legacy-peer-deps
```

### TxODDS API Activation

The included activation script handles the full setup:

1. Generates a Solana devnet wallet (saved to `.devnet-wallet.json`)
2. Gets a guest JWT from TxODDS
3. Subscribes on-chain to the TxODDS data feed (free tier)
4. Signs and activates a long-lived API token

```bash
# You'll need ~0.01 SOL on devnet for the subscription transaction
# The script attempts an airdrop, or you can manually fund the wallet
npx ts-node scripts/activate-api.ts
```

The script outputs the credentials you need for `.env.local`.

### Environment Variables

Create `.env.local` in the project root:

```env
TXODDS_JWT=<your-jwt-from-activation>
TXODDS_API_TOKEN=<your-api-token-from-activation>
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000/app](http://localhost:3000/app) for the fixtures dashboard.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── app/
│   │   ├── page.tsx                    # Fixtures dashboard (live/upcoming/completed)
│   │   ├── layout.tsx                  # App shell — sticky header, wallet provider
│   │   └── match/[fixtureId]/page.tsx  # Live match view with markets
│   ├── api/proxy/
│   │   ├── fixtures/route.ts           # Proxies TxODDS fixture list
│   │   ├── scores-stream/route.ts      # Proxies SSE score stream (adds auth)
│   │   ├── odds-stream/route.ts        # Proxies SSE odds stream
│   │   └── stat-validation/route.ts    # Proxies Merkle proof endpoint
│   └── providers.tsx                   # Solana ConnectionProvider + WalletProvider
├── components/
│   ├── app/
│   │   ├── MatchCard.tsx               # Fixture card with flags, date, status
│   │   ├── MatchHeader.tsx             # Live score header with connection status
│   │   ├── MarketCard.tsx              # YES/NO market with countdown + payout preview
│   │   ├── MarketStream.tsx            # Active markets panel
│   │   ├── StakeModal.tsx              # Stake flow — wallet → create_intent → tx confirmation
│   │   ├── LiveMatchFeed.tsx           # Scrolling event timeline
│   │   ├── LiveStats.tsx               # Stat comparison bars (possession, shots, etc.)
│   │   ├── MiniPitch.tsx               # SVG pitch with ball position indicator
│   │   ├── SettledMarkets.tsx          # Resolved markets with outcomes
│   │   ├── DashboardHero.tsx           # Hero banner with live count + network info
│   │   └── WalletButton.tsx            # Connect/disconnect wallet
│   └── (landing components)            # Hero, HowItWorks, Mission, Footer, etc.
├── hooks/
│   ├── useScoresStream.ts              # SSE connection → dispatches events to store
│   ├── useFixtures.ts                  # Fetches fixtures, maps PascalCase→camelCase
│   ├── useMarkets.ts                   # Listens to events, calls market engine
│   └── useDemoSimulation.ts            # Dispatches simulated events on interval
├── stores/
│   └── marketStore.ts                  # Zustand — match state, events, markets, score
├── lib/
│   ├── txodds/
│   │   ├── types.ts                    # SoccerScoreEvent, Fixture, OddsData interfaces
│   │   ├── client.ts                   # HTTP client with auth headers
│   │   └── constants.ts                # API base URLs
│   ├── solana/
│   │   ├── constants.ts                # Program ID, mints, Solscan URLs
│   │   ├── program.ts                  # create_intent — PDA derivation, terms hash, ix building
│   │   └── settlement.ts              # claim_via_resolution — Merkle proof fetch + ix building
│   └── markets/
│       ├── engine.ts                   # Event→market generation logic
│       ├── types.ts                    # MicroMarket, MarketType, MatchEvent interfaces
│       └── resolver.ts                 # Market resolution logic
└── scripts/
    └── activate-api.ts                 # One-time TxODDS subscription + API token activation
```

---

## On-Chain Integration

### TxLINE Program

Program ID: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` (devnet)

| Instruction | Purpose |
|------------|---------|
| `subscribe` | Subscribe to a TxODDS data tier (free World Cup tier) |
| `create_intent` | Place a prediction — stakes USDT into an escrow PDA |
| `execute_match` | Match opposing intents (YES vs NO on same market) |
| `claim_via_resolution` | Settle with Merkle proof — winner claims from vault |

### Program Derived Addresses

| PDA | Seeds | Purpose |
|-----|-------|---------|
| `order_intent` | `["order_intent", user, terms_hash]` | Stores the user's prediction intent |
| `intent_vault` | `["intent_vault", order_intent]` | Escrows the staked USDT |
| `token_treasury_v2` | `["token_treasury_v2"]` | Protocol fee treasury |
| `pricing_matrix` | `["pricing_matrix"]` | Subscription tier pricing |
| `daily_scores_merkle_roots` | `["daily_scores_merkle_roots", date_key]` | On-chain Merkle roots for verification |

### Settlement Flow

```
1. Market timer expires → check if outcome condition was met
2. Fetch Merkle proof:
   GET /api/scores/stat-validation?fixtureId={id}&seq={seq}&statKey={key}
3. Build claim_via_resolution instruction:
   - Encode terms (fixture, stat key, predicate, thresholds)
   - Encode batch summary (seq, timestamp, merkle leaf)
   - Attach fixture_proof[] and main_tree_proof[]
4. Submit transaction → program verifies proof against on-chain root
5. Vault releases funds to winner
```

---

## Demo Mode

When no live match is available, open any match page and toggle **Demo Simulation** to see:

- Simulated match events appearing in the feed (goals, corners, cards)
- Markets generating automatically from those events
- Countdown timers ticking down
- Markets resolving with outcomes

This demonstrates the full UX flow without requiring a live World Cup game.

---

## Environment

| Variable | Description |
|----------|-------------|
| `TXODDS_JWT` | Guest JWT for initial TxODDS API auth (expires, refreshed by activation) |
| `TXODDS_API_TOKEN` | Long-lived API token for SSE streams and fixtures |
| `NEXT_PUBLIC_SOLANA_RPC` | Solana RPC endpoint (devnet) |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Network identifier (`devnet` or `mainnet-beta`) |

---

## License

MIT
