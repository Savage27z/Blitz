"use client";

import { motion } from "framer-motion";

interface Props {
  liveCount: number;
}

export default function DashboardHero({ liveCount }: Props) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-warm-dark via-[#1a1410] to-[#0d1a0d] p-8 md:p-10">
      {/* Atmospheric background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Stadium light beams */}
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-primary/[0.04] blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-green-500/[0.03] blur-3xl" />
        {/* Pitch line pattern */}
        <svg className="absolute bottom-0 right-0 h-full w-1/2 opacity-[0.03]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeWidth="0.5" />
          <rect x="0" y="50" width="40" height="100" stroke="white" strokeWidth="0.5" />
          <rect x="160" y="50" width="40" height="100" stroke="white" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="3" fill="white" />
        </svg>
        {/* Animated particles */}
        <motion.div
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[20%] top-[30%] h-1 w-1 rounded-full bg-amber-primary/60"
        />
        <motion.div
          animate={{ y: [10, -10, 10], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[40%] top-[60%] h-1 w-1 rounded-full bg-green-500/60"
        />
        <motion.div
          animate={{ y: [-5, 5, -5], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[60%] top-[20%] h-0.5 w-0.5 rounded-full bg-white/40"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚽</span>
            <div>
              <h1 className="font-display text-2xl text-offwhite md:text-3xl">
                FIFA World Cup 2026
              </h1>
              <p className="mt-0.5 text-[0.8125rem] text-muted">
                Real-time prediction markets
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 flex flex-wrap items-center gap-6"
        >
          <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.04] px-4 py-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="inline-flex h-full w-full rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            </span>
            <span className="text-[0.8125rem] font-medium text-red-400">
              {liveCount} Live {liveCount === 1 ? "Match" : "Matches"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[0.75rem]">
            <div>
              <span className="text-muted">Fixtures</span>
              <span className="ml-2 font-mono font-semibold text-amber-primary">{liveCount} live</span>
            </div>
            <div className="h-4 w-px bg-white/[0.08]" />
            <div>
              <span className="text-muted">Network</span>
              <span className="ml-2 font-mono font-semibold text-offwhite">Devnet</span>
            </div>
            <div className="h-4 w-px bg-white/[0.08]" />
            <div>
              <span className="text-muted">Data</span>
              <span className="ml-2 font-mono font-semibold text-offwhite">TxODDS Live</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
