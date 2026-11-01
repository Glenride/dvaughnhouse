# Tress Column — Work Order for Antigravity — Sunday, November 1, 2026 (Phase 3 Continuation)

**Prepared by:** Janine, at D'Vaughn's direction
**For:** Antigravity, on the iMac
**Tree:** the thinktank-os tree, Tress Column code at `pearls-buildout-2026-10-23/pearls/` (directory and branch names have not changed — see "Name change" below)
**Branch:** `pearls-buildout` (verified November 1, 2026: HEAD `d06fa6b`, Phase 2). Work, commit, and push on `pearls-buildout` only — never commit directly to `main`.
**Status:** This order is self-contained. It supersedes the 2026-10-29 Phase 3 order as the operative instruction for Phase 3, and carries forward every gate and decision from that order. **Phase 3 is AUTHORIZED** — authorized by D'Vaughn on 2026-10-29, and continued under the Tress Column name by his tap on 2026-11-01. The Sepolia rehearsal may proceed, subject to the gates below. Nothing in this order authorizes mainnet, and nothing in it renames contracts, files, or identifiers.

---

## Name change — what this order does and does not do

- **Tress Column is the product name, locked 2026-11-01.** Pearls is the former name. Use "Tress Column" in all new report, documentation, and user-facing copy written under this order.
- **The first launch from the October 30 order, formerly called "Pearl #0," is now the first Tress Column launch.** Its form is unchanged: a Sepolia dummy (see Task 3). Do not launch SPINE under the first-launch name.
- **What does NOT change in this order:** contract, file, branch, and directory names stay exactly as they are — including `PearlHook`, `LaunchLocker`, branch `pearls-buildout`, and path `pearls-buildout-2026-10-23/pearls/`. Renaming those is a separate rename-execution order, still pending his picks (subdomain, contract names, tier names, tagline). Do not rename anything in code, comments, or filenames under this order, and do not invent a subdomain, a ticker, or a tagline.
- **Tagline: none locked.** Do not put any tagline in any copy under this order — not "There's power in Tress Column," not the synthesis recommendations, not any line from the 100-tagline file. A tagline goes in only when he locks one.
- **Dropped names stay dropped.** Never use PLURAL, Dagger, or Buttress Launchpad for this product. Never use the TRES ticker — that spelling (single s) is a different, crowded ticker and is not this product.
- **Unchanged by the rename:** fee rule (configured at inception, then immutable; locked LP → $10M / 0.30%, unlocked → $20K / ~0.58% modeled, exact unlocked figure unconfirmed), tier prices (Plus+ Trader $7 / Creator $27 / Studio $97, monthly only), Sepolia/testnet-only status, and the H-2 correction (brand-agnostic — it is a code fix, not a branding fix).

## Where things stand (verified November 1, 2026, not claimed)

