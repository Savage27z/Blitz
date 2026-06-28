"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import { generateMarketsFromEvent, resetEngine } from "@/lib/markets/engine";
import type { MatchEvent } from "@/lib/markets/types";
import type { GameState } from "@/lib/txodds/types";

const DEMO_EVENTS: Omit<MatchEvent, "id" | "timestamp">[] = [
  { type: "possession", team: 1, minute: 53, detail: "Building up" },
  { type: "danger", team: 1, minute: 54, detail: "HighDanger" },
  { type: "corner", team: 1, minute: 55 },
  { type: "possession", team: 2, minute: 56, detail: "Counter attack" },
  { type: "danger", team: 2, minute: 57, detail: "Danger" },
  { type: "yellow_card", team: 2, minute: 58 },
  { type: "corner", team: 2, minute: 59 },
  { type: "danger", team: 1, minute: 60, detail: "HighDanger" },
  { type: "goal", team: 1, minute: 61, detail: "Shot" },
  { type: "possession", team: 2, minute: 63, detail: "Restart" },
  { type: "danger", team: 2, minute: 65, detail: "Danger" },
  { type: "corner", team: 1, minute: 67 },
  { type: "yellow_card", team: 1, minute: 68 },
  { type: "danger", team: 2, minute: 70, detail: "HighDanger" },
  { type: "goal", team: 2, minute: 72, detail: "Head" },
];

function phaseForMinute(minute: number): GameState {
  if (minute >= 90) return "H2";
  if (minute >= 45) return "H2";
  return "H1";
}

export function useDemoSimulation(enabled: boolean) {
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled) {
      indexRef.current = 0;
      return;
    }

    const { fixtureId } = useMarketStore.getState();
    if (!fixtureId) return;

    resetEngine();
    indexRef.current = 0;
    useMarketStore.getState().updateMatchState("H1", 52, [0, 0]);
    useMarketStore.getState().setConnected(false);

    const tick = () => {
      const state = useMarketStore.getState();
      if (!state.fixtureId) return;

      if (indexRef.current >= DEMO_EVENTS.length) {
        indexRef.current = 0;
      }

      const template = DEMO_EVENTS[indexRef.current];
      const newMinute = state.matchMinute + 1;
      const phase = phaseForMinute(newMinute);

      const event: MatchEvent = {
        ...template,
        id: `demo-${Date.now()}-${indexRef.current}`,
        timestamp: Date.now(),
        minute: newMinute,
      };

      let newScore = [...state.score] as [number, number];
      if (event.type === "goal") {
        newScore[event.team - 1]++;
      }

      state.addEvent(event);
      state.updateMatchState(phase, newMinute, newScore);

      const markets = generateMarketsFromEvent(
        event,
        state.fixtureId,
        phase,
        newScore,
        state.team1Name,
        state.team2Name,
      );
      markets.forEach((m) => state.addMarket(m));

      indexRef.current++;
    };

    tick();
    intervalRef.current = setInterval(tick, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);
}
