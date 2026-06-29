"use client";

import { useState, useEffect, useCallback } from "react";
import type { Fixture, SoccerScore } from "@/lib/txodds/types";
import {
  type FixtureFilter,
  getFixtureCategory,
  isFixtureLive,
  mapRawFixture,
  normalizeFixturesPayload,
} from "@/lib/txodds/fixtures";

export type { FixtureFilter };
export { getFixtureCategory, isFixtureLive };

const ARCHIVE_KEY = "blitz-fixtures-archive";

function isValidFixture(f: unknown): f is Fixture {
  if (!f || typeof f !== "object") return false;
  const o = f as Record<string, unknown>;
  return typeof o.fixtureId === "number" && typeof o.startTime === "number" && typeof o.participant1Name === "string";
}

function loadArchive(): Fixture[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidFixture);
  } catch {
    return [];
  }
}

function saveArchive(fixtures: Fixture[]) {
  if (typeof window === "undefined") return;
  const completed = fixtures.filter((f) => getFixtureCategory(f) === "completed");
  const byId = new Map<number, Fixture>();
  loadArchive().forEach((f) => byId.set(f.fixtureId, f));
  completed.forEach((f) => byId.set(f.fixtureId, f));
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(Array.from(byId.values())));
}

function mergeWithArchive(incoming: Fixture[]): Fixture[] {
  const byId = new Map<number, Fixture>();
  loadArchive().forEach((f) => byId.set(f.fixtureId, f));
  incoming.forEach((f) => byId.set(f.fixtureId, f));
  return Array.from(byId.values());
}

async function refreshScoresFromSnapshot(fixtures: Fixture[]): Promise<Fixture[]> {
  const now = Date.now();
  const needsRefresh = fixtures.filter((f) => {
    const cat = getFixtureCategory(f, now);
    if (cat === "live") return true;
    if (cat === "completed" && f.startTime && now - f.startTime < 6 * 60 * 60 * 1000) return true;
    return false;
  });

  if (needsRefresh.length === 0) return fixtures;

  const updates = new Map<number, SoccerScore>();

  await Promise.allSettled(
    needsRefresh.map(async (f) => {
      try {
        const res = await fetch(`/api/proxy/scores-snapshot/${f.fixtureId}`, { cache: "no-store" });
        if (!res.ok) return;
        const events = await res.json();
        if (!Array.isArray(events) || events.length === 0) return;

        const latest = events.reduce((best: Record<string, unknown>, e: Record<string, unknown>) => {
          const seq = Number(e.Seq ?? e.seq ?? 0);
          const bestSeq = Number(best.Seq ?? best.seq ?? 0);
          return seq >= bestSeq ? e : best;
        }, events[0]);

        const score = (latest.Score ?? latest.score ?? latest.ScoreSoccer ?? latest.scoreSoccer) as SoccerScore | undefined;
        if (score?.Participant1?.Total && score?.Participant2?.Total) {
          updates.set(f.fixtureId, score);
        }
      } catch {
        // keep existing score
      }
    })
  );

  if (updates.size === 0) return fixtures;

  return fixtures.map((f) => {
    const freshScore = updates.get(f.fixtureId);
    return freshScore ? { ...f, score: freshScore } : f;
  });
}

export function useFixtures() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FixtureFilter>("upcoming");
  const [now, setNow] = useState(() => Date.now());

  const fetchFixtures = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/proxy/fixtures");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const list = normalizeFixturesPayload(data).map(mapRawFixture);
      const merged = mergeWithArchive(list);

      const withFreshScores = await refreshScoresFromSnapshot(merged);
      saveArchive(withFreshScores);
      setFixtures(withFreshScores);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch fixtures");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFixtures();
    const interval = setInterval(fetchFixtures, 30000);
    return () => clearInterval(interval);
  }, [fetchFixtures]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(tick);
  }, []);

  const filtered = fixtures.filter((f) => getFixtureCategory(f, now) === filter);

  return { fixtures: filtered, allFixtures: fixtures, loading, error, filter, setFilter };
}
