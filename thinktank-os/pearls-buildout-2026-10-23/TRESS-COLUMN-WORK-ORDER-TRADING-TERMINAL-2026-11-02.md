# Tress Column — Work Order for Antigravity — Monday, November 2, 2026 (Trading Terminal)

**Prepared by:** Janine, at D'Vaughn's direction
**For:** Antigravity, on the iMac
**Tree:** the thinktank-os tree, Tress Column code at `pearls-buildout-2026-10-23/pearls/` (directory and branch names have not changed)
**Branch:** `pearls-buildout` (verified November 2, 2026: HEAD `c04b516`, post-H-2 fix). Work, commit, and push on `pearls-buildout` only — never commit directly to `main`.
**Status:** This order is self-contained. It is AUTHORIZED by D'Vaughn on 2026-11-02 ("move forward with building trade [terminal for] Tress Column"). It builds the Trading Terminal surface only. It does not authorize a Sepolia deploy, a mainnet step, a contract change, a contract rename, or a public deploy of the terminal itself — the public-deploy step is held for his preview approval (see Task 4).

---

## What "trade" means here

"Trade" is read as the Trading Terminal — the Phase 4 v1b surface in the PRD (§ Phase 4, item 2). If D'Vaughn meant a different surface, this order stops and he corrects the read; nothing in it renames or re-scopes another surface.

## Where things stand (verified November 2, 2026, not claimed)

