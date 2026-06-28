import { NextRequest, NextResponse } from "next/server";
import { getValidJwt } from "@/lib/txodds/auth";
import { extractScoreStatusFromEvents, normalizeFixturesPayload } from "@/lib/txodds/fixtures";

async function enrichWithScores(
  base: string,
  jwt: string,
  apiToken: string,
  fixtures: any[]
) {
  const now = Date.now();
  const candidates = fixtures.filter((f) => {
    const start = f.StartTime ?? f.startTime;
    return start && start <= now + 15 * 60 * 1000;
  });

  if (candidates.length === 0) return fixtures;

  const enriched = await Promise.all(
    fixtures.map(async (fixture) => {
      const start = fixture.StartTime ?? fixture.startTime;
      if (!start || start > now + 15 * 60 * 1000) return fixture;

      const fixtureId = fixture.FixtureId ?? fixture.fixtureId;
      try {
        const res = await fetch(`${base}/api/scores/snapshot/${fixtureId}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "X-Api-Token": apiToken,
          },
          next: { revalidate: 15 },
        });
        if (!res.ok) return fixture;

        const events = await res.json();
        if (!Array.isArray(events) || events.length === 0) return fixture;

        const { statusId, score } = extractScoreStatusFromEvents(events);
        return {
          ...fixture,
          ...(statusId ? { StatusSoccerId: statusId } : {}),
          ...(score ? { ScoreSoccer: score, scoreSoccer: score } : {}),
        };
      } catch {
        return fixture;
      }
    })
  );

  return enriched;
}

export async function GET(req: NextRequest) {
  const apiToken = process.env.TXODDS_API_TOKEN;
  const base = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

  if (!apiToken) {
    return NextResponse.json({ error: "TxODDS credentials not configured" }, { status: 500 });
  }

  const competitionId = req.nextUrl.searchParams.get("competitionId");
  const url = competitionId
    ? `${base}/api/fixtures/snapshot?competitionId=${competitionId}`
    : `${base}/api/fixtures/snapshot`;

  try {
    const jwt = await getValidJwt();
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `TxODDS API: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const fixtures = normalizeFixturesPayload(data);
    const enriched = await enrichWithScores(base, jwt, apiToken, fixtures);
    return NextResponse.json(enriched);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch fixtures";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
