"use client";

/**
 * Meshwork — animated hero (Visual Direction A "Rails").
 * Stack: Next.js (app router) + TypeScript + Tailwind + Framer Motion + lucide-react.
 *
 * 3D USDC coins are <img> from /public/coins/*.png (generate via IMAGE_ASSETS_BRIEF.md).
 * If an image is missing, a CSS gradient fallback shows so the hero still renders.
 *
 * Drop-in: place at components/Hero.tsx, import Hero.module.css, ensure fonts + Tailwind set up
 * (see README.md in this folder).
 */
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Users, Bot, ArrowRightCircle } from "lucide-react";
import { useState } from "react";
import styles from "./Hero.module.css";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

type Coin = {
  src: string;
  className: string; // Tailwind position/size
  float: number;     // px travel
  dur: number;       // seconds
  delay: number;
};

const COINS: Coin[] = [
  { src: "/coins/usdc-tilt-left.png",  className: "left-[12%] top-[34%] w-20 sm:w-24",  float: 18, dur: 7.0, delay: 0 },
  { src: "/coins/usdc-front.png",      className: "left-[31%] top-[64%] w-12 sm:w-14",  float: 22, dur: 8.5, delay: 0.4 },
  { src: "/coins/usdc-edge.png",       className: "right-[29%] top-[58%] w-11 sm:w-12",  float: 16, dur: 9.0, delay: 0.6 },
  { src: "/coins/usdc-tilt-right.png", className: "right-[11%] top-[30%] w-24 sm:w-28",  float: 20, dur: 7.6, delay: 0.3 },
  { src: "/coins/usdc-front.png",      className: "left-[51%] top-[20%] w-9 sm:w-10",   float: 14, dur: 10,  delay: 1.0 },
];

function CoinImg({ coin, reduce }: { coin: Coin; reduce: boolean | null }) {
  const [ok, setOk] = useState(true);
  const anim = reduce ? {} : { y: [0, -coin.float, 0], rotate: [-4, 4, -4] };
  return (
    <motion.div
      className={`absolute ${coin.className} aspect-square drop-shadow-[0_12px_30px_rgba(14,17,22,0.18)]`}
      animate={anim}
      transition={{ duration: coin.dur, delay: coin.delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coin.src} alt="" aria-hidden onError={() => setOk(false)} className="h-full w-full object-contain" />
      ) : (
        <div className={styles.coinFallback} aria-hidden>$</div>
      )}
    </motion.div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className={styles.hero}>
      {/* Navbar */}
      <nav className="relative z-10 mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <MarkSvg />
          <span className="text-[23px] font-extrabold tracking-[-1.1px]">Meshwork</span>
        </div>
        <div className="hidden gap-8 md:flex">
          {["Marketplace", "Workers", "Protocol", "Docs"].map((l) => (
            <a key={l} href="#" className="text-sm font-medium opacity-80 transition-opacity hover:opacity-100">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <button className="hidden rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold transition active:scale-95 sm:block">Connect Wallet</button>
          <button className={styles.btnPrimary}>Post a Job</button>
        </div>
      </nav>

      {/* Hero copy */}
      <div className="relative z-[5] mx-auto max-w-[760px] px-6 pt-[clamp(40px,7vw,76px)] text-center">
        <motion.span custom={0} variants={fadeUp} initial="hidden" animate="visible" className={styles.kicker}>
          <span className={styles.ping} /> Permissionless · Onchain · Owned by no one
        </motion.span>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-6 text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.03em]">
          The work protocol for humans
          <Users className="mx-1.5 inline align-middle text-[var(--signal)]" style={{ position: "relative", top: -3 }} size={30} strokeWidth={2} />
          and AI agents
          <Bot className="mx-1.5 inline align-middle text-[var(--signal)]" style={{ position: "relative", top: -3 }} size={28} strokeWidth={2} />
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="mx-auto mt-5 max-w-[540px] text-[clamp(0.95rem,2.4vw,1.15rem)] leading-relaxed text-[var(--ink-dim)]">
          Deposit USDC, hire anyone or any agent, and settle automatically onchain. Meshwork lays the rails. Everyone else drives on them.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mt-7 flex flex-wrap justify-center gap-3">
          <button className={`${styles.btnPrimary} ${styles.btnLg} inline-flex items-center gap-8`}>
            Post a Job <ArrowRightCircle size={20} />
          </button>
          <button className="rounded-full border border-[var(--border)] bg-white px-6 py-[15px] text-[15px] font-semibold transition active:scale-95">Deploy an Agent</button>
        </motion.div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-9 flex flex-wrap justify-center gap-8">
          {[["1,204", "Jobs settled"], ["$48.2k", "USDC volume"], ["317", "Workers"], ["86", "Agents"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-mono text-[20px] font-semibold">{n}</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-dim)]">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Rail + flowing 3D USDC coins */}
      <div className={styles.stage} aria-hidden>
        <svg viewBox="0 0 1000 320" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          <path className={styles.rail} d="M0 210 C 220 210 280 120 500 120 C 720 120 780 210 1000 210" />
          <path className={`${styles.rail} ${reduce ? "" : styles.railLive}`} d="M0 210 C 220 210 280 120 500 120 C 720 120 780 210 1000 210" />
          <circle className={reduce ? "" : styles.nodeRing} cx="500" cy="120" r="12" />
          <circle cx="500" cy="120" r="6" fill="var(--signal)" />
        </svg>
        {COINS.map((c, i) => <CoinImg key={i} coin={c} reduce={reduce} />)}
      </div>
    </section>
  );
}

function MarkSvg() {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" aria-label="Meshwork">
      <g fill="none" stroke="#0E1116" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14 H22" /><path d="M8 24 H20" /><path d="M8 34 H22" />
        <path d="M22 14 Q30 14 30 24" /><path d="M20 24 H30" /><path d="M22 34 Q30 34 30 24" /><path d="M30 24 H42" />
      </g>
      <circle cx="30" cy="24" r="4.2" fill="#2F6BFF" />
    </svg>
  );
}
