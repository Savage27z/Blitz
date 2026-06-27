"use client";

import { motion } from "framer-motion";

function SolanaLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3"
    >
      <svg className="h-7 w-7" viewBox="0 0 128 128" fill="none">
        <path d="M25.6 95.5a3.2 3.2 0 012.3-1h93.8a1.6 1.6 0 011.1 2.7l-18.4 18.4a3.2 3.2 0 01-2.3 1H8.3a1.6 1.6 0 01-1.1-2.7L25.6 95.5z" fill="url(#sol-a)" />
        <path d="M25.6 12.4a3.3 3.3 0 012.3-1h93.8a1.6 1.6 0 011.1 2.7L104.4 32.5a3.2 3.2 0 01-2.3 1H8.3a1.6 1.6 0 01-1.1-2.7L25.6 12.4z" fill="url(#sol-b)" />
        <path d="M104.4 53.7a3.2 3.2 0 00-2.3-1H8.3a1.6 1.6 0 00-1.1 2.7l18.4 18.4a3.2 3.2 0 002.3 1h93.8a1.6 1.6 0 001.1-2.7L104.4 53.7z" fill="url(#sol-c)" />
        <defs>
          <linearGradient id="sol-a" x1="10" y1="120" x2="120" y2="10" gradientUnits="userSpaceOnUse"><stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" /></linearGradient>
          <linearGradient id="sol-b" x1="10" y1="120" x2="120" y2="10" gradientUnits="userSpaceOnUse"><stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" /></linearGradient>
          <linearGradient id="sol-c" x1="10" y1="120" x2="120" y2="10" gradientUnits="userSpaceOnUse"><stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" /></linearGradient>
        </defs>
      </svg>
      <span className="text-[0.9375rem] font-medium text-warm-dark">Solana</span>
    </motion.div>
  );
}

function TxOddsLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warm-dark">
        <span className="font-mono text-[0.5625rem] font-bold text-amber-primary">Tx</span>
      </div>
      <span className="text-[0.9375rem] font-medium text-warm-dark">TxODDS</span>
    </motion.div>
  );
}

export default function PoweredBy() {
  return (
    <section className="bg-cream py-36 lg:py-48">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="eyebrow mb-12 text-amber-deep"
        >
          POWERED BY
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-10">
          <SolanaLogo />
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden h-5 w-px origin-center bg-warm-dark/10 sm:block"
          />
          <TxOddsLogo />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 max-w-md text-[1rem] leading-relaxed text-muted"
        >
          On-chain settlement powered by TxODDS verified match data on Solana.
        </motion.p>

        {/* Merkle tree */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="mx-auto mt-14 max-w-[180px]"
        >
          <svg viewBox="0 0 200 100" className="w-full" fill="none" stroke="currentColor" strokeWidth="0.75">
            <g className="text-warm-dark/12">
              <line x1="100" y1="18" x2="55" y2="48" />
              <line x1="100" y1="18" x2="145" y2="48" />
              <line x1="55" y1="52" x2="32" y2="78" />
              <line x1="55" y1="52" x2="78" y2="78" />
              <line x1="145" y1="52" x2="122" y2="78" />
              <line x1="145" y1="52" x2="168" y2="78" />
            </g>
            <circle cx="100" cy="14" r="5" className="fill-amber-primary/15 stroke-amber-primary" strokeWidth="1" />
            <circle cx="55" cy="50" r="4" className="fill-warm-dark/[0.03] stroke-warm-dark/15" strokeWidth="0.75" />
            <circle cx="145" cy="50" r="4" className="fill-warm-dark/[0.03] stroke-warm-dark/15" strokeWidth="0.75" />
            <circle cx="32" cy="80" r="3" className="fill-warm-dark/[0.03] stroke-warm-dark/15" strokeWidth="0.75" />
            <circle cx="78" cy="80" r="3" className="fill-warm-dark/[0.03] stroke-warm-dark/15" strokeWidth="0.75" />
            <circle cx="122" cy="80" r="3" className="fill-warm-dark/[0.03] stroke-warm-dark/15" strokeWidth="0.75" />
            <circle cx="168" cy="80" r="3" className="fill-amber-primary/15 stroke-amber-primary" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
