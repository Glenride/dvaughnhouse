# Tress Column — Work Order for Antigravity — Monday, November 2, 2026 (Ops Console)

**Prepared by:** Janine, at D'Vaughn's direction
**For:** Antigravity, on the iMac
**Tree:** the thinktank-os tree, Tress Column code at `pearls-buildout-2026-10-23/pearls/` (directory and branch names have not changed)
**Branch:** `pearls-buildout` (verified November 2, 2026: HEAD `c04b516`, post-H-2 fix). Work, commit, and push on `pearls-buildout` only — never commit directly to `main`.
**Status:** This order is self-contained. It is AUTHORIZED by D'Vaughn on 2026-11-02 ("same for ops console" — the same move-forward as the Trading Terminal order of the same day). It builds the Ops Console surface only. It does not authorize a Sepolia deploy, a mainnet step, a contract change, a contract rename, or a public/staff deployment of the console itself — deployment is held for his auth + preview approval (see Task 4).

---

## Where things stand (verified November 2, 2026, not claimed)

- **Live site:** `https://tc.dvaughnhouse.com/` returns 200, title "Tress Column"; `https://pearls.dvaughnhouse.com/` returns 301 to `tc`. The live page lists the Ops Console only as a specified v0.7 surface — "staff-facing, off-chain, SaaS side only" — it is not a live product.
- **Ops Console status: designed only, not built.** PRD v1.0 (2026-10-27) § Phase 4 item 4 is the design; no ops-console code exists in the iMac `pearls/` tree (the only `console*` files there are Foundry build artifacts, not a product console). No staff console is running anywhere.
- **Phase 3 (the console's live-data dependency) is NOT deployed yet — this order does not fix that:**
  - H-2 fix LANDED November 1, 18:04 ET (`defb9f0`): `LaunchLocker.deposit` now carries `nonReentrant` (verified, line 105), with Aderyn re-run and report corrected.
  - Safe APPROVED November 1, 19:18 ET: throwaway test Safe treasury `0x2683bc585BEd0cAc0B232bbEd0e3127757EDc74B`; deployer `0xE33906173fD81b4b8aB6B6C78Cd2262B15BFEE20`; RPC `https://sepolia.base.org` (chain 84532); `script/Deploy.s.sol` gate verified.
  - Deploy BLOCKED on two gates recorded in `BUILD-OUT-REPORT.md` §7.3 (`c04b516`): (1) deployer balance is 0 ETH — it needs ~0.02–0.05 Base Sepolia testnet ETH for gas; (2) EIP-170 size limit — `LaunchFactory` runtime is 27,495 bytes, over the 24,576-byte maximum by 2,919 bytes. Per the locked rules, that structural finding is reported, not redesigned unilaterally. **This order does not touch `LaunchFactory`, `Deploy.s.sol`, or any contract to work around the size gate.** If console work surfaces a contract change, report it — do not make it.
  - Consequence for this order: there is no real Sepolia launch for the console to monitor yet. Build and test against fork/local data (Task 2), show an honest empty state for launches, and hold the "works against real Sepolia launches" acceptance check until Phase 3 unblocks. Never fill the gap with fabricated launches, subscribers, campaigns, or fee totals.
- **Locked facts carried forward:** product name Tress Column (locked 2026-11-01); fee doctrine configured at inception, then immutable — locked LP → $10M gate / 0.30% in quote asset only, unlocked → $20K / ~0.58% modeled (exact unlocked figure unconfirmed, do not hard-code it as locked); Plus+ passes LOCKED 2026-11-02 as Sapphire $7 / Emerald $27 / Ruby $97, monthly only; Merkle airdrop campaigns 0.0194 ETH flat per campaign (PRD price sheet, locked 2026-10-25); canonical Base Sepolia PoolManager `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`; fork-test block used in verification: 49,250,000. Contract names `PearlHook` / `LaunchLocker` are still pending his picks — do not rename them in code, comments, or filenames under this order.

## Tasks — in order

**0. Inventory first. No new code yet.**
Confirm in the report: (a) the PRD § Phase 4 item 4 design lines you are building from; (b) the existing fork-test data and PoolManager bindings you will test monitoring/accounting against; (c) every place the live tc page mentions the Ops Console, so the new surface does not contradict the live page until launches exist. If the iMac tree does not hold the current tc page source, say so and stop before rewriting the live page — do not rebuild it from a stale copy.

**1. Build the Ops Console — staff-facing, SaaS side only.**
Five modules, and only these, in this order:
1. **Plus+ subscriptions** — Sapphire $7 / Emerald $27 / Ruby $97, monthly only, with their locked feature sets (Sapphire: Pure Tress Column feed, Airdrop Claim Radar + batch claimer, whale/unlock tracking; Emerald: workbench, no-code Merkle snapshot builder, Scout analytics + trust widget, Watchtower alerts + unlock countdowns, vanity certificate URLs; Ruby: 1 free AirdropDistributor deploy/month via off-chain rebate, Citadel 24/7 monitoring, snapshot exports, incident support, Abyssal Gold Studio seal). Subscription state is SaaS/off-chain state — label it as such; it is never presented as on-chain state.
2. **Airdrop campaigns** — campaign creation and tracking at the locked 0.0194 ETH flat per campaign; Merkle snapshot building belongs to the Emerald workbench, not to a hand-edited list.
3. **Launch monitoring** — launches, locker state, lock type, and timing, read from on-chain state. Until a real Sepolia launch exists, this shows an honest empty state (no launches yet).
4. **Certificate issuance** — certificate renders from on-chain launch data, not from a local file or mock. Issuance here means surfacing/verifying the on-chain certificate, not minting a certificate by staff fiat.
5. **Treasury-fee accounting** — fee totals reconciled to **on-chain receipts only**. An internal ledger may exist as a cache/index, but it is never the source of truth: every fee figure shown must trace to a chain receipt, and any figure that cannot be traced is shown as unreconciled, not as a total.
- **Hard negatives — build none of these, even if a framework offers them:** the console does not hold customer balances, does not approve withdrawals, does not freeze users, and does not add admin keys, setters, pause, or proxy powers to core contracts. Staff actions in the console are SaaS-side operations (subscriptions, campaigns, monitoring, certificate surfacing, accounting) — never on-chain control over user funds or launches.

**2. Test against real chain data shapes — no fabricated operations.**
- Test on a Base Sepolia fork (the verification block above) and local Anvil: monitoring reads, certificate surfacing, and fee accounting reconciled to fork receipts; subscription/campaign flows against test SaaS data clearly labeled as test data.
- Until a real Sepolia launch exists, launch monitoring and fee accounting show honest empty/unreconciled states — no fabricated launches, subscribers, campaigns, or fee totals, and no demo data presented as live operations.
- Run the pre-commit language check (`bash check-language.sh` from the repo root) — never commit if it fails.

**3. Commit and push on branch `pearls-buildout`.**
Commit the console code, test outputs, and report updates; push on the branch where the work runs. Do not merge to `main` yourself — that is D'Vaughn's call. Do not touch Janine's canonical copy (`~/workspace/your_files/pearls/`) — sync is D'Vaughn's call.

**4. Preview, then STOP for his auth + deployment approval.**
- **Auth is an open decision, not a build default.** The PRD leaves Plus+ portal auth open (shares ThinkTank OS auth vs. stands alone). The same question gates this staff console. Build the console behind a staging gate, propose the auth approach in the report (ThinkTank OS auth vs. standalone, with the trade-off stated), and do NOT publish it — publicly or "staff-only" without an approved gate — until he picks. An unauthenticated staff console is never a delivered state, even as a preview link he has not approved.
- Deliver a preview he can open behind that staging gate with the report below, then stop. Staff deployment happens only after he approves both the preview and the auth approach.

## Locked rules — D'Vaughn's decisions, not yours to change

If anything below looks wrong, surface it in your report. Do not remove, rename, relabel, or "fix" it on your own.

- **Fee doctrine, frozen** (see "Where things stand"). Do not change fee constants, the $10M gate, or lock minimums to make tests pass.
- **No admin keys, no owner, no setters, no pause, no proxy, no upgrade path** in core contracts — and the console adds none, and exercises none over users.
- **Base Sepolia ONLY in this phase. No mainnet, ever, in this order.** Testnet-only keys; never a personal wallet key. `script/Deploy.s.sol` gate untouched.
- **Canonical tree untouched.** Janine's canonical copy stays untouched; sync is D'Vaughn's call.
- **Naming, new user-facing copy only:** Tress Column for the product (formerly Pearls). No tagline until he locks one (none is locked). Never use: "sovereign", "ventures", or "institute" for Glenride. Never use the dropped names (PLURAL, Dagger, Buttress Launchpad) or the TRES ticker. User-facing copy never says "AI" — users get help from "the Assistant". Contract, file, branch, and directory names stay exactly as they are under this order.
- **Honest status, always:** nothing is claimed as live, deployed, audited, or counted until it is. No third-party audit is claimed until one exists. A Sepolia deployment is a rehearsal, never "the launch," in any copy until D'Vaughn says otherwise. SaaS state is labeled SaaS; on-chain state is labeled on-chain; never blend them into one total.

## Non-goals for today

No mainnet. No contract changes (including no EIP-170 workaround). No Sepolia deploy. No customer-balance, withdrawal-approval, or freeze capability. No public or unauthenticated staff deployment. No Plus+ portal or Trading Terminal build (terminal is a separate order, same day). No landing-page rewrite. No canonical-tree edits. No fee/gate/lock/price changes. No rename execution (contract names, tagline).

## Open decisions — D'Vaughn's calls, not yours (do not decide them in code)

Ops Console auth (ThinkTank OS auth vs. standalone — same open question as Plus+ portal auth) · console hosting/deployment path (his pick, after preview) · Phase 3 unblockers (deployer testnet-ETH funding; EIP-170 factory-size redesign options — report options, do not implement) · contract names (PearlHook, LaunchLocker) · tagline (none locked).

## Report back (required, in BUILD-OUT-REPORT.md)

- Inventory from Task 0 (design lines, fork data/bindings, live-page mentions).
- What was built: the five modules, with the SaaS-vs-on-chain labeling for each figure shown.
- Test evidence: fork/Anvil runs (monitoring reads, certificate surfacing, fee reconciliation to receipts), and the honest empty states for launches/fees.
- Proposed auth approach (with trade-off) and preview location, awaiting his auth + deployment approval.
- What is still blocked by Phase 3 (no real Sepolia launch yet) and what re-verification is owed once one exists.
- Remaining gaps, if any.

Janine independently re-verifies all of it (preview read-back + fork-test evidence) before anything is reported to D'Vaughn as sound. Report findings; do not soften them.

## Definition of done for today

- Ops Console built in the working tree: five modules, staff-facing, SaaS side only, no custody, no withdrawal approval, no freeze, no new admin powers.
- Fee accounting reconciled to on-chain receipts only; unreconciled figures labeled as such.
- Tested on fork/Anvil with honest empty states — no fabricated operations.
- Committed + pushed on `pearls-buildout`, language check passed.
- Preview delivered behind a staging gate, deployment held for his auth + deployment approval.
- Nothing on mainnet, nothing claimed beyond what the fork and the chain prove.
