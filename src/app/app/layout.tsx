"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Providers from "@/app/providers";
import WalletButton from "@/components/app/WalletButton";
import ToastContainer from "@/components/app/Toast";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-[0.75rem] font-medium transition-all ${
        active ? "bg-white/[0.06] text-offwhite" : "text-muted hover:text-offwhite"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMatchView = pathname.includes("/match/");
  const isProfile = pathname.includes("/profile");

  return (
    <Providers>
      <div className="min-h-screen bg-warm-dark text-offwhite">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-amber-primary focus:px-4 focus:py-2 focus:text-warm-dark focus:font-semibold"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-warm-dark/80 backdrop-blur-xl" role="banner">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-display text-lg text-offwhite transition-opacity hover:opacity-80">
                Blitz
              </Link>
              {isMatchView && (
                <Link
                  href="/app"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] text-muted transition-all hover:bg-white/[0.04] hover:text-offwhite"
                >
                  <span className="text-[0.6rem]">←</span> <span className="hidden sm:inline">Matches</span>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <NavLink href="/app" label="Matches" active={!isMatchView && !isProfile} />
                <NavLink href="/app/profile" label="Profile" active={isProfile} />
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <ToastContainer />
      </div>
    </Providers>
  );
}
