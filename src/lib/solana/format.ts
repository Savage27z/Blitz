import { LAMPORTS_PER_SOL, USDT_DECIMALS } from "./constants";

const USDT_SCALE = BigInt(10 ** USDT_DECIMALS);

/** Parse a SOL amount string/number to lamports without float drift. */
export function parseSolToLamports(input: string | number): bigint {
  const raw = typeof input === "number" ? input.toString() : input.trim();
  if (!raw || !/^\d+(\.\d+)?$/.test(raw)) return BigInt(0);

  const [wholePart, fractionPart = ""] = raw.split(".");
  const fraction = fractionPart.padEnd(9, "0").slice(0, 9);

  return BigInt(wholePart) * BigInt(LAMPORTS_PER_SOL) + BigInt(fraction || "0");
}

export function lamportsToSol(lamports: bigint | number): number {
  const value = typeof lamports === "bigint" ? lamports : BigInt(lamports);
  return Number(value) / LAMPORTS_PER_SOL;
}

/** Parse a USDT amount to on-chain micro-units (6 decimals). */
export function parseUsdtToMicro(input: string | number): bigint {
  const raw = typeof input === "number" ? input.toString() : input.trim();
  if (!raw || !/^\d+(\.\d+)?$/.test(raw)) return BigInt(0);

  const [wholePart, fractionPart = ""] = raw.split(".");
  const fraction = fractionPart.padEnd(USDT_DECIMALS, "0").slice(0, USDT_DECIMALS);

  return BigInt(wholePart) * USDT_SCALE + BigInt(fraction || "0");
}

export function microUsdtToUsdt(micro: bigint | number): number {
  const value = typeof micro === "bigint" ? micro : BigInt(micro);
  return Number(value) / Number(USDT_SCALE);
}

/** Format SOL for display (not USD). */
export function formatSol(amount: number, decimals = 4): string {
  if (!Number.isFinite(amount)) return "0 SOL";
  const trimmed = amount.toFixed(decimals).replace(/\.?0+$/, "");
  return `${trimmed} SOL`;
}

/** Format USDT for display. */
export function formatUsdt(amount: number, decimals = 2): string {
  if (!Number.isFinite(amount)) return "0 USDT";
  const trimmed = amount.toFixed(decimals).replace(/\.?0+$/, "");
  return `${trimmed} USDT`;
}
