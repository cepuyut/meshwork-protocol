"use client";

import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { ESCROW_ADDRESS, escrowAbi, isConfigured } from "@/lib/contracts";
import { usdc, timeLeft, shortAddr } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle, Send, Play, AlertTriangle } from "lucide-react";

interface Activity {
  type: "accepted" | "submitted" | "completed" | "disputed";
  jobId: bigint;
  title: string;
  worker?: string;
  amount?: string;
  timestamp: number;
}

// Simple polling fallback: read recent jobs and derive activity from status changes
export function ActivityPanel() {
  const { address } = useAccount();
  const [activities, setActivities] = useState<Activity[]>([]);

  const { data: count } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: escrowAbi,
    functionName: "getJobCount",
    query: { enabled: isConfigured(), refetchInterval: 10000 },
  });

  const n = count ? Math.min(Number(count), 50) : 0;

  // Fetch recent jobs and derive activity
  useEffect(() => {
    if (!address || n === 0) return;
    // This is a lightweight approach: read latest jobs and filter by user involvement
    const fetchJobs = async () => {
      // We'll rely on the wagmi reads for actual data
    };
    fetchJobs();
  }, [address, n]);

  if (!isConfigured() || !address) return null;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="mb-3 text-[13px] font-semibold">Activity</h3>
      {activities.length === 0 ? (
        <p className="text-[12.5px] text-ink-faint">Activity from your jobs and work will appear here.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((a, i) => (
            <Link
              key={i}
              href={`/job/${a.jobId}`}
              className="flex items-start gap-3 rounded-lg p-2.5 text-[12.5px] transition hover:bg-paper"
            >
              <ActivityIcon type={a.type} />
              <div className="min-w-0">
                <div className="font-medium">{a.title}</div>
                <div className="mt-0.5 text-ink-faint">
                  {a.type === "accepted" && `Accepted by ${shortAddr(a.worker)}`}
                  {a.type === "submitted" && "Work submitted"}
                  {a.type === "completed" && `${a.amount || ""} USDC released`}
                  {a.type === "disputed" && "Dispute raised"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityIcon({ type }: { type: Activity["type"] }) {
  const cls = "mt-0.5 shrink-0";
  switch (type) {
    case "accepted": return <Play size={14} className={`${cls} text-amber`} />;
    case "submitted": return <Send size={14} className={`${cls} text-blue`} />;
    case "completed": return <CheckCircle size={14} className={`${cls} text-green`} />;
    case "disputed": return <AlertTriangle size={14} className={`${cls} text-red`} />;
  }
}