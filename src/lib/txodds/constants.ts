export const TXODDS_API_BASE =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

export const PROGRAM_ID_DEVNET = "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J";
export const PROGRAM_ID_MAINNET = "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA";

export const TXL_TOKEN_MINT_DEVNET = "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG";
export const TXL_TOKEN_MINT_MAINNET = "Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL";

export const SERVICE_LEVEL_ID = 12;

export const STAT_KEYS = {
  P1_GOALS: 1,
  P2_GOALS: 2,
  P1_YELLOW: 3,
  P2_YELLOW: 4,
  P1_RED: 5,
  P2_RED: 6,
  P1_CORNERS: 7,
  P2_CORNERS: 8,
} as const;

export const PERIOD_MULTIPLIER = {
  H1: 1000,
  H2: 2000,
  ET1: 3000,
  ET2: 4000,
  PE: 5000,
} as const;
