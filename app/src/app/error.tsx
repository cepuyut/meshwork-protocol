"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center max-w-[400px]">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">Error</div>
        <h1 className="mt-3 text-[22px] font-bold">Something went wrong</h1>
        <p className="mt-2 text-ink-dim text-[14px]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={() => reset()}
          className="mt-5 rounded-[11px] bg-blue px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}