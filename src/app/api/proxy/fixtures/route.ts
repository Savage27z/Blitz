import { NextRequest, NextResponse } from "next/server";
import { getValidJwt } from "@/lib/txodds/auth";

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
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch fixtures" }, { status: 502 });
  }
}