- **Phase 0:** true Uniswap `v4.0.0` pin (`e50237c`), blob-verified.
- **Phase 1:** hook completion — v4-periphery pinned (`v1.0.3` / `3779387`), canonical interfaces, CREATE2 salt mining, fee settlement via `poolManager.take()` proven on fork. Suite 59/59 re-verified by Janine.
- **Phase 2:** security — Aderyn pass (High 2, both triaged; Low 5, accepted), Halmos 11 invariant proofs, 16 adversarial fork tests, security report published. Suite 75/75 re-verified by Janine (45 unit/fuzz + 30 fork).
- **Phase 2 addendum (OPEN, must land first):** the security report's H-2 line claims `LaunchLocker.deposit` is protected by `nonReentrant` — false as committed. Verified November 1 on the iMac: branch `pearls-buildout` is still at `d06fa6b`, `LaunchLocker.deposit` (line 104) carries no `nonReentrant` modifier, and the contract uses no `ReentrancyGuard`; `hasPosition` is set AFTER the `ownerOf` call. Addendum file on the iMac: `PEARLS-WORK-ORDER-PHASE2-ADDENDUM-H2-2026-10-29.md`. Deploy NOTHING until that fix is in and re-verified.
- **Phase 3 decisions, both settled October 30:** first launch = Sepolia dummy (his tap, 13:42 ET); Safe/key path = Antigravity proposes a fully throwaway testnet set (his tap, 13:46 ET). Mission Control task 206 already carries both picks (verified October 31) — do not recreate it, and do not re-home it. It stays under project 27 (Pearls launchpad) / owner 1 (D'Vaughn). Never use project 56 / owner 2 — that is Motion Bot intake routing, and it caused the October 29 watcher misfire.
- **Phase 3 progress to date: none deployed.** No Sepolia deployment has been broadcast, and no throwaway set proposal has been recorded in `BUILD-OUT-REPORT.md`. The H-2 fix and the proposal + Safe approval are both still outstanding, in that order.

## Today's tasks — Phase 3 continuation: Base Sepolia + first Tress Column launch (in order)

**0. Land the H-2 fix FIRST. No deploy from pre-fix code.**
Apply the H-2 addendum: `nonReentrant` on `LaunchLocker.deposit`, full suite green, Aderyn re-run, report lines corrected to match the code, commit + push on `pearls-buildout`. Confirm the modifier is actually on the function (read the code, do not trust the report). Do NOT reorder state before the check — setting `hasPosition` before the `ownerOf` check bricks the one-shot locker on failure. Every step below deploys ONLY from the post-fix commit. If the fix is not in, stop here and report that.

**1. Prerequisites gate — propose the throwaway set, then STOP for Safe approval. Do not substitute.**
Safe/key path was picked October 30: **you propose a fully throwaway testnet set** — do not wait for him to supply a key or Safe. Propose it, then STOP for his approval of the proposed Safe address before any deploy transaction. Before any deploy transaction, confirm ALL of these and record them in the report. If any item is absent, STOP, report exactly what is missing, and do not proceed — do not invent a treasury address, do not deploy with a placeholder, do not use a personal or mainnet key:
- A testnet-only deployer, created fresh for this rehearsal only (never a personal wallet key, never a mainnet key). Present the deployer ADDRESS for approval; keep the key itself on this iMac work machine only — never in chat, never in Mission Control, never committed to git, never sent to Janine.
- Sepolia ETH on the deployer sufficient for the deployment transactions.
- A throwaway test Safe address to use as treasury. **The treasury address is immutable once deployed** — it must be the address D'Vaughn approves, not a guess. If he has not approved the proposed Safe address, stop and say so.
- A working Base Sepolia RPC endpoint.
- `script/Deploy.s.sol` still hard-gated to Base Sepolia (84532) and local Anvil (31337) — verify the gate before running it; do not touch it.

**2. Deploy the factory + hook to Base Sepolia.**
Deploy via `script/Deploy.s.sol` on Base Sepolia only, and only after Task 0 and Task 1 have both cleared. Record in `BUILD-OUT-REPORT.md`: deployed addresses (factory, hook, any auxiliary contracts), transaction hashes, block numbers, deployer address, and the treasury Safe address used. Verify on-chain immediately: the hook address validates its permission flags, the factory-hook wiring matches, the PoolManager binding is the canonical Base Sepolia PoolManager (`0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`), and the fee terms match the locked doctrine (0% below the $10M gate, 0.30% in quote asset only above it).

**3. First Tress Column launch — Sepolia dummy.**
Launch exactly that form and record it as the first Tress Column launch — no SPINE launch under the first-launch name, no placeholder launch, no "temporary" launch that becomes the record. Note: the launch alone does not clear any gate retroactively — no deploy transaction until the H-2 fix (Task 0) is in and the throwaway testnet set has its Safe address approved by D'Vaughn (Task 1).

**4. After the first launch: prove it end to end.**
- The launch certificate renders from on-chain data (not from a local file or a mock).
- The lock is verifiable on-chain (locker state, lock type, timing).
- The trust panel shows live state from the Sepolia deployment.
- Record the evidence: certificate URL/render, lock verification steps + outputs, trust panel state, transaction hashes. If any piece does not prove out, report it as a gap — do not present a partial proof as complete.

**5. Commit and push on branch `pearls-buildout`.**
Commit the deployment record, verification outputs, and report updates; push on the branch where the work runs. Do not merge to `main` yourself — that is D'Vaughn's call. Run the pre-commit language check (`bash check-language.sh` from the repo root) — never commit if it fails.

## Ground truth (verified, do not re-derive — build on it)

- Uniswap v4-core release tag **`v4.0.0` = commit `e50237c43811bd9b526eff40f26772152a42daba`** (2025-01-21), blob-verified. `v4-periphery` pinned at tag `v1.0.3` / rev `3779387` (npm release line; GitHub git tags for that repo are empty).
- Fee settlement is proven on fork: `poolManager.take(quoteCurrency, treasury, fee)`, all 4 directions, pre/post-gate, zero below gate and on the crossing swap.
- Canonical Base Sepolia PoolManager: `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`. Fork-test block used in verification: `49,250,000`.
- `59d3ecf` is a May 2025 main-branch commit, NOT the v4.0.0 tag. Never repeat the "v4.0.0 @ 59d3ecf" claim anywhere.

## Locked rules — D'Vaughn's decisions, not yours to change

If anything below looks wrong, surface it in your report. Do not remove, rename, relabel, or "fix" it on your own.

- **Fee doctrine, frozen:** the fee is configured at inception per launch, then immutable forever. No platform fee until $10M cumulative volume; above the gate, 0.30% in quote asset only (WETH/USDC); the crossing swap pays no fee; the gate is fixed in quote units at deploy (no swap-time oracle). Tier 1 Patient (locked/burned LP): $10M gate / 0.30%. Tier 3 Uncommitted (no lock): $20K gate / ~0.58% modeled — exact figure unconfirmed, do not hard-code it as locked.
- **No admin keys, no owner, no setters, no pause, no proxy, no upgrade path.** Core contracts have none and gain none.
- **Do not change fee constants, the $10M gate, or lock minimums to make tests pass.** If a design point seems wrong, flag it in the report.
- **Base Sepolia ONLY in this phase. No mainnet, ever, in this order.** Testnet-only deployer key; never a personal wallet key. `script/Deploy.s.sol` gate untouched.
- **Treasury is immutable once deployed.** Only the approved throwaway test Safe address. No placeholder, no guess.
- **Canonical tree untouched.** `~/workspace/your_files/pearls/` (Janine's canonical copy) stays untouched — sync is D'Vaughn's call. Do not rename that tree under this order.
- **Naming, everywhere including code comments and variable names in NEW copy:** Tress Column for the product (formerly Pearls). Never use: "sovereign", "ventures", or "institute" for Glenride. No tagline until he locks one. No dropped names (PLURAL, Dagger, Buttress Launchpad). No TRES ticker. User-facing copy never says "AI" — users get help from "the Assistant". (This work order is internal; the rule binds anything user-facing you write. Contract and file identifiers stay as-is under this order — see "Name change" above.)
- **Honest status, always:** nothing is claimed as live, deployed, audited, or counted until it is. No fabricated testimonials, stats, or endorsements. No third-party audit is claimed until one exists. A Sepolia deployment is a rehearsal, never "the launch" — mainnet language stays out of every report line until D'Vaughn says otherwise.

## Non-goals for today

No mainnet. No Phase 4 surfaces (landing page, terminal, Plus+ portal, Ops console — those build against real Sepolia launches on a later order). No grant applications (those unlock once Sepolia exists; they are the NEXT step after this phase proves out, not part of it). No multi-network PoolManager parameterization (carried gap, his schedule). No canonical-tree edits. No fee/gate/lock changes. No rename execution (subdomain, contract names, tier names, tagline — separate order, his picks pending). No Mission Control re-homing or recreation (task 206 already carries the settled picks).

## Open decisions — D'Vaughn's calls, not yours (do not decide them in code)

Rename execution: subdomain LOCKED 2026-11-01 (tc.dvaughnhouse.com, his tap; redirect DECIDED 2026-11-01: pearls.dvaughnhouse.com redirects to tc, not a full cutover — implementation gated on the tc site being live, overhaul execution not ordered by that tap) · contract names (PearlHook, LaunchLocker) · tier names · tagline (none locked) · trading-terminal routing fee · landing-page waitlist/notify path · Plus+ portal auth · canonical-tree sync · multi-network parameterization schedule.

## Report back (required, in BUILD-OUT-REPORT.md)

- H-2 fix confirmation (modifier present on `deposit`, suite + Aderyn re-run, report lines corrected) + post-fix commit hash deployed from.
- Prerequisites: the proposed throwaway set (deployer address, Safe address, Sepolia ETH, RPC), and the record of D'Vaughn's Safe approval — or what was missing if stopped. Never report a private key.
- Deployment record: addresses, transaction hashes, block numbers, deployer, treasury Safe.
- On-chain verification outputs for Task 2.
- First Tress Column launch status: launched per his pick (Sepolia dummy) with full evidence (Task 4), or explicitly held with the gate that is still blocking it.
- Remaining gaps, if any.

Janine independently re-verifies all of it (on-chain checks + suite re-run) before anything is reported to D'Vaughn as sound. Report findings; do not soften them.

## Definition of done for today

- H-2 fix landed and verified; deployment from the post-fix commit only.
- Throwaway testnet set proposed and its Safe address approved by D'Vaughn before any deploy transaction.
- Factory + hook deployed to Base Sepolia and verified on-chain (or a precise stopped report naming the missing prerequisite).
- First Tress Column launch (Sepolia dummy) proven end to end — or explicitly held with the blocking gate named.
- Report updated, commit pushed on `pearls-buildout`, language check passed.
- Nothing on mainnet, nothing claimed beyond what the chain proves, nothing renamed in code or filenames under this order.
