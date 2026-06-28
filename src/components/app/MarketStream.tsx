"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";
import MarketCard from "./MarketCard";
import StakeModal from "./StakeModal";

export default function MarketStream() {
  const activeMarkets = useMarketStore((s) => s.activeMarkets);
  const gamePhase = useMarketStore((s) => s.gamePhase);
  const isCompleted = ["F", "FET", "FPE", "WET", "WPE"].includes(gamePhase);
  const [stakingTarget, setStakingTarget] = useState<{
    marketId: string;
    outcome: 0 | 1;
  } | null>(null);

  const handleStake = (marketId: string, outcome: 0 | 1) => {
    if (isCompleted) return;
    setStakingTarget({ marketId, outcome });
  };

  const targetMarket = stakingTarget
    ? activeMarkets.find((m) => m.id === stakingTarget.marketId)
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <span className="text-[0.75rem] font-semibold text-offwhite">Active Markets</span>
        <span className={`rounded-full px-2.5 py-0.5 font-mono text-[0.6875rem] font-semibold ${
          activeMarkets.length > 0
            ? "border border-amber-primary/20 bg-amber-primary/10 text-amber-primary"
            : "border border-white/[0.06] bg-white/[0.03] text-white/40"
        }`}>
          {activeMarkets.length}
        </span>
      </div>

      <div className="max-h-[520px] space-y-3 overflow-y-auto p-4">
        {activeMarkets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                <span className="text-xl text-white/20">📈</span>
              </div>
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-warm-dark bg-white/20" />
            </div>
            <div className="text-center">
              <p className="text-[0.8125rem] font-medium text-white/40">
                {isCompleted ? "Match ended" : "No active markets"}
              </p>
              <p className="mt-1 text-[0.6875rem] text-white/20">
                {isCompleted
                  ? "All markets have been settled"
                  : "Toggle Demo Simulation above, or wait for live match events"}
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activeMarkets.map((market) => (
              <MarketCard key={market.id} market={market} onStake={handleStake} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {stakingTarget && targetMarket && (
        <StakeModal
          market={targetMarket}
          outcome={stakingTarget.outcome}
          onClose={() => setStakingTarget(null)}
        />
      )}
    </div>
  );
}
