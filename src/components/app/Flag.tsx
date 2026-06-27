"use client";

import { getCountryCode } from "@/lib/flags";

interface Props {
  team: string;
  size?: number;
  className?: string;
}

export default function Flag({ team, size = 28, className = "" }: Props) {
  const code = getCountryCode(team);

  if (!code) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-[0.55rem] font-bold uppercase text-white/30 ${className}`}
        style={{ width: size, height: Math.round(size * 0.72) }}
      >
        ?
      </span>
    );
  }

  const w = size * 2;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w${w}/${code}.png`}
      srcSet={`https://flagcdn.com/w${w}/${code}.png 1x, https://flagcdn.com/w${Math.round(w * 1.5)}/${code}.png 2x`}
      alt={`${team} flag`}
      width={size}
      height={Math.round(size * 0.72)}
      className={`rounded-md object-cover shadow-[0_1px_4px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.08] ${className}`}
      loading="lazy"
    />
  );
}
