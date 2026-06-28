"use client";

import CountdownTimer from "@/components/ui/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import type { MicroMarket } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

interface Props {
  market: MicroMarket;
  onStake: (marketId: string, outcome: 0 | 1) => void;
}

export default function MarketCard({ market, onStake }: Props) {
  const totalPool = market.totalStaked[0] + market.totalStaked[1];
  const prob0 = totalPool > 0 ? (market.totalStaked[0] / totalPool) * 100 : 50;
  const isExpired = Date.now() >= market.expiresAt;
  const isLocked = market.status === "locked" || isExpired;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 gap-3">
        <p className="text-sm font-medium leading-snug">{market.question}</p>
        <CountdownTimer expiresAt={market.expiresAt} />
      </CardHeader>

      <CardContent className="space-y-3">
        <Progress value={prob0}>
          <ProgressTrack className="h-1.5">
            <ProgressIndicator className="bg-emerald-500" />
          </ProgressTrack>
        </Progress>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={isLocked}
            onClick={() => onStake(market.id, 0)}
            className={cn(
              "h-auto flex-col gap-0.5 py-3",
              "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50"
            )}
          >
            <span className="text-xs text-muted-foreground">{market.outcomes[0]}</span>
            <span className="font-mono text-sm font-semibold text-emerald-400">
              {prob0.toFixed(0)}%
            </span>
          </Button>
          <Button
            variant="outline"
            disabled={isLocked}
            onClick={() => onStake(market.id, 1)}
            className={cn(
              "h-auto flex-col gap-0.5 py-3",
              "border-destructive/30 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50"
            )}
          >
            <span className="text-xs text-muted-foreground">{market.outcomes[1]}</span>
            <span className="font-mono text-sm font-semibold text-destructive">
              {(100 - prob0).toFixed(0)}%
            </span>
          </Button>
        </div>
      </CardContent>

      {isLocked && (
        <CardFooter className="justify-center border-t bg-muted/30 py-2">
          <p className="text-xs text-muted-foreground">Market locked — resolving soon</p>
        </CardFooter>
      )}
    </Card>
  );
}
