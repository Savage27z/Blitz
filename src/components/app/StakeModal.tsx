"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMarketStore } from "@/stores/marketStore";
import { createIntent } from "@/lib/solana/program";
import { SOLSCAN_BASE, SOLSCAN_CLUSTER_PARAM } from "@/lib/solana/constants";
import type { MicroMarket } from "@/lib/markets/types";

interface Props {
  market: MicroMarket;
  outcome: 0 | 1;
  onClose: () => void;
}

export default function StakeModal({ market, outcome, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stakeOnMarket = useMarketStore((s) => s.stakeOnMarket);

  const { publicKey, wallet, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const numAmount = parseFloat(amount) || 0;
  const totalPool = market.totalStaked[0] + market.totalStaked[1] + numAmount;
  const yourShare = totalPool > 0 ? numAmount / (market.totalStaked[outcome] + numAmount) : 0;
  const potentialPayout = yourShare * totalPool;

  const handleStake = async () => {
    if (numAmount <= 0) return;

    if (!publicKey || !signTransaction) {
      setVisible(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const signature = await createIntent({
        connection,
        wallet: { publicKey, signTransaction, signAllTransactions: (wallet?.adapter as any)?.signAllTransactions?.bind(wallet?.adapter) },
        fixtureId: market.fixtureId,
        marketType: market.type,
        outcome,
        amount: numAmount,
      });

      stakeOnMarket(market.id, outcome, numAmount);
      setTxHash(signature);
    } catch (err: any) {
      console.error("Stake error:", err);
      setError(err?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const solscanUrl = txHash ? `${SOLSCAN_BASE}/${txHash}${SOLSCAN_CLUSTER_PARAM}` : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-warm-dark p-6 shadow-2xl"
        >
          {txHash ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-medium text-offwhite">Stake Confirmed On-Chain</h3>
              <p className="mt-2 text-[0.8125rem] text-muted">
                {numAmount} USDT on &quot;{market.outcomes[outcome]}&quot;
              </p>
              {solscanUrl && (
                <a
                  href={solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-mono text-[0.6875rem] text-amber-primary hover:underline"
                >
                  View on Solscan →
                </a>
              )}
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-amber-primary py-3 text-[0.875rem] font-semibold text-warm-dark"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[0.9375rem] font-medium text-offwhite">
                    Place Stake
                  </h3>
                  <p className="mt-1 text-[0.75rem] text-muted">
                    {market.question}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted transition-colors hover:text-offwhite"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5">
                <div
                  className={`rounded-lg border px-4 py-3 ${
                    outcome === 0
                      ? "border-green-500/30 bg-green-500/[0.06]"
                      : "border-red-500/30 bg-red-500/[0.06]"
                  }`}
                >
                  <span className="text-[0.8125rem] font-medium text-offwhite">
                    {market.outcomes[outcome]}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[0.6875rem] text-muted">Amount (USDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.1"
                  className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-mono text-offwhite placeholder:text-muted/50 focus:border-amber-primary/50 focus:outline-none"
                />
                <div className="mt-2 flex gap-2">
                  {[1, 5, 10, 25].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.6875rem] text-muted transition-colors hover:text-offwhite"
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {numAmount > 0 && (
                <div className="mt-4 space-y-2 rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <div className="flex justify-between text-[0.75rem]">
                    <span className="text-muted">Potential payout</span>
                    <span className="font-mono text-green-400">
                      ${potentialPayout.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[0.75rem]">
                    <span className="text-muted">Your share of pool</span>
                    <span className="font-mono text-offwhite">
                      {(yourShare * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-[0.75rem] text-red-400">
                  {error}
                </div>
              )}

              {!publicKey && (
                <p className="mt-3 text-center text-[0.6875rem] text-amber-primary/80">
                  Connect your wallet to stake
                </p>
              )}

              <button
                onClick={handleStake}
                disabled={numAmount <= 0 || submitting}
                className="mt-5 w-full rounded-xl bg-amber-primary py-3.5 text-[0.875rem] font-semibold text-warm-dark transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Confirming on-chain..."
                  : !publicKey
                  ? "Connect Wallet"
                  : `Stake $${numAmount || "0"} USDT`}
              </button>

              <p className="mt-3 text-center text-[0.625rem] text-muted">
                On-chain settlement via TxODDS Merkle proof • Solana devnet
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
