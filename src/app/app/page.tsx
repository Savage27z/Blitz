"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFixtures, FixtureFilter } from "@/hooks/useFixtures";
import MatchCard from "@/components/app/MatchCard";
import DashboardHero from "@/components/app/DashboardHero";

const TABS: { id: FixtureFilter; label: string }[] = [
  { id: "live", label: "🔴 Live Now" },
  { id: "upcoming", label: "📅 Upcoming" },
  { id: "completed", label: "✓ Completed" },
];

export default function AppPage() {
  const { fixtures, allFixtures, loading, error, filter, setFilter } = useFixtures();

  const liveCount = allFixtures.filter((f) =>
    ["H1", "HT", "H2", "ET1", "ET2", "PE", "HTET"].includes(f.statusId || "NS")
  ).length;

  return (
    <div>
      <DashboardHero liveCount={liveCount} totalMarkets={liveCount * 4} />

      {/* Filter tabs */}
      <div className="mb-8 flex items-center gap-1 overflow-x-auto rounded-full border border-white/[0.06] bg-white/[0.02] p-1 w-fit max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-5 py-2 text-[0.8125rem] font-medium transition-all duration-300 ${
              filter === tab.id
                ? "bg-amber-primary text-warm-dark"
                : "text-muted hover:text-offwhite"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="h-1.5 w-1.5 rounded-full bg-amber-primary"
              />
            ))}
          </div>
          <span className="text-[0.8125rem] text-muted">Loading matches...</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-[0.875rem] text-red-400">{error}</p>
          <p className="mt-1 text-[0.75rem] text-muted">
            Check your TxODDS credentials in .env.local
          </p>
        </div>
      )}

      {!loading && !error && fixtures.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted">No {filter} matches found</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {[...fixtures].sort((a, b) => a.startTime - b.startTime).map((f, i) => (
            <motion.div
              key={f.fixtureId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <MatchCard fixture={f} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
