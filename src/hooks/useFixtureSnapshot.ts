"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import type { GameState } from "@/lib/txodds/types";
import type { MatchEvent } from "@/lib/markets/types";
import { extractScoreStatusFromEvents } from "@/lib/txodds/fixtures";

const LIVE_PHASES: GameState[] = ["H1", "H2", "HT", "ET1", "ET2", "PE"];

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

/** Hydrate match state from scores snapshot — never clobber live SSE events */
export function useFixtureSnapshot(fixtureId: number | null, startTime?: number) {
  const updateMatchState = useMarketStore((s) => s.updateMatchState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!fixtureId) return;

    let cancelled = false;

    async function loadSnapshot() {
      try {
        const res = await fetch(`/api/proxy/scores-snapshot/${fixtureId}`);
        if (!res.ok || cancelled) return;

        const events = await res.json();
        if (!Array.isArray(events) || events.length === 0 || cancelled) return;

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
        }

        const store = useMarketStore.getState();
        const isLive =
          LIVE_PHASES.includes(phase) ||
          LIVE_PHASES.includes(store.gamePhase) ||
          store.connected;

        if (isLive && (store.connected || store.events.length > 0 || hydratedRef.current)) {
          updateMatchState(phase, minute, [p1, p2]);
          return;
        }

        const matchEvents = parseEvents(events);
        useMarketStore.setState({ events: matchEvents });
        updateMatchState(phase, minute, [p1, p2]);
        hydratedRef.current = true;
      } catch {
        // SSE or demo may still provide live updates
      }
    }

    loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, [fixtureId, startTime, updateMatchState]);

  useEffect(() => {
    hydratedRef.current = false;
  }, [fixtureId]);
}
