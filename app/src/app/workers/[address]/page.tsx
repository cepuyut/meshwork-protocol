"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { Nav } from "@/components/Nav";
import { PageWrap, StatusBadge, NotLive, EmptyState } from "@/components/ui";
import { ReputationBadge } from "@/components/ReputationBadge";
import { REGISTRY_ADDRESS, registryAbi, ESCROW_ADDRESS, escrowAbi, isConfigured } from "@/lib/contracts";
import { usdc, shortAddr } from "@/lib/format";
import { getReputation, TIER_INFO } from "@/lib/reputation";

export default function WorkerProfile() {
  const { address } = useParams<{ address: string }>();

  const { data: worker } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "getWorker",
    args: [address as `0x${string}`],
    query: { enabled: isConfigured() && !!address },
  });

  const { data: jobIds } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: escrowAbi,
    functionName: "getWorkerJobs",
    args: [address as `0x${string}`],
    query: { enabled: isConfigured() && !!address },
  });

  const w = worker as any;
  const ids = (jobIds as bigint[] | undefined) ?? [];

  if (!isConfigured()) return <main className="min-h-screen"><Nav /><PageWrap><NotLive /></PageWrap></main>;
  if (!w || !w.exists) return <main className="min-h-screen"><Nav /><PageWrap><EmptyState title="Worker not found" hint="This address hasn't registered on Meshwork yet." /></PageWrap></main>;

  return (
    <main className="min-h-screen">
      <Nav />
      <PageWrap>
        <div className="mx-auto max-w-[720px]">
          {/* Profile header */}
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[22px] font-bold">{w.name}</h1>
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${w.isAgent ? "bg-blue-soft text-blue" : "bg-[#efece6] text-[#7a7d74]"}`}>
                    {w.isAgent ? "AI Agent" : "Person"}
                  </span>
                  <ReputationBadge jobsCompleted={w.jobsCompleted} totalEarned={w.totalEarned} />
                  {w.isActive ? (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-green">
                      <i className="h-[6px] w-[6px] rounded-full bg-green" /> Active
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-ink-faint">Inactive</span>
                  )}
                </div>
                <div className="mt-1.5 font-mono text-[12px] text-ink-faint">{shortAddr(address)}</div>
              </div>
              <Link
                href={`/post?target=${address}`}
                className="rounded-[11px] bg-blue px-5 py-2.5 text-sm font-semibold text-white"
              >
                Hire directly
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl border border-line bg-paper p-4">
              <div className="text-center">
                <div className="font-mono text-[20px] font-semibold">{String(w.jobsCompleted)}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">Jobs done</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[20px] font-semibold">{usdc(w.totalEarned)}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">USDC earned</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[20px] font-semibold">{w.pricePerJob > 0n ? usdc(w.pricePerJob) : "—"}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">Price/job</div>
              </div>
            </div>
            <div className="mt-2 text-center font-mono text-[9.5px] italic text-ink-faint">
              unverified on-chain activity
            </div>

            {/* Capabilities */}
            {w.capabilities && w.capabilities.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">Capabilities</div>
                <div className="flex flex-wrap gap-1.5">
                  {(w.capabilities as string[]).map((c: string) => (
                    <span key={c} className="rounded-full border border-line-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.05em] text-ink-dim">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Agent info */}
            {w.isAgent && w.endpoint && (
              <div className="mt-5">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">Endpoint</div>
                <code className="rounded-lg border border-line bg-paper px-3 py-2 font-mono text-[12px] text-ink-dim break-all">{w.endpoint}</code>
              </div>
            )}
          </div>

          {/* Job history */}
          <div className="mt-6">
            <h2 className="mb-4 text-[16px] font-semibold">Job history ({ids.length})</h2>
            {ids.length === 0 ? (
              <EmptyState title="No jobs yet" hint="This worker hasn't accepted any jobs." />
            ) : (
              <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {ids.map((id) => (
                  <JobRow key={String(id)} jobId={id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </PageWrap>
    </main>
  );
}

function JobRow({ jobId }: { jobId: bigint }) {
  const { data: job } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: escrowAbi,
    functionName: "getJob",
    args: [jobId],
    query: { enabled: isConfigured() },
  });

  const j = job as any;
  if (!j) return null;

  return (
    <Link href={`/job/${jobId}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-paper">
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold">{j.title}</div>
        <div className="mt-1 font-mono text-[11px] text-ink-faint">JOB #{String(j.id)}</div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="font-mono text-[15px] font-semibold">{usdc(j.amount)} <span className="text-[10px] text-ink-faint">USDC</span></span>
        <StatusBadge status={Number(j.status)} />
      </div>
    </Link>
  );
}