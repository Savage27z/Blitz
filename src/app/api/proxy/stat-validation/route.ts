import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const jwt = process.env.TXODDS_JWT;
  const apiToken = process.env.TXODDS_API_TOKEN;
  const base = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

  if (!jwt || !apiToken) {
    return NextResponse.json({ error: "TxODDS credentials not configured" }, { status: 500 });
  }

  const fixtureId = req.nextUrl.searchParams.get("fixtureId");
  const seq = req.nextUrl.searchParams.get("seq");
  const statKey = req.nextUrl.searchParams.get("statKey");

  if (!fixtureId || !seq || !statKey) {
    return NextResponse.json({ error: "Missing fixtureId, seq, or statKey" }, { status: 400 });
  }

  const url = `${base}/api/scores/stat-validation?fixtureId=${fixtureId}&seq=${seq}&statKey=${statKey}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `TxODDS API: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stat validation" }, { status: 502 });
  }
}
