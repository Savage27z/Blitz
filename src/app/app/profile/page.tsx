"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, User, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useUserStore } from "@/stores/userStore";
import { SOLSCAN_BASE, SOLSCAN_CLUSTER_PARAM } from "@/lib/solana/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { stakes, loadStakes } = useUserStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (publicKey) loadStakes(publicKey.toBase58());
  }, [publicKey, loadStakes]);

  const address = publicKey?.toBase58();
  const short = address ? `${address.slice(0, 6)}...${address.slice(-6)}` : "";
  const totalStaked = stakes.reduce((sum, s) => sum + s.amount, 0);
  const activeStakes = stakes.filter((s) => s.status === "active").length;

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!publicKey) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-xl border bg-secondary">
            <User className="size-6 text-muted-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Your Profile</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            Connect your wallet to view your stakes, transaction history, and activity.
          </CardDescription>
          <Button className="mt-6" onClick={() => setVisible(true)}>
            <Wallet className="size-4" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-xl">
                <AvatarFallback className="rounded-xl bg-primary/10 font-mono text-lg text-primary">
                  {address!.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardDescription>Connected Wallet</CardDescription>
                <button
                  onClick={copyAddress}
                  className="mt-1 flex items-center gap-2 font-mono text-base transition-opacity hover:opacity-70"
                >
                  {short}
                  <span className="text-xs text-primary">{copied ? "Copied!" : "Copy"}</span>
                </button>
                <p className="mt-1 text-xs text-muted-foreground">Solana Devnet</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" render={
                <a
                  href={`https://solscan.io/account/${address}${SOLSCAN_CLUSTER_PARAM}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }>
                <ExternalLink className="size-3.5" />
                Solscan
              </Button>
              <Button variant="destructive" size="sm" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Staked", value: `$${totalStaked.toFixed(2)}` },
          { label: "Active Positions", value: activeStakes.toString() },
          { label: "Total Trades", value: stakes.length.toString() },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stake History</CardTitle>
        </CardHeader>

        {stakes.length === 0 ? (
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">No stakes yet</p>
            <p className="text-xs text-muted-foreground">
              Place a prediction on a live match to see it here
            </p>
            <Button size="sm" render={<Link href="/app" />}>
              Browse Matches
            </Button>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            {stakes.map((stake, i) => (
              <div key={stake.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{stake.question}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <Badge variant="secondary" className="text-primary">
                        {stake.outcomeLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(stake.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      ${stake.amount.toFixed(2)}
                    </span>
                    <a
                      href={`${SOLSCAN_BASE}/${stake.txHash}${SOLSCAN_CLUSTER_PARAM}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View tx
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
