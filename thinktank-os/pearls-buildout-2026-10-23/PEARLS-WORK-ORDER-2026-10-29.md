# Pearls — Work Order for Antigravity — Thursday, October 29, 2026

**Prepared by:** Janine, at D'Vaughn's direction
**For:** Antigravity, on the iMac
**Tree:** the thinktank-os tree (`~/projects/dvaughnhouse/thinktank-os`), Pearls code at `pearls-buildout-2026-10-23/pearls/`
**Branch:** `pearls-buildout` (exists locally and on origin, currently at `f46ba91`). Work, commit, and push on `pearls-buildout` only — never commit directly to `main`.
**Status:** This order is self-contained for today. It supersedes the 2026-10-28 work order as the operative instruction. Phase 0 is done (see below) — today's job is Phase 1, PearlHook completion.

---

## Where things stand (verified, not claimed)

**Phase 0 is DONE and independently verified — do not redo it.**
- The 2026-10-28 order was run and merged: `f46ba91` ("Phase 0 true Uniswap v4.0.0 pin @e50237c and IPoolManager struct alignment"), merged to `main` as `b72f0dc`.
- Janine independently verified it 2026-10-29: `lib/v4-core` blob hashes match the true `v4.0.0` tag byte-for-byte (`src/interfaces/IPoolManager.sol` = `85703ef79d0271f9a8816cfd7cf7a5c63e28a706`, `src/PoolManager.sol` = `c24fbc0ea6c31791617b3e15ce21d585ebd5fdf2`); `foundry.lock` reads `lib/v4-core` tag `v4.0.0`, rev `e50237c43811bd9b526eff40f26772152a42daba`; all 5 files import from `IPoolManager.sol`; `BUILD-OUT-REPORT.md` §§1.1/4.2 corrected and the `59d3ecf` claim retracted.
- Full suite re-run against the true pin: **59 tests passed, 0 failed, 0 skipped** (5 suites, 4 test files: `Pearls.t.sol`, `PearlHook.t.sol`, `PearlHookForkTest`, `PearlHookRouterForkTest`, `AttestationRegistryTest` — 45 unit/fuzz + 14 fork, fork tests against the public Base Sepolia RPC `https://sepolia.base.org`).
- The old 59-vs-53 count discrepancy is resolved: 59 is the iMac tree's real count, reproduced independently. The 53 figure was measured on Janine's VM canonical tree (`~/workspace/your_files/pearls/`), a different tree state. Canonical-tree sync is D'Vaughn's call, not yours.

**One toolchain finding — fix it first (Task 0 below):** Foundry is NOT installed on the iMac (`~/.foundry/bin/` does not exist, no `forge` on PATH). The verification above ran on a copy of the iMac tree elsewhere. You need a working `forge` where you work before Phase 1 can be verified.

## Today's tasks — Phase 1: PearlHook completion (the critical path)

For each item, first assess what is already present (some pieces have tests already — e.g. a hook-miner test exists), then complete what is missing. Report per item what was already there vs what you built. Never weaken a test to make it pass.

**0. Establish the toolchain on the iMac.**
Install Foundry (foundryup) on the iMac, verify `forge --version` and a clean `forge build` in `pearls-buildout-2026-10-23/pearls/`. If you run the suite anywhere else, say exactly where and why.

**1. Pin v4-periphery.**
`foundry.lock` currently carries `lib/v4-periphery` at rev `3779387e5d296f39df543d23524b050f89a62917` with NO tag — it floats. Identify the release tag that rev belongs to (or the correct release tag to pin), pin it the same way v4-core is pinned (tag + rev in `foundry.lock`), and re-verify the full suite. Do not float versions. If pinning periphery surfaces API differences, fix minimally and report them.

**2. Replace mirrored callback signatures with the canonical v4 interfaces.**
Wherever PearlHook/PearlHookCore mirrors v4 callback signatures instead of using the canonical interfaces, replace the mirrors. No behavior change beyond the interface alignment; report every file touched.

**3. Complete CREATE2 salt mining so the hook address encodes its callback permissions.**
Verify the existing miner against the hook's actual permission flags; complete it if it is partial, and prove a mined address deploys with exactly the intended flags (and that an unmined address is rejected — the existing test names this behavior; keep it green).

**4. Implement fee settlement inside the unlock context — the core of this phase.**
The hook must actually TAKE the fee via `PoolManager.take()` / `settle()`, not compute it and claim a delta of 0. Quote math alone is not settlement: prove on a forked pool that fees move to the right party in all four direction cases (buy/sell × exact-in/exact-out), pre- and post-gate, and that nothing is taken below the gate. This is the item the whole phase stands or falls on.

**5. Run the spec §7.3 fork-test matrix against a Base Sepolia fork.**
4 direction cases × gate state × guard state, on the fork (public `https://sepolia.base.org` is the default when no `BASE_SEPOLIA_RPC_URL` is set). All fork tests green, including the router-path fork tests and the guard-window cases. Report exact counts per suite.

