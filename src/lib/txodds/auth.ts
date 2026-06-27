const API_BASE = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
  ? "https://txline.txodds.com"
  : "https://txline-dev.txodds.com";

let cachedJwt: string | null = null;
let jwtExpiry: number = 0;

export async function getValidJwt(): Promise<string> {
  const envJwt = process.env.TXODDS_JWT;

  if (cachedJwt && Date.now() < jwtExpiry - 60_000) {
    return cachedJwt;
  }

  if (envJwt) {
    try {
      const payload = JSON.parse(Buffer.from(envJwt.split(".")[1], "base64").toString());
      if (payload.exp * 1000 > Date.now() + 60_000) {
        cachedJwt = envJwt;
        jwtExpiry = payload.exp * 1000;
        return envJwt;
      }
    } catch {}
  }

  const res = await fetch(`${API_BASE}/auth/guest/start`, { method: "POST" });
  if (!res.ok) throw new Error(`JWT refresh failed: ${res.status}`);
  const data = await res.json();
  const token = data.token || data.jwt;
  if (!token) throw new Error("No token in guest response");

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    jwtExpiry = payload.exp * 1000;
  } catch {
    jwtExpiry = Date.now() + 5 * 60 * 60_000;
  }

  cachedJwt = token;
  return token;
}
