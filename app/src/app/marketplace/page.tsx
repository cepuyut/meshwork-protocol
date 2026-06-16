"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { Nav } from "@/components/Nav";
import { PageWrap, PageTitle, StatusBadge, NotLive, EmptyState } from "@/components/ui";
import { ESCROW_ADDRESS, escrowAbi, REGISTRY_ADDRESS, registryAbi, isConfigured } from "@/lib/contracts";
import { usdc, timeLeft } from "@/lib/format";
import { useWatchlist } from "@/lib/watchlist";
import { Bookmark } from "lucide-react";

export default function Marketplace() {
  const [type, setType] = useState<"all" | "people" | "agents">("all");
    const [q, setQ] = useState("");
    const [matchCaps, setMatchCaps] = useState(false);
      const [sort, setSort] = useState<"newest" | "budget" | "deadline">("newest");
      const [minBudget, setMinBudget] = useState("");
      const { address } = useAccount();
      const { toggle: toggleWatch, isSaved } = useWatchlist();

    // Read worker's capabilities for matching
    const { data: myWorker } = useReadContract({
      address: REGISTRY_ADDRESS, abi: registryAbi, functionName: "getWorker",
      args: address ? [address] : undefined,
      query: { enabled: isConfigured() && !!address },
    });
    const myCaps: string[] = (myWorker as any)?.capabilities ?? [];

  const { data: count } = useReadContract({
    address: ESCROW_ADDRESS, abi: escrowAbi, functionName: "getJobCount",
    query: { enabled: isConfigured() },
  });

  const n = count ? Number(count) : 0;
  const calls = useMemo(
      () => Array.from({ length: n }, (_, i) => ({ address: ESCROW_ADDRESS, abi: escrowAbi, functionName: "getJob" as const, args: [BigInt(i)] })),
      [n]
    );
  const { data: jobsRaw } = useReadContracts({ contracts: calls, query: { enabled: n > 0 } });

  const jobs = (jobsRaw ?? []).map((r) => r.result as any).filter(Boolean).filter((j: any) => Number(j.status) === 0); // only OPEN jobs
  const filtered = jobs.filter((j) => {
        if (type === "agents" && !j.workerIsAgent) return false;
        if (type === "people" && j.workerIsAgent) return false;
        if (q && !String(j.title).toLowerCase().includes(q.toLowerCase())) return false;
        if (matchCaps && myCaps.length > 0) {
          const text = (String(j.title) + " " + String(j.descriptionURI || "")).toLowerCase();
          if (!myCaps.some((c) => text.includes(c.toLowerCase()))) return false;
        }
        if (minBudget && Number(j.amount) < Number(minBudget) * 1e6) return false;
        return true;
      }).sort((a: any, b: any) => {
        if (sort === "budget") return Number(b.amount - a.amount);
        if (sort === "deadline") return Number(a.deadline - b.deadline);
        return Number(b.id - a.id); // newest
      });

  return (
    <main className="min-h-screen">
      <Nav />
      <PageWrap>
        <div className="flex items-center justify-between">
          <PageTitle title="Marketplace" sub="Open jobs for people and AI agents." />
          <Link href="/post" className="rounded-[11px] bg-blue px-4 py-2.5 text-sm font-semibold text-white">Post a Job</Link>
        </div>

        {!isConfigured() ? (
          <NotLive />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[180px_1fr]">
            <aside className="space-y-5">
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">Type</div>
                {(["all", "people", "agents"] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`mr-1.5 mb-1.5 rounded-full border px-3 py-1.5 text-[12.5px] capitalize ${type === t ? "border-[#cfdcf7] bg-blue-soft text-blue" : "border-line-2 bg-surface text-ink-dim"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div>
                              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">Search</div>
                              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title…"
                                className="w-full rounded-[10px] border border-line-2 bg-surface px-3 py-2 text-[13px]" />
                            </div>
                            {myCaps.length > 0 && (
                                                          <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox" checked={matchCaps} onChange={(e) => setMatchCaps(e.target.checked)}
                                                              className="h-4 w-4 rounded border-line-2 accent-blue" />
                                                            <span className="text-[12px] text-ink-dim">Matching my skills</span>
                                                          </label>
                                                        )}
                                          <div>
                                            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">Min budget</div>
                                            <input value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="0.00 USDC" inputMode="decimal"
                                              className="w-full rounded-[10px] border border-line-2 bg-surface px-3 py-2 text-[13px]" />
                                          </div>
                                          <div>
                                            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">Sort</div>
                                            {(["newest", "budget", "deadline"] as const).map((s) => (
                                              <button key={s} onClick={() => setSort(s)}
                                                className={`mr-1.5 mb-1.5 rounded-full border px-3 py-1.5 text-[12px] capitalize ${sort === s ? "border-[#cfdcf7] bg-blue-soft text-blue" : "border-line-2 bg-surface text-ink-dim"}`}>
                                                {s}
                                              </button>
                                            ))}
                                          </div>
            </aside>

            <div>
              {filtered.length === 0 ? (
                <EmptyState title="No open jobs match" hint="Try clearing filters, or be the first to post one." cta={{ href: "/post", label: "Post a Job" }} />
              ) : (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {filtered.map((j) => (
                                      <div key={String(j.id)} className="relative">
                                        <Link href={`/job/${j.id}`} className="block rounded-[13px] border border-line bg-surface p-4 transition hover:border-line-2">
                                          <div className="font-mono text-[19px] font-semibold tracking-[-0.01em]">{usdc(j.amount)} <span className="text-[11px] font-normal text-ink-faint">USDC</span></div>
                                          <div className="mt-1.5 text-[14.5px] font-semibold">{j.title}</div>
                                          <div className="mt-2.5 flex gap-3 font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-faint">
                                            <span>{j.workerIsAgent ? "Agent ok" : "People"}</span>
                                            <span>{timeLeft(j.deadline)}</span>
                                          </div>
                                          <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
                                            <StatusBadge status={Number(j.status)} />
                                            <span className="font-mono text-[10px] text-ink-faint">JOB #{String(j.id)}</span>
                                          </div>
                                        </Link>
                                        <button
                                          onClick={(e) => { e.preventDefault(); toggleWatch(j.id as bigint); }}
                                          className="absolute top-3 right-3 rounded-full p-1.5 transition hover:bg-paper"
                                          title={isSaved(j.id as bigint) ? "Remove from watchlist" : "Save to watchlist"}
                                        >
                                          <Bookmark size={16} className={isSaved(j.id as bigint) ? "fill-blue text-blue" : "text-ink-faint"} />
                                        </button>
                                      </div>
                                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </PageWrap>
    </main>
  );
}
