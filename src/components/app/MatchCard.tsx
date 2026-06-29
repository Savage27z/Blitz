"use client";

import { memo } from "react";
import Link from "next/link";
import type { Fixture } from "@/lib/txodds/types";
import { getFixtureCategory } from "@/hooks/useFixtures";
import Flag from "@/components/app/Flag";

function getMinuteDisplay(fixture: Fixture): string | null {
  const s = fixture.statusId || "NS";
  if (s === "H1") return "~25'";
  if (s === "H2") return "~65'";
  if (s === "HT") return "HT";
  return null;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getStatusLabel(fixture: Fixture): string {
  const category = getFixtureCategory(fixture);
  const s = fixture.statusId || "NS";

  if (category === "live" && s === "NS") return "Live";
  if (category === "completed" && s === "NS") return "Full Time";

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

export default memo(function MatchCard({ fixture }: { fixture: Fixture }) {
  const category = getFixtureCategory(fixture);
  const isLive = category === "live";
  const isCompleted = category === "completed";
  const isUpcoming = category === "upcoming";
  const p1Goals = fixture.score?.Participant1?.Total?.Goals ?? (isUpcoming ? "" : "0");
  const p2Goals = fixture.score?.Participant2?.Total?.Goals ?? (isUpcoming ? "" : "0");
  const minute = getMinuteDisplay(fixture);

  return (
    <Link
      href={`/app/match/${fixture.fixtureId}`}
      aria-label={`${fixture.participant1Name} vs ${fixture.participant2Name} — ${getStatusLabel(fixture)}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:translate-y-[-1px]"
    >
      {/* Live top accent */}
      {isLive && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-40" />
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-white/40">
            {getStatusLabel(fixture)}
          </span>
          {minute && (
            <span className="font-mono text-[0.65rem] font-semibold text-amber-primary">{minute}</span>
          )}
        </div>
        <span className="rounded-full border border-amber-primary/20 bg-amber-primary/5 px-2 py-0.5 text-[0.55rem] font-medium uppercase tracking-wider text-amber-primary/80">
          {fixture.competitionName || "World Cup"}
        </span>
      </div>

      {/* Main content */}
      <div className="px-5 py-5">
        <div className="flex items-center">
          {/* Team 1 */}
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-xl">
              <Flag team={fixture.participant1Name} size={28} />
            </div>
            <span className="text-[0.9375rem] font-semibold text-offwhite">
              {fixture.participant1Name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="mx-4">
            {isUpcoming ? (
              <span className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[0.75rem] font-medium text-white/30">
                vs
              </span>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/30 px-4 py-2 font-mono text-xl font-bold text-offwhite">
                <span>{p1Goals}</span>
                <span className="text-[0.75rem] text-white/20">–</span>
                <span>{p2Goals}</span>
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="text-[0.9375rem] font-semibold text-offwhite">
              {fixture.participant2Name}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-xl">
              <Flag team={fixture.participant2Name} size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-2.5">
        {isLive ? (
          <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[0.625rem] font-semibold text-red-400">
            Live now
          </span>
        ) : (
          <span className="text-[0.625rem] text-white/20">Group Stage</span>
        )}
        <span className="text-[0.6875rem] font-medium text-amber-primary opacity-0 transition-all duration-200 group-hover:opacity-100">
          {isCompleted ? "View results →" : isLive ? "Trade now →" : "Preview →"}
        </span>
      </div>
    </Link>
  );
});
