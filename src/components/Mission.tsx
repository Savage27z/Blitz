"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SplitText from "./SplitText";

export default function Mission() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.05]);

  return (
    <section
      ref={sectionRef}
      className="grain relative flex min-h-[90vh] items-center justify-center overflow-hidden"
    >
      {/* Parallax zoom background */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-[-15%]"
        aria-hidden
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/mission-stadium.jpg')",
          }}
        />
      </motion.div>

      {/* Dark cinematic overlays */}
      <div className="absolute inset-0 bg-warm-dark/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent,var(--color-warm-dark))]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-[clamp(2.25rem,6vw,4.75rem)] leading-[1.05] tracking-[-0.02em] text-offwhite">
          <SplitText>Every match has 100 moments worth predicting.</SplitText>
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-display text-[clamp(2.25rem,6vw,4.75rem)] leading-[1.05] tracking-[-0.02em] text-amber-primary"
        >
          Blitz makes them tradeable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 flex flex-wrap items-center justify-center gap-12 lg:gap-20"
        >
          {[
            { value: "10 min", label: "Market duration" },
            { value: "<2s", label: "Settlement" },
            { value: "100%", label: "On-chain" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p className="font-display text-[clamp(1.5rem,3vw,2.75rem)] text-offwhite">
                {stat.value}
              </p>
              <p className="mt-2 eyebrow text-[0.5625rem] text-muted-light">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
