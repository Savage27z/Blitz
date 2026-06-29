"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "What is Blitz?",
    a: "Blitz is a real-time sports prediction market built on Solana. Instead of traditional 90-minute match bets, Blitz creates micro-markets that resolve in 5–10 minutes — like predicting the next goal, next corner, or whether both teams will score before halftime.",
  },
  {
    q: "How do micro-markets work?",
    a: "When a live match event happens (goal, corner, card), Blitz's engine generates new prediction markets with short time windows. You stake USDT on an outcome, and the market resolves automatically using verified TxODDS match data. Payouts are proportional to the pool.",
  },
  {
    q: "Is this on mainnet?",
    a: "Blitz is currently deployed on Solana Devnet for the hackathon. All stakes use devnet USDT. The architecture is designed for mainnet deployment with the same on-chain settlement logic.",
  },
  {
    q: "Where does the match data come from?",
    a: "All match data — scores, events, odds, and statistics — comes from TxODDS, a professional sports data provider. Data is streamed in real-time via SSE (Server-Sent Events) and used to both generate and resolve markets.",
  },
  {
    q: "What happens if no event occurs before a market expires?",
    a: "If a market expires without a qualifying event (e.g., no goal is scored), the market is voided — a push. All stakers receive their original stake back. No one wins or loses.",
  },
  {
    q: "What wallet do I need?",
    a: "Any Solana-compatible wallet works — Phantom, Solflare, Backpack, and others. Connect your wallet, switch to Devnet, and you're ready to stake on live matches.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-offwhite"
      >
        <span className="pr-4 text-[0.9375rem] font-medium text-offwhite">{q}</span>
        <span
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[0.75rem] text-white/40 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[0.875rem] leading-relaxed text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="bg-warm-dark py-24 lg:py-32">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="eyebrow mb-4 text-amber-primary/80">FAQ</p>
          <h2 className="font-display text-3xl text-offwhite md:text-4xl">
            Common questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
