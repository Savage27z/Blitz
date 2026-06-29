"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMarketStore } from "@/stores/marketStore";
import { useUserStore } from "@/stores/userStore";
import { generateMarketsFromEvent } from "@/lib/markets/engine";
import { checkResolution } from "@/lib/markets/resolver";
import { toast } from "@/components/app/Toast";

export function useMarkets() {
  const fixtureId = useMarketStore((s) => s.fixtureId);
  const events = useMarketStore((s) => s.events);
  const gamePhase = useMarketStore((s) => s.gamePhase);
  const score = useMarketStore((s) => s.score);
  const team1Name = useMarketStore((s) => s.team1Name);
  const team2Name = useMarketStore((s) => s.team2Name);
  const activeMarkets = useMarketStore((s) => s.activeMarkets);
  const matchMinute = useMarketStore((s) => s.matchMinute);
  const addMarket = useMarketStore((s) => s.addMarket);
  const settleMarket = useMarketStore((s) => s.settleMarket);
  const lockMarket = useMarketStore((s) => s.lockMarket);

  const { publicKey } = useWallet();
  const updateStakesForMarket = useUserStore((s) => s.updateStakesForMarket);

  const processedEventsRef = useRef<Set<string>>(new Set());
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    processedEventsRef.current.clear();
    sessionStartRef.current = Date.now();
  }, [fixtureId]);

  useEffect(() => {
    if (!fixtureId || events.length === 0) return;

    const latest = events[0];
    if (processedEventsRef.current.has(latest.id)) return;

    // Skip stale snapshot events — only generate markets for fresh stream/demo events
    const isDemo = latest.id.startsWith("demo-");
    const isFresh = latest.timestamp >= sessionStartRef.current - 15_000;
    if (!isDemo && !isFresh) {
      processedEventsRef.current.add(latest.id);
      return;
    }

    processedEventsRef.current.add(latest.id);

    const newMarkets = generateMarketsFromEvent(
      latest,
      fixtureId,
      gamePhase,
      score,
      team1Name,
      team2Name,
    );

    newMarkets.forEach((m) => {
      addMarket(m);
      toast(`New market: ${m.question}`, "market");
    });
  }, [events, fixtureId, gamePhase, score, team1Name, team2Name, addMarket]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const wallet = publicKey?.toBase58();
      const markets = useMarketStore.getState().activeMarkets;
      const currentEvents = useMarketStore.getState().events;
      const currentScore = useMarketStore.getState().score;
      const currentMinute = useMarketStore.getState().matchMinute;

      markets.forEach((market) => {
        if (market.status === "open" && market.expiresAt - now < 30_000) {
          lockMarket(market.id);
        }

        const resolution = checkResolution(market, currentEvents, currentScore, currentMinute);
        if (resolution?.resolved) {
          settleMarket(market.id, resolution.result);
          const label = resolution.result === null
            ? "Void — Push"
            : market.outcomes[resolution.result];
          toast(`Settled: ${label}`, "settle");
          if (wallet) {
            updateStakesForMarket(market.id, resolution.result, wallet);
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [lockMarket, settleMarket, publicKey, updateStakesForMarket]);
}
