"use client";

import { getReputation, TIER_INFO } from "@/lib/reputation";

interface Props {
  jobsCompleted: bigint | number;
  totalEarned: bigint | number;
  size?: "sm" | "md";
}

export function ReputationBadge({ jobsCompleted, totalEarned, size = "md" }: Props) {
  const rep = getReputation({ jobsCompleted, totalEarned });
  const info = TIER_INFO[rep.tier];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono ${size === "sm" ? "text-[9px]" : "text-[10px]"} uppercase tracking-[0.06em] font-medium ${rep.color} ${rep.textColor}`}
      title={`${rep.tier}: ${info.desc} · Success: ${rep.successScore}%`}
    >
      {info.icon} {rep.tier}
    </span>
  );
}