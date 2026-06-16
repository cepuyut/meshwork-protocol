"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/lib/wagmi";
import { AddNetworkButton } from "@/components/AddNetworkButton";

function short(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
}

export function Nav() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const wrongChain = isConnected && chainId !== arcTestnet.id;
  const injected = connectors[0];

  return (
    <header>
      {wrongChain && (
        <div className="bg-blue-soft text-blue text-center text-[13px] py-2 font-medium">
          You&apos;re on the wrong network.{" "}
          <button className="underline" onClick={() => switchChain({ chainId: arcTestnet.id })}>
            Switch to Arc Testnet
          </button>
        </div>
      )}
      <nav className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 48 48" aria-label="Meshwork">
            <g fill="none" stroke="var(--ink)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 14 H22" /><path d="M8 24 H20" /><path d="M8 34 H22" />
              <path d="M22 14 Q30 14 30 24" /><path d="M20 24 H30" /><path d="M22 34 Q30 34 30 24" /><path d="M30 24 H42" />
            </g><circle cx="30" cy="24" r="4.2" fill="var(--blue)" />
          </svg>
          <span className="text-[20px] font-bold tracking-[-0.5px]">Meshwork</span>
        </a>
        <div className="hidden gap-7 md:flex">
          <a href="/marketplace" className="text-sm text-ink-dim hover:text-ink">Marketplace</a>
          <a href="/workers" className="text-sm text-ink-dim hover:text-ink">Workers</a>
          <a href="/dashboard" className="text-sm text-ink-dim hover:text-ink">Dashboard</a>
          <a href="/docs" className="text-sm text-ink-dim hover:text-ink">Docs</a>
                  </div>
        <div className="flex items-center gap-3">
                  <AddNetworkButton />
                  {isConnected ? (
            <button onClick={() => disconnect()} className="rounded-[10px] border border-line-2 bg-surface px-4 py-2 font-mono text-[12px]">
              {short(address)}
            </button>
          ) : (
            <button onClick={() => injected && connect({ connector: injected })} className="rounded-[10px] bg-blue px-4 py-2.5 text-sm font-semibold text-white">
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
