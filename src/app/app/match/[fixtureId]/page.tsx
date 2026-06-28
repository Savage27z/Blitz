"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useScoresStream } from "@/hooks/useScoresStream";
import { useFixtureSnapshot } from "@/hooks/useFixtureSnapshot";
import { useMarkets } from "@/hooks/useMarkets";
import { useDemoSimulation } from "@/hooks/useDemoSimulation";
import { useMarketStore } from "@/stores/marketStore";
import { getFixtureCategory } from "@/hooks/useFixtures";
import MatchHeader from "@/components/app/MatchHeader";
import LiveMatchFeed from "@/components/app/LiveMatchFeed";
import MarketStream from "@/components/app/MarketStream";
import SettledMarkets from "@/components/app/SettledMarkets";
import MiniPitch from "@/components/app/MiniPitch";
import LiveStats from "@/components/app/LiveStats";
import { normalizeFixturesPayload, mapRawFixture } from "@/lib/txodds/fixtures";
import type { Fixture } from "@/lib/txodds/types";

export default function MatchPage() {
  const params = useParams();
  const fixtureId = params.fixtureId ? Number(params.fixtureId) : null;
  const [demoMode, setDemoMode] = useState(false);
  const [fixtureLoaded, setFixtureLoaded] = useState(false);
  const [fixtureMeta, setFixtureMeta] = useState<Fixture | null>(null);
  const connected = useMarketStore((s) => s.connected);
  const gamePhase = useMarketStore((s) => s.gamePhase);

  useEffect(() => {
    if (!fixtureId) return;

    setFixtureLoaded(false);
    setFixtureMeta(null);
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
        const list = normalizeFixturesPayload(data).map(mapRawFixture);
        const fixture = list.find((f) => f.fixtureId === fixtureId);
        if (fixture) {
          setFixtureMeta(fixture);
          store.setFixtureInfo(fixtureId!, fixture.participant1Name, fixture.participant2Name);

          const p1 = fixture.score?.Participant1?.Total?.Goals;
          const p2 = fixture.score?.Participant2?.Total?.Goals;
          const category = getFixtureCategory(fixture);

          if (p1 != null && p2 != null) {
            store.updateMatchState(
              category === "completed" ? "F" : fixture.statusId ?? "NS",
              category === "completed" ? 90 : 0,
              [p1, p2]
            );
          } else if (category === "completed") {
            store.updateMatchState("F", 90, store.score);
          }
        }
      } catch {
        // keep placeholder
      } finally {
        setFixtureLoaded(true);
      }
    }

    loadFixture();
  }, [fixtureId]);

  useFixtureSnapshot(fixtureId, fixtureMeta?.startTime);
  useScoresStream(fixtureId);
  useMarkets();
  useDemoSimulation(demoMode);

  const isCompleted = gamePhase === "F" || gamePhase === "FET" || gamePhase === "FPE";
  const showDemoToggle = !connected && !isCompleted;

  return (
    <div className="space-y-6">
      <MatchHeader loading={!fixtureLoaded} />

      {showDemoToggle && (
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
