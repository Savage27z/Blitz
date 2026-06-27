"use client";

import { motion } from "framer-motion";

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export default function SplitText({ children, className = "", delay = 0 }: SplitTextProps) {
  const words = children.split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      className={`inline ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "100%", opacity: 0 },
              visible: {
                y: "0%",
                opacity: 1,
                transition: {
                  duration: 0.8,
                  delay: delay + i * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </motion.span>
  );
}
