"use client";

import { useState } from "react";
import Image from "next/image";
import { getCountryCode, getFlagUrl } from "@/lib/flags";
import { cn } from "@/lib/utils";

interface Props {
  team: string;
  size?: number;
  className?: string;
}

function FlagFallback({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border bg-muted text-[0.55rem] font-bold uppercase text-muted-foreground",
        className
      )}
      style={{ width: size, height: Math.round(size * 0.72) }}
    >
      ?
    </span>
  );
}

export default function Flag({ team, size = 28, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const code = getCountryCode(team);
  const src = getFlagUrl(team, size);
  const height = Math.round(size * 0.72);

  if (!code || !src || failed) {
    return <FlagFallback size={size} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={`${team} flag`}
      width={size}
      height={height}
      className={cn(
        "rounded-md object-cover ring-1 ring-border",
        className
      )}
      sizes={`${size}px`}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
