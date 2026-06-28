import {
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TXLINE_PROGRAM_ID, USDT_MINT } from "./constants";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import type { Connection } from "@solana/web3.js";

export type CreateIntentPhase = "preparing" | "signing" | "sending" | "confirming";

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out — try again`)), ms)
    ),
  ]);
}

/**
 * Compute a SHA-256 terms hash for market intent parameters.
 */
export async function computeTermsHash(
  fixtureId: number,
  marketType: string,
  outcome: number
): Promise<Uint8Array> {
  const input = `blitz:${fixtureId}:${marketType}:${outcome}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return new Uint8Array(hashBuffer);
}

export function deriveOrderIntentPda(
  maker: PublicKey,
  termsHash: Uint8Array
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("order_intent"), maker.toBuffer(), Buffer.from(termsHash)],
    TXLINE_PROGRAM_ID
  );
}

export function deriveIntentVaultPda(orderIntentPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("intent_vault"), orderIntentPda.toBuffer()],
    TXLINE_PROGRAM_ID
  );
}

export interface CreateIntentParams {
  connection: Connection;
  wallet: AnchorWallet;
  fixtureId: number;
  marketType: string;
  outcome: number;
  amount: number;
  expirationMinutes?: number;
  onPhase?: (phase: CreateIntentPhase) => void;
}

/**
 * Create an on-chain intent via the TxLINE program.
 */
export async function createIntent(params: CreateIntentParams): Promise<string> {
  const {
    connection,
    wallet,
    fixtureId,
    marketType,
    outcome,
    amount,
    expirationMinutes = 10,
    onPhase,
  } = params;

  onPhase?.("preparing");

  const termsHash = await computeTermsHash(fixtureId, marketType, outcome);
  const intentId = BigInt(Date.now());

  const [orderIntentPda] = deriveOrderIntentPda(wallet.publicKey, termsHash);
  const [intentVault] = deriveIntentVaultPda(orderIntentPda);

  const makerTokenAccount = getAssociatedTokenAddressSync(
    USDT_MINT,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  const depositAmount = BigInt(Math.floor(amount * 1_000_000));
  const expirationTs = BigInt(Math.floor(Date.now() / 1000) + expirationMinutes * 60);
  const claimPeriod = 3600;

  const discriminator = Buffer.from([216, 214, 79, 121, 23, 194, 96, 104]);

  const intentIdBuf = Buffer.alloc(8);
  intentIdBuf.writeBigUInt64LE(intentId);

  const depositBuf = Buffer.alloc(8);
  depositBuf.writeBigUInt64LE(depositAmount);

  const expirationBuf = Buffer.alloc(8);
  expirationBuf.writeBigInt64LE(expirationTs);

  const claimPeriodBuf = Buffer.alloc(2);
  claimPeriodBuf.writeUInt16LE(claimPeriod);

  const fixtureIdBuf = Buffer.alloc(8);
  fixtureIdBuf.writeBigInt64LE(BigInt(fixtureId));

  const data = Buffer.concat([
    discriminator,
    intentIdBuf,
    Buffer.from(termsHash),
    depositBuf,
    expirationBuf,
    claimPeriodBuf,
    fixtureIdBuf,
  ]);

  const instruction = {
    programId: TXLINE_PROGRAM_ID,
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: orderIntentPda, isSigner: false, isWritable: true },
      { pubkey: intentVault, isSigner: false, isWritable: true },
      { pubkey: makerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: USDT_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  };

  const [blockhashResult, ataInfo] = await withTimeout(
    Promise.all([
      connection.getLatestBlockhash("confirmed"),
      connection.getAccountInfo(makerTokenAccount, "confirmed"),
    ]),
    12_000,
    "RPC request"
  );

  const { blockhash, lastValidBlockHeight } = blockhashResult;

  const tx = new Transaction({
    feePayer: wallet.publicKey,
    blockhash,
    lastValidBlockHeight,
  });

  if (!ataInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        makerTokenAccount,
        wallet.publicKey,
        USDT_MINT
      )
    );
  }

  tx.add(instruction);

  onPhase?.("signing");
  const signedTx = await wallet.signTransaction(tx);

  onPhase?.("sending");
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: true,
    maxRetries: 3,
  });

  onPhase?.("confirming");
  await withTimeout(
    connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    ),
    20_000,
    "Transaction confirmation"
  ).catch(() => {
    // Signature was sent — return it even if confirm is slow
  });

  return signature;
}
