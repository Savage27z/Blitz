"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);

  const line1 = "Predict the next 10 minutes,";
  const line2 = "not the next 90.";

  return (
    <section
      ref={sectionRef}
      className="grain relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
    >
      {/* Parallax zoom background */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-stadium.jpg')",
          }}
        />
      </motion.div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-dark/60 via-warm-dark/50 to-warm-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent,var(--color-warm-dark))]" />

      {/* Content with scroll fade */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow mb-10 text-amber-primary/80"
        >
          REAL-TIME PREDICTION MARKETS
        </motion.p>

        <h1 className="font-display text-[clamp(2.75rem,7.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] text-offwhite">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {line1}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.2, delay: 1.55, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {line2}
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 2.0 }}
          className="mx-auto mt-10 max-w-md text-[1.0625rem] leading-relaxed text-muted-light/80"
        >
          Real-time prediction markets that live and die
          during a live match.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 flex flex-wrap items-center justify-center gap-5"
        >
          <a
            href="/app"
            className="group relative overflow-hidden rounded-full bg-amber-primary px-9 py-4 text-[0.875rem] font-medium tracking-[-0.01em] text-warm-dark transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
          >
            <span className="relative z-10">Launch App</span>
            <span className="absolute inset-0 -translate-x-full bg-amber-glow transition-transform duration-500 group-hover:translate-x-0" />
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-offwhite/15 px-9 py-4 text-[0.875rem] font-medium text-offwhite/70 transition-all duration-500 hover:border-offwhite/30 hover:text-offwhite"
          >
            See how it works
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="eyebrow text-[0.5rem] text-muted">SCROLL</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-offwhite/30 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
