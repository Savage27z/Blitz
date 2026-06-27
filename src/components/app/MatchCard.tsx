"use client";

import Link from "next/link";
import type { Fixture } from "@/lib/txodds/types";
import { getFlag } from "@/lib/flags";

const LIVE_STATES = ["H1", "HT", "H2", "ET1", "ET2", "PE", "HTET"];
const COMPLETED_STATES = ["F", "FET", "FPE", "WET", "WPE"];

function getMinuteDisplay(fixture: Fixture): string | null {
  const s = fixture.statusId || "NS";
  if (s === "H1") return "~25'";
  if (s === "H2") return "~65'";
  if (s === "HT") return "HT";
  return null;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getStatusLabel(fixture: Fixture): string {
  const s = fixture.statusId || "NS";
  if (s === "NS") {
    const d = new Date(fixture.startTime);
    if (isNaN(d.getTime())) return "TBD";
    const month = MONTHS[d.getMonth()];
    const day = d.getDate();
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${month} ${day} · ${h12.toString().padStart(2, "0")}:${m} ${ampm}`;
  }
  if (s === "HT") return "Half Time";
  if (s === "H1") return "1st Half";
  if (s === "H2") return "2nd Half";
  if (s === "F" || s === "FET" || s === "FPE") return "Full Time";
  return s;
}

export default function MatchCard({ fixture }: { fixture: Fixture }) {
  const isLive = LIVE_STATES.includes(fixture.statusId || "NS");
  const isCompleted = COMPLETED_STATES.includes(fixture.statusId || "NS");
  const isUpcoming = !isLive && !isCompleted;
  const p1Goals = fixture.score?.Participant1?.Total?.Goals ?? (isUpcoming ? "" : "0");
  const p2Goals = fixture.score?.Participant2?.Total?.Goals ?? (isUpcoming ? "" : "0");
  const minute = getMinuteDisplay(fixture);

  return (
    <div>
      <Link
        href={`/app/match/${fixture.fixtureId}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-2.5">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            )}
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-light">
              {getStatusLabel(fixture)}
            </span>
            {minute && (
              <span className="font-mono text-[0.6rem] text-amber-primary">{minute}</span>
            )}
          </div>
          <span className="font-mono text-[0.55rem] uppercase tracking-wider text-amber-primary/70">
            Group Stage
          </span>
        </div>

        {/* Main content */}
        <div className="px-5 py-4">
          {/* Teams + Score */}
          <div className="flex items-center">
            {/* Team 1 */}
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getFlag(fixture.participant1Name)}</span>
                <span className="text-[0.875rem] font-medium text-offwhite">
                  {fixture.participant1Name}
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="mx-3 flex items-center gap-2">
              {isUpcoming ? (
                <span className="text-[0.75rem] text-muted">vs</span>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 font-mono text-xl font-bold text-offwhite">
                  <span>{p1Goals}</span>
                  <span className="text-[0.75rem] text-muted">:</span>
                  <span>{p2Goals}</span>
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex flex-1 flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[0.875rem] font-medium text-offwhite">
                  {fixture.participant2Name}
                </span>
                <span className="text-xl">{getFlag(fixture.participant2Name)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-2.5">
          <span className="text-[0.625rem] text-muted">
            {fixture.competitionName || "World Cup 2026"}
          </span>
          <div className="flex items-center gap-3">
            {isLive && (
              <span className="rounded-full bg-amber-primary/10 px-2 py-0.5 text-[0.6rem] font-medium text-amber-primary">
                4 markets
              </span>
            )}
            <span className="text-[0.65rem] font-medium text-amber-primary opacity-0 transition-all duration-200 group-hover:opacity-100">
              {isCompleted ? "Results →" : isLive ? "Trade →" : "Preview →"}
            </span>
          </div>
        </div>

        {/* Live gradient accent */}
        {isLive && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        )}
      </Link>
    </div>
  );
}
