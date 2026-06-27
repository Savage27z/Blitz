"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import SplitText from "./SplitText";

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  visual: ReactNode;
  reverse?: boolean;
}

export default function StepCard({
  step,
  title,
  description,
  visual,
  reverse = false,
}: StepCardProps) {
  return (
    <div className={`grid items-center gap-16 lg:grid-cols-2 lg:gap-24`}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className={`space-y-5 ${reverse ? "lg:order-2" : ""}`}
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="eyebrow text-amber-deep"
        >
          {step}
        </motion.p>
        <h3 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] text-warm-dark">
          <SplitText delay={0.3}>{title}</SplitText>
        </h3>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm text-[1rem] leading-relaxed text-muted"
        >
          {description}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`flex justify-center ${reverse ? "lg:order-1" : ""}`}
      >
        {visual}
      </motion.div>
    </div>
  );
}
