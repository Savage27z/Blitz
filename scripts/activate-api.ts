/**
 * One-time setup script to activate TxODDS TxLINE API access on devnet.
 * 
 * Run: npx ts-node scripts/activate-api.ts
 * 
 * This will:
 * 1. Generate or load a Solana devnet keypair
 * 2. Airdrop SOL if needed
 * 3. Get a guest JWT from TxODDS
 * 4. Subscribe on-chain (free tier, service level 12 = real-time World Cup)
 * 5. Activate the API token
 * 6. Output credentials for .env.local
 */

const { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } = require("@solana/web3.js");
const { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

const DEVNET_RPC = "https://api.devnet.solana.com";
const API_BASE = "https://txline-dev.txodds.com";
const PROGRAM_ID = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const TXL_TOKEN_MINT = new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG");
const SERVICE_LEVEL_ID = 1; // Only free tier available on devnet (60s delay)
const DURATION_WEEKS = 4;

const KEYPAIR_PATH = path.join(__dirname, "..", ".devnet-wallet.json");

async function getOrCreateKeypair(): Promise<typeof Keypair> {
  if (fs.existsSync(KEYPAIR_PATH)) {
    const secretKey = new Uint8Array(JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8")));
    return Keypair.fromSecretKey(secretKey);
  }

  const keypair = Keypair.generate();
  fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(keypair.secretKey)));
  console.log("Generated new devnet wallet. Saved to .devnet-wallet.json");
  return keypair;
}

async function ensureFunded(connection: any, publicKey: any) {
  const balance = await connection.getBalance(publicKey);
  console.log(`Balance: ${balance / 1e9} SOL`);
  
  if (balance < 0.01 * 1e9) {
    console.log("Requesting airdrop of 2 SOL...");
    const sig = await connection.requestAirdrop(publicKey, 2 * 1e9);
    await connection.confirmTransaction(sig, "confirmed");
    const newBalance = await connection.getBalance(publicKey);
    console.log(`New balance: ${newBalance / 1e9} SOL`);
  }
}

async function main() {
  console.log("=== TxLINE API Activation (Devnet) ===\n");

  const keypair = await getOrCreateKeypair();
  console.log(`Wallet: ${keypair.publicKey.toBase58()}`);

  const connection = new Connection(DEVNET_RPC, {
    commitment: "confirmed",
    disableRetryOnRateLimit: false,
  });
  await ensureFunded(connection, keypair.publicKey);

  // Step 1: Get guest JWT
  console.log("\n[1/3] Getting guest JWT...");
  const authRes = await fetch(`${API_BASE}/auth/guest/start`, { method: "POST" });
  if (!authRes.ok) {
    const text = await authRes.text();
    console.error(`Auth failed: ${authRes.status} ${text}`);
    process.exit(1);
  }
  const authData = await authRes.json();
  const jwt = authData.token;
  console.log(`JWT obtained: ${jwt.slice(0, 40)}...`);

  // Step 2: Subscribe on-chain (free tier)
  console.log("\n[2/3] Subscribing on-chain (Service Level 12, free)...");

  // Derive PDAs
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    PROGRAM_ID
  );
  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    TXL_TOKEN_MINT,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pricing_matrix")],
    PROGRAM_ID
  );

  // User's TxL token account
  const userTokenAccount = getAssociatedTokenAddressSync(
    TXL_TOKEN_MINT,
    keypair.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  // Build the subscribe instruction manually using discriminator from IDL
  const discriminator = Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]);

  // Args: service_level_id (u16), weeks (u8)
  const args = Buffer.alloc(3);
  args.writeUInt16LE(SERVICE_LEVEL_ID, 0);
  args.writeUInt8(DURATION_WEEKS, 2);

  const data = Buffer.concat([discriminator, args]);

  const subscribeIx = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: keypair.publicKey, isSigner: true, isWritable: true },       // user
      { pubkey: pricingMatrixPda, isSigner: false, isWritable: false },      // pricing_matrix
      { pubkey: TXL_TOKEN_MINT, isSigner: false, isWritable: false },        // token_mint
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },       // user_token_account
      { pubkey: tokenTreasuryVault, isSigner: false, isWritable: true },     // token_treasury_vault
      { pubkey: tokenTreasuryPda, isSigner: false, isWritable: false },      // token_treasury_pda
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
    ],
    data,
  });

  // We may need to create the user's token account first
  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  const ixs = [];
  if (!accountInfo) {
    console.log("Creating TxL token account...");
    ixs.push(
      createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        userTokenAccount,
        keypair.publicKey,
        TXL_TOKEN_MINT,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }
  ixs.push(subscribeIx);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({ feePayer: keypair.publicKey, blockhash, lastValidBlockHeight });
  ixs.forEach((ix: any) => tx.add(ix));
  tx.sign(keypair);

  let txSig: string;
  try {
    txSig = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    await connection.confirmTransaction({ signature: txSig, blockhash, lastValidBlockHeight }, "confirmed");
    console.log(`Subscribe tx: ${txSig}`);
  } catch (e: any) {
    // If subscription already exists, the error might indicate that
    console.error("Subscribe transaction failed:", e.message || e);
    console.log("\nIf you already have an active subscription, you can skip to activation.");
    console.log("Attempting activation with a dummy sig...");
    txSig = "already_subscribed";
    // Try to proceed anyway
  }

  // Step 3: Activate API token
  console.log("\n[3/3] Activating API token...");

  const nacl = require("tweetnacl");
  const selectedLeagues: number[] = [];
  const messageString = `${txSig}:${selectedLeagues.join(",")}:${jwt}`;
  const message = new TextEncoder().encode(messageString);
  const signatureBytes = nacl.sign.detached(message, keypair.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString("base64");

  const activateRes = await fetch(`${API_BASE}/api/token/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      txSig,
      walletSignature,
      leagues: selectedLeagues,
    }),
  });

  if (!activateRes.ok) {
    const text = await activateRes.text();
    console.error(`Activation failed: ${activateRes.status} ${text}`);
    console.log("\n--- Partial credentials (JWT only) ---");
    console.log(`TXODDS_JWT=${jwt}`);
    console.log("TXODDS_API_TOKEN=<activation failed, try again>");
    process.exit(1);
  }

  const responseText = await activateRes.text();
  let apiToken: string;
  try {
    const parsed = JSON.parse(responseText);
    apiToken = parsed.token || responseText;
  } catch {
    apiToken = responseText;
  }

  // Output
  console.log("\n========================================");
  console.log("SUCCESS! Add these to your .env.local:");
  console.log("========================================\n");
  console.log(`TXODDS_JWT=${jwt}`);
  console.log(`TXODDS_API_TOKEN=${apiToken}`);
  console.log(`NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com`);
  console.log(`NEXT_PUBLIC_SOLANA_NETWORK=devnet`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
