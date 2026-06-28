import type { GameState, SoccerScore, SoccerScoreEvent } from "@/lib/txodds/types";
import type { MatchEvent } from "@/lib/markets/types";

/** Numeric soccer phase IDs from TxODDS scores feed (Type: "Soccer"). */
const SOCCER_STATUS_BY_ID: Record<number, GameState> = {
  1: "NS",
  2: "H1",
  3: "HT",
  4: "H2",
  5: "F",
  6: "ET1",
  7: "ET2",
  8: "PE",
  9: "FET",
  10: "FPE",
  11: "WET",
  12: "WPE",
  13: "HTET",
};

function readData(raw: Record<string, unknown>) {
  return (raw.DataSoccer ?? raw.dataSoccer ?? raw.Data ?? raw.data) as
    | Record<string, unknown>
    | undefined;
}

function readScore(raw: Record<string, unknown>): SoccerScore | undefined {
  return (raw.ScoreSoccer ?? raw.scoreSoccer ?? raw.Score ?? raw.score) as
    | SoccerScore
    | undefined;
}

export function mapSoccerStatusId(statusId: unknown): GameState | undefined {
  if (typeof statusId === "string") {
    const s = statusId as GameState;
    if (s && s !== "NS") return s;
    return statusId === "NS" ? "NS" : undefined;
  }
  if (typeof statusId === "number") {
    return SOCCER_STATUS_BY_ID[statusId];
  }
  return undefined;
}

export function gamePhaseFromRaw(raw: Record<string, unknown>): GameState | undefined {
  const soccer =
    raw.statusSoccerId ??
    raw.StatusSoccerId ??
    raw.StatusId ??
    raw.statusId;
  const data = readData(raw);
  const fromData = data?.StatusId ?? data?.statusId;
  return mapSoccerStatusId(soccer) ?? mapSoccerStatusId(fromData);
}

export function minuteFromRaw(raw: Record<string, unknown>): number {
  const data = readData(raw);
  const fromData = data?.Minutes ?? data?.minutes;
  if (typeof fromData === "number" && fromData > 0) return fromData;

  const clock = (raw.Clock ?? raw.clock) as { Seconds?: number; seconds?: number } | undefined;
  const seconds = clock?.Seconds ?? clock?.seconds;
  if (typeof seconds === "number" && seconds > 0) {
    return Math.min(90, Math.max(1, Math.ceil(seconds / 60)));
  }
  return 0;
}

export function normalizeScoreEvent(raw: Record<string, unknown>): SoccerScoreEvent {
  const data = readData(raw);
  const action = String(raw.action ?? raw.Action ?? data?.Action ?? "");

  const enrichedData =
    data && Object.keys(data).length > 0
      ? {
          ...data,
          Goal: data.Goal ?? data.goal ?? action === "goal",
          Corner: data.Corner ?? data.corner ?? action === "corner",
          YellowCard: data.YellowCard ?? data.yellowCard ?? action === "yellow_card",
          RedCard: data.RedCard ?? data.redCard ?? action === "red_card",
          Minutes: data.Minutes ?? data.minutes ?? minuteFromRaw(raw),
          Participant: data.Participant ?? data.participant ?? raw.Participant ?? raw.participant,
          FreeKickType: data.FreeKickType ?? data.freeKickType,
          GoalType: data.GoalType ?? data.goalType,
        }
      : action
        ? {
            Action: action,
            Goal: action === "goal",
            Corner: action === "corner",
            YellowCard: action === "yellow_card",
            RedCard: action === "red_card",
            Minutes: minuteFromRaw(raw),
            Participant: raw.Participant ?? raw.participant,
            FreeKickType: (readData(raw) as Record<string, unknown> | undefined)?.FreeKickType,
          }
        : undefined;

  return {
    fixtureId: (raw.fixtureId ?? raw.FixtureId) as number,
    gameState: String(raw.gameState ?? raw.GameState ?? ""),
    startTime: (raw.startTime ?? raw.StartTime) as number,
    participant1Id: (raw.participant1Id ?? raw.Participant1Id) as number,
    participant2Id: (raw.participant2Id ?? raw.Participant2Id) as number,
    participant1IsHome: Boolean(raw.participant1IsHome ?? raw.Participant1IsHome),
    action,
    ts: (raw.ts ?? raw.Ts) as number,
    seq: (raw.seq ?? raw.Seq) as number,
    statusSoccerId: (gamePhaseFromRaw(raw) ?? "NS") as GameState,
    scoreSoccer: readScore(raw) ?? {
      Participant1: {
        H1: { Goals: 0, YellowCards: 0, RedCards: 0, Corners: 0 },
        H2: { Goals: 0, YellowCards: 0, RedCards: 0, Corners: 0 },
        Total: { Goals: 0, YellowCards: 0, RedCards: 0, Corners: 0 },
      },
      Participant2: {
        H1: { Goals: 0, YellowCards: 0, RedCards: 0, Corners: 0 },
        H2: { Goals: 0, YellowCards: 0, RedCards: 0, Corners: 0 },
        Total: { Goals: 0, YellowCards: 0, RedCards: 0, Corners: 0 },
      },
    },
    dataSoccer: enrichedData as SoccerScoreEvent["dataSoccer"],
    stats: (raw.stats ?? raw.Stats ?? {}) as Record<string, number>,
    possession: typeof raw.possession === "number" ? raw.possession : Number(raw.Possession ?? 0),
    possessionType: (raw.possessionType ?? raw.PossessionType) as SoccerScoreEvent["possessionType"],
    parti1StateSoccer: (raw.parti1StateSoccer ?? raw.Parti1State) as SoccerScoreEvent["parti1StateSoccer"],
    parti2StateSoccer: (raw.parti2StateSoccer ?? raw.Parti2State) as SoccerScoreEvent["parti2StateSoccer"],
    possibleEventSoccer: (raw.possibleEventSoccer ?? raw.PossibleEvent) as SoccerScoreEvent["possibleEventSoccer"],
  };
}

