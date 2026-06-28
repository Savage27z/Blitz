"use client";

import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import type { Fixture } from "@/lib/txodds/types";
import { getFixtureCategory } from "@/hooks/useFixtures";
import Flag from "@/components/app/Flag";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getMinuteDisplay(fixture: Fixture): string | null {
  const s = fixture.statusId || "NS";
  if (s === "H1") return "~25'";
  if (s === "H2") return "~65'";
  if (s === "HT") return "HT";
  return null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

export default function MatchCard({ fixture }: { fixture: Fixture }) {
  const category = getFixtureCategory(fixture);
  const isLive = category === "live";
  const isCompleted = category === "completed";
  const isUpcoming = category === "upcoming";
  const p1Goals = fixture.score?.Participant1?.Total?.Goals ?? (isUpcoming ? "" : "0");
  const p2Goals = fixture.score?.Participant2?.Total?.Goals ?? (isUpcoming ? "" : "0");
  const minute = getMinuteDisplay(fixture);

  return (
    <Link href={`/app/match/${fixture.fixtureId}`} className="block h-full">
      <Card
        className={cn(
          "h-full transition-colors hover:border-primary/30 hover:bg-card/80",
          isLive && "border-destructive/30"
        )}
      >
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="destructive" className="gap-1">
                <Radio className="size-3" />
                Live
              </Badge>
            )}
            {!isLive && (
              <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {getStatusLabel(fixture)}
              </span>
            )}
            {minute && (
              <span className="font-mono text-xs font-semibold text-primary">{minute}</span>
            )}
          </div>
          <Badge variant="outline" className="text-[0.65rem] uppercase tracking-wide">
            {fixture.competitionName || "World Cup"}
          </Badge>
        </CardHeader>

        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-secondary">
                <Flag team={fixture.participant1Name} size={28} />
              </div>
              <span className="truncate font-medium">{fixture.participant1Name}</span>
            </div>

            <div className="shrink-0">
              {isUpcoming ? (
                <span className="rounded-md border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                  vs
                </span>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-mono text-xl font-bold tabular-nums">
                  <span>{p1Goals}</span>
                  <span className="text-sm text-muted-foreground">–</span>
                  <span>{p2Goals}</span>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
              <span className="truncate text-right font-medium">{fixture.participant2Name}</span>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-secondary">
                <Flag team={fixture.participant2Name} size={28} />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between border-t bg-muted/30">
          {isLive ? (
            <Badge variant="secondary" className="text-primary">
              4 markets live
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Group Stage</span>
          )}
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover/card:opacity-100">
            {isCompleted ? "View results" : isLive ? "Trade now" : "Preview"}
            <ArrowRight className="size-3" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
