"use client";

import { motion } from "framer-motion";

const COMPARISONS = [
  {
    label: "Traditional Sportsbooks",
    items: ["90-minute lock-in", "Opaque odds engine", "Custodial funds", "Slow withdrawals"],
    side: "old" as const,
  },
  {
    label: "Blitz",
    items: [
      "5–10 min micro-markets",
      "Transparent parimutuel pools",
      "Non-custodial on Solana",
      "Instant on-chain settlement",
    ],
    side: "new" as const,
  },
];

export default function WhyBlitz() {
  return (
    <section className="bg-warm-dark py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="eyebrow mb-4 text-amber-primary/80">WHY BLITZ</p>
          <h2 className="font-display text-3xl text-offwhite md:text-4xl">
            Not your average sportsbook
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-muted">
            Blitz replaces opaque, slow betting platforms with transparent, real-time prediction
            markets settled on-chain.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {COMPARISONS.map((col) => (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: col.side === "new" ? 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-2xl border p-6 ${
                col.side === "new"
                  ? "border-amber-primary/20 bg-amber-primary/[0.04]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <div className="mb-5 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    col.side === "new" ? "bg-amber-primary" : "bg-white/20"
                  }`}
                />
                <span
                  className={`text-[0.8125rem] font-semibold ${
                    col.side === "new" ? "text-amber-primary" : "text-white/50"
                  }`}
                >
                  {col.label}
                </span>
              </div>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[0.5rem] ${
                        col.side === "new"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {col.side === "new" ? "✓" : "✕"}
                    </span>
                    <span className="text-[0.875rem] text-offwhite/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
