import { PublicKey } from "@solana/web3.js";

export const TXLINE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA"
    : "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
);

export const USDT_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
    : "ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh"
);

export const TXL_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"
    : "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"
);

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

export const SOLSCAN_BASE =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? "https://solscan.io/tx"
    : "https://solscan.io/tx";

export const SOLSCAN_CLUSTER_PARAM =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta" ? "" : "?cluster=devnet";
