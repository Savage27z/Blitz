"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function AnimatedNumber({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => v.toFixed(2));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}
