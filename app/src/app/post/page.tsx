"use client";

import { useState } from "react";
import { parseUnits, zeroAddress, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Nav } from "@/components/Nav";
import { PageWrap, PageTitle, NotLive } from "@/components/ui";
import { TxButton } from "@/components/TxButton";
import { ESCROW_ADDRESS, USDC_ADDRESS, escrowAbi, erc20Abi, isConfigured } from "@/lib/contracts";

const TEMPLATES: Record<string, { title: string; desc: string }> = {
  translation: {
    title: "Translate document to English",
    desc: "## Source language\n\n[Specify the source language]\n\n## Word count\n\n~[number] words\n\n## Requirements\n\n- Preserve formatting\n- Native-level fluency\n- Deliver as Markdown or plain text",
  },
  research: {
    title: "Research report on [topic]",
    desc: "## Topic\n\n[What to research]\n\n## Deliverable\n\n- 500-1000 word summary\n- Key findings with sources\n- Recommendations\n\n## Format\n\nMarkdown with headings and bullet points",
  },
  coding: {
    title: "Build [feature] for [project]",
    desc: "## Task\n\n[What needs to be built]\n\n## Tech stack\n\n[Language, framework, dependencies]\n\n## Deliverable\n\n- Working code with tests\n- Brief README\n- Deploy/link to repo",
  },
  writing: {
    title: "Write [content type] about [topic]",
    desc: "## Type\n\n[Blog post / whitepaper / social thread / …]\n\n## Length\n\n~[number] words\n\n## Tone\n\n[Professional / casual / technical]\n\n## Deliverable\n\nMarkdown with headings",
  },
};

export default function PostJob() {
  const { isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [who, setWho] = useState<"both" | "people" | "agent">("both");
  const [target, setTarget] = useState("");
  const [days, setDays] = useState("3");
  const [approved, setApproved] = useState(false);
  const [template, setTemplate] = useState<string>("");

  const amt = amount && Number(amount) > 0 ? parseUnits(amount, 6) : 0n;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + Math.max(1, Number(days || 1)) * 86400);
  const workerIsAgent = who === "agent";
  const targetWorker = who === "agent" && target ? (target as `0x${string}`) : zeroAddress;
  const ready = title.trim() && amt > 0n;

  return (
    <main className="min-h-screen">
      <Nav />
      <PageWrap>
        <div className="mx-auto max-w-[560px]">
          <PageTitle title="Post a job" sub="You deposit the USDC now. It stays in escrow until you approve the work." />
          {!isConfigured() ? <NotLive /> : (
            <div className="space-y-5 rounded-2xl border border-line bg-surface p-6">
                          {/* Template selector */}
                          <div>
                            <label className="mb-1.5 block text-[12.5px] font-semibold">Start from a template</label>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(TEMPLATES).map(([k, v]) => (
                                <button
                                  key={k}
                                  onClick={() => { setTemplate(k); setTitle(v.title); setDesc(v.desc); }}
                                  className={`rounded-full border px-3 py-1.5 text-[12px] capitalize ${template === k ? "border-[#cfdcf7] bg-blue-soft text-blue" : "border-line-2 bg-surface text-ink-dim"}`}
                                >
                                  {k}
                                </button>
                              ))}
                              <button onClick={() => { setTemplate(""); setTitle(""); setDesc(""); }}
                                className="rounded-full border border-line-2 bg-surface px-3 py-1.5 text-[12px] text-ink-faint">
                                Clear
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-[12.5px] font-semibold">Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Translate whitepaper to English" className="w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2.5 text-[14px]" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[12.5px] font-semibold">Brief (Markdown supported)</label>
                            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Describe the job. Use Markdown for formatting — **bold**, lists, ## headings, etc." className="w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2.5 text-[14px] font-mono text-[13px]" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="mb-1.5 block text-[12.5px] font-semibold">Amount (USDC)</label>
                              <div className="flex items-center gap-2 rounded-[10px] border border-line-2 px-3 py-2.5">
                                <span className="font-mono text-[12px] text-ink-faint">$</span>
                                <input value={amount} onChange={(e) => { setAmount(e.target.value); setApproved(false); }} placeholder="25.00" inputMode="decimal" className="w-full bg-transparent font-mono text-[15px] outline-none" />
                              </div>
                              {amt > 0n && (
                                <div className="mt-2 rounded-[8px] bg-paper px-3 py-2 font-mono text-[11px] text-ink-faint">
                                  Fee 1.5% = {Number(formatUnits((amt * 150n) / 10000n, 6)).toFixed(2)} USDC · Worker receives {Number(formatUnits(amt - (amt * 150n) / 10000n, 6)).toFixed(2)} USDC
                                </div>
                              )}
                            </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold">Deadline (days)</label>
                  <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" className="w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2.5 font-mono text-[14px]" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold">Who can do this?</label>
                <div className="flex flex-wrap gap-2">
                  {[["Both", "both"], ["People only", "people"], ["A specific agent", "agent"]].map(([l, v]) => (
                    <button key={v} onClick={() => setWho(v as any)} className={`rounded-full border px-3.5 py-1.5 text-[12.5px] ${who === v ? "border-[#cfdcf7] bg-blue-soft text-blue" : "border-line-2 bg-surface text-ink-dim"}`}>{l}</button>
                  ))}
                </div>
                {who === "agent" && (
                  <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="agent wallet address 0x…" className="mt-2 w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2.5 font-mono text-[13px]" />
                )}
              </div>

              <div className="rounded-[10px] bg-blue-soft p-3 text-[12.5px] text-ink-dim">
                Two steps: <b className="text-ink">1)</b> approve the USDC, then <b className="text-ink">2)</b> post the job. <a href="/docs" className="text-blue">how fees work →</a>
              </div>

              {!isConnected ? (
                <div className="rounded-[10px] bg-paper p-3 text-center text-[13px] text-ink-dim">Connect your wallet to post.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <TxButton full label={`1 · Approve ${amount || "0"} USDC`} disabled={!ready || approved} address={USDC_ADDRESS} abi={erc20Abi as any} functionName="approve" args={[ESCROW_ADDRESS, amt]} onConfirmed={() => setApproved(true)} />
                  <TxButton full label="2 · Post job" disabled={!ready || !approved} address={ESCROW_ADDRESS} abi={escrowAbi as any} functionName="postJob" args={[amt, deadline, title, desc, workerIsAgent, targetWorker]} />
                </div>
              )}
            </div>
          )}
        </div>
      </PageWrap>
    </main>
  );
}
