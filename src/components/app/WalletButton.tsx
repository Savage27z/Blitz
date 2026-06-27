"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";

export default function WalletButton() {
  const { publicKey, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  if (connecting) {
    return (
      <button
        disabled
        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[0.75rem] font-medium text-muted"
      >
        Connecting...
      </button>
    );
  }

  if (publicKey) {
    const short = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    return (
      <Link
        href="/app/profile"
        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[0.75rem] font-medium text-offwhite transition-all hover:border-amber-primary/30 hover:bg-amber-primary/10"
      >
        {short}
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-amber-primary px-4 py-2 text-[0.75rem] font-semibold text-warm-dark transition-all hover:brightness-110"
    >
      Connect Wallet
    </button>
  );
}
