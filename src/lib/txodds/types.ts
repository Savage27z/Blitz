export type GameState = "NS" | "H1" | "HT" | "H2" | "F" | "ET1" | "ET2" | "PE" | "FET" | "FPE" | "WET" | "WPE" | "HTET";

export type PossessionType = "SafePossession" | "AttackPossession" | "DangerPossession" | "HighDangerPossession";

export type FreeKickType = "Safe" | "Attack" | "Danger" | "HighDanger" | "Offside";

export interface PeriodScore {
  Goals: number;
  YellowCards: number;
  RedCards: number;
  Corners: number;
}

export interface ParticipantScore {
  H1: PeriodScore;
  H2: PeriodScore;
  Total: PeriodScore;
}

export interface SoccerScore {
  Participant1: ParticipantScore;
  Participant2: ParticipantScore;
}

export interface PossibleEvent {
  Goal: boolean;
  Penalty: boolean;
  Corner: boolean;
}

export interface DataSoccer {
  Action: string;
  Goal: boolean;
  GoalType?: "Head" | "Shot" | "OwnGoal" | "Other";
  Corner: boolean;
  YellowCard: boolean;
  RedCard: boolean;
  Penalty: boolean;
  VAR: boolean;
  FreeKickType?: FreeKickType;
  ThrowInType?: "Safe" | "Attack" | "Danger";
  Minutes: number;
  Participant: number;
  PlayerId?: number;
  PlayerInId?: number;
  PlayerOutId?: number;
}

export interface SoccerScoreEvent {
  fixtureId: number;
  gameState: string;
  startTime: number;
  participant1Id: number;
  participant2Id: number;
  participant1IsHome: boolean;
  action: string;
  ts: number;
  seq: number;
  statusSoccerId: GameState;
  scoreSoccer: SoccerScore;
  dataSoccer?: DataSoccer;
  stats: Record<string, number>;
  possession: number;
  possessionType?: PossessionType;
  parti1StateSoccer?: { PossibleEvent: PossibleEvent };
  parti2StateSoccer?: { PossibleEvent: PossibleEvent };
  possibleEventSoccer?: { RedCard: boolean; YellowCard: boolean; VAR: boolean };
}

export interface Fixture {
  fixtureId: number;
  competitionId: number;
  competitionName?: string;
  participant1Id: number;
  participant2Id: number;
  participant1Name: string;
  participant2Name: string;
  participant1IsHome: boolean;
  startTime: number;
  statusId?: GameState;
  score?: SoccerScore;
}

export interface OddsData {
  fixtureId: number;
  marketTypeId: number;
  odds: Array<{
    outcomeId: number;
    price: number;
    bookmaker: string;
  }>;
}
