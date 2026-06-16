"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { Nav } from "@/components/Nav";
import { PageWrap, PageTitle, StatusBadge, NotLive, EmptyState } from "@/components/ui";
import { TxButton } from "@/components/TxButton";
import { FaucetGuide } from "@/components/FaucetGuide";
import { ESCROW_ADDRESS, escrowAbi, REGISTRY_ADDRESS, registryAbi, isConfigured } from "@/lib/contracts";
import { usdc, timeLeft } from "@/lib/format";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<"client" | "worker">("client");

  const { data: ids } = useReadContract({
    address: ESCROW_ADDRESS, abi: escrowAbi,
    functionName: tab === "client" ? "getClientJobs" : "getWorkerJobs",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured() && !!address },
  });

  const list = (ids as bigint[] | undefined) ?? [];
  const { data: jobsRaw } = useReadContracts({
    contracts: list.map((id) => ({ address: ESCROW_ADDRESS, abi: escrowAbi, functionName: "getJob" as const, args: [id] })),
    query: { enabled: list.length > 0 },
  });
  const jobs = (jobsRaw ?? []).map((r) => r.result as any).filter(Boolean);

    // Worker stats from Registry
    const { data: worker, refetch: refetchWorker } = useReadContract({
      address: REGISTRY_ADDRESS, abi: registryAbi, functionName: "getWorker",
      args: address ? [address] : undefined,
      query: { enabled: isConfigured() && !!address },
    });
    const w = worker as any;

    return (
      <main className="min-h-screen">
        <Nav />
        <PageWrap>
          <PageTitle title="Dashboard" sub="Your jobs and your work in one place." />
          {!isConfigured() ? <NotLive /> : !isConnected ? (
            <EmptyState title="Connect your wallet" hint="Your posted jobs and accepted work show up here once you connect." />
          ) : (
            <>
              {/* Worker stats card */}
              {tab === "worker" && w?.exists && (
                <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl border border-line bg-surface p-4">
                  <div className="text-center">
                    <div className="font-mono text-[18px] font-semibold">{String(w.jobsCompleted)}</div>
                    <div className="text-[11px] text-ink-faint">Jobs done</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-[18px] font-semibold">{usdc(w.totalEarned)}</div>
                    <div className="text-[11px] text-ink-faint">USDC earned</div>
                  </div>
                  <div className="text-center">
                    {w.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-green">
                        <i className="h-[6px] w-[6px] rounded-full bg-green" /> Active
                      </span>
                    ) : (
                      <span className="text-[12px] text-ink-faint">Paused</span>
                    )}
                    <div className="mt-1">
                      <TxButton
                        label={w.isActive ? "Pause" : "Resume"}
                        variant="ghost"
                        address={REGISTRY_ADDRESS}
                        abi={registryAbi as any}
                        functionName="setActive"
                        args={[!w.isActive]}
                        onConfirmed={() => refetchWorker()}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-5 flex gap-2">
                {[["client", "My Jobs (as client)"], ["worker", "My Work (as worker)"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTab(v as any)} className={`rounded-[10px] px-4 py-2 text-[13px] font-medium ${tab === v ? "bg-ink text-white" : "border border-line-2 bg-surface text-ink-dim"}`}>{l}</button>
                ))}
              </div>
              {jobs.length === 0 ? (
                <EmptyState title={tab === "client" ? "No jobs posted yet" : "No work accepted yet"} hint={tab === "client" ? "Post your first job to get something done." : "Browse the marketplace and accept a job."} cta={tab === "client" ? { href: "/post", label: "Post a Job" } : { href: "/marketplace", label: "Browse jobs" }} />
              ) : (
                <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                  {jobs.map((j) => (
                    <Link key={String(j.id)} href={`/job/${j.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-paper">
                      <div className="min-w-0">
                        <div className="truncate text-[14.5px] font-semibold">{j.title}</div>
                        <div className="mt-1 font-mono text-[11px] text-ink-faint">JOB #{String(j.id)} · {timeLeft(j.deadline)}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="font-mono text-[15px] font-semibold">{usdc(j.amount)} <span className="text-[10px] text-ink-faint">USDC</span></span>
                        <StatusBadge status={Number(j.status)} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <FaucetGuide />
              </div>
            </>
          )}
      </PageWrap>
    </main>
  );
}
