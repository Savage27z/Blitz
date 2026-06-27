"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-warm-dark">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-between gap-8 py-16 sm:flex-row"
        >
          <a
            href="#"
            className="font-display text-lg text-offwhite transition-opacity duration-300 hover:opacity-70"
          >
            Blitz
          </a>

          <div className="flex items-center gap-8">
            <a
              href="https://github.com/Savage27z/Blitz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.8125rem] text-muted transition-colors duration-500 hover:text-offwhite"
            >
              GitHub
            </a>
            <a
              href="https://txline.txodds.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.8125rem] text-muted transition-colors duration-500 hover:text-offwhite"
            >
              TxODDS
            </a>
            <a
              href="/app"
              className="rounded-full bg-amber-primary px-5 py-2 text-[0.8125rem] font-medium text-warm-dark transition-all duration-500 hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
            >
              Launch App
            </a>
          </div>
        </motion.div>

        <div className="border-t border-white/[0.04] py-6 text-center">
          <p className="text-[0.6875rem] text-muted/60">
            © {new Date().getFullYear()} Blitz. Built on Solana.
          </p>
        </div>
      </div>
    </footer>
  );
}
