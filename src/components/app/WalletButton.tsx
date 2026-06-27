"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";

export default function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = useCallback(() => {
    if (publicKey) {
      disconnect();
    } else {
      setVisible(true);
    }
  }, [publicKey, disconnect, setVisible]);

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
    const addr = publicKey.toBase58();
    const short = `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    return (
      <button
        onClick={handleClick}
        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[0.75rem] font-medium text-offwhite transition-all hover:border-white/[0.16] hover:bg-white/[0.08]"
      >
        {short}
      </button>
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
