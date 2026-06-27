"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import type { SoccerScoreEvent, GameState } from "@/lib/txodds/types";
import type { MatchEvent } from "@/lib/markets/types";

function parseScoreEvent(raw: SoccerScoreEvent): MatchEvent | null {
  const data = raw.dataSoccer;
  if (!data) return null;

  const minute = data.Minutes || 0;
  const team = (data.Participant === raw.participant1Id ? 1 : 2) as 1 | 2;
  const id = `${raw.fixtureId}-${raw.seq}-${raw.ts}`;

  if (data.Goal) {
    return { id, type: "goal", team, minute, detail: data.GoalType, timestamp: raw.ts };
  }
  if (data.YellowCard) {
    return { id, type: "yellow_card", team, minute, timestamp: raw.ts };
  }
  if (data.RedCard) {
    return { id, type: "red_card", team, minute, timestamp: raw.ts };
  }
  if (data.Corner) {
    return { id, type: "corner", team, minute, timestamp: raw.ts };
  }
  if (data.FreeKickType === "Danger" || data.FreeKickType === "HighDanger") {
    return { id, type: "danger", team, minute, detail: data.FreeKickType, timestamp: raw.ts };
  }

  return null;
}

export function useScoresStream(fixtureId: number | null) {
  const esRef = useRef<EventSource | null>(null);
  const { addEvent, updateMatchState, setConnected } = useMarketStore();

  useEffect(() => {
    if (!fixtureId) return;

    const url = `/api/proxy/scores-stream?fixtureId=${fixtureId}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (msg) => {
      if (!msg.data) return;
      try {
        const raw: SoccerScoreEvent = JSON.parse(msg.data);
        if (!raw.statusSoccerId) return;

        const p1Goals = raw.scoreSoccer?.Participant1?.Total?.Goals ?? 0;
        const p2Goals = raw.scoreSoccer?.Participant2?.Total?.Goals ?? 0;
        const minute = raw.dataSoccer?.Minutes ?? 0;

        updateMatchState(raw.statusSoccerId as GameState, minute, [p1Goals, p2Goals]);

        const event = parseScoreEvent(raw);
        if (event) addEvent(event);
      } catch {
        // heartbeat or malformed
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      setTimeout(() => {
        if (esRef.current === es) {
          esRef.current = new EventSource(url);
        }
      }, 3000);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [fixtureId, addEvent, updateMatchState, setConnected]);
}
