"use client";

import { useMarketStore } from "@/stores/marketStore";
import { getFlag, getStage } from "@/lib/flags";

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
  const { team1Name, team2Name, score, gamePhase, matchMinute, connected, fixtureId } =
    useMarketStore();

  const isLive = ["H1", "H2", "ET1", "ET2", "PE"].includes(gamePhase);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-1.5 w-1.5 rounded-full ${isLive ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" : "bg-muted"}`} />
          <span className="eyebrow text-[0.6rem] text-muted-light">
            {isLive ? "LIVE" : connected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[0.6875rem] font-medium text-muted-light">
            {PHASE_LABELS[gamePhase] || gamePhase}
          </span>
          {isLive && (
            <span className="font-mono text-[0.75rem] text-amber-primary">
              {matchMinute}&apos;
            </span>
          )}
        </div>
      </div>

      {/* Stage */}
      <div className="mt-3 text-center">
        <span className="rounded-full bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-amber-primary/80">
          {getStage(fixtureId || 0)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <span className="text-3xl">{getFlag(team1Name)}</span>
          <p className="text-lg font-medium text-offwhite">{team1Name}</p>
        </div>
        <div className="mx-6 flex items-center gap-3 font-mono text-4xl font-bold text-offwhite">
          <span>{score[0]}</span>
          <span className="text-lg text-muted">:</span>
          <span>{score[1]}</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <p className="text-lg font-medium text-offwhite">{team2Name}</p>
          <span className="text-3xl">{getFlag(team2Name)}</span>
        </div>
      </div>
    </div>
  );
}
