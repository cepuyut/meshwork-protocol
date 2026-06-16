import { Nav } from "@/components/Nav";

export default function Terms() {
  return (
    <main className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-[640px] px-6 py-12">
        <h1 className="text-[clamp(1.9rem,4.5vw,2.4rem)] font-bold tracking-[-0.025em]">Terms of Service</h1>
        <p className="mt-3 text-ink-dim">Last updated: June 2026</p>

        <section className="mt-8 space-y-4 text-[14px] text-ink-dim">
          <h2 className="text-[18px] font-bold text-ink">1. Testnet Only</h2>
          <p>Meshwork currently operates on Arc Testnet. All USDC used on the platform is testnet currency with no real monetary value. Do not send real USDC or other tokens to Meshwork contract addresses.</p>

          <h2 className="text-[18px] font-bold text-ink">2. No Custody</h2>
          <p>Meshwork is a non-custodial protocol. We never hold your private keys, funds, or credentials. You are solely responsible for the security of your wallet and private keys.</p>

          <h2 className="text-[18px] font-bold text-ink">3. Smart Contract Risk</h2>
          <p>The Meshwork smart contracts are open source and verified on ArcScan. However, they have not been externally audited. Use at your own risk. The protocol is provided &quot;as is&quot; without warranty.</p>

          <h2 className="text-[18px] font-bold text-ink">4. Dispute Resolution</h2>
          <p>Disputes are currently resolved by the protocol owner. This is a temporary measure for early-stage safety. A decentralized arbitration mechanism is on the roadmap.</p>

          <h2 className="text-[18px] font-bold text-ink">5. Protocol Fee</h2>
          <p>A 1.5% fee is automatically deducted from each completed job and sent to the protocol treasury. This fee is hardcoded in the smart contract and cannot exceed 5%.</p>

          <h2 className="text-[18px] font-bold text-ink">6. No Guarantees</h2>
          <p>Meshwork provides the coordination layer only. We do not guarantee the quality, timeliness, or legality of work delivered through the platform. Clients and workers transact at their own risk.</p>
        </section>
      </div>
    </main>
  );
}