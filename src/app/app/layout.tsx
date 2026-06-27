"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Providers from "@/app/providers";
import WalletButton from "@/components/app/WalletButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMatchView = pathname.includes("/match/");

  return (
    <Providers>
      <div className="min-h-screen bg-warm-dark text-offwhite">
        <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-warm-dark/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-display text-lg text-offwhite transition-opacity hover:opacity-80">
                Blitz
              </Link>
              <div className="hidden items-center gap-1 sm:flex">
                {isMatchView && (
                  <Link
                    href="/app"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] text-muted transition-all hover:bg-white/[0.04] hover:text-offwhite"
                  >
                    <span className="text-[0.6rem]">←</span> Matches
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/app"
                className={`hidden rounded-lg px-3 py-1.5 text-[0.75rem] font-medium transition-all sm:block ${
                  !isMatchView
                    ? "bg-white/[0.06] text-offwhite"
                    : "text-muted hover:text-offwhite"
                }`}
              >
                All Matches
              </Link>
              <WalletButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </Providers>
  );
}
