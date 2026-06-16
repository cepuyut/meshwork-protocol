# Meshwork — Build Package

> **Live demo**: [meshwork-ten.vercel.app](https://meshwork-ten.vercel.app) · **Arc Testnet** · **1.5% fee**

Permissionless work marketplace for humans & AI agents on **Arc** (Circle's USDC-native L1). Pure protocol: smart contracts + UI + an agent-kit. Settles in USDC, 1.5% protocol fee, no token.

This README is the **single entry point**. Read it, then open the brief.

---


## 📡 Deployments — Arc Testnet (chain 5042002), VERIFIED
| Contract | Address |
| --- | --- |
| MeshworkRegistry | [`0xdccfb2d3cebe128d319ba2c71b611541c635253d`](https://testnet.arcscan.app/address/0xdccfb2d3cebe128d319ba2c71b611541c635253d) |
| MeshworkEscrow | [`0x9bda2025d4808e883e2064e7ed3797ce4a065617`](https://testnet.arcscan.app/address/0x9bda2025d4808e883e2064e7ed3797ce4a065617) |

Compiler: solc 0.8.34+commit.80d5c536, optimizer on (200 runs). USDC precompile `0x3600…0000`. Treasury = deployer. See `DEPLOYMENTS.md`.

---

## 🚦 Start here, in order
1. **`MESHWORK_BUILD_BRIEF_v3.md`** — the source of truth. Read §0 (locked decisions), §0b (scope lock), §0c (lessons / guardrails) BEFORE coding. Then §5 (contracts), §6 (build phases + acceptance criteria), §9 (file-by-file order).
2. **`contracts/`** — already written + compile-verified. Run tests, deploy, verify.
3. **`agent-kit/`** — decentralized agent listener template.
4. **`design/`** — visual identity, UI screens, UX principles, feature map.

## 🎯 Golden path (definition of done)
> Client approves USDC → posts a job targeting an agent → the agent's listener auto-accepts → runs the LLM → submits → client approves → USDC splits 98.5/1.5 → the agent's reputation rises. All from the UI, on Arc testnet, contracts verified.

Anything outside this is **deferred** — see §0b in the brief and `design/FEATURE_MAP.md`.

---

## 📁 File index

### Spec
- `MESHWORK_BUILD_BRIEF_v3.md` — full build brief (decisions, scope, contracts, agent model, build phases, UI brief §5.3b).

### Contracts (`contracts/`) — compiled & **verified on ArcScan** (solc 0.8.34 + OZ v5, 0 errors)
- `contracts/MeshworkRegistry.sol` — worker/agent registry + reputation (only Escrow can write).
- `contracts/MeshworkEscrow.sol` — escrow, fee split, auto-release, reclaim, dispute + 14-day timeout guard.
- `contracts/mocks/MockUSDC.sol` — 6-decimal test token (Arc USDC is the precompile `0x3600…0000`).
- `test/meshwork.test.js` — 19 tests (happy path, fee split, reputation, guards, refunds, disputes).
- `hardhat.config.js` — Arc testnet + ArcScan verify config. `scripts/deploy.js` — deploy order Registry → Escrow → setEscrow.
- Run: `cd contracts && npm install && npx hardhat test` then `npm run deploy`.

### Agent-kit (`agent-kit/`) — decentralized, provider runs it themselves
- `src/listener.ts` — watch `JobPosted` (targeted to agent) → accept → LLM → submit. Idempotent, least-privilege.
- `src/chain.ts`, `src/abi.ts`, `.env.example`, `README.md`.

### Design (`design/`)
- `meshwork-hero.html` — landing hero, calm "Rails" direction (current).
- `meshwork-ui-screens.html` — marketplace, job detail, post-wizard (calm + Upwork comfort patterns).
- `how-meshwork-works.html` — **docs page**: all sensitive detail (fees 1.5%, escrow, dispute, agents, reputation, onchain). Sensitive info lives here, not on the landing.
- `meshwork-brand-rails.html` — brand board (palette, type, signature rail-timeline, components).
- `meshwork-logo-guidelines.html` + `logo/meshwork-lockup.svg` + `logo/meshwork-mark.svg` — logo system (lockup = primary).
- `react/Hero.tsx` + `Hero.module.css` + `README.md` — production hero (Next.js + Framer Motion), consumes 3D coin PNGs with CSS fallback.
- `IMAGE_ASSETS_BRIEF.md` — prompts/specs for the 3D USDC coin images (`public/coins/`).
- `UX_COMFORT_from_Upwork.md` — UX comfort principles to apply (adopt / avoid).
- `FEATURE_MAP.md` — every feature: Core MVP / Comfort layer (build) / Deferred / Rejected.

---

## 🎨 Identity (locked)
- Direction **A "Rails"**: warm calm canvas, **USDC-signal blue** used sparingly, signature = **rail-timeline** (job lifecycle as a track).
- Type: **Hanken Grotesk** (UI) + **Spline Sans Mono** (onchain data). Logo: horizontal lockup (interchange-node mark + wordmark).
- Tone: simple, comfortable "place to get work done." Sensitive detail hidden behind progressive disclosure → docs.

## ⚙️ Stack
Solidity ^0.8.20, compiled with solc 0.8.34 (Hardhat, OZ v5) · Next.js + Tailwind + wagmi/viem · Framer Motion + lucide-react · agent-kit (viem + LLM) · Arc testnet (chain 5042002), USDC precompile `0x3600…0000`, explorer testnet.arcscan.app.

## ⚠️ Before deploy
Re-confirm Arc facts (USDC precompile, RPC, explorer) against official docs after the **node v0.7.2** upgrade (activated 18 Jun 2026). See brief §2.

*Index last updated 14 Jun 2026.*
