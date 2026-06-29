import type { MicroMarket, MatchEvent } from "./types";

export function checkResolution(
  market: MicroMarket,
  events: MatchEvent[],
  score: [number, number],
  currentMinute: number,
): { resolved: boolean; result: 0 | 1 | null } | null {
  const now = Date.now();

  if (now >= market.expiresAt) {
    return resolveOnExpiry(market, events, score, currentMinute);
  }

  const newEvents = events.filter((e) => e.timestamp > market.createdAt);

  switch (market.type) {
    case "next_goal": {
      const goal = newEvents.find((e) => e.type === "goal");
      if (goal) {
        return { resolved: true, result: goal.team === 1 ? 0 : 1 };
      }
      break;
    }
    case "next_corner": {
      const corner = newEvents.find((e) => e.type === "corner");
      if (corner) {
        return { resolved: true, result: corner.team === 1 ? 0 : 1 };
      }
      break;
    }
    case "both_teams_score": {
      const newGoals = newEvents.filter((e) => e.type === "goal");
      const trailingTeamScored = newGoals.length > 0;
      if (trailingTeamScored) {
        return { resolved: true, result: 0 };
      }
      break;
    }
    case "card_before": {
      const card = newEvents.find(
        (e) => e.type === "yellow_card" || e.type === "red_card"
      );
      if (card) {
        return { resolved: true, result: 0 };
      }
      break;
    }
    case "halftime_result": {
      const goalInWindow = newEvents.find((e) => e.type === "goal");
      if (goalInWindow) {
        return { resolved: true, result: 1 };
      }
      break;
    }
  }

  return null;
}

function resolveOnExpiry(
  market: MicroMarket,
  events: MatchEvent[],
  score: [number, number],
  currentMinute: number,
): { resolved: boolean; result: 0 | 1 | null } {
  const newEvents = events.filter((e) => e.timestamp > market.createdAt);

  switch (market.type) {
    case "next_goal": {
      const goal = newEvents.find((e) => e.type === "goal");
      if (!goal) return { resolved: true, result: null };
      return { resolved: true, result: goal.team === 1 ? 0 : 1 };
    }
    case "total_goals_over": {
      const totalGoals = score[0] + score[1];
      const target = market.resolveTarget ?? 999;
      return { resolved: true, result: totalGoals > target ? 0 : 1 };
    }
    case "both_teams_score": {
      const trailingScored = newEvents.some((e) => e.type === "goal");
      return { resolved: true, result: trailingScored ? 0 : 1 };
    }
    case "card_before": {
      const card = newEvents.find(
        (e) => e.type === "yellow_card" || e.type === "red_card"
      );
      return { resolved: true, result: card ? 0 : 1 };
    }
    case "halftime_result": {
      const goalInWindow = newEvents.find((e) => e.type === "goal");
      return { resolved: true, result: goalInWindow ? 1 : 0 };
    }
    case "next_corner": {
      const corner = newEvents.find((e) => e.type === "corner");
      if (!corner) return { resolved: true, result: null };
      return { resolved: true, result: corner.team === 1 ? 0 : 1 };
    }
    default:
      return { resolved: true, result: null };
  }
}
