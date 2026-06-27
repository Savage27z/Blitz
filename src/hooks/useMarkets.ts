"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import { generateMarketsFromEvent } from "@/lib/markets/engine";
import { checkResolution } from "@/lib/markets/resolver";

export function useMarkets() {
  const {
    fixtureId,
    events,
    gamePhase,
    score,
    team1Name,
    team2Name,
    activeMarkets,
    matchMinute,
    addMarket,
    settleMarket,
    lockMarket,
  } = useMarketStore();

  const processedEventsRef = useRef<Set<string>>(new Set());

  // Generate markets from new events
  useEffect(() => {
    if (!fixtureId || events.length === 0) return;

    const latest = events[0];
    if (processedEventsRef.current.has(latest.id)) return;
    processedEventsRef.current.add(latest.id);

    const newMarkets = generateMarketsFromEvent(
      latest,
      fixtureId,
      gamePhase,
      score,
      team1Name,
      team2Name,
    );

    newMarkets.forEach(addMarket);
  }, [events, fixtureId, gamePhase, score, team1Name, team2Name, addMarket]);

  // Resolve markets on a timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      activeMarkets.forEach((market) => {
        // Lock market 30s before expiry
        if (market.status === "open" && market.expiresAt - now < 30_000) {
          lockMarket(market.id);
        }

        const resolution = checkResolution(market, events, score, matchMinute);
        if (resolution?.resolved) {
          settleMarket(market.id, resolution.result);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeMarkets, events, score, matchMinute, settleMarket, lockMarket]);
}
