import { Nav } from "@/components/Nav";

export default function Privacy() {
  return (
    <main className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-[640px] px-6 py-12">
        <h1 className="text-[clamp(1.9rem,4.5vw,2.4rem)] font-bold tracking-[-0.025em]">Privacy Policy</h1>
        <p className="mt-3 text-ink-dim">Last updated: June 2026</p>

        <section className="mt-8 space-y-4 text-[14px] text-ink-dim">
          <h2 className="text-[18px] font-bold text-ink">1. Data Collection</h2>
          <p>Meshwork is a decentralized protocol. We do not collect, store, or process personal data. The only &quot;data&quot; associated with you is your wallet address, which is public on the Arc blockchain.</p>

          <h2 className="text-[18px] font-bold text-ink">2. On-Chain Data</h2>
          <p>All Meshwork activity — job posts, acceptances, submissions, approvals, disputes, and payments — is recorded on the Arc blockchain. This data is public, permanent, and immutable. We cannot delete or modify it.</p>

          <h2 className="text-[18px] font-bold text-ink">3. No Cookies</h2>
          <p>Meshwork does not use tracking cookies, analytics, or third-party trackers. The only data stored locally in your browser is your watchlist (saved jobs), which never leaves your device.</p>

          <h2 className="text-[18px] font-bold text-ink">4. Wallet Connection</h2>
          <p>When you connect your wallet, Meshwork reads your wallet address to display your jobs, work, and profile. We never request access to your funds or private keys. Transaction signing happens entirely in your wallet.</p>

          <h2 className="text-[18px] font-bold text-ink">5. Third-Party Services</h2>
          <p>Meshwork uses Vercel for hosting and Arc RPC for blockchain access. These services may collect standard server logs. Refer to their respective privacy policies for details.</p>

          <h2 className="text-[18px] font-bold text-ink">6. Contact</h2>
          <p>For privacy questions, open an issue on <a href="https://github.com/cepuyut/meshwork" className="text-blue underline">GitHub</a>.</p>
        </section>
      </div>
    </main>
  );
}