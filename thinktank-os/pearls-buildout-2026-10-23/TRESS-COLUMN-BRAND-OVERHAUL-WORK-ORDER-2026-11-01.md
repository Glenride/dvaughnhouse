# Tress Column — Brand Overhaul Work Order for Antigravity — Sunday, November 1, 2026

**Prepared by:** Janine, at D'Vaughn's direction
**For:** Antigravity, on the iMac
**Scope:** Convert the live Pearls brand to Tress Column, and move the live site from `pearls.dvaughnhouse.com` to `tc.dvaughnhouse.com`, with `pearls.dvaughnhouse.com` redirecting to `tc`.
**Status:** This order is self-contained and AUTHORIZED by D'Vaughn's tap on 2026-11-01 ("Write the brand overhaul order now"). It is a brand/site order only — it does not authorize a Sepolia deploy (Phase 3 continuation order, separate), a mainnet step, a contract change, or any renamed contract, tier, tagline, or mark.

---

## Decisions already locked — build on these, do not re-decide them

- **Product name: Tress Column** (locked 2026-11-01). Pearls is the former name. Same fair-launch platform product, Base only.
- **Subdomain: `tc.dvaughnhouse.com`** (locked 2026-11-01, his tap).
- **Redirect: `pearls.dvaughnhouse.com` redirects to `tc.dvaughnhouse.com`** (decided 2026-11-01, his words). Not a full cutover/removal of the old subdomain — the old address stays as a redirect.
- **Redirect gate (hard): the redirect goes in ONLY after `tc.dvaughnhouse.com` is deployed and verified live.** Redirecting to a not-yet-live `tc` would break the live Pearls page. If `tc` is not verified live, stop before the redirect step and report that.
- **Unchanged by the rename:** fee rule (configured at inception, then immutable; locked LP → $10M / 0.30%, unlocked → $20K / ~0.58% modeled, exact unlocked figure unconfirmed), tier prices (Plus+ Trader $7 / Creator $27 / Studio $97, monthly only), Sepolia/testnet-only status, and the H-2 code correction (brand-agnostic, Phase 3 order).

## Where things stand (verified November 1, 2026, not claimed)

- **Live site now:** `https://pearls.dvaughnhouse.com/` — title "Pearls — There's power in Pearls.", full landing page (Configure → Lock → Prove, certificate, fee story, terminal/console, actor map, Plus+ tiers, status ledger). Verified live by read-back November 1.
- **Pages project:** `pearls` (created 2026-10-26); canonical Pages URL `https://pearls-osk.pages.dev/` — plain `pearls.pages.dev` was already taken by another account, so the canonical URL does not change in this order. Do not create a new Pages project for `tc` unless the `pearls` project path fails and you report why first.
- **DNS, as it was set up October 26:** CNAME `pearls` → `pearls-osk.pages.dev`, proxied, added manually — DNS was NOT auto-created by the Pages custom-domain attach. Expect the same manual step for `tc` (see Task 2). The `cf` CLI path (`cf pages domains create`) worked for custom domains where the raw Pages API attach failed twice with a misleading 400 "invalid TLD" — use the `cf` path.
- **Current staging source:** `~/workspace/deploys/pearls-v2/` (October 27 full redo: `index.html` + `assets/` — hero-orb.mp4, hero-orb-poster.jpg, nacre.webp, self-hosted fonts). The older `~/workspace/deploys/pearls/` copy is the October 26 build — a rollback copy only, NOT the source for this overhaul. If the iMac tree does not hold the current page source, say so in the inventory (Task 0) and stop before rewriting — do not rebuild the page from the stale October 26 copy.
- **Docs in scope:** brand book (`PEARLS-BRAND-BOOK.md`), spec (`spec.md`), PRD (`pearls-prd-v1.0-2026-10-27.md`), frontend taste standard, and the Phase 3 continuation work order (already updated for the `tc` subdomain + redirect decision). Janine's canonical copy (`~/workspace/your_files/pearls/`) stays untouched by this order — update the copies in the working tree, list every changed file in the report, and Janine syncs the canonical copy after verification. Do not rename that canonical tree under this order.
- **Palette, as locked in the brand book:** Pearls White `#FAF9F6`, Nacre Cream `#F5EFE6`, Abyssal Gold `#D4AF37`, Signal Orange `#FF6B2B`, Abyssal Black `#0D0E11`. Hex values do not change in this order (see Task 1 for the colour-name flag).
- **Dropped names stay dropped:** never use PLURAL, Dagger, or Buttress Launchpad. Never use the TRES ticker (single-s spelling, crowded, not this product).

