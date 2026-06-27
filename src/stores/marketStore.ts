import { create } from "zustand";
import type { MicroMarket, MatchEvent } from "@/lib/markets/types";
import type { GameState, SoccerScore } from "@/lib/txodds/types";

interface MarketStoreState {
  fixtureId: number | null;
  team1Name: string;
  team2Name: string;
  score: [number, number];
  gamePhase: GameState;
  matchMinute: number;
  events: MatchEvent[];
  activeMarkets: MicroMarket[];
  settledMarkets: MicroMarket[];
  connected: boolean;

  setFixtureInfo: (id: number, t1: string, t2: string) => void;
  setConnected: (v: boolean) => void;
  addEvent: (event: MatchEvent) => void;
  updateMatchState: (phase: GameState, minute: number, score: [number, number]) => void;
  addMarket: (market: MicroMarket) => void;
  settleMarket: (marketId: string, result: 0 | 1, proofTxHash?: string) => void;
  stakeOnMarket: (marketId: string, outcome: 0 | 1, amount: number) => void;
  lockMarket: (marketId: string) => void;
}

export const useMarketStore = create<MarketStoreState>((set) => ({
  fixtureId: null,
  team1Name: "Team 1",
  team2Name: "Team 2",
  score: [0, 0],
  gamePhase: "NS",
  matchMinute: 0,
  events: [],
  activeMarkets: [],
  settledMarkets: [],
  connected: false,

  setFixtureInfo: (id, t1, t2) => set({ fixtureId: id, team1Name: t1, team2Name: t2 }),
  setConnected: (v) => set({ connected: v }),

  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 100) })),

  updateMatchState: (phase, minute, score) =>
    set({ gamePhase: phase, matchMinute: minute, score }),

  addMarket: (market) =>
    set((s) => ({ activeMarkets: [market, ...s.activeMarkets] })),

  settleMarket: (marketId, result, proofTxHash) =>
    set((s) => {
      const market = s.activeMarkets.find((m) => m.id === marketId);
      if (!market) return s;
      const settled: MicroMarket = {
        ...market,
        status: "settled",
        result,
        settlementProof: proofTxHash || null,
      };
      return {
        activeMarkets: s.activeMarkets.filter((m) => m.id !== marketId),
        settledMarkets: [settled, ...s.settledMarkets].slice(0, 20),
      };
    }),

  stakeOnMarket: (marketId, outcome, amount) =>
    set((s) => ({
      activeMarkets: s.activeMarkets.map((m) => {
        if (m.id !== marketId) return m;
        const staked = [...m.totalStaked] as [number, number];
        staked[outcome] += amount;
        return { ...m, totalStaked: staked };
      }),
    })),

  lockMarket: (marketId) =>
    set((s) => ({
      activeMarkets: s.activeMarkets.map((m) =>
        m.id === marketId ? { ...m, status: "locked" as const } : m
      ),
    })),
}));
