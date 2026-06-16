import { formatUnits } from "viem";
import { USDC_DECIMALS } from "./contracts";

export function usdc(amount: bigint | number | string): string {
  try {
    const v = typeof amount === "bigint" ? amount : BigInt(amount);
    const n = Number(formatUnits(v, USDC_DECIMALS));
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return "0.00";
  }
}

export function shortAddr(a?: string): string {
  return a && a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || "";
}

export function timeLeft(deadline: bigint): string {
  const ms = Number(deadline) * 1000 - Date.now();
  if (ms <= 0) return "ended";
  const d = Math.floor(ms / 86400000);
  if (d >= 1) return `${d}d left`;
  const h = Math.floor(ms / 3600000);
  return h >= 1 ? `${h}h left` : "<1h left";
}

export const arcscanTx = (hash: string) => `https://testnet.arcscan.app/tx/${hash}`;
export const arcscanAddr = (addr: string) => `https://testnet.arcscan.app/address/${addr}`;
