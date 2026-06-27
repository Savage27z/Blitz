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
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-[0.6rem] text-muted-light">
            ACTIVE MARKETS
          </span>
          <span className="font-mono text-[0.6875rem] text-amber-primary">
            {activeMarkets.length}
          </span>
        </div>
      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto p-4">
        {activeMarkets.length === 0 ? (
          <p className="py-8 text-center text-[0.8125rem] text-muted">
            {isCompleted
              ? "Match ended — no active markets"
              : "Markets will appear as events unfold..."}
          </p>
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