export function goalsFromRaw(raw: Record<string, unknown>, score?: SoccerScore): [number, number] {
  const p1 = score?.Participant1?.Total?.Goals;
  const p2 = score?.Participant2?.Total?.Goals;
  if (typeof p1 === "number" || typeof p2 === "number") {
    return [p1 ?? 0, p2 ?? 0];
  }

  const stats = (raw.Stats ?? raw.stats) as Record<string, number> | undefined;
  if (stats) {
    return [stats["1"] ?? stats[1] ?? 0, stats["2"] ?? stats[2] ?? 0];
  }
  return [0, 0];
}

export function parseMatchEventFromRaw(raw: Record<string, unknown>): MatchEvent | null {
  const normalized = normalizeScoreEvent(raw);
  const data = normalized.dataSoccer as Record<string, unknown> | undefined;
  if (!data) return null;

  const minute = (data.Minutes as number) || minuteFromRaw(raw);
  const participant = data.Participant as number | undefined;
  const team = (participant === normalized.participant1Id ? 1 : 2) as 1 | 2;
  const id = `${normalized.fixtureId}-${normalized.seq}-${normalized.ts}`;

  if (data.Goal || normalized.action === "goal") {
    return {
      id,
      type: "goal",
      team,
      minute,
      detail: (data.GoalType as string) ?? undefined,
      timestamp: Date.now(),
    };
  }
  if (data.YellowCard || normalized.action === "yellow_card") {
    return { id, type: "yellow_card", team, minute, timestamp: Date.now() };
  }
  if (data.RedCard || normalized.action === "red_card") {
    return { id, type: "red_card", team, minute, timestamp: Date.now() };
  }
  if (data.Corner || normalized.action === "corner") {
    return { id, type: "corner", team, minute, timestamp: Date.now() };
  }
  const fkType = data.FreeKickType as string | undefined;
  if (fkType === "Danger" || fkType === "HighDanger") {
    return { id, type: "danger", team, minute, detail: fkType, timestamp: Date.now() };
  }
  if (
    normalized.action === "danger_possession" ||
    normalized.action === "high_danger_possession"
  ) {
    return {
      id,
      type: "danger",
      team,
      minute,
      detail: normalized.action,
      timestamp: Date.now(),
    };
  }

  return null;
}

export function extractScoreStatusFromEvents(events: Record<string, unknown>[]): {
  statusId?: GameState;
  score?: SoccerScore;
  minute?: number;
} {
  let statusId: GameState | undefined;
  let score: SoccerScore | undefined;
  let minute = 0;

  for (const e of events) {
    const phase = gamePhaseFromRaw(e);
    if (phase && phase !== "NS") statusId = phase;

    const sc = readScore(e);
    if (sc?.Participant1?.Total) score = sc;

    const m = minuteFromRaw(e);
    if (m > minute) minute = m;
  }

  for (let i = events.length - 1; i >= 0; i--) {
    const phase = gamePhaseFromRaw(events[i]);
    if (phase && phase !== "NS") {
      statusId = phase;
      break;
    }
  }

  if (minute === 0) {
    for (let i = events.length - 1; i >= 0; i--) {
      const m = minuteFromRaw(events[i]);
      if (m > 0) {
        minute = m;
        break;
      }
    }
  }

  return { statusId, score, minute };
}

export function extractStats(raw: Record<string, unknown>) {
  const stats = (raw.Stats ?? raw.stats) as Record<string, number> | undefined;
  const p1Shots = stats?.["1001"] ?? stats?.["1007"] ?? 0;
  const p2Shots = stats?.["2001"] ?? stats?.["2007"] ?? 0;
  const possession =
    typeof raw.Possession === "number"
      ? raw.Possession
      : typeof raw.possession === "number"
        ? raw.possession
        : 50;

  return {
    possession: possession === 1 ? 55 : possession === 2 ? 45 : 50,
    shotsOnTarget: [p1Shots, p2Shots] as [number, number],
  };
}
