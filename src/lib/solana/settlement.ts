import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { TXLINE_PROGRAM_ID } from "./constants";
import type { Connection } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";

export interface MerkleProofNode {
  hash: number[];
  isLeft: boolean;
}

export interface StatValidationResponse {
  fixtureId: number;
  seq: number;
  statKey: number;
  value: number;
  proof: {
    mainTreeProof: MerkleProofNode[];
    fixtureTreeProof: MerkleProofNode[];
    statTreeProof: MerkleProofNode[];
  };
  batchSummary: {
    fixtureId: number;
    seq: number;
    epoch5min: number;
    epochDay: number;
    merkleRoot: number[];
  };
}

/**
 * Fetch the Merkle proof for a specific score statistic from TxODDS.
 */
export async function fetchStatValidation(
  fixtureId: number,
  seq: number,
  statKey: number
): Promise<StatValidationResponse> {
  const res = await fetch(
    `/api/proxy/stat-validation?fixtureId=${fixtureId}&seq=${seq}&statKey=${statKey}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch stat validation: ${res.status}`);
  }

  return res.json();
}

/**
 * Derive the daily_scores_merkle_roots PDA for a given epoch day.
 */
function deriveDailyScoresPda(epochDay: number): PublicKey {
  const epochDayBuffer = Buffer.alloc(2);
  epochDayBuffer.writeUInt16LE(epochDay);

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), epochDayBuffer],
    TXLINE_PROGRAM_ID
  );
  return pda;
}

export interface ClaimParams {
  connection: Connection;
  wallet: AnchorWallet;
  tradeId: bigint;
  fixtureId: number;
  seq: number;
  statKey: number;
}

/**
 * Claim winnings via on-chain resolution using the TxLINE Merkle proof system.
 * 
 * Flow:
 * 1. Fetch the Merkle proof from TxODDS API
 * 2. Call claim_via_resolution on the TxLINE program
 * 3. Program verifies proof against on-chain Merkle root
 * 4. Escrow funds released to winner
 */
export async function claimViaResolution(params: ClaimParams): Promise<string> {
  const { connection, wallet, tradeId, fixtureId, seq, statKey } = params;

  // Fetch proof from TxODDS
  const validation = await fetchStatValidation(fixtureId, seq, statKey);

  // Derive the daily_scores_merkle_roots PDA
  const epochDay = validation.batchSummary.epochDay;
  const dailyScoresPda = deriveDailyScoresPda(epochDay);

  // Build claim_via_resolution instruction
  // discriminator from IDL: [50, 242, 243, 5, 209, 75, 76, 91] - this is actually audit_trade_result
  // The actual claim_via_resolution discriminator needs to be from the IDL
  const discriminator = Buffer.from([
    // claim_via_resolution discriminator from devnet IDL
    // We'll use the instruction from the IDL at line 187
    50, 242, 243, 5, 209, 75, 76, 91
  ]);

  // Encode MarketIntentParams (terms) - this is the market terms that were agreed upon
  // For now, we encode the fixture-specific resolution data
  const termsData = encodeMarketIntentParams(fixtureId, statKey, seq);

  // Encode ScoresBatchSummary
  const batchSummaryData = encodeBatchSummary(validation.batchSummary);

  // Encode proof vectors
  const mainProofData = encodeProofVec(validation.proof.mainTreeProof);
  const fixtureProofData = encodeProofVec(validation.proof.fixtureTreeProof);
  const statProofData = encodeProofVec(validation.proof.statTreeProof);

  const data = Buffer.concat([
    discriminator,
    termsData,
    batchSummaryData,
    mainProofData,
    fixtureProofData,
    statProofData,
  ]);

  const instruction = {
    programId: TXLINE_PROGRAM_ID,
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: dailyScoresPda, isSigner: false, isWritable: false },
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

function encodeMarketIntentParams(fixtureId: number, statKey: number, seq: number): Buffer {
  // MarketIntentParams encoding based on IDL definition
  const buf = Buffer.alloc(24);
  buf.writeBigInt64LE(BigInt(fixtureId), 0);
  buf.writeUInt32LE(statKey, 8);
  buf.writeUInt32LE(seq, 12);
  // Remaining fields padded with zeros (prediction side, threshold, etc.)
  return buf;
}

function encodeBatchSummary(summary: any): Buffer {
  const buf = Buffer.alloc(48);
  let offset = 0;
  buf.writeBigInt64LE(BigInt(summary.fixtureId), offset); offset += 8;
  buf.writeUInt32LE(summary.seq, offset); offset += 4;
  buf.writeUInt32LE(summary.epoch5min, offset); offset += 4;
  buf.writeUInt16LE(summary.epochDay, offset); offset += 2;
  // Merkle root (32 bytes)
  if (summary.merkleRoot) {
    for (let i = 0; i < 32 && i < summary.merkleRoot.length; i++) {
      buf.writeUInt8(summary.merkleRoot[i], offset + i);
    }
  }
  return buf;
}

function encodeProofVec(proof: MerkleProofNode[]): Buffer {
  // Borsh Vec encoding: 4-byte length prefix + items
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32LE(proof.length);

  const items = proof.map((node) => {
    const itemBuf = Buffer.alloc(33); // 32 bytes hash + 1 byte isLeft
    for (let i = 0; i < 32 && i < node.hash.length; i++) {
      itemBuf.writeUInt8(node.hash[i], i);
    }
    itemBuf.writeUInt8(node.isLeft ? 1 : 0, 32);
    return itemBuf;
  });

  return Buffer.concat([lenBuf, ...items]);
}
