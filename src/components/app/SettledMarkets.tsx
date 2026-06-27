"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";

export default function SettledMarkets() {
  const settled = useMarketStore((s) => s.settledMarkets);

  if (settled.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <span className="eyebrow text-[0.6rem] text-muted-light">
          SETTLED MARKETS
        </span>
      </div>

      <div className="space-y-2 p-4">
        <AnimatePresence initial={false}>
          {settled.map((market) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-3"
            >
              <div className="flex-1">
                <p className="text-[0.8125rem] text-muted-light">
                  {market.question}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[0.625rem] font-semibold ${
                      market.result === 0
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {market.result !== null ? market.outcomes[market.result] : "N/A"}
                  </span>
                  {market.settlementProof && (
                    <a
                      href={`https://explorer.solana.com/tx/${market.settlementProof}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.625rem] text-amber-primary hover:underline"
                    >
                      View proof →
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
