"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

export default function WalletButton() {
  const { publicKey, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  if (connecting) {
    return (
      <Button variant="outline" size="sm" disabled>
        Connecting...
      </Button>
    );
  }

  if (publicKey) {
    const short = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    return (
      <Button variant="outline" size="sm" render={<Link href="/app/profile" />}>
        {short}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleClick}>
      Connect Wallet
    </Button>
  );
}
