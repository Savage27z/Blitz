"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";
import type { MatchEvent } from "@/lib/markets/types";

const EVENT_CONFIG: Record<MatchEvent["type"], { icon: string; color: string; bg: string }> = {
  goal: { icon: "⚽", color: "text-amber-primary", bg: "bg-amber-primary/10" },
  yellow_card: { icon: "🟨", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  red_card: { icon: "🟥", color: "text-red-500", bg: "bg-red-500/10" },
  corner: { icon: "⛳", color: "text-emerald-400", bg: "bg-emerald-400/5" },
  substitution: { icon: "🔄", color: "text-blue-400", bg: "bg-blue-400/5" },
  free_kick: { icon: "🎯", color: "text-muted-light", bg: "bg-white/[0.03]" },
  possession: { icon: "📊", color: "text-muted", bg: "bg-white/[0.02]" },
  phase_change: { icon: "⏱", color: "text-offwhite", bg: "bg-white/[0.04]" },
  danger: { icon: "⚠️", color: "text-red-400", bg: "bg-red-400/5" },
};

function EventRow({ event }: { event: MatchEvent }) {
  const { team1Name, team2Name } = useMarketStore();
  const cfg = EVENT_CONFIG[event.type];
  const teamName = event.team === 1 ? team1Name : team2Name;

  let label = "";
  switch (event.type) {
    case "goal": label = `GOAL — ${teamName}`; break;
    case "yellow_card": label = `Yellow Card — ${teamName}`; break;
    case "red_card": label = `Red Card — ${teamName}`; break;
    case "corner": label = `Corner — ${teamName}`; break;
    case "danger": label = `Danger! ${event.detail || ""} — ${teamName}`; break;
    case "phase_change": label = event.detail || "Phase change"; break;
    default: label = `${event.type} — ${teamName}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className={`flex items-center gap-3 rounded-xl ${cfg.bg} px-3 py-2.5 mb-2`}>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-black/20 text-sm">
          {cfg.icon}
        </span>
        <div className="flex-1 min-w-0">
          <span className={`text-[0.8125rem] font-medium ${cfg.color}`}>{label}</span>
        </div>
        <span className="flex-shrink-0 font-mono text-[0.6875rem] text-white/30">
          {event.minute}&apos;
        </span>
      </div>
    </motion.div>
  );
}

export default function LiveMatchFeed() {
  const events = useMarketStore((s) => s.events);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <span className="text-[0.75rem] font-semibold text-offwhite">Match Events</span>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[0.6rem] text-white/40">
          {events.length}
        </span>
      </div>
      <div className="max-h-[420px] overflow-y-auto p-3">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <div className="h-8 w-8 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
              <span className="text-[0.75rem] text-white/20">📡</span>
            </div>
            <p className="text-[0.8125rem] text-white/30">Waiting for match events...</p>
            <p className="text-[0.65rem] text-white/15">Events stream in real-time during live matches</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
