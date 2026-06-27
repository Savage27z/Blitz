import { TXODDS_API_BASE } from "./constants";

export async function txoddsGet(path: string, headers?: Record<string, string>) {
  const jwt = process.env.TXODDS_JWT;
  const apiToken = process.env.TXODDS_API_TOKEN;

  if (!jwt || !apiToken) {
    throw new Error("TxODDS credentials not configured");
  }

  const res = await fetch(`${TXODDS_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": apiToken,
      ...headers,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`TxODDS API error: ${res.status} ${res.statusText}`);
  }

  return res;
}

export async function txoddsJSON<T>(path: string): Promise<T> {
  const res = await txoddsGet(path);
  return res.json() as Promise<T>;
}
