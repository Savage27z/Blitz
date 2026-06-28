"use client";

import { useState, useEffect, useCallback } from "react";
import type { Fixture } from "@/lib/txodds/types";
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

function loadArchive(): Fixture[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Fixture[];
    return Array.isArray(parsed) ? parsed : [];
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
      saveArchive(merged);
      setFixtures(merged);
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

  // Re-evaluate live/completed buckets every minute without waiting for API poll
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(tick);
  }, []);

  const filtered = fixtures.filter((f) => getFixtureCategory(f, now) === filter);

  return { fixtures: filtered, allFixtures: fixtures, loading, error, filter, setFilter };
}