**6. Commit and push on branch `pearls-buildout`.**
A fix that is live but uncommitted is not done. Commit and push on the branch where it runs. Do not merge to `main` yourself — that is D'Vaughn's call.

## Ground truth (verified, do not re-derive — build on it)

- Uniswap v4-core release tag **`v4.0.0` = commit `e50237c43811bd9b526eff40f26772152a42daba`** (2025-01-21). Verified by blob hash, above.
- In true v4.0.0, `SwapParams` and `ModifyLiquidityParams` live in **`src/interfaces/IPoolManager.sol`**. The file `src/types/PoolOperation.sol` **does not exist** in v4.0.0.
- `59d3ecf53afa9264a16bba0e38f4c5d2231f80bc` is a **May 2025 main-branch commit**, NOT the v4.0.0 tag. Never repeat the "v4.0.0 @ 59d3ecf" claim anywhere.
- The aggregator work (commit `958dccb`) is real and passing, verified against the true pin as part of the 59 above. The 2026-10-23 aggregator-hooks prompt (router-path matrix, guard-window characterization, quote-competitiveness benchmark, factory tier restriction, launch-event completeness, seeding shape) is a SEPARATE pending item awaiting D'Vaughn's paste — it is NOT part of today's tasks unless he says so.

## Locked rules — D'Vaughn's decisions, not yours to change

If anything below looks wrong, surface it in your report. Do not remove, rename, relabel, or "fix" it on your own.

- **Fee doctrine, frozen:** the fee is configured at inception per launch, then immutable forever. No platform fee until $10M cumulative volume; above the gate, 0.30% in quote asset only (WETH/USDC); the crossing swap pays no fee; the gate is fixed in quote units at deploy (no swap-time oracle). Tier 1 Patient (locked/burned LP): $10M gate / 0.30%. Tier 3 Uncommitted (no lock): $20K gate / ~0.58% modeled — exact figure unconfirmed, do not hard-code it as locked.
- **No admin keys, no owner, no setters, no pause, no proxy, no upgrade path.** Core contracts have none and gain none.
- **Do not change fee constants, the $10M gate, or lock minimums to make tests pass.** If a design point seems wrong, flag it in the report.
- **Testnet/local only.** Never point anything at mainnet. Deployment anywhere — including Sepolia — is D'Vaughn's explicit call, not part of today's work. `script/Deploy.s.sol` is hard-gated to Base Sepolia (84532) and local Anvil (31337); do not touch that gate.
- **Canonical tree untouched.** `~/workspace/your_files/pearls/` (Janine's canonical copy) stays untouched — sync is D'Vaughn's call.
- **Naming, everywhere including code comments and variable names:** Pearls, always plural. The gold colour and Studio seal are Abyssal Gold. Never use: "sovereign", "ventures", or "institute" for Glenride. User-facing copy never says "AI" — users get help from "the Assistant". (This work order is internal; the rule binds anything user-facing you write.)
- **Honest status, always:** nothing is claimed as live, deployed, audited, or counted until it is. No fabricated testimonials, stats, or endorsements. No document may claim the hook is complete until the §7.3 fork-test matrix passes against the true pin.

## Non-goals for today

No deploy. No Sepolia rehearsal (that is Phase 3, D'Vaughn's gate). No mainnet. No Phase 2 security work (Aderyn/Halmos/adversarial tests come after completion, on the next order). No changes to fee invariants, guard windows, or lock minimums. No canonical-tree edits. No landing-page work (already live at pearls.dvaughnhouse.com).

## Open decisions — D'Vaughn's calls, not yours (do not decide them in code)

Pearl #0 (SPINE manual deploy vs Sepolia dummy) · routing fee · waitlist path · Plus+ portal auth · canonical-tree sync. If your work touches one, leave the current behavior intact and flag it.

## Report back (required, in BUILD-OUT-REPORT.md)

- Toolchain: where `forge` now runs on the iMac (or where the suite ran, if not the iMac) + `forge --version`.
- Per Phase 1 item: what was already present vs what you built, files touched, and any API differences the periphery pin surfaced.
- Exact test counts per suite (forge, incl. fork matrix), and the settlement proof: fees taken on fork in all four directions, pre- and post-gate, zero below the gate.
- Remaining gaps, if any.

Janine independently re-verifies all of it (blob-hash vs the tag + full suite re-run) before anything is reported to D'Vaughn as sound. Report findings; do not soften them.

## Definition of done for today

- `forge` works on the iMac; `forge build` clean against true v4.0.0 + pinned periphery.
- `forge test` fully green including the §7.3 fork-test matrix; settlement proven on fork, not just quote math.
- Report updated, commit pushed on `pearls-buildout`.
- Nothing deployed, nothing claimed beyond what the run proves.
