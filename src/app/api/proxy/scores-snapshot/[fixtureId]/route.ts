import { NextRequest, NextResponse } from "next/server";
import { getValidJwt } from "@/lib/txodds/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const apiToken = process.env.TXODDS_API_TOKEN;
  const base = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

  if (!apiToken) {
    return NextResponse.json({ error: "TxODDS credentials not configured" }, { status: 500 });
  }

  const { fixtureId } = await params;

  try {
    const jwt = await getValidJwt();
    const res = await fetch(`${base}/api/scores/snapshot/${fixtureId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `TxODDS API: ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch scores snapshot";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
