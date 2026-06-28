"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useUserStore } from "@/stores/userStore";
import { SOLSCAN_BASE, SOLSCAN_CLUSTER_PARAM } from "@/lib/solana/constants";
import { formatSol } from "@/lib/solana/format";

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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <span className="text-2xl text-white/30">👤</span>
        </div>
        <h1 className="font-display text-2xl text-offwhite">Your Profile</h1>
        <p className="mt-2 max-w-sm text-[0.875rem] text-muted">
          Connect your wallet to view your stakes, transaction history, and activity.
        </p>
        <button
          onClick={() => setVisible(true)}
          className="mt-8 rounded-full bg-amber-primary px-8 py-3 text-[0.875rem] font-semibold text-warm-dark transition-all hover:brightness-110"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-primary/[0.06] blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-primary/20 bg-amber-primary/10">
              <span className="font-mono text-xl font-bold text-amber-primary">
                {address!.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-widest text-white/40">
                Connected Wallet
              </p>
              <button
                onClick={copyAddress}
                className="mt-1 flex items-center gap-2 font-mono text-[1rem] text-offwhite transition-opacity hover:opacity-70"
              >
                {short}
                <span className="text-[0.65rem] text-amber-primary">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
              <p className="mt-1 text-[0.75rem] text-muted">Solana Devnet</p>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`https://solscan.io/account/${address}${SOLSCAN_CLUSTER_PARAM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[0.75rem] font-medium text-offwhite transition-all hover:bg-white/[0.08]"
            >
              View on Solscan
            </a>
            <button
              onClick={() => disconnect()}
              className="rounded-full border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-[0.75rem] font-medium text-red-400 transition-all hover:bg-red-500/10"
            >
              Disconnect
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Staked", value: formatSol(totalStaked) },
          { label: "Active Positions", value: activeStakes.toString() },
          { label: "Total Trades", value: stakes.length.toString() },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
          >
            <p className="text-[0.65rem] font-medium uppercase tracking-widest text-white/40">
              {stat.label}
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-offwhite">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Stake history */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-[0.875rem] font-semibold text-offwhite">Stake History</h2>
        </div>

        {stakes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-[0.875rem] text-muted">No stakes yet</p>
            <p className="text-[0.75rem] text-white/25">
              Place a prediction on a live match to see it here
            </p>
            <Link
              href="/app"
              className="mt-2 rounded-full bg-amber-primary px-5 py-2 text-[0.8125rem] font-semibold text-warm-dark"
            >
              Browse Matches
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {stakes.map((stake) => (
              <div key={stake.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.875rem] font-medium text-offwhite">
                    {stake.question}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="rounded-full bg-amber-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-primary">
                      {stake.outcomeLabel}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                        stake.status === "won"
                          ? "bg-green-500/10 text-green-400"
                          : stake.status === "lost"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-white/[0.06] text-muted"
                      }`}
                    >
                      {stake.status}
                    </span>
                    <span className="text-[0.65rem] text-muted">
                      {new Date(stake.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-[0.875rem] font-semibold text-offwhite">
                    {formatSol(stake.amount)}
                  </span>
                  <a
                    href={`${SOLSCAN_BASE}/${stake.txHash}${SOLSCAN_CLUSTER_PARAM}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.65rem] text-amber-primary hover:underline"
                  >
                    View tx →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
