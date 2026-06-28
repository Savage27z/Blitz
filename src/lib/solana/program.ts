import {
  PublicKey,
  SystemProgram,
  Transaction,
  type Connection,
  type VersionedTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TXLINE_PROGRAM_ID, STAKE_MINT, LAMPORTS_PER_SOL } from "./constants";
import { lamportsToSol, parseSolToLamports } from "./format";

export type StakeWallet = {
  publicKey: PublicKey;
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
};

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
  wallet: StakeWallet;
  fixtureId: number;
  marketType: string;
  outcome: number;
  /** Stake amount in SOL (e.g. 0.1) — string preferred to avoid float drift */
  amount: string | number;
  expirationMinutes?: number;
  onPhase?: (phase: CreateIntentPhase) => void;
}

/**
 * Stake SOL on-chain via TxLINE create_intent.
 * Native SOL is wrapped to WSOL in the same transaction before escrow.
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

  const lamports = parseSolToLamports(amount);
  if (lamports <= BigInt(0)) {
    throw new Error("Stake amount must be greater than 0");
  }
  const solHuman = lamportsToSol(lamports);

  const termsHash = await computeTermsHash(fixtureId, marketType, outcome);
  const intentId = BigInt(Date.now());

  const [orderIntentPda] = deriveOrderIntentPda(wallet.publicKey, termsHash);
  const [intentVault] = deriveIntentVaultPda(orderIntentPda);

  const makerTokenAccount = getAssociatedTokenAddressSync(
    STAKE_MINT,
    wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );

  const expirationTs = BigInt(Math.floor(Date.now() / 1000) + expirationMinutes * 60);
  const claimPeriod = 3600;

  const discriminator = Buffer.from([216, 214, 79, 121, 23, 194, 96, 104]);

  const intentIdBuf = Buffer.alloc(8);
  intentIdBuf.writeBigUInt64LE(intentId);

  const depositBuf = Buffer.alloc(8);
  depositBuf.writeBigUInt64LE(lamports);

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
      { pubkey: STAKE_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  };

  const [blockhashResult, ataInfo, balance] = await withTimeout(
    Promise.all([
      connection.getLatestBlockhash("confirmed"),
      connection.getAccountInfo(makerTokenAccount, "confirmed"),
      connection.getBalance(wallet.publicKey, "confirmed"),
    ]),
    12_000,
    "RPC request"
  );

  const feeBuffer = BigInt(10_000_000); // ~0.01 SOL for fees + rent
  if (BigInt(balance) < lamports + feeBuffer) {
    throw new Error(
      `Insufficient SOL — need ~${solHuman.toFixed(4)} SOL plus ~0.01 SOL for fees`
    );
  }

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
        STAKE_MINT
      )
    );
  }

  tx.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: makerTokenAccount,
      lamports: Number(lamports),
    }),
    createSyncNativeInstruction(makerTokenAccount),
    instruction
  );

  onPhase?.("signing");
  const signedTx = await wallet.signTransaction(tx);

  onPhase?.("sending");
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: true,
    maxRetries: 3,
  });

  onPhase?.("confirming");
  const confirmation = await withTimeout(
    connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    ),
    30_000,
    "Transaction confirmation"
  );

  if (confirmation.value.err) {
    throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
  }

  return signature;
}
