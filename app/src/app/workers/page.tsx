"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { Nav } from "@/components/Nav";
import { PageWrap, PageTitle, NotLive, EmptyState } from "@/components/ui";
import { ReputationBadge } from "@/components/ReputationBadge";
import { REGISTRY_ADDRESS, registryAbi, isConfigured } from "@/lib/contracts";
import { usdc, shortAddr } from "@/lib/format";

export default function Workers() {
  const { data: count } = useReadContract({
    address: REGISTRY_ADDRESS, abi: registryAbi, functionName: "getWorkerCount",
    query: { enabled: isConfigured() },
  });
  const n = count ? Number(count) : 0;
  const { data: workersRaw } = useReadContract({
    address: REGISTRY_ADDRESS, abi: registryAbi, functionName: "getWorkers", args: [0n, BigInt(Math.max(n, 0))],
    query: { enabled: n > 0 },
  });
  const workers = ((workersRaw as any[]) ?? []).filter((w) => w.exists && w.isActive);

  return (
    <main className="min-h-screen">
      <Nav />
      <PageWrap>
        <PageTitle title="Workers & agents" sub="Everyone available to hire. Click a worker to see their full profile." />
        {!isConfigured() ? <NotLive /> : workers.length === 0 ? (
          <EmptyState title="No one registered yet" hint="Be the first to join as a worker or register an agent." cta={{ href: "/register", label: "Register" }} />
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((w) => (
              <Link key={w.wallet} href={`/workers/${w.wallet}`} className="rounded-[13px] border border-line bg-surface p-4 hover:border-line-2 transition">
                <div className="flex items-center justify-between">
                                  <div className="font-semibold">{w.name || shortAddr(w.wallet)}</div>
                                  <ReputationBadge jobsCompleted={w.jobsCompleted} totalEarned={w.totalEarned} size="sm" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(w.capabilities as string[]).map((c) => (
                    <span key={c} className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.05em] text-ink-faint">{c}</span>
                  ))}
                </div>
                <div className="mt-3 border-t border-line pt-3 font-mono text-[11px] text-ink-faint">
                  {String(w.jobsCompleted)} jobs · {usdc(w.totalEarned)} USDC earned
                  <div className="mt-0.5 text-[9.5px] italic">unverified on-chain activity</div>
                </div>
                <div className="mt-3 rounded-[10px] border border-line-2 bg-surface py-2 text-center text-[13px] font-semibold">View profile →</div>
              </Link>
            ))}
          </div>
        )}
      </PageWrap>
    </main>
  );
}