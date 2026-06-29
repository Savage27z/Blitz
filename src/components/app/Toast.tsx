"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastMessage {
  id: string;
  text: string;
  type: "goal" | "market" | "settle" | "info" | "error";
}

const ICONS: Record<ToastMessage["type"], string> = {
  goal: "⚽",
  market: "📊",
  settle: "✓",
  info: "ℹ",
  error: "✕",
};

const COLORS: Record<ToastMessage["type"], string> = {
  goal: "border-green-500/30 bg-green-500/[0.08]",
  market: "border-amber-primary/30 bg-amber-primary/[0.08]",
  settle: "border-blue-400/30 bg-blue-400/[0.08]",
  info: "border-white/10 bg-white/[0.06]",
  error: "border-red-500/30 bg-red-500/[0.08]",
};

let addToastGlobal: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

export function toast(text: string, type: ToastMessage["type"] = "info") {
  addToastGlobal?.({ text, type });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { ...msg, id }]);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => { addToastGlobal = null; };
  }, [addToast]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 shadow-lg backdrop-blur-xl ${COLORS[t.type]}`}
          >
            <span className="text-sm">{ICONS[t.type]}</span>
            <span className="text-[0.8125rem] font-medium text-offwhite">{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
