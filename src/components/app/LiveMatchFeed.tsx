"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";
import type { MatchEvent } from "@/lib/markets/types";

const EVENT_CONFIG: Record<MatchEvent["type"], { icon: string; color: string }> = {
  goal: { icon: "⚽", color: "text-amber-primary" },
  yellow_card: { icon: "🟨", color: "text-yellow-400" },
  red_card: { icon: "🟥", color: "text-red-500" },
  corner: { icon: "⛳", color: "text-muted-light" },
  substitution: { icon: "🔄", color: "text-muted-light" },
  free_kick: { icon: "🎯", color: "text-muted-light" },
  possession: { icon: "📊", color: "text-muted" },
  phase_change: { icon: "⏱", color: "text-offwhite" },
  danger: { icon: "⚠️", color: "text-red-400" },
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 border-b border-white/[0.03] py-3 last:border-0"
    >
      <span className="w-8 font-mono text-[0.6875rem] text-muted">
        {event.minute}&apos;
      </span>
      <span className="text-sm">{cfg.icon}</span>
      <span className={`text-[0.8125rem] ${cfg.color}`}>{label}</span>
    </motion.div>
  );
}

export default function LiveMatchFeed() {
  const events = useMarketStore((s) => s.events);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <span className="eyebrow text-[0.6rem] text-muted-light">MATCH EVENTS</span>
      </div>
      <div className="max-h-[500px] overflow-y-auto px-5">
        {events.length === 0 ? (
          <p className="py-8 text-center text-[0.8125rem] text-muted">
            Waiting for match events...
          </p>
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
