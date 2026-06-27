"use client";

import { motion } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";
import { getFlag } from "@/lib/flags";

const PHASE_LABELS: Record<string, string> = {
  NS: "Not Started",
  H1: "1st Half",
  HT: "Half Time",
  H2: "2nd Half",
  F: "Full Time",
  ET1: "Extra Time 1",
  ET2: "Extra Time 2",
  PE: "Penalties",
};

export default function MatchHeader() {
  const { team1Name, team2Name, score, gamePhase, matchMinute, connected } =
    useMarketStore();

  const isLive = ["H1", "H2", "ET1", "ET2", "PE"].includes(gamePhase);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Background glow */}
      {isLive && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-red-500/[0.06] blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-amber-primary/[0.04] blur-3xl" />
        </div>
      )}

      {/* Top status bar */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isLive ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-40" />
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            </span>
          ) : (
            <span className="inline-flex h-2 w-2 rounded-full bg-white/20" />
          )}
          <span className="font-mono text-[0.65rem] font-medium uppercase tracking-widest text-white/50">
            {isLive ? "Live" : connected ? "Connected" : "Awaiting kickoff"}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-[0.6875rem] font-medium text-white/60 backdrop-blur-sm">
            {PHASE_LABELS[gamePhase] || gamePhase}
          </span>
          {isLive && matchMinute > 0 && (
            <motion.span
              key={matchMinute}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-[0.8125rem] font-semibold text-amber-primary"
            >
              {matchMinute}&apos;
            </motion.span>
          )}
        </div>
      </div>

      {/* Score section */}
      <div className="relative mt-8 flex items-center justify-between">
        {/* Team 1 */}
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-3xl shadow-inner">
            {getFlag(team1Name)}
          </div>
          <div>
            <p className="text-[1.125rem] font-semibold tracking-tight text-offwhite">{team1Name}</p>
            <p className="mt-0.5 text-[0.65rem] text-white/30">Home</p>
          </div>
        </div>

        {/* Score */}
        <div className="mx-4 flex items-center gap-1">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/40 px-6 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <span className="font-mono text-4xl font-bold tabular-nums text-offwhite">{score[0]}</span>
            <span className="text-lg text-white/20">–</span>
            <span className="font-mono text-4xl font-bold tabular-nums text-offwhite">{score[1]}</span>
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="text-right">
            <p className="text-[1.125rem] font-semibold tracking-tight text-offwhite">{team2Name}</p>
            <p className="mt-0.5 text-[0.65rem] text-white/30">Away</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-3xl shadow-inner">
            {getFlag(team2Name)}
          </div>
        </div>
      </div>
    </div>
  );
}
