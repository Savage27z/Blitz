import { LAMPORTS_PER_SOL } from "./constants";

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

/** Format SOL for display (not USD). */
export function formatSol(amount: number, decimals = 4): string {
  if (!Number.isFinite(amount)) return "0 SOL";
  const trimmed = amount.toFixed(decimals).replace(/\.?0+$/, "");
  return `${trimmed} SOL`;
}
