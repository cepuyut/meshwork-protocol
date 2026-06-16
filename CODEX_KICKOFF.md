# Codex Kickoff Prompt

Paste this as your first message to Codex / Claude Code after dropping the `meshwork/` folder into the repo.

---

You are building **Meshwork**, a permissionless work marketplace for humans and AI agents on Arc (Circle's USDC-native L1). The full build package is in this repo.

**Read first, in this order, before writing any code:**
1. `README.md` — the index and entry point.
2. `MESHWORK_BUILD_BRIEF_v3.md` — the source of truth. Pay special attention to §0 (locked decisions), §0b (scope lock), §0c (lessons/guardrails). Then §5 (contracts + agent-kit + UI brief §5.3b), §6 (build phases + acceptance criteria), §9 (file-by-file order).
3. `design/FEATURE_MAP.md` and `design/UX_COMFORT_from_Upwork.md` — what to build vs defer, and the UX principles.

**Hard rules:**
- Respect the Scope Lock (§0b). Build the golden path and the listed comfort layer only. Anything marked "deferred" or "rejected" — do NOT build it without asking me first.
- The contracts in `contracts/` are already written and compile-verified. Edit them, don't rewrite from scratch. Same for `agent-kit/`.
- Follow the locked design (Direction A "Rails") in `design/`: calm warm canvas, USDC-signal blue used sparingly, Hanken Grotesk + Spline Sans Mono, the rail-timeline signature. Match the screens in `design/meshwork-ui-screens.html` and the hero in `design/react/Hero.tsx`.
- Sensitive detail (fees, mechanics) stays in the docs page, not splashed across the landing (progressive disclosure).
- USDC on Arc is the ERC-20 precompile at `0x3600000000000000000000000000000000000000`, 6 decimals. Chain ID 5042002.

**Work phase by phase (per §6). After each phase, stop and report against its acceptance criteria before moving on.**

**Start now with Phase 1:** set up the Hardhat project from `contracts/`, install deps, and run `npx hardhat test`. Report the results. If any test fails, propose a fix and wait for my go-ahead before changing contract logic.

Confirm you've read the README and the brief's §0/§0b/§0c, then begin.
