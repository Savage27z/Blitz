"use client";

import { useState, useEffect } from "react";

function formatTime(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function CountdownTimer({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(expiresAt - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(expiresAt - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isUrgent = remaining > 0 && remaining < 60_000;

  return (
    <span
      className={`font-mono text-[0.75rem] ${
        isUrgent ? "animate-pulse text-red-400" : "text-muted-light"
      }`}
    >
      {remaining <= 0 ? "Resolving..." : formatTime(remaining)}
    </span>
  );
}
