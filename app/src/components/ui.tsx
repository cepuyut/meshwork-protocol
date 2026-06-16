import Link from "next/link";
import { JOB_STATUS } from "@/lib/contracts";

const STATUS_STYLE: Record<number, string> = {
  0: "bg-[#efece6] text-[#7a7d74]",          // Open
  1: "bg-[#f6efe0] text-[#8a6d24]",          // Active
  2: "bg-blue-soft text-blue",               // Submitted
  3: "bg-[#e4f0e8] text-[#3e7355]",          // Settled
  4: "bg-[#fbe2dc] text-[#a3331d]",          // Disputed
  5: "bg-[#efece6] text-[#7a7d74]",          // Cancelled
};
const STATUS_DOT: Record<number, string> = {
  0: "bg-[#aaa]", 1: "bg-amber", 2: "bg-blue", 3: "bg-green", 4: "bg-red", 5: "bg-[#aaa]",
};

export function StatusBadge({ status }: { status: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] font-medium ${STATUS_STYLE[status] ?? STATUS_STYLE[0]}`}>
      <i className={`h-[6px] w-[6px] rounded-full ${STATUS_DOT[status] ?? STATUS_DOT[0]}`} />
      {JOB_STATUS[status] ?? "—"}
    </span>
  );
}

export function PageWrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1080px] px-6 py-10">{children}</div>;
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-[26px] font-bold tracking-[-0.015em]">{title}</h1>
      {sub && <p className="mt-1 text-ink-dim">{sub}</p>}
    </div>
  );
}

export function EmptyState({ title, hint, cta }: { title: string; hint: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-8 py-14 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">Nothing here yet</div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-ink-dim">{hint}</p>
      {cta && (
        <Link href={cta.href} className="mt-5 inline-block rounded-[11px] bg-blue px-5 py-2.5 text-sm font-semibold text-white">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export function NotLive() {
  return (
    <EmptyState
      title="The protocol isn't deployed yet"
      hint="Contracts go live on Arc testnet shortly. Once they're deployed, jobs and workers appear here automatically."
      cta={{ href: "/docs", label: "Read how it works" }}
    />
  );
}
