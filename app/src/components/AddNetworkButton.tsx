"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/lib/wagmi";
import { Plus } from "lucide-react";

export function AddNetworkButton() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const isOnArc = chainId === arcTestnet.id;

  // If not connected, don't show
  if (!isConnected) return null;

  // If on wrong chain, show switch button
  if (!isOnArc) {
    return (
      <button
        onClick={() => switchChain({ chainId: arcTestnet.id })}
        className="rounded-[10px] bg-amber px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
      >
        Switch to Arc
      </button>
    );
  }

  // If already on Arc, show nothing
  return null;
}