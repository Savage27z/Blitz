"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-1/2 z-50 -translate-x-1/2"
    >
      <nav
        className={`flex items-center gap-8 rounded-full px-7 py-3 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? "border border-white/[0.08] bg-warm-dark/85 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            : "border border-white/[0.03] bg-warm-dark/30 backdrop-blur-sm"
        }`}
      >
        <a
          href="#"
          className="font-display text-lg tracking-tight text-offwhite transition-opacity duration-300 hover:opacity-70"
        >
          Blitz
        </a>

        <a
          href="/app"
          className="relative overflow-hidden rounded-full bg-amber-primary px-5 py-2 text-[0.8125rem] font-medium tracking-[-0.01em] text-warm-dark transition-all duration-500 hover:shadow-[0_0_24px_rgba(245,158,11,0.35)]"
        >
          Launch App
        </a>
      </nav>
    </motion.header>
  );
}
