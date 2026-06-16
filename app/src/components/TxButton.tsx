"use client";

import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Abi } from "viem";
import { arcscanTx } from "@/lib/format";
import { useToast } from "@/components/Toast";

type Props = {
  label: string;
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  full?: boolean;
  onConfirmed?: () => void;
};

export function TxButton({ label, address, abi, functionName, args = [], disabled, variant = "primary", full, onConfirmed }: Props) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { addToast, updateToast, dismissToast } = useToast();
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending && !toastId.current) {
      toastId.current = addToast({ type: "pending", title: `${label}…`, message: "Confirm in your wallet" });
    }
    if (hash && toastId.current) {
      updateToast(toastId.current, { type: "pending", title: `${label}…`, message: "Waiting for confirmation", txHash: hash });
    }
    if (confirming && toastId.current) {
      updateToast(toastId.current, { type: "pending", title: `${label}…`, message: "Confirming on Arc…", txHash: hash });
    }
    if (isSuccess && toastId.current) {
      updateToast(toastId.current, { type: "success", title: "Done ✓", message: label, txHash: hash });
      setTimeout(() => { if (toastId.current) dismissToast(toastId.current!); toastId.current = null; }, 5000);
      if (onConfirmed) onConfirmed();
    }
    if (error && toastId.current) {
      updateToast(toastId.current, { type: "error", title: "Failed", message: (error as any).shortMessage || "Transaction failed" });
      setTimeout(() => { if (toastId.current) dismissToast(toastId.current!); toastId.current = null; }, 6000);
    }
  }, [isPending, hash, confirming, isSuccess, error]);

  const busy = isPending || confirming;
  const base = "rounded-[11px] px-5 py-3 text-[14px] font-semibold transition disabled:opacity-50";
  const style =
    variant === "ghost" ? "border border-line-2 bg-surface text-ink"
    : variant === "danger" ? "border border-[#e8cfc7] bg-surface text-red"
    : "bg-blue text-white";

  return (
    <div className={full ? "w-full" : ""}>
      <button
        disabled={disabled || busy}
        onClick={() => writeContract({ address, abi, functionName, args })}
        className={`${base} ${style} ${full ? "w-full" : ""} inline-flex items-center justify-center gap-2`}
      >
        {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {isSuccess ? "Done ✓" : isPending ? "Confirm in wallet…" : confirming ? "Pending…" : label}
      </button>
      {hash && (
        <a href={arcscanTx(hash)} target="_blank" rel="noreferrer" className="mt-1.5 block text-center font-mono text-[10.5px] text-ink-faint underline">
          view transaction
        </a>
      )}
      {error && <div className="mt-1.5 text-center text-[12px] text-red">{(error as any).shortMessage || "Transaction failed"}</div>}
    </div>
  );
}