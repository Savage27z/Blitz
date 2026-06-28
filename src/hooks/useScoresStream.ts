"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import type { SoccerScoreEvent, GameState } from "@/lib/txodds/types";
import type { MatchEvent } from "@/lib/markets/types";

function normalizeScoreEvent(raw: any): SoccerScoreEvent {
  return {
    fixtureId: raw.fixtureId ?? raw.FixtureId,
    gameState: raw.gameState ?? raw.GameState,
    startTime: raw.startTime ?? raw.StartTime,
    participant1Id: raw.participant1Id ?? raw.Participant1Id,
    participant2Id: raw.participant2Id ?? raw.Participant2Id,
    participant1IsHome: raw.participant1IsHome ?? raw.Participant1IsHome,
    action: raw.action ?? raw.Action,
    ts: raw.ts ?? raw.Ts,
    seq: raw.seq ?? raw.Seq,
    statusSoccerId: raw.statusSoccerId ?? raw.StatusSoccerId,
    scoreSoccer: raw.scoreSoccer ?? raw.ScoreSoccer,
    dataSoccer: raw.dataSoccer ?? raw.DataSoccer,
    stats: raw.stats ?? raw.Stats ?? {},
    possession: raw.possession ?? raw.Possession ?? 0,
    possessionType: raw.possessionType ?? raw.PossessionType,
    parti1StateSoccer: raw.parti1StateSoccer ?? raw.Parti1StateSoccer,
    parti2StateSoccer: raw.parti2StateSoccer ?? raw.Parti2StateSoccer,
    possibleEventSoccer: raw.possibleEventSoccer ?? raw.PossibleEventSoccer,
  };
}

function parseScoreEvent(raw: SoccerScoreEvent): MatchEvent | null {
  const data = raw.dataSoccer as any;
  if (!data) return null;

  const minute = data.Minutes ?? data.minutes ?? 0;
  const participant = data.Participant ?? data.participant;
  const team = (participant === raw.participant1Id ? 1 : 2) as 1 | 2;
  const id = `${raw.fixtureId}-${raw.seq}-${raw.ts}`;

  if (data.Goal || data.goal) {
    return { id, type: "goal", team, minute, detail: data.GoalType ?? data.goalType, timestamp: Date.now() };
  }
  if (data.YellowCard || data.yellowCard) {
    return { id, type: "yellow_card", team, minute, timestamp: Date.now() };
  }
  if (data.RedCard || data.redCard) {
    return { id, type: "red_card", team, minute, timestamp: Date.now() };
  }
  if (data.Corner || data.corner) {
    return { id, type: "corner", team, minute, timestamp: Date.now() };
  }
  const fkType = data.FreeKickType ?? data.freeKickType;
  if (fkType === "Danger" || fkType === "HighDanger") {
    return { id, type: "danger", team, minute, detail: fkType, timestamp: Date.now() };
  }

  return null;
}

function extractStats(raw: SoccerScoreEvent) {
  const stats = raw.stats as Record<string, any> | undefined;
  const p1Shots =
    stats?.Participant1?.ShotsOnTarget ??
    stats?.participant1?.shotsOnTarget ??
    0;
  const p2Shots =
    stats?.Participant2?.ShotsOnTarget ??
    stats?.participant2?.shotsOnTarget ??
    0;

  const possession = typeof raw.possession === "number" ? raw.possession : 50;

  return {
    possession,
    shotsOnTarget: [p1Shots, p2Shots] as [number, number],
  };
}

export function useScoresStream(fixtureId: number | null) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!fixtureId) return;

    const { addEvent, updateMatchState, updateMatchStats, setConnected } =
      useMarketStore.getState();

    const connect = () => {
      if (!mountedRef.current) return;

      esRef.current?.close();
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      const url = `/api/proxy/scores-stream?fixtureId=${fixtureId}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => setConnected(true);

      es.onmessage = (msg) => {
        if (!msg.data || msg.data === "heartbeat") return;
        try {
          const raw = normalizeScoreEvent(JSON.parse(msg.data));
          const data = raw.dataSoccer as any;
          if (!raw.statusSoccerId && !data) return;

          const p1Goals = raw.scoreSoccer?.Participant1?.Total?.Goals ?? 0;
          const p2Goals = raw.scoreSoccer?.Participant2?.Total?.Goals ?? 0;
          const minute = data?.Minutes ?? data?.minutes ?? useMarketStore.getState().matchMinute;
          const phase =
            (raw.statusSoccerId as GameState | undefined) ??
            useMarketStore.getState().gamePhase;

          updateMatchState(phase, minute, [p1Goals, p2Goals]);

          const { possession, shotsOnTarget } = extractStats(raw);
          updateMatchStats({ possession, shotsOnTarget });

          const event = parseScoreEvent(raw);
          if (event) addEvent(event);
        } catch {
          // heartbeat or malformed
        }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        reconnectRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      esRef.current?.close();
      setConnected(false);
    };
  }, [fixtureId]);
}
