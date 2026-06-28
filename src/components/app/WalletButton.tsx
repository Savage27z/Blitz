"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useState } from "react";

export default function WalletButton() {
  const { publicKey, connecting, wallet, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setError(null);

    if (!wallet) {
      setVisible(true);
      return;
    }

    try {
      await connect();
    } catch (err: unknown) {
      console.error("Wallet connect failed:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [wallet, connect, setVisible]);

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
        title={publicKey.toBase58()}
      >
        {short}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        className="rounded-full bg-amber-primary px-4 py-2 text-[0.75rem] font-semibold text-warm-dark transition-all hover:brightness-110"
      >
        {wallet ? `Connect ${wallet.adapter.name}` : "Connect Wallet"}
      </button>
      {error && (
        <span className="max-w-[180px] truncate text-[0.6rem] text-red-400" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}
