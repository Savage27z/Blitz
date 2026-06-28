"use client";

import { motion } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";
import Flag from "@/components/app/Flag";

interface StatBarProps {
  label: string;
  left: number;
  right: number;
}

function StatBar({ label, left, right }: StatBarProps) {
  const total = left + right || 1;
  const leftPct = (left / total) * 100;
  const rightPct = (right / total) * 100;

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[0.75rem] font-medium tabular-nums text-offwhite">{left}</span>
        <span className="text-[0.6rem] font-medium uppercase tracking-widest text-white/30 transition-colors group-hover:text-white/50">{label}</span>
        <span className="font-mono text-[0.75rem] font-medium tabular-nums text-offwhite">{right}</span>
      </div>
      <div className="flex h-1 gap-0.5 overflow-hidden rounded-full">
        <motion.div
          initial={{ width: "50%" }}
          animate={{ width: `${leftPct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-full bg-amber-primary"
        />
        <motion.div
          initial={{ width: "50%" }}
          animate={{ width: `${rightPct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-full bg-white/20"
        />
      </div>
    </div>
  );
}

export default function LiveStats() {
  const { team1Name, team2Name, events, gamePhase, matchStats } = useMarketStore();

  const hasData = events.length > 0 || ["H1", "HT", "H2", "ET1", "ET2", "PE", "HTET"].includes(gamePhase);

  const t1Corners = events.filter((e) => e.type === "corner" && e.team === 1).length;
  const t2Corners = events.filter((e) => e.type === "corner" && e.team === 2).length;
  const t1Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 1).length;
  const t2Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 2).length;
  const t1Dangers = events.filter((e) => e.type === "danger" && e.team === 1).length;
  const t2Dangers = events.filter((e) => e.type === "danger" && e.team === 2).length;

  const possession = matchStats.possession;
  const t1Possession = Math.round(possession);
  const t2Possession = 100 - t1Possession;

  const t1Shots = matchStats.shotsOnTarget[0] || t1Dangers;
  const t2Shots = matchStats.shotsOnTarget[1] || t2Dangers;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <Flag team={team1Name} size={22} />
          <span className="text-[0.8125rem] font-semibold text-offwhite">{team1Name}</span>
        </div>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[0.55rem] font-medium uppercase tracking-widest text-white/40">
          Stats
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[0.8125rem] font-semibold text-offwhite">{team2Name}</span>
          <Flag team={team2Name} size={22} />
        </div>
      </div>

      <div className="p-5">
        {!hasData ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02]">
              <span className="text-[0.75rem] text-white/20">⏱</span>
            </div>
            <p className="text-[0.8125rem] text-white/30">
              Stats will appear when the match is live
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <StatBar label="Possession" left={t1Possession} right={t2Possession} />
            <StatBar label="Shots on Target" left={t1Shots} right={t2Shots} />
            <StatBar label="Corners" left={t1Corners} right={t2Corners} />
            <StatBar label="Cards" left={t1Cards} right={t2Cards} />
            <StatBar label="Dangerous Attacks" left={t1Dangers} right={t2Dangers} />
          </div>
        )}
      </div>
    </div>
  );
}
