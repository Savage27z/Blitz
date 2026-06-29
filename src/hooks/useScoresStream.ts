"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/stores/marketStore";
import type { GameState } from "@/lib/txodds/types";
import {
  extractStats,
  goalsFromRaw,
  minuteFromRaw,
  normalizeScoreEvent,
  parseMatchEventFromRaw,
  gamePhaseFromRaw,
} from "@/lib/txodds/scores";
import { readSseStream } from "@/lib/txodds/sse";

function applyScorePayload(raw: Record<string, unknown>, fixtureId: number) {
  const eventFixtureId = raw.FixtureId ?? raw.fixtureId;
  if (eventFixtureId != null && Number(eventFixtureId) !== fixtureId) return;

  const { addEvent, updateMatchState, updateMatchStats } = useMarketStore.getState();
  const normalized = normalizeScoreEvent(raw);
  const phase = gamePhaseFromRaw(raw) ?? normalized.statusSoccerId;
  const minute = minuteFromRaw(raw) || useMarketStore.getState().matchMinute;
  const score = goalsFromRaw(raw, normalized.scoreSoccer);

  updateMatchState(phase as GameState, minute, score);
  updateMatchStats(extractStats(raw, [raw]));

  const matchEvent = parseMatchEventFromRaw(raw);
  if (matchEvent) addEvent(matchEvent);
}

export function useScoresStream(fixtureId: number | null) {
  const abortRef = useRef<AbortController | null>(null);
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

    const { setConnected } = useMarketStore.getState();

    const connect = async () => {
      if (!mountedRef.current) return;

      abortRef.current?.abort();
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/proxy/scores-stream?fixtureId=${fixtureId}`, {
          signal: controller.signal,
          headers: { Accept: "text/event-stream" },
        });

        if (!res.ok || !res.body) {
          throw new Error(`Stream ${res.status}`);
        }

        setConnected(true);

        await readSseStream(
          res.body,
          (data) => {
            try {
              applyScorePayload(JSON.parse(data) as Record<string, unknown>, fixtureId);
            } catch {
              // heartbeat or malformed
            }
          },
          controller.signal
        );

        if (mountedRef.current && !controller.signal.aborted) {
          setConnected(false);
          reconnectRef.current = setTimeout(connect, 3000);
        }
      } catch (err) {
        if (controller.signal.aborted || !mountedRef.current) return;
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      setConnected(false);
    };
  }, [fixtureId]);
}
