"use client";

import { Activity, Globe, Radio, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Props {
  liveCount: number;
  totalMarkets: number;
}

export default function DashboardHero({ liveCount, totalMarkets }: Props) {
  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-2 text-primary">FIFA World Cup 2026</p>
            <CardTitle className="font-display text-2xl md:text-3xl">
              Real-time prediction markets
            </CardTitle>
          </div>
          {liveCount > 0 && (
            <Badge variant="destructive" className="gap-1.5 shrink-0">
              <Radio className="size-3" />
              {liveCount} live
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border bg-secondary/50 p-4">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
              <TrendingUp className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active markets</p>
              <p className="font-mono text-lg font-semibold tabular-nums">{totalMarkets}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-secondary/50 p-4">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
              <Globe className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Network</p>
              <p className="font-mono text-lg font-semibold">Devnet</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-secondary/50 p-4">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
              <Activity className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data feed</p>
              <p className="font-mono text-lg font-semibold">TxODDS Live</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <p className="text-sm text-muted-foreground">
          Stake on live match outcomes. Markets resolve automatically from official match data.
        </p>
      </CardContent>
    </Card>
  );
}
