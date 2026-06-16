import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, walletConnect } from "wagmi/connectors";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.arc.network";
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

// Arc Testnet — USDC is the native gas token (18 decimals native; ERC-20 interface 6 decimals at 0x3600...0000)
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected(), walletConnect({ projectId: WC_PROJECT_ID })],
  transports: { [arcTestnet.id]: http(RPC) },
  ssr: true,
});
