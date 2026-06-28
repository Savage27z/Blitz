"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Providers from "@/app/providers";
import WalletButton from "@/components/app/WalletButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="sm"
      render={<Link href={href} />}
      className={cn(!active && "text-muted-foreground")}
    >
      {label}
    </Button>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMatchView = pathname.includes("/match/");
  const isProfile = pathname.includes("/profile");

  return (
    <Providers>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-display text-lg transition-opacity hover:opacity-80">
                Blitz
              </Link>
              {isMatchView && (
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href="/app" />}
                  className="gap-1.5 text-muted-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Matches
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center sm:flex">
                <NavLink href="/app" label="Matches" active={!isMatchView && !isProfile} />
                <NavLink href="/app/profile" label="Profile" active={isProfile} />
              </div>
              <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
              <WalletButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </Providers>
  );
}
