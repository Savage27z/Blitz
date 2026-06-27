"use client";

export default function LiveIndicator({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
      <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-red-400">
        Live
      </span>
    </span>
  );
}
