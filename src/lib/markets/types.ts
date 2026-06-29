export type MarketType =
  | "next_goal"
  | "goal_before"
  | "total_goals_over"
  | "clean_sheet"
  | "next_corner"
  | "card_before"
  | "halftime_result"
  | "both_teams_score";

export type MarketStatus = "open" | "locked" | "settled";

export interface MicroMarket {
  id: string;
  fixtureId: number;
  type: MarketType;
  question: string;
  outcomes: [string, string];
  createdAt: number;
  expiresAt: number;
  resolvesAt: number;
  triggerEvent: string;
  status: MarketStatus;
  result: 0 | 1 | null;
  resolveTarget?: number;
  totalStaked: [number, number];
  settlementProof: string | null;
}

export interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "corner" | "substitution" | "free_kick" | "possession" | "phase_change" | "danger";
  team: 1 | 2;
  minute: number;
  playerName?: string;
  detail?: string;
  timestamp: number;
}
