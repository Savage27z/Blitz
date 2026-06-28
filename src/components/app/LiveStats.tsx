"use client";

import { BarChart3, Clock } from "lucide-react";
import { useMarketStore } from "@/stores/marketStore";
import Flag from "@/components/app/Flag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface StatBarProps {
  label: string;
  left: number;
  right: number;
}

function StatBar({ label, left, right }: StatBarProps) {
  const total = left + right || 1;
  const leftPct = (left / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm tabular-nums">
        <span className="font-mono font-medium">{left}</span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{right}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
        <Progress value={leftPct} className="w-full gap-0">
          <ProgressTrack className="h-1.5 bg-transparent">
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </div>
    </div>
  );
}

export default function LiveStats() {
  const { team1Name, team2Name, events, gamePhase } = useMarketStore();

  const hasData = events.length > 0 || ["H1", "HT", "H2", "ET1", "ET2", "PE"].includes(gamePhase);

  const t1Corners = events.filter((e) => e.type === "corner" && e.team === 1).length;
  const t2Corners = events.filter((e) => e.type === "corner" && e.team === 2).length;
  const t1Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 1).length;
  const t2Cards = events.filter((e) => (e.type === "yellow_card" || e.type === "red_card") && e.team === 2).length;
  const t1Dangers = events.filter((e) => e.type === "danger" && e.team === 1).length;
  const t2Dangers = events.filter((e) => e.type === "danger" && e.team === 2).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Flag team={team1Name} size={22} />
          <span className="text-sm font-semibold">{team1Name}</span>
        </div>
        <Badge variant="outline" className="gap-1">
          <BarChart3 className="size-3" />
          Stats
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{team2Name}</span>
          <Flag team={team2Name} size={22} />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        {!hasData ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full border bg-secondary">
              <Clock className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Stats will appear when the match is live
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <StatBar label="Possession" left={50} right={50} />
            <StatBar label="Shots on Target" left={0} right={0} />
            <StatBar label="Corners" left={t1Corners} right={t2Corners} />
            <StatBar label="Cards" left={t1Cards} right={t2Cards} />
            <StatBar label="Dangerous Attacks" left={t1Dangers} right={t2Dangers} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
