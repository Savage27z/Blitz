"use client";

import { motion } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";
import { getFlag } from "@/lib/flags";

interface StatBarProps {
  label: string;
  left: number;
  right: number;
  leftColor?: string;
  rightColor?: string;
}

function StatBar({ label, left, right, leftColor = "bg-amber-primary", rightColor = "bg-white/30" }: StatBarProps) {
  const total = left + right || 1;
  const leftPct = (left / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-right font-mono text-[0.6875rem] text-offwhite">{left}</span>
      <div className="flex-1">
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: "50%" }}
            animate={{ width: `${leftPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`${leftColor} rounded-full`}
          />
          <div className="flex-1" />
        </div>
        <p className="mt-1 text-center text-[0.6rem] uppercase tracking-wider text-muted">{label}</p>
      </div>
      <span className="w-6 font-mono text-[0.6875rem] text-offwhite">{right}</span>
    </div>
  );
}

export default function LiveStats() {
  const { team1Name, team2Name, events, gamePhase } = useMarketStore();

  const hasData = events.length > 0 || ["H1", "HT", "H2", "ET1", "ET2", "PE"].includes(gamePhase);

  const t1Corners = events.filter((e) => e.type === "corner" && e.team === 1).length;
  const t2Corners = events.filter((e) => e.type === "corner" && e.team === 2).length;
  const t1Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 1).length;
  const t2Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 2).length;
  const t1Dangers = events.filter((e) => e.type === "danger" && e.team === 1).length;
  const t2Dangers = events.filter((e) => e.type === "danger" && e.team === 2).length;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFlag(team1Name)}</span>
            <span className="text-[0.75rem] font-medium text-offwhite">{team1Name}</span>
          </div>
          <span className="eyebrow text-[0.55rem] text-muted-light">MATCH STATS</span>
          <div className="flex items-center gap-2">
            <span className="text-[0.75rem] font-medium text-offwhite">{team2Name}</span>
            <span className="text-lg">{getFlag(team2Name)}</span>
          </div>
        </div>
        <p className="py-4 text-center text-[0.8125rem] text-muted">
          Stats will appear when the match is live
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFlag(team1Name)}</span>
          <span className="text-[0.75rem] font-medium text-offwhite">{team1Name}</span>
        </div>
        <span className="eyebrow text-[0.55rem] text-muted-light">MATCH STATS</span>
        <div className="flex items-center gap-2">
          <span className="text-[0.75rem] font-medium text-offwhite">{team2Name}</span>
          <span className="text-lg">{getFlag(team2Name)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <StatBar label="Possession" left={50} right={50} />
        <StatBar label="Shots on Target" left={0} right={0} />
        <StatBar label="Corners" left={t1Corners} right={t2Corners} />
        <StatBar label="Cards" left={t1Cards} right={t2Cards} />
        <StatBar label="Dangerous Attacks" left={t1Dangers} right={t2Dangers} />
      </div>
    </div>
  );
}
