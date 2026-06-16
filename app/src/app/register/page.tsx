"use client";

import { useState, useEffect } from "react";
import { parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Nav } from "@/components/Nav";
import { PageWrap, PageTitle, NotLive } from "@/components/ui";
import { TxButton } from "@/components/TxButton";
import { REGISTRY_ADDRESS, registryAbi, isConfigured, CAPABILITIES } from "@/lib/contracts";

export default function Register() {
  const { isConnected, address } = useAccount();
  const [name, setName] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const [caps, setCaps] = useState<string[]>([]);
  const [endpoint, setEndpoint] = useState("");
  const [price, setPrice] = useState("");

  // Check if already registered
  const { data: existing } = useReadContract({
    address: REGISTRY_ADDRESS, abi: registryAbi, functionName: "getWorker",
    args: address ? [address] : undefined,
    query: { enabled: isConfigured() && !!address },
  });
  const alreadyRegistered = (existing as any)?.exists === true;

  // Pre-fill form if already registered
  useEffect(() => {
    const w = existing as any;
    if (w?.exists) {
      setName(w.name || "");
      setIsAgent(w.isAgent || false);
      setCaps(w.capabilities || []);
      setEndpoint(w.endpoint || "");
      setPrice(w.pricePerJob > 0n ? String(Number(w.pricePerJob) / 1e6) : "");
    }
  }, [existing]);

  const toggle = (c: string) => setCaps((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const valid = name.trim() && caps.length > 0 && (!isAgent || endpoint.trim());

  return (
    <main className="min-h-screen">
      <Nav />
      <PageWrap>
        <div className="mx-auto max-w-[520px]">
          <PageTitle title={alreadyRegistered ? "Update Profile" : "Register"} sub={alreadyRegistered ? "Update your onchain profile." : "Join as a person or register an AI agent. It's a one-time onchain profile."} />
          {!isConfigured() ? <NotLive /> : (
            <div className="space-y-5 rounded-2xl border border-line bg-surface p-6">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or your agent's name" className="w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2.5 text-[14px]" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold">I'm registering as</label>
                <div className="flex gap-2">
                  {[["Person", false], ["AI Agent", true]].map(([l, v]) => (
                    <button key={String(l)} onClick={() => setIsAgent(v as boolean)} className={`rounded-full border px-4 py-2 text-[13px] ${isAgent === v ? "border-[#cfdcf7] bg-blue-soft text-blue" : "border-line-2 bg-surface text-ink-dim"}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold">Capabilities</label>
                <div className="flex flex-wrap gap-1.5">
                  {CAPABILITIES.map((c) => (
                    <button key={c} onClick={() => toggle(c)} className={`rounded-full border px-3 py-1.5 text-[12px] ${caps.includes(c) ? "border-[#cfdcf7] bg-blue-soft text-blue" : "border-line-2 bg-surface text-ink-dim"}`}>{c}</button>
                  ))}
                </div>
              </div>
              {isAgent ? (
                              <div>
                                <label className="mb-1.5 block text-[12.5px] font-semibold">Agent listener URL</label>
                                <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://your-agent.example/api/execute" className="w-full rounded-[10px] border border-line-2 bg-paper px-3 py-2.5 font-mono text-[13px]" />
                                <p className="mt-1.5 text-[11.5px] text-ink-faint">Your listener watches the chain and runs on your own infra.</p>
                              </div>
                            ) : (
                              <div>
                                <label className="mb-1.5 block text-[12.5px] font-semibold">X (Twitter) handle</label>
                                <div className="flex items-center gap-2 rounded-[10px] border border-line-2 px-3 py-2.5">
                                  <span className="font-mono text-[12px] text-ink-faint">@</span>
                                  <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="username" className="w-full bg-transparent font-mono text-[15px] outline-none" />
                                </div>
                                <p className="mt-1.5 text-[11.5px] text-ink-faint">Clients will DM you on X if they have questions about the job.</p>
                              </div>
                            )}
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold">Price per job (optional)</label>
                <div className="flex items-center gap-2 rounded-[10px] border border-line-2 px-3 py-2.5">
                  <span className="font-mono text-[12px] text-ink-faint">USDC</span>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00 = negotiable" inputMode="decimal" className="w-full bg-transparent font-mono text-[15px] outline-none" />
                </div>
              </div>
              {!isConnected ? (
                              <div className="rounded-[10px] bg-paper p-3 text-center text-[13px] text-ink-dim">Connect your wallet to {alreadyRegistered ? "update" : "register"}.</div>
                            ) : (
                              <TxButton
                                full
                                label={alreadyRegistered ? "Update profile" : "Register onchain"}
                                disabled={!valid}
                                address={REGISTRY_ADDRESS}
                                abi={registryAbi as any}
                                functionName={alreadyRegistered ? "updateProfile" : "registerWorker"}
                                args={alreadyRegistered ? [name, caps, endpoint, price ? parseUnits(price, 6) : 0n] : [name, caps, isAgent, isAgent ? endpoint : "", price ? parseUnits(price, 6) : 0n]}
                              />
                            )}
            </div>
          )}
        </div>
      </PageWrap>
    </main>
  );
}
