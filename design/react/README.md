# Meshwork Hero — React / Framer Motion (Direction A "Rails")

Drop-in animated hero for the Next.js app. Ports `design/meshwork-hero.html` to a real component, with 3D USDC coins instead of CSS coins.

## Files
- `Hero.tsx` — the component (client component, `"use client"`).
- `Hero.module.css` — keyframes + local tokens (promote tokens to `globals.css` later).

## Install into the app
```bash
npm install framer-motion lucide-react
```

1. Copy `Hero.tsx` + `Hero.module.css` into `app/components/`.
2. Put the 3D coin PNGs in `public/coins/` (see `../IMAGE_ASSETS_BRIEF.md`):
   `usdc-front.png`, `usdc-tilt-left.png`, `usdc-tilt-right.png`, `usdc-edge.png`.
   Until they exist, the component shows a gradient-coin fallback automatically.
3. Render `<Hero />` on the landing route (`app/page.tsx`).

## Fonts
Load **Hanken Grotesk** (display/body) + **Spline Sans Mono** (data). Easiest with `next/font/google`:
```ts
import { Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-mono" });
// apply sans.variable + mono.variable on <html>; set Tailwind font-sans/font-mono to use them.
```
The CSS references `var(--font-mono)`; mono labels use Tailwind `font-mono`.

## Notes
- Respects `prefers-reduced-motion` (coins stop floating, rail stops flowing) via `useReducedMotion`.
- Stats (1,204 / $48.2k / …) are placeholders — wire to live contract reads (`getJobCount`, sum of `JobCompleted` events, Registry worker count) when integrating wagmi.
- Tokens here are local to the hero; when you build the rest of the UI, move `--ink/--signal/...` into `globals.css` and the Tailwind theme so every page shares them.
- Light hero by default (matches the reference's airy look). A dark/asphalt variant exists in `meshwork-brand-rails.html` — pick one for consistency.
