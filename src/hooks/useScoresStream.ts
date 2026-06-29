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

  const seq = Number(raw.Seq ?? raw.seq ?? 0);
  const store = useMarketStore.getState();

  if (seq > 0 && seq <= store.lastEventSeq) return;

  const { addEvent, updateMatchState, updateMatchStats } = store;
  const normalized = normalizeScoreEvent(raw);
  const phase = gamePhaseFromRaw(raw) ?? normalized.statusSoccerId;
  const minute = minuteFromRaw(raw) || store.matchMinute;
  const score = goalsFromRaw(raw, normalized.scoreSoccer);

  if (seq > 0) {
    useMarketStore.setState({ lastEventSeq: seq, lastEventTime: Date.now() });
  }

  updateMatchState(phase as GameState, minute, score);
  updateMatchStats(extractStats(raw, [raw]));

  const matchEvent = parseMatchEventFromRaw(raw);
  if (matchEvent) addEvent(matchEvent);
}

const STREAM_TIMEOUT_MS = 90_000;

export function useScoresStream(fixtureId: number | null) {
  const abortRef = useRef<AbortController | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

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
      setConnected(false);

      try {
        const res = await fetch(`/api/proxy/scores-stream?fixtureId=${fixtureId}`, {
          signal: controller.signal,
          headers: { Accept: "text/event-stream" },
        });

        if (!res.ok || !res.body) {
          throw new Error(`Stream ${res.status}`);
        }

        setConnected(true);
        retryCountRef.current = 0;

        let lastDataTime = Date.now();
        const timeoutCheck = setInterval(() => {
          if (Date.now() - lastDataTime > STREAM_TIMEOUT_MS) {
            controller.abort();
          }
        }, 10_000);

        try {
          await readSseStream(
            res.body,
            (data) => {
              lastDataTime = Date.now();
              try {
                applyScorePayload(JSON.parse(data) as Record<string, unknown>, fixtureId);
              } catch {
                // heartbeat or malformed
              }
            },
            controller.signal
          );
        } finally {
          clearInterval(timeoutCheck);
        }

        if (mountedRef.current && !controller.signal.aborted) {
          setConnected(false);
          reconnectRef.current = setTimeout(connect, 3000);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setConnected(false);
        if (controller.signal.aborted && !mountedRef.current) return;
        const delay = Math.min(3000 * Math.pow(2, retryCountRef.current), 30_000);
        retryCountRef.current++;
        reconnectRef.current = setTimeout(connect, delay);
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
