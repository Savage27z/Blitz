import type { MicroMarket, MarketType, MatchEvent } from "./types";
import type { SoccerScoreEvent, GameState } from "@/lib/txodds/types";

const MARKET_DURATION_MS = 5 * 60 * 1000; // 5-minute windows
const COOLDOWN_MS = 30 * 1000;

interface EngineState {
  lastMarketTime: Record<MarketType, number>;
  totalMarketsGenerated: number;
}

let engineState: EngineState = {
  lastMarketTime: {} as Record<MarketType, number>,
  totalMarketsGenerated: 0,
};

export function resetEngine() {
  engineState = { lastMarketTime: {} as Record<MarketType, number>, totalMarketsGenerated: 0 };
}

function canGenerate(type: MarketType): boolean {
  const last = engineState.lastMarketTime[type] || 0;
  return Date.now() - last > COOLDOWN_MS;
}

function buildMarket(
  fixtureId: number,
  type: MarketType,
  question: string,
  outcomes: [string, string],
  triggerEvent: string,
  durationMs: number = MARKET_DURATION_MS,
): MicroMarket {
  const now = Date.now();
  engineState.lastMarketTime[type] = now;
  engineState.totalMarketsGenerated++;

  return {
    id: `${fixtureId}-${type}-${engineState.totalMarketsGenerated}-${now}`,
    fixtureId,
    type,
    question,
    outcomes,
    createdAt: now,
    expiresAt: now + durationMs,
    resolvesAt: now + durationMs,
    triggerEvent,
    status: "open",
    result: null,
    totalStaked: [0, 0],
    settlementProof: null,
  };
}

export function generateMarketsFromEvent(
  event: MatchEvent,
  fixtureId: number,
  gamePhase: GameState,
  score: [number, number],
  team1Name: string,
  team2Name: string,
): MicroMarket[] {
  const markets: MicroMarket[] = [];
  const isPlayable = ["H1", "H2", "ET1", "ET2"].includes(gamePhase);
  if (!isPlayable) return markets;

  const totalGoals = score[0] + score[1];

  if (event.type === "danger" || event.type === "corner") {
    if (canGenerate("next_goal")) {
      markets.push(
        buildMarket(
          fixtureId,
          "next_goal",
          `Next goal: ${team1Name} or ${team2Name}?`,
          [team1Name, team2Name],
          event.id,
          3 * 60 * 1000,
        )
      );
    }
  }

  if (event.type === "goal") {
    if (canGenerate("total_goals_over")) {
      const target = totalGoals + 0.5;
      const m = buildMarket(
        fixtureId,
        "total_goals_over",
        `Over ${target} total goals by end of half?`,
        ["Yes", "No"],
        event.id,
      );
      m.resolveTarget = target;
      markets.push(m);
    }
    if (canGenerate("both_teams_score")) {
      const both = score[0] > 0 && score[1] > 0;
      if (!both) {
        const trailing = score[0] === 0 ? team1Name : team2Name;
        markets.push(
          buildMarket(
            fixtureId,
            "both_teams_score",
            `Will ${trailing} score in the next 10 minutes?`,
            ["Yes", "No"],
            event.id,
            10 * 60 * 1000,
          )
        );
      }
    }
  }

  if (event.type === "corner") {
    if (canGenerate("next_corner")) {
      markets.push(
        buildMarket(
          fixtureId,
          "next_corner",
          `Next corner: ${team1Name} or ${team2Name}?`,
          [team1Name, team2Name],
          event.id,
          4 * 60 * 1000,
        )
      );
    }
  }

  if (event.type === "yellow_card" || event.type === "red_card") {
    if (canGenerate("card_before")) {
      const targetMinute = event.minute + 15;
      markets.push(
        buildMarket(
          fixtureId,
          "card_before",
          `Another card before ${targetMinute}'?`,
          ["Yes", "No"],
          event.id,
          7 * 60 * 1000,
        )
      );
    }
  }

  if (event.type === "phase_change" && gamePhase === "H2") {
    if (canGenerate("halftime_result")) {
      markets.push(
        buildMarket(
          fixtureId,
          "halftime_result",
          `Will the current scoreline hold for 10 minutes?`,
          ["Yes", "No"],
          event.id,
          10 * 60 * 1000,
        )
      );
    }
  }

  return markets;
}
