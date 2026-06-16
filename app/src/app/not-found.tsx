import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center max-w-[400px]">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">404</div>
        <h1 className="mt-3 text-[22px] font-bold">Page not found</h1>
        <p className="mt-2 text-ink-dim text-[14px]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="mt-5 inline-block rounded-[11px] bg-blue px-5 py-2.5 text-sm font-semibold text-white">
          Back to home
        </Link>
      </div>
    </div>
  );
}