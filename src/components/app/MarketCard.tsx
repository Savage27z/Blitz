"use client";

import { motion } from "framer-motion";
import CountdownTimer from "@/components/ui/CountdownTimer";
import type { MicroMarket } from "@/lib/markets/types";

interface Props {
  market: MicroMarket;
  onStake: (marketId: string, outcome: 0 | 1) => void;
}

export default function MarketCard({ market, onStake }: Props) {
  const totalPool = market.totalStaked[0] + market.totalStaked[1];
  const prob0 = totalPool > 0 ? (market.totalStaked[0] / totalPool) * 100 : 50;
  const isExpired = Date.now() >= market.expiresAt;
  const isLocked = market.status === "locked" || isExpired;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, height: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <div className="flex items-start justify-between">
        <p className="text-[0.8125rem] font-medium leading-snug text-offwhite">
          {market.question}
        </p>
        <CountdownTimer expiresAt={market.expiresAt} />
      </div>

      {/* Probability bar */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-700"
          style={{ width: `${prob0}%` }}
        />
      </div>

      {/* Outcome buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={isLocked}
          onClick={() => onStake(market.id, 0)}
          className="group rounded-lg border border-green-500/20 bg-green-500/[0.06] px-3 py-2.5 text-center transition-all hover:border-green-500/40 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block text-[0.6875rem] text-muted-light">
            {market.outcomes[0]}
          </span>
          <span className="mt-0.5 block font-mono text-[0.75rem] font-semibold text-green-400">
            {prob0.toFixed(0)}%
          </span>
        </button>
        <button
          disabled={isLocked}
          onClick={() => onStake(market.id, 1)}
          className="group rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-center transition-all hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block text-[0.6875rem] text-muted-light">
            {market.outcomes[1]}
          </span>
          <span className="mt-0.5 block font-mono text-[0.75rem] font-semibold text-red-400">
            {(100 - prob0).toFixed(0)}%
          </span>
        </button>
      </div>

      {isLocked && (
        <p className="mt-2 text-center text-[0.6875rem] text-muted">
          Market locked — resolving soon
        </p>
      )}
    </motion.div>
  );
}
