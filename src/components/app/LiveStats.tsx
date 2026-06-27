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
  const { team1Name, team2Name, score, events } = useMarketStore();

  const t1Corners = events.filter((e) => e.type === "corner" && e.team === 1).length;
  const t2Corners = events.filter((e) => e.type === "corner" && e.team === 2).length;
  const t1Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 1).length;
  const t2Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 2).length;
  const t1Dangers = events.filter((e) => e.type === "danger" && e.team === 1).length;
  const t2Dangers = events.filter((e) => e.type === "danger" && e.team === 2).length;

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
        <StatBar label="Possession" left={62} right={38} />
        <StatBar label="Shots on Target" left={5} right={3} />
        <StatBar label="Corners" left={t1Corners || 5} right={t2Corners || 3} />
        <StatBar label="Cards" left={t1Cards || 1} right={t2Cards || 1} />
        <StatBar label="Dangerous Attacks" left={t1Dangers || 4} right={t2Dangers || 2} />
      </div>
    </div>
  );
}
