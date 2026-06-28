# Blitz Demo Guide

## Live app

https://blitz-pied.vercel.app

## Judge setup (5 minutes)

### 1. Wallet

- Install [Phantom](https://phantom.app/) or Solflare
- Switch network to **Solana Devnet**

### 2. Fund wallet

- **SOL** (gas): use the [Solana devnet faucet](https://faucet.solana.com/)
- **USDT** (staking): you need devnet USDT at mint `ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh`
  - If you have devnet USDT, send a small amount to your wallet
  - The app auto-creates your USDT token account on first stake

### 3. Activate TxODDS API (for local dev only)

```bash
cp .env.example .env.local
# Fill in TXODDS_JWT and TXODDS_API_TOKEN from your TxLINE subscription
npm run activate-api
```

Production (Vercel) already has credentials configured.

---

## Demo script (2–3 min)

### Step 1 — Browse fixtures

1. Go to `/app`
2. Switch tabs: **Live**, **Upcoming**, **Completed**
3. All fixture data comes from TxODDS (real World Cup 2026 schedule)

### Step 2 — Demo simulation

1. Open any **Upcoming** match (or one without live SSE)
2. Toggle **Demo Simulation** ON
3. Within ~6 seconds you should see:
   - Events in the match feed (corners, danger, goals)
   - **Active Markets** appearing on the right
   - Countdown timers on market cards

### Step 3 — Stake on-chain

1. Click **YES** or **NO** on an open market
2. Connect Phantom (devnet)
3. Enter stake amount (e.g. $1 USDT) → **Stake**
4. Confirm transaction → Solscan link appears

### Step 4 — Settlement

1. Wait for market timer to expire (~3–5 min in demo, faster if event resolves early)
2. Market moves to **Settled Markets** with outcome
3. Check **Profile** — stake status updates to `won` or `lost`

---

## What's on-chain vs off-chain

| Feature | Status |
|---------|--------|
| Real fixtures/scores (TxODDS) | ✅ Live |
| Market generation from events | ✅ Works (demo + live SSE) |
| On-chain stake (`create_intent`) | ✅ Devnet |
| UI settlement (outcome resolution) | ✅ Works |
| On-chain claim (`claim_via_resolution`) | 🔜 Requires matched trades via `execute_match` |

Stakes are recorded on-chain as order intents. Full Merkle-verified payout requires matched opposing intents — infrastructure is built (`stat-validation` proxy) and is the next integration step.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No markets in demo | Ensure Demo Simulation is ON and match isn't completed |
| Stake fails "insufficient funds" | Fund devnet USDT + SOL |
| Stake fails program error | Check wallet is on devnet, not mainnet |
| No live matches | Use Demo Simulation on any upcoming fixture |
| Completed tab empty | Games appear ~2 hours after kickoff |

---

## Repo

https://github.com/Savage27z/Blitz
