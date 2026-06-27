import { NextRequest } from "next/server";
import { getValidJwt } from "@/lib/txodds/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiToken = process.env.TXODDS_API_TOKEN;
  const base = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

  if (!apiToken) {
    return new Response("TxODDS credentials not configured", { status: 500 });
  }

  const fixtureId = req.nextUrl.searchParams.get("fixtureId");
  const url = fixtureId
    ? `${base}/api/scores/stream?fixtureId=${fixtureId}`
    : `${base}/api/scores/stream`;

  try {
    const jwt = await getValidJwt();
    const upstream = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response("Failed to connect to scores stream", { status: 502 });
  }
}
