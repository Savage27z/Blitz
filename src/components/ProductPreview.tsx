"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function MatchFeed() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          <span className="text-[0.875rem] font-medium text-offwhite">
            Arsenal vs Chelsea
          </span>
        </div>
        <span className="font-mono text-[0.875rem] font-medium text-amber-primary">
          1 - 0
        </span>
      </div>
      <div className="flex-1 space-y-3 p-6">
        {[
          { time: "38'", text: "Possession: Arsenal 62%", dim: true },
          { time: "36'", text: "Corner — Chelsea", dim: false },
          { time: "31'", text: "⚽ GOAL — Saka (Arsenal)", dim: false },
          { time: "28'", text: "Shot on target — Havertz", dim: true },
          { time: "23'", text: "Dangerous attack — Arsenal", dim: false },
          { time: "18'", text: "🟨 Yellow — Rice", dim: false },
        ].map((event, i) => (
          <div key={i} className="flex items-start gap-4">
            <span className="w-7 shrink-0 font-mono text-[0.6875rem] text-muted">
              {event.time}
            </span>
            <span
              className={`text-[0.8125rem] leading-relaxed ${
                event.dim ? "text-muted" : "text-offwhite/80"
              }`}
            >
              {event.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveMarkets() {
  const markets = [
    { question: "Goal before 45'?", yes: "1.85", no: "2.10", timer: "6:42" },
    { question: "Next corner Arsenal?", yes: "1.55", no: "2.60", timer: "2:18" },
    { question: "Card before 40'?", yes: "3.20", no: "1.35", timer: "1:54" },
  ];

  return (
    <div className="flex flex-col">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <span className="eyebrow text-[0.625rem] text-amber-primary">
          ACTIVE MARKETS
        </span>
      </div>
      <div className="flex-1 space-y-3 p-6">
        {markets.map((m, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-500 hover:border-white/[0.08] hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.8125rem] font-medium text-offwhite">
                {m.question}
              </span>
              <span className="font-mono text-[0.625rem] text-muted">{m.timer}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-amber-primary/[0.08] py-2.5 text-center text-[0.75rem] font-semibold text-amber-primary">
                YES — {m.yes}
              </div>
              <div className="rounded-xl bg-white/[0.04] py-2.5 text-center text-[0.75rem] font-semibold text-offwhite/60">
                NO — {m.no}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettledRow() {
  const settled = [
    { question: "Corner before 30'?", result: "YES", payout: "+1.8 USDC", won: true },
    { question: "Goal before 20'?", result: "NO", payout: "-1.0 USDC", won: false },
    { question: "Card in first 15'?", result: "YES", payout: "+3.2 USDC", won: true },
  ];

  return (
    <div className="border-t border-white/[0.06] px-6 py-5">
      <span className="eyebrow text-[0.5625rem] text-muted">SETTLED</span>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {settled.map((s, i) => (
          <div
            key={i}
            className={`rounded-xl px-4 py-3 ${
              s.won ? "bg-green-500/[0.06]" : "bg-red-500/[0.06]"
            }`}
          >
            <p className="text-[0.6875rem] text-offwhite/50">{s.question}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span
                className={`text-[0.75rem] font-medium ${
                  s.won ? "text-green-400" : "text-red-400"
                }`}
              >
                {s.result} {s.won ? "✓" : "✗"}
              </span>
              <span
                className={`font-mono text-[0.6875rem] ${
                  s.won ? "text-green-400" : "text-red-400"
                }`}
              >
                {s.payout}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <section className="bg-cream pb-36 lg:pb-48">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="mb-16 text-center"
        >
          <p className="eyebrow text-amber-deep">THE BLITZ APP</p>
        </motion.div>

        <div ref={containerRef} style={{ perspective: "1200px" }}>
          <motion.div
            style={{ rotateX, scale }}
            className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-warm-dark shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)]"
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-6 py-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
              <span className="ml-4 font-display text-[0.8125rem] text-offwhite/30">
                Blitz
              </span>
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-2">
              <div className="border-r border-white/[0.06]">
                <MatchFeed />
              </div>
              <div>
                <ActiveMarkets />
              </div>
            </div>

            <SettledRow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
