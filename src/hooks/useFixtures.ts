"use client";

import { useState, useEffect } from "react";
import type { Fixture, GameState } from "@/lib/txodds/types";

export type FixtureFilter = "live" | "upcoming" | "completed";

const LIVE_STATES: GameState[] = ["H1", "HT", "H2", "ET1", "ET2", "PE", "HTET"];
const COMPLETED_STATES: GameState[] = ["F", "FET", "FPE", "WET", "WPE"];

// Approximate match duration for time-based inference when API has no status
const MATCH_DURATION_MS = 105 * 60 * 1000;

export function getFixtureCategory(fixture: Fixture, now = Date.now()): FixtureFilter {
  const status = fixture.statusId || "NS";

  if (LIVE_STATES.includes(status)) return "live";
  if (COMPLETED_STATES.includes(status)) return "completed";

  const start = fixture.startTime;
  if (!start || isNaN(start)) return "upcoming";

  if (start + MATCH_DURATION_MS < now) return "completed";
  if (start <= now) return "live"; // kickoff passed, likely in progress
  return "upcoming";
}

export function isFixtureLive(fixture: Fixture, now = Date.now()): boolean {
  return getFixtureCategory(fixture, now) === "live";
}

export function useFixtures() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FixtureFilter>("upcoming");

  useEffect(() => {
    async function fetchFixtures() {
      try {
        setLoading(true);
        const res = await fetch("/api/proxy/fixtures");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        const raw: any[] = Array.isArray(data) ? data : data.fixtures || [];
        const list: Fixture[] = raw.map((f) => ({
          fixtureId: f.FixtureId ?? f.fixtureId,
          competitionId: f.CompetitionId ?? f.competitionId,
          competitionName: f.Competition ?? f.competitionName,
          participant1Id: f.Participant1Id ?? f.participant1Id,
          participant2Id: f.Participant2Id ?? f.participant2Id,
          participant1Name: f.Participant1 ?? f.participant1Name ?? "TBD",
          participant2Name: f.Participant2 ?? f.participant2Name ?? "TBD",
          participant1IsHome: f.Participant1IsHome ?? f.participant1IsHome ?? true,
          startTime: f.StartTime ?? f.startTime,
          statusId: f.StatusSoccerId ?? f.statusId ?? "NS",
          score: f.scoreSoccer ?? f.score,
        }));
        setFixtures(list);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Failed to fetch fixtures");
      } finally {
        setLoading(false);
      }
    }
    fetchFixtures();
    const interval = setInterval(fetchFixtures, 30000);
    return () => clearInterval(interval);
  }, []);

  const now = Date.now();
  const filtered = fixtures.filter((f) => getFixtureCategory(f, now) === filter);

  return { fixtures: filtered, allFixtures: fixtures, loading, error, filter, setFilter };
}
