# Blitz — Hackathon Submission

## One-liner

Real-time prediction markets that live and die during a live FIFA World Cup 2026 match — powered by TxODDS live data and Solana staking via TxLINE.

---

## Problem

Traditional prediction markets are boring. You bet on "who wins?" and wait 90 minutes. The action happens in moments — a counter-attack at 73', a penalty in extra time, a red card that changes everything. Those moments are untradeable.

## Solution

Blitz generates **binary micro-markets in real-time** from live match events:

- "Next goal: Team A or Team B?" (resolves in ~3 minutes)
- "Over X total goals by end of half?" (resolves at expiry)
- "Another card before 75'?" (resolves on event or timeout)

Markets open, get traded, and auto-settle in the UI while the game is still playing. Stakes are recorded on-chain via TxLINE `create_intent`.

---

## TxODDS Integration

| Feature | How We Use TxODDS |
|---------|-------------------|
| Real-time scores | SSE stream drives market generation |
| Match events | Goals, corners, cards trigger new markets |
| Fixture data | Live World Cup 2026 schedule and participants |
| Merkle proofs | `stat-validation` proxy ready for on-chain settlement |
| Stat snapshots | Completed match scores via scores snapshot API |

### On-Chain Flow (staking)

```
User stakes YES on "Next goal: Brazil or Argentina?"
  → create_intent (TxLINE program, wrapped SOL escrow)
  → SOL escrowed in intent_vault PDA
  → Intent stored with SHA-256 terms hash
```

### Settlement (current + roadmap)

```
Market timer expires → UI resolves outcome from live events
  → Profile stake status updates (won/lost)
  → Full on-chain claim via claim_via_resolution (requires execute_match pairing — next step)
```

---

## What We Built

1. **Market Engine** — Generates binary markets from SSE/demo events in real-time
2. **SSE Integration** — Server-proxied streams from TxODDS with JWT auto-refresh
3. **On-chain Staking** — `create_intent` with correct PDA derivation and ATA creation
4. **Settlement UI** — Auto-resolves markets from event feed; syncs profile stakes
5. **API Activation Script** — `npm run activate-api` for TxODDS subscription
6. **Production UI** — Real fixtures, live stats, pitch visualization, wallet connection
7. **Demo Mode** — Full UX simulation when no live match is available

---

## Demo Script

See [DEMO.md](./DEMO.md) for judge setup (wallet, devnet SOL, troubleshooting).

1. Open `/app` → See real World Cup 2026 fixtures
2. Open a match → Toggle **Demo Simulation**
3. Watch markets generate from simulated events
4. Connect wallet (Phantom devnet) → Stake on a market → On-chain intent confirmed
5. Wait for resolution → Check settled markets + profile

---

## Team

Solo builder.

---

## Links

- Live app: https://blitz-pied.vercel.app
- GitHub: https://github.com/Savage27z/Blitz
- Demo guide: [DEMO.md](./DEMO.md)
- Devnet wallet: `9rLHZzcRtdtLPiU7s8q27CHfenAsRHVAbnDXuwoKvr2z`
- TxLINE Program: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