- **Live site:** `https://tc.dvaughnhouse.com/` returns 200, title "Tress Column"; `https://pearls.dvaughnhouse.com/` returns 301 to `tc`. The live page lists the Trading Terminal only as a fast-follow surface "after launches exist" — it is not a live product.
- **Terminal status: designed only, not built.** PRD v1.0 (2026-10-27) § Phase 4 item 2 is the design; no terminal code exists in the iMac `pearls/` tree (the only `console*` files there are Foundry build artifacts, not a product console). Nothing on the live site trades anything.
- **Phase 3 (the terminal's dependency) is NOT deployed yet — this order does not fix that:**
  - H-2 fix LANDED November 1, 18:04 ET (`defb9f0`): `LaunchLocker.deposit` now carries `nonReentrant` (verified, line 105), with Aderyn re-run and report corrected.
  - Safe APPROVED November 1, 19:18 ET: throwaway test Safe treasury `0x2683bc585BEd0cAc0B232bbEd0e3127757EDc74B`; deployer `0xE33906173fD81b4b8aB6B6C78Cd2262B15BFEE20`; RPC `https://sepolia.base.org` (chain 84532); `script/Deploy.s.sol` gate verified.
  - Deploy BLOCKED on two gates recorded in `BUILD-OUT-REPORT.md` §7.3 (`c04b516`): (1) deployer balance is 0 ETH — it needs ~0.02–0.05 Base Sepolia testnet ETH for gas; (2) EIP-170 size limit — `LaunchFactory` runtime is 27,495 bytes, over the 24,576-byte maximum by 2,919 bytes. Per the locked rules, that structural finding is reported, not redesigned unilaterally. **This order does not touch `LaunchFactory`, `Deploy.s.sol`, or any contract to work around the size gate.** If terminal work surfaces a contract change, report it — do not make it.
  - Consequence for this order: there is no real Sepolia launch for the terminal to trade yet. Build and test against fork/local data (Task 2), show an honest empty state for Tress Column launches, and hold the "works against real Sepolia launches" acceptance check until Phase 3 unblocks. Never fill the gap with fabricated tokens, volume, or prices.
- **Locked facts carried forward:** product name Tress Column (locked 2026-11-01); fee doctrine configured at inception, then immutable — locked LP → $10M gate / 0.30% in quote asset only, unlocked → $20K / ~0.58% modeled (exact unlocked figure unconfirmed, do not hard-code it as locked); launch tier Platinum (burn/lock 180d+, $10M, 0.30%) LOCKED 2026-11-02, Gold PROPOSED (not locked), Silver modeled; canonical Base Sepolia PoolManager `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`; fork-test block used in verification: 49,250,000. Contract names `PearlHook` / `LaunchLocker` are still pending his picks — do not rename them in code, comments, or filenames under this order.

## Tasks — in order

**0. Inventory first. No new code yet.**
Confirm in the report: (a) the PRD § Phase 4 item 2 design lines you are building from; (b) the existing fork-test pools and PoolManager bindings you will test against; (c) every place the live tc page mentions the terminal, so the new surface does not contradict the live page's "after launches exist" line until a launch exists. If the iMac tree does not hold the current tc page source, say so and stop before rewriting the live page — do not rebuild it from a stale copy.

**1. Build the terminal — non-custodial frontend routing only.**
- Tress Column launches swap against their Uniswap v4 PoolManager pools through PearlHook, under the locked fee rule: 0% below the gate, 0.30% in quote asset only at/above it, and **no additional Tress Column fee on Tress Column pools**.
- Other Base tokens route via standard DEX routing (Uniswap v4 router, Odos, or 1inch API) — frontend routing only. **Tress Column never takes custody; the trader signs their own swap.** No wallet, key, or approval flow that gives the terminal custody, and no server-side swap execution.
- Token page displays, all derived from on-chain / AMM data, never invented: AMM-derived depth, candlestick chart, volume-gate progress, and a certificate link on every token page (certificate renders from on-chain data, not a local file or mock).
- **Routing fee: PROPOSED, not locked — build it as OFF.** The PRD proposal is 0.05–0.1% on non-Tress Column Base swaps only. Do not charge it, do not present it as locked, and do not bury it in a quote. Build the fee point as a single, clearly flagged, disabled switch so that if he locks a fee later it is one deliberate change, with disclosure copy he approves. Price, disclosure, and whether to charge it at all remain his calls.
- **Hosting path: do not invent one.** The PRD's old `pearls.xyz/trade` reference is stale — the product now lives at `tc.dvaughnhouse.com`. Build the surface in the working tree and report a proposed hosting path for his pick; do not attach a new subdomain, do not publish a `/trade` path to the live site, and do not deploy the terminal publicly under this order (see Task 4).

**2. Test against real chain data shapes — no fake demo, no simulated swap.**
- Test on a Base Sepolia fork (the verification block above) and local Anvil: quote → sign → swap flow against fork pools, gate progress pre/post-gate and on the crossing swap (which pays no fee), certificate link resolving to on-chain launch terms.
- Until a real Sepolia launch exists, the Tress Column launches list shows an honest empty state (no launches yet), not placeholder tokens. No mock terminal, no simulated swap, no fabricated volume, price, or testimonials anywhere in the surface — the PRD's honest-status rule binds every screen.
- Run the pre-commit language check (`bash check-language.sh` from the repo root) — never commit if it fails.

**3. Commit and push on branch `pearls-buildout`.**
Commit the terminal code, test outputs, and report updates; push on the branch where the work runs. Do not merge to `main` yourself — that is D'Vaughn's call. Do not touch Janine's canonical copy (`~/workspace/your_files/pearls/`) — sync is D'Vaughn's call.

**4. Preview, then STOP for his public-deploy approval.**
Deliver a preview (staging/preview URL or local run he can open) with the report below, then stop. Public deploy to `tc.dvaughnhouse.com` (or any new subdomain/path) happens only after he approves the preview — a public trading surface is his gate, not a build-step default.

## Locked rules — D'Vaughn's decisions, not yours to change

If anything below looks wrong, surface it in your report. Do not remove, rename, relabel, or "fix" it on your own.

- **Fee doctrine, frozen** (see "Where things stand"). Do not change fee constants, the $10M gate, or lock minimums to make tests pass.
- **No admin keys, no owner, no setters, no pause, no proxy, no upgrade path** in core contracts — and the terminal adds none.
- **Base Sepolia ONLY in this phase. No mainnet, ever, in this order.** Testnet-only keys; never a personal wallet key. `script/Deploy.s.sol` gate untouched.
- **Canonical tree untouched.** Janine's canonical copy stays untouched; sync is D'Vaughn's call.
- **Naming, new user-facing copy only:** Tress Column for the product (formerly Pearls). No tagline until he locks one (none is locked). Never use: "sovereign", "ventures", or "institute" for Glenride. Never use the dropped names (PLURAL, Dagger, Buttress Launchpad) or the TRES ticker. User-facing copy never says "AI" — users get help from "the Assistant". Contract, file, branch, and directory names stay exactly as they are under this order.
- **Honest status, always:** nothing is claimed as live, deployed, audited, or counted until it is. No third-party audit is claimed until one exists. A Sepolia deployment is a rehearsal, never "the launch," in any copy until D'Vaughn says otherwise.

## Non-goals for today

No mainnet. No contract changes (including no EIP-170 workaround). No Sepolia deploy. No routing-fee charge or lock. No new subdomain or live-site publish. No Plus+ portal, no Ops Console (separate order, same day), no landing-page rewrite. No canonical-tree edits. No fee/gate/lock changes. No rename execution (contract names, tier names beyond what is locked above, tagline).

## Open decisions — D'Vaughn's calls, not yours (do not decide them in code)

Trading Terminal routing fee (0.05–0.1% on non-Tress Column swaps only — proposed, not locked) · terminal hosting path (stale `pearls.xyz/trade` vs. a `tc.dvaughnhouse.com` path — his pick) · Phase 3 unblockers (deployer testnet-ETH funding; EIP-170 factory-size redesign options — report options, do not implement) · contract names (PearlHook, LaunchLocker) · tagline (none locked).

## Report back (required, in BUILD-OUT-REPORT.md)

- Inventory from Task 0 (design lines, fork pools/bindings, live-page mentions).
- What was built: routes (Tress Column pools via PearlHook; other Base tokens via the chosen router), displays (depth, chart, gate progress, certificate link), and the routing-fee switch state (OFF, flagged).
- Test evidence: fork/Anvil runs (quotes, swaps, gate cases, crossing-swap zero fee), and the honest empty state for Tress Column launches.
- Preview location and the proposed hosting path, awaiting his public-deploy approval.
- What is still blocked by Phase 3 (no real Sepolia launch yet) and what re-verification is owed once one exists.
- Remaining gaps, if any.

Janine independently re-verifies all of it (preview read-back + fork-test evidence) before anything is reported to D'Vaughn as sound. Report findings; do not soften them.

## Definition of done for today

- Terminal built in the working tree, non-custodial, trader-signs-own-swap, fee rule correct, routing fee OFF and flagged.
- Tested on fork/Anvil with honest empty state — no fake tokens, volume, or prices.
- Committed + pushed on `pearls-buildout`, language check passed.
- Preview delivered, public deploy held for his approval.
- Nothing on mainnet, nothing claimed beyond what the fork and the chain prove.