## Tasks — in order. Do not skip the sequence.

**0. Inventory first. No edits yet.**
Grep and list, before rewriting anything: every "Pearls" product-name occurrence in the live page source, brand book, spec, and PRD; every pearl-metaphor line (certificate = pearl, strand, "a pearl is not found — it is made," "Pressure makes pearls," "first pearl is minted"); every colour-name line (Pearls White, Nacre Cream); every "There's power in Pearls" line; every price, fee, gate, and factual status line. Report the inventory with file + line for each class. Do NOT run a blind find-and-replace across the repo — that would rename contract identifiers, history, and code. New user-facing copy is the only thing being renamed in this order.

**1. Rewrite the copy — product name only. Invent nothing.**
- Replace the product name "Pearls" with "Tress Column" in new user-facing copy (page title, headings, body, Plus+ section header as "Tress Column Plus+" only insofar as it is the product name — pass names Trader / Creator / Studio do NOT change).
- "There's power in Pearls" is REMOVED, with no replacement tagline. No tagline is locked — do not substitute "There's power in Tress Column," the synthesis recommendations, or any line from the 100-tagline file.
- "Pearls #0" on the status ledger becomes "first Tress Column launch" (matching the Phase 3 order, Sepolia dummy). "Pearls treasury" becomes "Tress Column treasury" (product name only).
- **FLAG, do not decide:** (a) the certificate-as-pearl metaphor and strand language — keep the wording as-is in this pass, list it as an open decision in the report (rename the certificate concept, or keep "pearl" as a generic record term — his call); (b) colour names Pearls White / Nacre Cream — keep the hex values and the names as-is in this pass, list them as an open decision (renaming a colour is a mark decision, not a copy edit); (c) contract names (PearlHook, LaunchLocker), tier names, and tagline — all pending his picks, none renamed here.
- **Do NOT change any fee, gate, price, or factual status claim** except the brand name and subdomain. If a status line is stale, flag it — do not silently rewrite it. Known stale example to check, not to fix unilaterally: the live status ledger still shows symbolic proof and fork tests as "Pending," although Phase 2 completed those on October 29. Report it as stale; Janine / D'Vaughn correct the claim, you do not invent a new one.
- Language check (`bash check-language.sh` from the repo root) — never commit/deploy if it fails. Banned in all copy: "sovereign", "ventures", "institute" for Glenride. User-facing copy never says "AI" — users get help from "the Assistant". Dated concept history (v0.6/v0.7) keeps the old name as history — do not rewrite history.

**2. Deploy the rebranded site to `tc.dvaughnhouse.com` — and verify it before anything redirects.**
- Deploy the rebranded build to the existing Pages project `pearls` (same project, canonical `pearls-osk.pages.dev`). Verify the preview deployment first: HTTP 200, title carries Tress Column, no product-name "Pearls" remnants except the flagged certificate/colour lines from Task 1, no tagline, hero video + assets 200, mobile OK.
- Add `tc.dvaughnhouse.com` as a custom domain on the `pearls` project via the `cf` CLI path. Add the DNS CNAME `tc` → `pearls-osk.pages.dev`, proxied, manually if it is not auto-created (October 26 lesson). Allow for Cloudflare validation lag and carrier DNS caching — a first "pending"/522 is propagation, not failure; re-check before declaring a failure, and report the actual status at each check.
- Verify live: `https://tc.dvaughnhouse.com/` returns 200 with the rebranded page, title, and assets. Only when that verification passes may Task 3 begin. If deploy credentials or Pages/DNS write access are missing, STOP and report exactly what is missing — do not invent credentials, do not use a personal key, do not deploy from a different project without reporting why.

