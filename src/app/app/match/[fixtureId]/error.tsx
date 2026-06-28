"use client";

import Link from "next/link";

export default function MatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-medium text-offwhite">Match view crashed</h2>
      <p className="mt-2 max-w-md text-[0.8125rem] text-muted">
        {error.message || "Something went wrong loading this match."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-amber-primary px-5 py-2 text-[0.8125rem] font-semibold text-warm-dark"
        >
          Retry
        </button>
        <Link
          href="/app"
          className="rounded-full border border-white/[0.08] px-5 py-2 text-[0.8125rem] text-offwhite"
        >
          Back to matches
        </Link>
      </div>
    </div>
  );
}
