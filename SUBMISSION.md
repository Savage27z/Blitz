# Blitz — Hackathon Submission

## One-liner

Real-time prediction markets that live and die during a live FIFA World Cup 2026 match — powered by TxODDS Merkle-verified data on Solana.

---

## Problem

Traditional prediction markets are boring. You bet on "who wins?" and wait 90 minutes. The action happens in moments — a counter-attack at 73', a penalty in extra time, a red card that changes everything. Those moments are untradeable.

## Solution

Blitz generates **binary micro-markets in real-time** from live match events:

- "Goal before 45'? YES / NO" (resolves at half-time)
- "Next corner: Croatia or Ghana?" (resolves in ~2 minutes)
- "Total goals over 2.5 by 60'?" (resolves at 60th minute)

Markets open, get traded, and auto-settle **on-chain within minutes** while the game is still playing.

---

## TxODDS Integration

| Feature | How We Use TxODDS |
|---------|-------------------|
| Real-time scores | SSE stream drives market generation |
| Match events | Goals, corners, cards trigger new markets |
| Merkle proofs | `stat-validation` API provides proofs for on-chain settlement |
| Fixture data | Live World Cup 2026 schedule and participants |
| On-chain validation | TxLINE program verifies proofs against daily Merkle roots |

### On-Chain Flow

```
User stakes YES on "Goal before 45'"
  → create_intent (TxLINE program, Solana devnet)
  → Intent stored in PDA with terms hash

Half-time arrives, no goal scored → NO wins
  → Fetch Merkle proof from TxODDS /stat-validation
  → claim_via_resolution (TxLINE program)
  → Program verifies proof against on-chain root
  → Winner receives payout
```

---

## What We Built

1. **Market Engine** — Generates binary markets from SSE events in real-time
2. **SSE Integration** — Server-proxied streams from TxODDS with auth
3. **On-chain Staking** — `create_intent` with proper PDA derivation and terms hashing
4. **On-chain Settlement** — `claim_via_resolution` with Merkle proof fetching
5. **API Activation Script** — Automated subscription + token flow
6. **Full Production UI** — Real fixtures, live stats, pitch visualization, wallet connection

---

## Technical Highlights

- **Zero mock data** — All fixtures and scores are live from TxODDS
- **Correct instruction encoding** — Manual Anchor discriminator + arg serialization for TxLINE
- **PDA derivation** — order_intent, intent_vault, token_treasury, pricing_matrix
- **SHA-256 terms hashing** — Deterministic market terms for on-chain verification
- **Merkle proof consumption** — stat-validation proofs mapped to claim instruction format

---

## Demo Script

1. Open `/app` → See real upcoming World Cup 2026 fixtures
2. Click into a match → See match header, pitch, stats
3. Toggle "Demo Simulation" → Watch markets generate in real-time
4. Connect wallet (Phantom) → Click YES/NO on a market → See on-chain intent
5. Market resolves → Settlement with Merkle proof

---

## Team

Solo builder.

---

## Links

- Live app: [deploy URL]
- GitHub: [repo URL]
- Devnet wallet: `9rLHZzcRtdtLPiU7s8q27CHfenAsRHVAbnDXuwoKvr2z`
- TxLINE Program: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
