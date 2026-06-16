"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Nav } from "@/components/Nav";
import { PageWrap, StatusBadge, NotLive } from "@/components/ui";
import { TxButton } from "@/components/TxButton";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Markdown } from "@/components/Markdown";
import { ESCROW_ADDRESS, escrowAbi, REGISTRY_ADDRESS, registryAbi, isConfigured } from "@/lib/contracts";
import { usdc, shortAddr, timeLeft } from "@/lib/format";

const STATIONS = [
  ["Posted", "escrowed"], ["Accepted", "worker / agent"], ["Submitted", "in review"], ["Settled", "funds released"],
] as const;

export default function JobPage() {
  const { id } = useParams<{ id: string }>();
    const { address, isConnected } = useAccount();
    const [deliverable, setDeliverable] = useState("");
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveConfirmed, setApproveConfirmed] = useState(false);

    const { data: job, refetch } = useReadContract({
      address: ESCROW_ADDRESS, abi: escrowAbi, functionName: "getJob", args: [BigInt(id)],
      query: { enabled: isConfigured() },
    });

    // Check if connected wallet is registered
    const { data: myWorker } = useReadContract({
      address: REGISTRY_ADDRESS, abi: registryAbi, functionName: "getWorker",
      args: address ? [address] : undefined,
      query: { enabled: isConfigured() && !!address },
    });
    const iAmRegistered = (myWorker as any)?.exists === true;
    const iAmActive = (myWorker as any)?.isActive === true;

  if (!isConfigured()) return (<main className="min-h-screen"><Nav /><PageWrap><NotLive /></PageWrap></main>);
  if (!job) return (<main className="min-h-screen"><Nav /><PageWrap><div className="text-ink-dim">Loading job #{id}…</div></PageWrap></main>);

  const j = job as any;
  const status = Number(j.status);
  const isClient = address?.toLowerCase() === j.client.toLowerCase();
  const isWorker = address?.toLowerCase() === j.worker.toLowerCase();
  const reached = (i: number) => (i === 0 ? true : i === 1 ? status >= 1 : i === 2 ? status >= 2 : status >= 3);
  const isExpired = Number(j.deadline) < Math.floor(Date.now()/1000);
  const now = (i: number) => (i === 2 && status === 2) || (i === 1 && status === 1);

  return (
    <main className="min-h-screen">
      <Nav />
      <PageWrap>
        <div className="mx-auto max-w-[820px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <StatusBadge status={status} />
              <h1 className="mt-2 text-[22px] font-bold tracking-[-0.015em]">{j.title}</h1>
            </div>
            <div className="font-mono text-[24px] font-semibold">{usdc(j.amount)} <span className="text-[12px] text-ink-faint">USDC</span></div>
          </div>

          {/* rail */}
          <div className="relative mt-7 grid grid-cols-4">
            <div className="absolute left-[11%] right-[11%] top-[12px] h-[2px] bg-line-2">
              <div className="h-full bg-blue opacity-50" style={{ width: `${Math.min(status, 3) * 31 + 8}%` }} />
            </div>
            {STATIONS.map(([t, d], i) => (
              <div key={t} className="relative text-center">
                <div className={`mx-auto flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 bg-surface ${reached(i) ? "border-blue" : "border-line-2"} ${now(i) ? "border-amber" : ""}`}>
                  <i className={`block h-[7px] w-[7px] rounded-full ${now(i) ? "bg-amber" : reached(i) ? "bg-blue" : "bg-line-2"}`} />
                </div>
                <div className="mt-2 text-[12.5px] font-semibold">{t}</div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-faint">{d}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-[1fr_280px]">
            <div className="space-y-3.5">
              <div className="rounded-xl border border-line bg-surface p-4">
                              <h5 className="mb-1.5 text-[13px] font-semibold">Brief</h5>
                              <Markdown content={j.descriptionURI || "—"} />
                            </div>
                            {j.deliverableURI && (
                              <div className="rounded-xl border border-line bg-surface p-4">
                                <h5 className="mb-1.5 text-[13px] font-semibold">Deliverable</h5>
                                <Markdown content={j.deliverableURI} />
                              </div>
                            )}
              <div className="font-mono text-[11px] text-ink-faint">
                              client {shortAddr(j.client)} · worker {j.worker === "0x0000000000000000000000000000000000000000" ? "—" : <Link href={`/workers/${j.worker}`} className="text-blue underline">{shortAddr(j.worker)}</Link>}
                            </div>
            </div>

            {/* action panel */}
                        <div className="self-start rounded-xl border border-line bg-surface p-4">
                          {/* Deadline countdown */}
                          <div className="mb-3 rounded-[9px] bg-paper p-2.5 text-center font-mono text-[11px]">
                            {status <= 1 ? (
                              <span className="text-ink-dim">Deadline: <b className="text-ink">{timeLeft(j.deadline)}</b></span>
                            ) : status === 2 ? (
                              <span className="text-amber">Submitted · client can approve or dispute</span>
                            ) : status === 3 ? (
                              <span className="text-green">Settled ✓</span>
                            ) : status === 4 ? (
                              <span className="text-red">Disputed · awaiting resolution</span>
                            ) : (
                              <span className="text-ink-faint">Cancelled</span>
                            )}
                          </div>

                          <div className="mb-3.5 flex items-start gap-2 rounded-[9px] bg-blue-soft p-2.5 text-[12.5px] text-ink-dim">
                            <span>🔒</span><span><b className="text-ink">{usdc(j.amount)} USDC</b> held in escrow. Released only when the client approves. <a href="/docs" className="text-blue">How it works →</a></span>
                          </div>

              {status === 0 && !isClient && (
                              <div className="space-y-2">
                                {!isConnected ? (
                                  <div className="rounded-[9px] bg-paper p-3 text-center text-[12.5px] text-ink-dim">
                                    Connect your wallet to accept this job.
                                  </div>
                                ) : !iAmRegistered ? (
                                  <div className="space-y-2 rounded-[9px] bg-blue-soft p-3">
                                    <div className="text-[12.5px] text-ink-dim">
                                      You need to register before accepting jobs.
                                    </div>
                                    <a href="/register" className="block w-full rounded-[9px] bg-blue px-4 py-2.5 text-center text-[13px] font-semibold text-white">
                                      Register now →
                                    </a>
                                  </div>
                                ) : !iAmActive ? (
                                  <div className="rounded-[9px] bg-[#f6efe0] p-3 text-center text-[12.5px] text-ink-dim">
                                    Your profile is paused. Go to Dashboard to resume.
                                  </div>
                                ) : j.workerIsAgent && !(myWorker as any)?.isAgent ? (
                                  <div className="rounded-[9px] bg-[#f6efe0] p-3 text-center text-[12.5px] text-ink-dim">
                                    This job requires an AI agent. Only registered agents can accept.
                                  </div>
                                ) : (
                                  <TxButton full label="Accept this job" address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="acceptJob" args={[BigInt(id)]} onConfirmed={() => refetch()} />
                                )}
                              </div>
                            )}
                            {status === 0 && isClient && (
                <div className="mt-2">
                  <TxButton full variant="ghost" label="Cancel & refund" address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="cancelJob" args={[BigInt(id)]} onConfirmed={() => refetch()} />
                </div>
              )}
              {status === 1 && isWorker && (
                              <div className="space-y-2">
                                <textarea
                                  value={deliverable}
                                  onChange={(e) => setDeliverable(e.target.value)}
                                  placeholder="Paste your deliverable here. Use Markdown for formatting — **bold**, lists, ## headings, `code`, etc."
                                  rows={4}
                                  className="w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2.5 font-mono text-[13px]"
                                />
                                <TxButton full label="Submit work" disabled={!deliverable} address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="submitWork" args={[BigInt(id), deliverable]} onConfirmed={() => { refetch(); setDeliverable(""); }} />
                                <div className="text-center font-mono text-[10px] text-ink-faint">
                                  After submitting, the client will review and approve. If they don't respond, you can claim payment after the deadline.
                                </div>
                              </div>
                            )}
                            {status === 1 && isClient && (
                              <div className="space-y-2 rounded-[9px] bg-[#f6efe0] p-3">
                                <div className="text-[12px] font-semibold text-amber">Waiting for work</div>
                                <p className="text-[11.5px] text-ink-dim">
                                  A worker has accepted this job. They'll submit the work before the deadline.
                                  If they don't submit, you can reclaim your deposit after the deadline.
                                </p>
                              </div>
                            )}
              {status === 2 && isClient && (
                              <div className="space-y-2">
                                {!approveConfirmed ? (
                                  <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="w-full rounded-[11px] bg-blue px-5 py-3 text-[14px] font-semibold text-white"
                                  >
                                    Approve & release funds
                                  </button>
                                ) : (
                                  <TxButton full label="Yes, release funds" address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="approveWork" args={[BigInt(id)]} onConfirmed={() => { refetch(); setApproveConfirmed(false); }} />
                                )}
                                <div className="text-center font-mono text-[10px] text-ink-faint">Funds are held in escrow — you approve to release</div>
                                <ConfirmModal
                                  open={showApproveModal}
                                  title="Release payment?"
                                  message={`This will send ${usdc(j.amount)} USDC to the worker (minus 1.5% fee). This action cannot be undone.`}
                                  confirmLabel="Yes, release funds"
                                  onConfirm={() => { setShowApproveModal(false); setApproveConfirmed(true); }}
                                  onCancel={() => setShowApproveModal(false)}
                                />
                              </div>
                            )}
              {status === 2 && isClient && (
                <div className="mt-2">
                  <TxButton full variant="danger" label="Raise a dispute" address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="raiseDispute" args={[BigInt(id)]} onConfirmed={() => refetch()} />
                </div>
              )}
                            {status === 2 && isWorker && isExpired && (
                <div className="mt-2">
                  <TxButton full label="Claim payment (deadline passed)" address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="workerClaimSubmitted" args={[BigInt(id)]} onConfirmed={() => refetch()} />
                </div>
              )}
              {status === 1 && isClient && isExpired && (
                              <div className="mt-2">
                                <TxButton full variant="ghost" label="Reclaim deposit (deadline passed)" address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="reclaimExpired" args={[BigInt(id)]} onConfirmed={() => refetch()} />
                              </div>
                            )}
              {status === 4 && (
                <div className="space-y-2 rounded-[9px] bg-[#fbe2dc] p-3">
                  <div className="text-[12px] font-semibold text-red">Dispute in progress</div>
                  <p className="text-[11.5px] text-ink-dim">
                    {isClient ? "You raised this dispute." : isWorker ? "The client raised a dispute." : "A dispute was raised."}
                    {" "}The protocol owner can resolve it. If unresolved for 14 days, funds auto-release to the worker.
                  </p>
                </div>
              )}
              {status >= 3 && status !== 4 && <div className="text-center text-[13px] text-ink-dim">This job is {["", "", "", "settled", "in dispute", "cancelled"][status]}.</div>}
            </div>
          </div>
        </div>
      </PageWrap>
    </main>
  );
}
