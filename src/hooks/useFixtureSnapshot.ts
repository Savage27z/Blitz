"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import type { GameState } from "@/lib/txodds/types";
import type { MatchEvent } from "@/lib/markets/types";
import { LIVE_STATES } from "@/lib/txodds/fixtures";
import {
  extractScoreStatusFromEvents,
  extractStats,
  goalsFromRaw,
  parseMatchEventFromRaw,
} from "@/lib/txodds/scores";

function parseEvents(rawEvents: Record<string, unknown>[]): MatchEvent[] {
  const parsed: MatchEvent[] = [];
  const seen = new Set<string>();

  for (const raw of rawEvents) {
    const event = parseMatchEventFromRaw(raw);
    if (event && !seen.has(event.id)) {
      seen.add(event.id);
      parsed.push(event);
    }
  }

  return parsed.reverse();
}

function kickoffMinute(startTime?: number): number {
  if (!startTime) return 1;
  return Math.min(90, Math.max(1, Math.floor((Date.now() - startTime) / 60_000)));
}

async function applySnapshot(
  fixtureId: number,
  startTime: number | undefined,
  updateMatchState: ReturnType<typeof useMarketStore.getState>["updateMatchState"]
) {
  const res = await fetch(`/api/proxy/scores-snapshot/${fixtureId}`, {
    cache: "no-store",
  });
  if (!res.ok) return;

  const events = (await res.json()) as Record<string, unknown>[];
  if (!Array.isArray(events) || events.length === 0) return;

  const { statusId, score, minute: snapshotMinute } = extractScoreStatusFromEvents(events);
  const latest = events.reduce((best, e) => {
    const seq = Number(e.Seq ?? e.seq ?? 0);
    const bestSeq = Number(best.Seq ?? best.seq ?? 0);
    return seq >= bestSeq ? e : best;
  }, events[0]);

  const goals = goalsFromRaw(latest, score);
  let phase: GameState = statusId ?? "NS";
  let minute = snapshotMinute ?? 0;

  const now = Date.now();
  if (phase === "NS" && startTime && startTime + 120 * 60 * 1000 < now) {
    phase = "F";
    minute = 90;
  } else if (phase === "NS" && startTime && startTime <= now) {
    phase = "H1";
    if (minute === 0) minute = kickoffMinute(startTime);
  }

  const store = useMarketStore.getState();
  const isLive =
    LIVE_STATES.includes(phase) ||
    LIVE_STATES.includes(store.gamePhase) ||
    (startTime != null && startTime <= now && startTime + 120 * 60 * 1000 > now);

  const { possession, shotsOnTarget, corners, cards } = extractStats(latest, events);
  useMarketStore.getState().updateMatchStats({ possession, shotsOnTarget, corners, cards });

  if (isLive && store.connected && store.events.length > 0) {
    updateMatchState(phase, minute, goals);
    return;
  }

  const matchEvents = parseEvents(events);
  useMarketStore.setState({ events: matchEvents });
  updateMatchState(phase, minute, goals);
}

/** Hydrate + poll scores snapshot during live match window */
export function useFixtureSnapshot(fixtureId: number | null, startTime?: number) {
  const updateMatchState = useMarketStore((s) => s.updateMatchState);

  useEffect(() => {
    if (!fixtureId) return;

    let cancelled = false;

    async function loadSnapshot() {
      if (cancelled) return;
      try {
        await applySnapshot(fixtureId!, startTime, updateMatchState);
      } catch {
        // SSE may still provide live updates
      }
    }

    loadSnapshot();

    const inMatchWindow =
      startTime != null && startTime <= Date.now() && startTime + 120 * 60 * 1000 > Date.now();

    const poll = inMatchWindow
      ? setInterval(() => {
          if (cancelled) return;
          loadSnapshot();
        }, 5_000)
      : null;

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
    };
  }, [fixtureId, startTime, updateMatchState]);
}
