export function LiveMarketCard() {
  return (
    <div className="card-dark card-tilt w-full max-w-[340px] rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-primary" />
          <span className="eyebrow text-[0.625rem] text-amber-primary">LIVE</span>
        </div>
        <span className="font-mono text-[0.6875rem] text-muted-light">02:47</span>
      </div>

      <p className="mt-5 font-display text-xl leading-snug text-offwhite">
        Goal before 45&apos;?
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="rounded-2xl bg-amber-primary/10 py-3.5 text-center text-[0.8125rem] font-semibold text-amber-primary transition-all duration-300 hover:bg-amber-primary/20 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]">
          YES — 1.85
        </button>
        <button className="rounded-2xl bg-white/[0.04] py-3.5 text-center text-[0.8125rem] font-semibold text-offwhite/70 transition-all duration-300 hover:bg-white/[0.08]">
          NO — 2.10
        </button>
      </div>

      <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-amber-deep to-amber-primary" />
      </div>

      <p className="mt-3 font-mono text-[0.625rem] text-muted">
        62% backed YES
      </p>
    </div>
  );
}

export function SettledMarketCard() {
  return (
    <div className="card-dark card-tilt w-full max-w-[340px] rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="eyebrow text-[0.625rem] text-green-400">SETTLED</span>
        </div>
        <span className="font-mono text-[0.6875rem] text-muted-light">1.2s</span>
      </div>

      <p className="mt-5 font-display text-xl leading-snug text-offwhite">
        Corner before 38&apos;?
      </p>

      <div className="mt-6 rounded-2xl bg-green-500/[0.08] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[0.875rem] font-medium text-green-400">YES ✓</span>
          <span className="font-mono text-[0.875rem] font-semibold text-green-400">+2.4 USDC</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <svg className="h-3 w-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
        </svg>
        <span className="font-mono text-[0.625rem] text-muted">
          Verified on Solana · Merkle proof
        </span>
      </div>
    </div>
  );
}
