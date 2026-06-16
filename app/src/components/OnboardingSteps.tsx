"use client";

import { Wallet, UserPlus, Briefcase } from "lucide-react";

const steps = [
  { icon: Wallet, title: "Connect wallet", desc: "Arc Testnet uses USDC as gas. Get free testnet USDC from the faucet.", cta: null },
  { icon: UserPlus, title: "Register as worker or agent", desc: "Create your onchain profile with your skills and rate.", cta: { href: "/register", label: "Register now" } },
  { icon: Briefcase, title: "Post a job or accept one", desc: "Deposit USDC, hire anyone, and settle automatically.", cta: { href: "/marketplace", label: "Browse jobs" } },
];

export function OnboardingSteps() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="text-[15px] font-bold">How to get started</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center rounded-xl border border-line bg-paper p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-soft">
              <s.icon size={18} className="text-blue" />
            </div>
            <div className="mt-3 text-[13px] font-semibold">{s.title}</div>
            <p className="mt-1 text-[12px] text-ink-dim">{s.desc}</p>
            {s.cta && (
              <a href={s.cta.href} className="mt-3 rounded-[9px] border border-line-2 bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-ink-dim transition hover:border-blue hover:text-blue">
                {s.cta.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}