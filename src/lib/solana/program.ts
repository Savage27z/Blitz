import {
  PublicKey,
  SystemProgram,
  Transaction,
  type Connection,
  type VersionedTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  TXLINE_PROGRAM_ID,
  USDT_MINT,
  MIN_STAKE_USDT_MICRO,
} from "./constants";
import { microUsdtToUsdt, parseUsdtToMicro } from "./format";

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

function parseTxError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("InvalidMint")) {
      return "TxLINE only accepts devnet USDT for stakes — not SOL/WSOL";
    }
    if (msg.includes("InsufficientFunds") || msg.includes("insufficient")) {
      return "Insufficient devnet USDT in wallet (need ≥1 USDT + SOL for fees)";
    }
    if (msg.includes("Funds below minimal")) {
      return "Minimum stake is 1 USDT on TxLINE devnet";
    }
    return msg;
  }
  return "Transaction failed";
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
  /** Stake amount in USDT (e.g. 1 or 0.5) */
  amount: string | number;
  expirationMinutes?: number;
  onPhase?: (phase: CreateIntentPhase) => void;
}

/**
 * Stake devnet USDT on-chain via TxLINE create_intent.
 * The program hardcodes USDT_MINT — WSOL/SOL will fail with InvalidMint.
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

  const depositMicro = parseUsdtToMicro(amount);
  if (depositMicro <= BigInt(0)) {
    throw new Error("Stake amount must be greater than 0");
  }
  if (depositMicro < MIN_STAKE_USDT_MICRO) {
    throw new Error("Minimum stake is 1 USDT on TxLINE devnet");
  }

  const usdtHuman = microUsdtToUsdt(depositMicro);

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

  const expirationTs = BigInt(Math.floor(Date.now() / 1000) + expirationMinutes * 60);
  const claimPeriod = 3600;

  const discriminator = Buffer.from([216, 214, 79, 121, 23, 194, 96, 104]);

  const intentIdBuf = Buffer.alloc(8);
  intentIdBuf.writeBigUInt64LE(intentId);

  const depositBuf = Buffer.alloc(8);
  depositBuf.writeBigUInt64LE(depositMicro);

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

  const [blockhashResult, ataInfo, solBalance] = await withTimeout(
    Promise.all([
      connection.getLatestBlockhash("confirmed"),
      connection.getAccountInfo(makerTokenAccount, "confirmed"),
      connection.getBalance(wallet.publicKey, "confirmed"),
    ]),
    12_000,
    "RPC request"
  );

  if (BigInt(solBalance) < BigInt(5_000_000)) {
    throw new Error("Insufficient SOL for transaction fees — airdrop devnet SOL first");
  }

  if (ataInfo) {
    try {
      const tokenAccount = await getAccount(connection, makerTokenAccount);
      if (tokenAccount.amount < depositMicro) {
        throw new Error(
          `Insufficient devnet USDT — need ${usdtHuman.toFixed(2)} USDT, have ${microUsdtToUsdt(tokenAccount.amount).toFixed(2)} USDT`
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Insufficient devnet USDT")) {
        throw err;
      }
      throw new Error(
        `No devnet USDT token account — fund wallet with devnet USDT before staking`
      );
    }
  }

  const { blockhash, lastValidBlockHeight } = blockhashResult;

  const tx = new Transaction({
    feePayer: wallet.publicKey,
    blockhash,
    lastValidBlockHeight,
  });

  if (!ataInfo) {
    throw new Error(
      "No devnet USDT in wallet — get devnet USDT from a faucet or swap before staking"
    );
  }

  tx.add(instruction);

  onPhase?.("signing");
  const signedTx = await wallet.signTransaction(tx);

  onPhase?.("sending");
  try {
    const simulation = await connection.simulateTransaction(signedTx);
    if (simulation.value.err) {
      throw new Error(parseTxError(new Error(JSON.stringify(simulation.value.err))));
    }
  } catch (err) {
    throw new Error(parseTxError(err));
  }

  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
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
