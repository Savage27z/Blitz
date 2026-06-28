"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useScoresStream } from "@/hooks/useScoresStream";
import { useFixtureSnapshot } from "@/hooks/useFixtureSnapshot";
import { useMarkets } from "@/hooks/useMarkets";
import { useDemoSimulation } from "@/hooks/useDemoSimulation";
import { useMarketStore } from "@/stores/marketStore";
import { normalizeFixturesPayload, mapRawFixture, getFixtureCategory, LIVE_STATES } from "@/lib/txodds/fixtures";
import { resetEngine } from "@/lib/markets/engine";
import type { Fixture, GameState } from "@/lib/txodds/types";
import MatchHeader from "@/components/app/MatchHeader";
import LiveMatchFeed from "@/components/app/LiveMatchFeed";
import MarketStream from "@/components/app/MarketStream";
import SettledMarkets from "@/components/app/SettledMarkets";
import MiniPitch from "@/components/app/MiniPitch";
import LiveStats from "@/components/app/LiveStats";
import Link from "next/link";

function kickoffMinute(startTime?: number): number {
  if (!startTime) return 1;
  return Math.min(90, Math.max(1, Math.floor((Date.now() - startTime) / 60_000)));
}

function resolvePhaseFromFixture(fixture: Fixture): { phase: GameState; minute: number } {
  const category = getFixtureCategory(fixture);
  let phase: GameState = fixture.statusId ?? "NS";
  let minute = 0;

  if (category === "completed") {
    return { phase: "F", minute: 90 };
  }

  if (LIVE_STATES.includes(phase)) {
    return { phase, minute };
  }

  if (category === "live") {
    return { phase: "H1", minute: kickoffMinute(fixture.startTime) };
  }

  return { phase, minute };
}

const LIVE_PHASES = ["H1", "H2", "HT", "ET1", "ET2", "PE", "HTET"] as const;

export default function MatchPage() {
  const params = useParams();
  const rawId = params.fixtureId ? Number(params.fixtureId) : NaN;
  const fixtureId = Number.isFinite(rawId) && rawId > 0 ? rawId : null;
  const [demoMode, setDemoMode] = useState(false);
  const [fixtureLoaded, setFixtureLoaded] = useState(false);
  const [fixtureMeta, setFixtureMeta] = useState<Fixture | null>(null);
  const gamePhase = useMarketStore((s) => s.gamePhase);
  const connected = useMarketStore((s) => s.connected);

  useEffect(() => {
    if (!fixtureId) return;

    setFixtureLoaded(false);
    setFixtureMeta(null);
    resetEngine();
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
      matchStats: {
        possession: 50,
        shotsOnTarget: [0, 0],
        corners: [0, 0],
        cards: [0, 0],
      },
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

          const p1 = fixture.score?.Participant1?.Total?.Goals ?? 0;
          const p2 = fixture.score?.Participant2?.Total?.Goals ?? 0;
          const { phase, minute } = resolvePhaseFromFixture(fixture);
          store.updateMatchState(phase, minute, [p1, p2]);
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

  const isCompleted = gamePhase === "F" || gamePhase === "FET" || gamePhase === "FPE";
  const isLiveMatch = LIVE_PHASES.includes(gamePhase as (typeof LIVE_PHASES)[number]);
  const effectiveDemo = demoMode && !isLiveMatch;

  useEffect(() => {
    if (demoMode && isLiveMatch) setDemoMode(false);
  }, [demoMode, isLiveMatch]);

  useScoresStream(effectiveDemo ? null : fixtureId);
  useMarkets();
  useDemoSimulation(effectiveDemo);

  const showDemoToggle = !isCompleted && !isLiveMatch;

  if (!fixtureId) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">Invalid match ID</p>
        <Link href="/app" className="mt-4 inline-block text-amber-primary hover:underline">
          ← Back to matches
        </Link>
      </div>
    );
  }

  const handleDemoToggle = () => {
    const next = !demoMode;
    if (next) {
      useMarketStore.getState().setConnected(false);
    }
    setDemoMode(next);
  };

  const isKickoffWindow =
    fixtureMeta != null &&
    getFixtureCategory(fixtureMeta) === "live" &&
    !LIVE_PHASES.includes(gamePhase as (typeof LIVE_PHASES)[number]);

  return (
    <div className="space-y-6">
      <MatchHeader loading={!fixtureLoaded} />

      {isKickoffWindow && (
        <div className="rounded-xl border border-amber-primary/20 bg-amber-primary/[0.06] px-4 py-2.5 text-center text-[0.75rem] text-amber-primary/90">
          {connected
            ? "Kickoff — TxODDS feed connected, waiting for first live event…"
            : "Kickoff — connecting to TxODDS live feed…"}
        </div>
      )}

      {isLiveMatch && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-center text-[0.75rem] text-red-300">
          Live match — real TxODDS feed active. Demo mode disabled.
        </div>
      )}

      {showDemoToggle && (
        <div className="flex items-center justify-between rounded-xl border border-amber-primary/20 bg-amber-primary/[0.06] px-4 py-3">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[0.8125rem] font-medium text-offwhite">Demo Simulation</span>
              {demoMode && (
                <span className="rounded bg-amber-primary/20 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase text-amber-primary">
                  Active
                </span>
              )}
            </div>
            <span className="text-[0.6875rem] text-muted">
              {demoMode
                ? "Simulating live events and markets"
                : "Match not live yet — toggle to preview markets"}
            </span>
          </div>
          <button
            onClick={handleDemoToggle}
            aria-pressed={demoMode}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
              demoMode ? "bg-amber-primary" : "bg-white/[0.15]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-warm-dark transition-transform duration-200 ${
                demoMode ? "translate-x-5" : "translate-x-0.5"
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
