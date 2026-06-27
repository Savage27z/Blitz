"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useScoresStream } from "@/hooks/useScoresStream";
import { useMarkets } from "@/hooks/useMarkets";
import { useDemoSimulation } from "@/hooks/useDemoSimulation";
import { useMarketStore } from "@/stores/marketStore";
import MatchHeader from "@/components/app/MatchHeader";
import LiveMatchFeed from "@/components/app/LiveMatchFeed";
import MarketStream from "@/components/app/MarketStream";
import SettledMarkets from "@/components/app/SettledMarkets";
import MiniPitch from "@/components/app/MiniPitch";
import LiveStats from "@/components/app/LiveStats";

export default function MatchPage() {
  const params = useParams();
  const fixtureId = params.fixtureId ? Number(params.fixtureId) : null;
  const [demoMode, setDemoMode] = useState(false);
  const [fixtureLoaded, setFixtureLoaded] = useState(false);
  const connected = useMarketStore((s) => s.connected);

  useEffect(() => {
    if (!fixtureId) return;

    setFixtureLoaded(false);
    const store = useMarketStore.getState();
    store.setFixtureInfo(fixtureId, "…", "…");
    useMarketStore.setState({
      score: [0, 0],
      gamePhase: "NS",
      matchMinute: 0,
      events: [],
      activeMarkets: [],
      settledMarkets: [],
      connected: false,
    });

    async function loadFixture() {
      try {
        const res = await fetch("/api/proxy/fixtures");
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.fixtures || [];
        const fixture = list.find((f: any) => (f.FixtureId ?? f.fixtureId) === fixtureId);
        if (fixture) {
          const p1 = fixture.Participant1 ?? fixture.participant1Name ?? "Team A";
          const p2 = fixture.Participant2 ?? fixture.participant2Name ?? "Team B";
          store.setFixtureInfo(fixtureId!, p1, p2);
        }
      } catch {
        // keep placeholder
      } finally {
        setFixtureLoaded(true);
      }
    }

    loadFixture();
  }, [fixtureId]);

  useScoresStream(fixtureId);
  useMarkets();
  useDemoSimulation(demoMode);

  return (
    <div className="space-y-6">
      <MatchHeader loading={!fixtureLoaded} />

      {/* Demo mode toggle - fallback for when no live matches */}
      {!connected && (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[0.6875rem] text-muted">Demo Simulation</span>
            {demoMode && (
              <span className="rounded bg-amber-primary/10 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase text-amber-primary">
                Active
              </span>
            )}
            <span className="text-[0.55rem] text-muted/60">
              (no live SSE connection — use demo to simulate)
            </span>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
              demoMode ? "bg-amber-primary" : "bg-white/[0.1]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-warm-dark transition-transform duration-200 ${
                demoMode ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}

      <MiniPitch />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <LiveStats />
          <LiveMatchFeed />
        </div>

        <div className="space-y-6">
          <MarketStream />
          <SettledMarkets />
        </div>
      </div>
    </div>
  );
}
