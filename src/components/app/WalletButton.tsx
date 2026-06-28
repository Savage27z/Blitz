"use client";

import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Connect Wallet",
} as const;

export default function WalletButton() {
  return <BaseWalletMultiButton className="blitz-wallet-btn" labels={LABELS} />;
}
