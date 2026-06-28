"use client";

import { useMarketStore } from "@/stores/marketStore";
import Flag from "@/components/app/Flag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PHASE_LABELS: Record<string, string> = {
  NS: "Not Started",
  H1: "1st Half",
  HT: "Half Time",
  H2: "2nd Half",
  F: "Full Time",
  ET1: "Extra Time 1",
  ET2: "Extra Time 2",
  PE: "Penalties",
};

export default function MatchHeader({ loading = false }: { loading?: boolean }) {
  const { team1Name, team2Name, score, gamePhase, matchMinute, connected } =
    useMarketStore();

  const isLive = ["H1", "H2", "ET1", "ET2", "PE"].includes(gamePhase);
  const isLoading = loading || team1Name === "…";

  return (
    <Card className={cn(isLive && "border-destructive/30")}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="destructive">Live</Badge>
          ) : (
            <Badge variant="outline">
              {connected ? "Connected" : "Awaiting kickoff"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{PHASE_LABELS[gamePhase] || gamePhase}</Badge>
          {isLive && matchMinute > 0 && (
            <span className="font-mono text-sm font-semibold text-primary">
              {matchMinute}&apos;
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-secondary">
              {isLoading ? (
                <Skeleton className="size-8 rounded-md" />
              ) : (
                <Flag team={team1Name} size={40} />
              )}
            </div>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <p className="truncate text-lg font-semibold">{team1Name}</p>
              )}
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-background px-6 py-3 font-mono text-4xl font-bold tabular-nums">
            <span>{score[0]}</span>
            <span className="text-lg text-muted-foreground">–</span>
            <span>{score[1]}</span>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
            <div className="min-w-0 text-right">
              {isLoading ? (
                <Skeleton className="ml-auto h-5 w-32" />
              ) : (
                <p className="truncate text-lg font-semibold">{team2Name}</p>
              )}
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-secondary">
              {isLoading ? (
                <Skeleton className="size-8 rounded-md" />
              ) : (
                <Flag team={team2Name} size={40} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
