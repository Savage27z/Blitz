import type { Fixture, GameState, SoccerScore } from "@/lib/txodds/types";

export type FixtureFilter = "live" | "upcoming" | "completed";

const LIVE_STATES: GameState[] = ["H1", "HT", "H2", "ET1", "ET2", "PE", "HTET"];
const COMPLETED_STATES: GameState[] = ["F", "FET", "FPE", "WET", "WPE"];

/** Regulation + stoppage + brief post-whistle buffer when API has no status */
const MATCH_DURATION_MS = 120 * 60 * 1000;

export function normalizeFixturesPayload(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.value)) return obj.value;
    if (Array.isArray(obj.fixtures)) return obj.fixtures;
  }
  return [];
}

export function mapRawFixture(f: any): Fixture {
  return {
    fixtureId: f.FixtureId ?? f.fixtureId,
    competitionId: f.CompetitionId ?? f.competitionId,
    competitionName: f.Competition ?? f.competitionName,
    participant1Id: f.Participant1Id ?? f.participant1Id,
    participant2Id: f.Participant2Id ?? f.participant2Id,
    participant1Name: f.Participant1 ?? f.participant1Name ?? "TBD",
    participant2Name: f.Participant2 ?? f.participant2Name ?? "TBD",
    participant1IsHome: f.Participant1IsHome ?? f.participant1IsHome ?? true,
    startTime: f.StartTime ?? f.startTime,
    statusId: (f.StatusSoccerId ?? f.statusId ?? "NS") as GameState,
    score: (f.scoreSoccer ?? f.ScoreSoccer ?? f.score) as SoccerScore | undefined,
  };
}

export function getFixtureCategory(fixture: Fixture, now = Date.now()): FixtureFilter {
  const status = fixture.statusId || "NS";

  if (LIVE_STATES.includes(status)) return "live";
  if (COMPLETED_STATES.includes(status)) return "completed";

  const start = fixture.startTime;
  if (!start || isNaN(start)) return "upcoming";

  if (start + MATCH_DURATION_MS < now) return "completed";
  if (start <= now) return "live";
  return "upcoming";
}

export function isFixtureLive(fixture: Fixture, now = Date.now()): boolean {
  return getFixtureCategory(fixture, now) === "live";
}

export function extractScoreStatusFromEvents(events: any[]): {
  statusId?: GameState;
  score?: SoccerScore;
} {
  let statusId: GameState | undefined;
  let score: SoccerScore | undefined;

  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    const st = (e.StatusSoccerId ?? e.statusSoccerId) as GameState | undefined;
    const sc = (e.ScoreSoccer ?? e.scoreSoccer) as SoccerScore | undefined;
    if (st && st !== "NS") statusId = st;
    if (sc?.Participant1?.Total) score = sc;
    if (statusId && score) break;
  }

  return { statusId, score };
}
