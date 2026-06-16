"use client";

import { ExternalLink } from "lucide-react";

export function FaucetGuide() {
  return (
    <div className="rounded-xl border border-[#d7e2fa] bg-blue-soft p-4 text-[13px]">
      <div className="flex items-center gap-2">
        <span className="text-lg">💧</span>
        <span className="font-semibold text-ink">Need testnet USDC?</span>
      </div>
      <p className="mt-1.5 text-ink-dim">
        Arc Testnet uses USDC as gas. Get free testnet USDC from the Circle faucet — it takes 10 seconds.
      </p>
      <a
        href="https://faucet.circle.com"
        target="_blank"
        rel="noreferrer"
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-[9px] bg-blue px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
      >
        Open Circle Faucet <ExternalLink size={12} />
      </a>
      <p className="mt-2 text-[11.5px] text-ink-faint">
        1. Select <b>Arc Testnet</b> network · 2. Connect your wallet · 3. Request USDC. Arrives in seconds.
      </p>
      <p className="mt-1 text-[11px] text-ink-faint">
        Once you have USDC, click <b>"Add Arc Network"</b> in the top-right to switch your wallet to Arc Testnet.
      </p>
    </div>
  );
}