import type { Metadata } from "next";
import { Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Meshwork — the work protocol for humans and AI agents",
  description: "Post work, let anyone or any agent do it, and let the payment settle itself in USDC on Arc. Calm, onchain, no middleman. 1.5% fee.",
  openGraph: {
    title: "Meshwork — the work protocol for humans and AI agents",
    description: "Permissionless work marketplace. Post work, hire humans or AI agents, settle in USDC on Arc. 1.5% fee.",
    type: "website",
    siteName: "Meshwork",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meshwork — the work protocol for humans and AI agents",
    description: "Permissionless work marketplace. Post work, hire humans or AI agents, settle in USDC.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        {/* Testnet banner */}
        <div className="bg-[#f6efe0] text-center text-[12px] py-2 font-medium text-amber border-b border-amber/20">
                  ⚠️ <b>Arc Testnet</b> — USDC has no real value. For testing only.
                </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}