**3. Redirect `pearls.dvaughnhouse.com` → `tc.dvaughnhouse.com` — only after Task 2 verifies.**
- Implement a redirect (301) from `pearls.dvaughnhouse.com` to `tc.dvaughnhouse.com`, preserving path and query where the redirect mechanism allows it. Do NOT remove the `pearls` custom domain and do NOT delete the old DNS record as a substitute for a redirect — the decision was redirect, not cutover.
- Verify: `https://pearls.dvaughnhouse.com/` returns 301 to `tc`, `https://tc.dvaughnhouse.com/` returns 200, a deep link on the old subdomain resolves through the redirect without a loop, and the canonical Pages URL still serves. If the redirect mechanism is unavailable, STOP and report that — do not leave `pearls` pointing at the old page and claim the redirect is done, and do not cut over by deletion.
- Keep the old page's honest-status claims intact through the redirect: nothing is claimed as live, deployed, audited, or counted until it is, and a Sepolia rehearsal is never "the launch" in any copy.

**4. Update the docs and record the change.**
- Update the product name in the working-tree copies of the brand book, spec, and PRD under the same Task 1 rules (name only, no invented tagline/mark/contract/tier names, no fee or status changes, history kept as history). List every changed file in the report.
- Do NOT rename the Mission Control goal/project in this order — flag it for Janine (project 27, "Pearls launchpad," already carries the Phase 3 picks; its rename is a separate, Janine-side step).
- Commit any tree docs changes on branch `pearls-buildout` and push (never directly to `main` — that is D'Vaughn's call). Record the deployment in the report: Pages project + deployment URL, custom-domain + DNS records added, redirect verification outputs, and the full changed-file list.

## Ground truth (verified, do not re-derive — build on it)

- Pages project `pearls`; canonical `pearls-osk.pages.dev`; custom domain `pearls.dvaughnhouse.com` was CNAME `pearls` → `pearls-osk.pages.dev`, proxied, manual.
- Current staging source `~/workspace/deploys/pearls-v2/` (October 27 redo); rollback copy `~/workspace/deploys/pearls/` (October 26 build) is NOT the source.
- Fee doctrine frozen (see "Decisions already locked"); Plus+ prices $7 / $27 / $97, monthly only, introductory offers subject to change without notice; protocol fee fixed on-chain at launch is different from pass pricing and never changes once set.
- Uniswap v4-core `v4.0.0` = `e50237c`; canonical Base Sepolia PoolManager `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408` (Phase 3 order, not this order's scope).

## Non-goals for today

No contract renames. No tier, tagline, or mark inventions. No fee, gate, lock-minimum, or price changes. No factual status-claim rewrites (flag stale lines instead). No Sepolia deploy (Phase 3 continuation order, separate). No mainnet, ever, in this order. No Phase 4 surfaces. No canonical-tree edits on Janine's VM. No new Pages project unless the `pearls` path fails and is reported first. No removal of the `pearls` subdomain or DNS record. No blind repo-wide rename.

## Open decisions — D'Vaughn's calls, not yours (do not decide them in copy or code)

Certificate-as-pearl metaphor (keep or rename) · colour names Pearls White / Nacre Cream (keep or rename, hexes unchanged) · contract names (PearlHook, LaunchLocker) · tier names · tagline (none locked) · Mission Control goal/project rename (Janine-side) · canonical-tree sync (Janine-side, after verification).

## Report back (required)

- Inventory from Task 0 (surface counts by class, with file + line references).
- Changed files, with the Task 1 flag list (certificate metaphor, colour names) quoted verbatim as open decisions.
- Deployment record: Pages project, preview + production URLs, custom-domain + DNS records, verification outputs for `tc` (200, title, assets, mobile).
- Redirect record: mechanism used, verification outputs for `pearls` (301 → `tc`, deep link, no loop), and confirmation the old domain was NOT removed.
- Stale factual lines found (e.g. status ledger security path), reported as stale, not rewritten.
- Remaining gaps, if any.

Janine independently re-verifies all of it (live `tc` + redirect + copy read-back) before anything is reported to D'Vaughn as sound. Report findings; do not soften them.

## Definition of done for today

- Rebranded site live and verified at `https://tc.dvaughnhouse.com/` (200, Tress Column title, no unflagged Pearls product-name remnants, no tagline, assets + mobile OK).
- `https://pearls.dvaughnhouse.com/` returns 301 to `tc` (path preserved where the mechanism allows), old domain NOT removed, no redirect loop.
- Docs updated (name only) with a complete changed-file list; tree changes committed + pushed on `pearls-buildout`, language check passed.
- Open decisions (certificate metaphor, colour names, contract names, tier names, tagline) reported as open, not decided in copy or code.
- Nothing on mainnet, nothing claimed beyond what the live pages and the chain prove.
