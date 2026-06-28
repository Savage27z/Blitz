"use client";

import { Calendar, CheckCircle2, Radio } from "lucide-react";
import { useFixtures, FixtureFilter, isFixtureLive, getFixtureCategory } from "@/hooks/useFixtures";
import MatchCard from "@/components/app/MatchCard";
import DashboardHero from "@/components/app/DashboardHero";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS: { id: FixtureFilter; label: string; icon: React.ReactNode }[] = [
  { id: "live", label: "Live", icon: <Radio className="size-3.5" /> },
  { id: "upcoming", label: "Upcoming", icon: <Calendar className="size-3.5" /> },
  { id: "completed", label: "Completed", icon: <CheckCircle2 className="size-3.5" /> },
];

export default function AppPage() {
  const { allFixtures, loading, error, filter, setFilter } = useFixtures();

  const now = Date.now();
  const liveCount = allFixtures.filter((f) => isFixtureLive(f, now)).length;
  const tabCounts = {
    live: allFixtures.filter((f) => getFixtureCategory(f, now) === "live").length,
    upcoming: allFixtures.filter((f) => getFixtureCategory(f, now) === "upcoming").length,
    completed: allFixtures.filter((f) => getFixtureCategory(f, now) === "completed").length,
  };

  const emptyMessages: Record<FixtureFilter, string> = {
    live: "No live matches right now — check Upcoming for kickoff times",
    upcoming: "No upcoming matches scheduled",
    completed: "No completed matches yet — games move here ~2 hours after kickoff",
  };

  function fixturesForTab(tabId: FixtureFilter) {
    return [...allFixtures]
      .filter((f) => getFixtureCategory(f, now) === tabId)
      .sort((a, b) =>
        tabId === "completed" ? b.startTime - a.startTime : a.startTime - b.startTime
      );
  }

  return (
    <div>
      <DashboardHero liveCount={liveCount} totalMarkets={liveCount * 4} />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FixtureFilter)} className="mb-8">
        <TabsList variant="line">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
              {tab.icon}
              {tab.label}
              {!loading && tabCounts[tab.id] > 0 && (
                <span className="ml-0.5 font-mono text-xs text-muted-foreground">
                  {tabCounts[tab.id]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => {
          const tabFixtures = fixturesForTab(tab.id);
          return (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="space-y-4 pt-6">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-destructive">{error}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Check your TxODDS credentials in .env.local
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && !error && tabFixtures.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">{emptyMessages[tab.id]}</p>
              </div>
            )}

            {!loading && !error && tabFixtures.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {tabFixtures.map((f) => (
                  <MatchCard key={f.fixtureId} fixture={f} />
                ))}
              </div>
            )}
          </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
