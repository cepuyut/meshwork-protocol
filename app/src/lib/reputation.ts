// Worker reputation tiers based on on-chain activity
// All data comes from the Registry contract — no backend needed

export interface Reputation {
  tier: "New" | "Rising" | "Proven" | "Expert";
  label: string;
  color: string;      // Tailwind bg class
  textColor: string;  // Tailwind text class
  successScore: number; // 0-100
}

export function getReputation(worker: {
  jobsCompleted: bigint | number;
  totalEarned: bigint | number;
  // disputedCount: bigint | number; // TODO: add when available from contract
}): Reputation {
  const completed = Number(worker.jobsCompleted);
  const earned = Number(worker.totalEarned) / 1e6; // USDC 6 decimals

  // Success score: placeholder until dispute tracking is available
  // For now, based on completion count and earnings
  const successScore = Math.min(100, completed * 5);

  let tier: Reputation["tier"];
  let color: string;
  let textColor: string;

  if (completed >= 50 && earned >= 5000) {
    tier = "Expert";
    color = "bg-purple-soft";
    textColor = "text-purple";
  } else if (completed >= 10 && earned >= 500) {
    tier = "Proven";
    color = "bg-blue-soft";
    textColor = "text-blue";
  } else if (completed >= 3 && earned >= 100) {
    tier = "Rising";
    color = "bg-[#e4f0e8]";
    textColor = "text-green";
  } else {
    tier = "New";
    color = "bg-[#efece6]";
    textColor = "text-[#7a7d74]";
  }

  return { tier, label: tier, color, textColor, successScore };
}

export const TIER_INFO: Record<string, { desc: string; icon: string }> = {
  New: { desc: "Just getting started", icon: "🌱" },
  Rising: { desc: "Building reputation", icon: "📈" },
  Proven: { desc: "Consistently delivers", icon: "✅" },
  Expert: { desc: "Top performer", icon: "🏆" },
};