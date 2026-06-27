import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TXLINE_PROGRAM_ID, USDT_MINT } from "./constants";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import type { Connection } from "@solana/web3.js";

/**
 * Compute a SHA-256 terms hash for market intent parameters.
 * This encodes: fixtureId + marketType + outcome into a deterministic 32-byte hash.
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

/**
 * Derive the order_intent PDA for a given maker + intentId.
 */
export function deriveOrderIntentPda(
  maker: PublicKey,
  intentId: bigint
): [PublicKey, number] {
  const intentIdBuffer = Buffer.alloc(8);
  intentIdBuffer.writeBigUInt64LE(intentId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("order_intent"), maker.toBuffer(), intentIdBuffer],
    TXLINE_PROGRAM_ID
  );
}

/**
 * Derive the intent vault PDA (token account owned by the intent PDA).
 */
export function deriveIntentVaultPda(
  orderIntentPda: PublicKey
): PublicKey {
  return getAssociatedTokenAddressSync(
    USDT_MINT,
    orderIntentPda,
    true,
    TOKEN_PROGRAM_ID
  );
}

export interface CreateIntentParams {
  connection: Connection;
  wallet: AnchorWallet;
  fixtureId: number;
  marketType: string;
  outcome: number;
  amount: number; // in USDT (6 decimals)
  expirationMinutes?: number;
}

/**
 * Create an on-chain intent (prediction market stake) via the TxLINE program.
 * Returns the transaction signature.
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
  } = params;

  const termsHash = await computeTermsHash(fixtureId, marketType, outcome);

  // Generate a unique intent ID based on timestamp
  const intentId = BigInt(Date.now());

  // Derive PDAs
  const [orderIntentPda] = deriveOrderIntentPda(wallet.publicKey, intentId);
  const intentVault = deriveIntentVaultPda(orderIntentPda);

  // User's USDT token account
  const makerTokenAccount = getAssociatedTokenAddressSync(
    USDT_MINT,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  // Convert amount to lamports (USDT has 6 decimals)
  const depositAmount = BigInt(Math.floor(amount * 1_000_000));

  // Expiration timestamp
  const expirationTs = BigInt(Math.floor(Date.now() / 1000) + expirationMinutes * 60);

  // Claim period in seconds (how long after resolution winner can claim)
  const claimPeriod = 3600; // 1 hour

  // Build the create_intent instruction manually using discriminator
  const discriminator = Buffer.from([216, 214, 79, 121, 23, 194, 96, 104]);

  // Encode args: intent_id (u64), terms_hash ([u8;32]), deposit_amount (u64), expiration_ts (i64), claim_period (u16), fixture_id (i64)
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
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },       // maker
      { pubkey: orderIntentPda, isSigner: false, isWritable: true },        // order_intent
      { pubkey: intentVault, isSigner: false, isWritable: true },           // intent_vault
      { pubkey: makerTokenAccount, isSigner: false, isWritable: true },     // maker_token_account
      { pubkey: USDT_MINT, isSigner: false, isWritable: false },            // token_mint
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },     // token_program
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ],
    data,
  };

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const tx = new Transaction({
    feePayer: wallet.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(instruction);

  const signedTx = await wallet.signTransaction(tx);
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  return signature;
}
