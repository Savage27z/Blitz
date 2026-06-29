"use client";

import { create } from "zustand";

export interface UserStake {
  id: string;
  wallet: string;
  fixtureId: number;
  marketId: string;
  question: string;
  outcome: 0 | 1;
  outcomeLabel: string;
  amount: number;
  txHash: string;
  timestamp: number;
  status: "active" | "won" | "lost" | "void" | "pending";
}

interface UserStoreState {
  stakes: UserStake[];
  addStake: (stake: UserStake) => void;
  loadStakes: (wallet: string) => UserStake[];
  updateStakesForMarket: (marketId: string, result: 0 | 1 | null, wallet: string) => void;
}

const STORAGE_KEY = "blitz_user_stakes";

function readAll(): UserStake[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(stakes: UserStake[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stakes.slice(0, 200)));
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  stakes: [],

  addStake: (stake) => {
    const all = readAll();
    const next = [stake, ...all];
    writeAll(next);
    set({ stakes: next.filter((s) => s.wallet === stake.wallet) });
  },

  loadStakes: (wallet) => {
    const filtered = readAll().filter((s) => s.wallet === wallet);
    set({ stakes: filtered });
    return filtered;
  },

  updateStakesForMarket: (marketId, result, wallet) => {
    const all = readAll().map((s) => {
      if (s.marketId !== marketId || s.wallet !== wallet || s.status !== "active") {
        return s;
      }
      const status = result === null
        ? ("void" as const)
        : s.outcome === result ? ("won" as const) : ("lost" as const);
      return { ...s, status };
    });
    writeAll(all);
    set({ stakes: all.filter((s) => s.wallet === wallet) });
  },
}));
