import type { MicroMarket, MatchEvent } from "./types";

export function checkResolution(
  market: MicroMarket,
  events: MatchEvent[],
  score: [number, number],
  currentMinute: number,
): { resolved: boolean; result: 0 | 1 } | null {
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
      if (score[0] > 0 && score[1] > 0) {
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
  }

  return null;
}

function resolveOnExpiry(
  market: MicroMarket,
  events: MatchEvent[],
  score: [number, number],
  currentMinute: number,
): { resolved: boolean; result: 0 | 1 } {
  const newEvents = events.filter((e) => e.timestamp > market.createdAt);

  switch (market.type) {
    case "next_goal": {
      const goal = newEvents.find((e) => e.type === "goal");
      if (!goal) return { resolved: true, result: 0 };
      return { resolved: true, result: goal.team === 1 ? 0 : 1 };
    }
    case "total_goals_over": {
      const totalGoals = score[0] + score[1];
      const questionMatch = market.question.match(/Over ([\d.]+)/);
      const target = questionMatch ? parseFloat(questionMatch[1]) : 999;
      return { resolved: true, result: totalGoals > target ? 0 : 1 };
    }
    case "both_teams_score": {
      return { resolved: true, result: score[0] > 0 && score[1] > 0 ? 0 : 1 };
    }
    case "card_before": {
      const card = newEvents.find(
        (e) => e.type === "yellow_card" || e.type === "red_card"
      );
      return { resolved: true, result: card ? 0 : 1 };
    }
    case "halftime_result":
    case "next_corner":
    case "next_goal":
    default:
      return { resolved: true, result: 1 };
  }
}
