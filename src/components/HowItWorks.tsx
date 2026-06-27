"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import StepCard from "./StepCard";
import { LiveMarketCard, SettledMarketCard } from "./MarketCard";
import SplitText from "./SplitText";

function EventTimeline() {
  const events = [
    { time: "12'", label: "Corner — Arsenal", type: "corner" },
    { time: "18'", label: "Yellow Card — #7 Saka", type: "card" },
    { time: "23'", label: "Danger! Shot on target", type: "danger" },
    { time: "31'", label: "GOAL — Arsenal 1-0", type: "goal" },
    { time: "37'", label: "Corner — Chelsea", type: "corner" },
  ];

  return (
    <div className="card-dark card-tilt w-full max-w-[340px] rounded-3xl p-6">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-[0.9375rem] font-medium text-offwhite">
            Arsenal vs Chelsea
          </p>
          <p className="mt-0.5 font-mono text-[0.6875rem] text-muted">
            Premier League
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono text-[0.6875rem] text-red-400">38&apos;</span>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-4">
        <div className="space-y-3.5">
          {events.map((event, i) => (
            <motion.div
              key={event.time + event.label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3.5"
            >
              <span className="w-7 font-mono text-[0.6875rem] text-muted-light">
                {event.time}
              </span>
              <span
                className={`h-[5px] w-[5px] rounded-full ${
                  event.type === "goal"
                    ? "bg-amber-primary shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    : event.type === "danger"
                    ? "bg-red-400"
                    : event.type === "card"
                    ? "bg-yellow-400"
                    : "bg-white/20"
                }`}
              />
              <span
                className={`text-[0.8125rem] ${
                  event.type === "goal"
                    ? "font-medium text-amber-primary"
                    : "text-offwhite/70"
                }`}
              >
                {event.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto my-24 h-[1px] w-full max-w-[120px] origin-left bg-gradient-to-r from-transparent via-amber-deep/40 to-transparent lg:my-32"
    />
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.3"],
  });
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative bg-cream py-36 lg:py-48">
      {/* Top transition line */}
      <motion.div
        style={{ width: lineWidth }}
        className="absolute left-0 top-0 h-[1px] bg-gradient-to-r from-amber-primary/60 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2 }}
          className="mb-32 lg:mb-40"
        >
          <p className="eyebrow mb-6 text-amber-deep">HOW BLITZ WORKS</p>
          <h2 className="font-display text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.05] text-warm-dark">
            <SplitText>A new way to predict the match</SplitText>
          </h2>
        </motion.div>

        <div className="space-y-0">
          <StepCard
            step="STEP 1"
            title="A match goes live"
            description="TxODDS streams real-time events — goals, corners, cards, danger possession. Every moment captured and verified."
            visual={<EventTimeline />}
          />

          <SectionDivider />

          <StepCard
            step="STEP 2"
            title="Markets drop in real-time"
            description='Blitz generates binary micro-markets: "Goal before 45′? YES / NO." Stake your prediction before time runs out.'
            visual={<LiveMarketCard />}
            reverse
          />

          <SectionDivider />

          <StepCard
            step="STEP 3"
            title="Settle on-chain, instantly"
            description="TxODDS Merkle proofs verify the outcome on Solana. Winners get paid before the next corner kick."
            visual={<SettledMarketCard />}
          />
        </div>
      </div>
    </section>
  );
}
