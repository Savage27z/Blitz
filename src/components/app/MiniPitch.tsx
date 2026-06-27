"use client";

import { motion } from "framer-motion";
import { useMarketStore } from "@/stores/marketStore";

export default function MiniPitch() {
  const events = useMarketStore((s) => s.events);
  const latestEvent = events[0];

  const actionZone = latestEvent
    ? latestEvent.type === "danger" || latestEvent.type === "corner"
      ? latestEvent.team === 1 ? 85 : 15
      : latestEvent.type === "goal"
        ? latestEvent.team === 1 ? 95 : 5
        : 50
    : 50;

  return (
    <div className="relative h-20 w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a1a0a]">
      {/* Pitch markings */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 80" fill="none" preserveAspectRatio="none">
        {/* Outline */}
        <rect x="2" y="2" width="396" height="76" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
        {/* Center line */}
        <line x1="200" y1="2" x2="200" y2="78" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
        {/* Center circle */}
        <circle cx="200" cy="40" r="15" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
        <circle cx="200" cy="40" r="1.5" fill="white" fillOpacity="0.2" />
        {/* Left penalty box */}
        <rect x="2" y="20" width="40" height="40" stroke="white" strokeOpacity="0.12" strokeWidth="0.5" />
        <rect x="2" y="30" width="15" height="20" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
        {/* Right penalty box */}
        <rect x="358" y="20" width="40" height="40" stroke="white" strokeOpacity="0.12" strokeWidth="0.5" />
        <rect x="383" y="30" width="15" height="20" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
      </svg>

      {/* Action indicator */}
      <motion.div
        animate={{ left: `${actionZone}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-4 w-4 rounded-full bg-amber-primary/60 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
        />
      </motion.div>

      {/* Zone labels */}
      <div className="absolute bottom-1 left-3 text-[0.5rem] font-mono uppercase tracking-wider text-white/20">
        DEF
      </div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[0.5rem] font-mono uppercase tracking-wider text-white/20">
        MID
      </div>
      <div className="absolute bottom-1 right-3 text-[0.5rem] font-mono uppercase tracking-wider text-white/20">
        ATK
      </div>
    </div>
  );
}
