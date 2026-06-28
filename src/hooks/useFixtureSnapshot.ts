"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import type { GameState } from "@/lib/txodds/types";
import type { MatchEvent } from "@/lib/markets/types";
import {
  extractScoreStatusFromEvents,
  getFixtureCategory,
  LIVE_STATES,
} from "@/lib/txodds/fixtures";

function parseEvents(rawEvents: any[]): MatchEvent[] {
  const parsed: MatchEvent[] = [];

  for (const raw of rawEvents) {
    const data = raw.DataSoccer ?? raw.dataSoccer;
    if (!data) continue;

    const minute = data.Minutes ?? data.minutes ?? 0;
    const participant = data.Participant ?? data.participant;
    const p1Id = raw.Participant1Id ?? raw.participant1Id;
    const team = (participant === p1Id ? 1 : 2) as 1 | 2;
    const id = `${raw.FixtureId ?? raw.fixtureId}-${raw.Seq ?? raw.seq}-${raw.Ts ?? raw.ts}`;

    if (data.Goal || data.goal) {
      parsed.push({ id, type: "goal", team, minute, timestamp: raw.Ts ?? raw.ts ?? Date.now() });
    } else if (data.YellowCard || data.yellowCard) {
      parsed.push({ id, type: "yellow_card", team, minute, timestamp: raw.Ts ?? raw.ts ?? Date.now() });
    } else if (data.RedCard || data.redCard) {
      parsed.push({ id, type: "red_card", team, minute, timestamp: raw.Ts ?? raw.ts ?? Date.now() });
    } else if (data.Corner || data.corner) {
      parsed.push({ id, type: "corner", team, minute, timestamp: raw.Ts ?? raw.ts ?? Date.now() });
    } else {
      const fkType = data.FreeKickType ?? data.freeKickType;
      if (fkType === "Danger" || fkType === "HighDanger") {
        parsed.push({ id, type: "danger", team, minute, detail: fkType, timestamp: raw.Ts ?? raw.ts ?? Date.now() });
      }
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
  const res = await fetch(`/api/proxy/scores-snapshot/${fixtureId}`);
  if (!res.ok) return;

  const events = await res.json();
  if (!Array.isArray(events) || events.length === 0) return;

  const { statusId, score } = extractScoreStatusFromEvents(events);
  const p1 = score?.Participant1?.Total?.Goals ?? 0;
  const p2 = score?.Participant2?.Total?.Goals ?? 0;

  let phase: GameState = statusId ?? "NS";
  let minute = 0;

  for (let i = events.length - 1; i >= 0; i--) {
    const data = events[i].DataSoccer ?? events[i].dataSoccer;
    const m = data?.Minutes ?? data?.minutes;
    if (typeof m === "number" && m > 0) {
      minute = m;
      break;
    }
  }

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
    store.connected;

  if (isLive && (store.connected || store.events.length > 0)) {
    updateMatchState(phase, minute, [p1, p2]);
    return;
  }

  const matchEvents = parseEvents(events);
  useMarketStore.setState({ events: matchEvents });
  updateMatchState(phase, minute, [p1, p2]);
}

/** Hydrate + poll scores snapshot during kickoff window */
export function useFixtureSnapshot(fixtureId: number | null, startTime?: number) {
  const updateMatchState = useMarketStore((s) => s.updateMatchState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!fixtureId) return;

    let cancelled = false;

    async function loadSnapshot() {
      if (cancelled) return;
      try {
        await applySnapshot(fixtureId!, startTime, updateMatchState);
        hydratedRef.current = true;
      } catch {
        // SSE may still provide live updates
      }
    }

    loadSnapshot();

    const shouldPoll =
      startTime != null && startTime <= Date.now() && startTime + 120 * 60 * 1000 > Date.now();

    const poll = shouldPoll
      ? setInterval(() => {
          if (cancelled) return;
          const phase = useMarketStore.getState().gamePhase;
          if (!LIVE_STATES.includes(phase) || phase === "H1") {
            loadSnapshot();
          }
        }, 15_000)
      : null;

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
    };
  }, [fixtureId, startTime, updateMatchState]);

  useEffect(() => {
    hydratedRef.current = false;
  }, [fixtureId]);
}
