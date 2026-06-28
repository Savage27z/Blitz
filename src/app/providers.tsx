"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

const DEVNET_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://rpc.ankr.com/solana_devnet";

export default function Providers({ children }: { children: React.ReactNode }) {
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as string) || "devnet";
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC ||
      (network === "devnet" ? DEVNET_RPC : clusterApiUrl(network as "devnet" | "mainnet-beta" | "testnet")),
    [network]
  );

  // Wallet Standard auto-detects Phantom, Solflare, etc. — explicit adapters can conflict.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: "confirmed" }}>
      <WalletProvider
        wallets={wallets}
        autoConnect
        onError={(err) => console.error("Wallet error:", err)}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
