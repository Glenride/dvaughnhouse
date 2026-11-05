# Pearls — Technical Specification v1.0

**Date:** 2026-10-21 · **Status:** Build spec for the contract core (Base Sepolia + local Anvil only)
**Concept source:** Pearls v0.6 (2026-10-21, concept locked) — supersedes v0.3 where they differ.
**Tagline:** "There's power in Pearls."

> **Scope of this document.** This spec covers (a) the on-chain contract core — built in this
> repo, (b) the TCHook integration boundary — designed in full, implemented in part, with the
> gap stated plainly, and (c) the off-chain Plus+ / CoinGuard suite — **designed only, not built**.
> Nothing in this repo targets mainnet. Deployment anywhere is D'Vaughn's gate, not this spec's.

> **Naming correction applied.** The v0.6 concept text named the `#D4AF37` palette entry and
> the Studio seal with a word that sits on D'Vaughn's banned-language list for his brands.
> Everywhere in Pearls the colour and the seal are **Abyssal Gold**. No Pearls artifact,
> contract, or UI copy may use the banned word, including in quotations of the concept text.

---

## 1. Product invariants (the spec exists to protect these)

1. **Configured at launch, immutable after.** Every launch parameter is set in the single
   `launch()` transaction and can never change. Core contracts have **no admin keys, no owner,
   no setters, no pause, no proxy, no upgrade path**. If a function is not in the ABI at deploy,
   it does not exist.
2. **Every choice is public.** All parameters are stored in immutable fields and emitted as
   events at launch. The launch certificate renders exactly what the contracts hold — nothing
   more, nothing hidden.
3. **No platform fee until $10M cumulative volume.** Below the gate the protocol fee is 0%.
   At/above the gate it is a fixed **0.3% (30 bps)**, taken **strictly in the quote asset**
   (WETH/USDC), routed to the platform treasury Safe. Pearls never receives, holds, or sells a
   launched token as a fee.
4. **The fee and the gate can never move.** Rate (30 bps) is a protocol constant. The gate is
   converted to fixed quote-asset units at deploy time (see §6) and stored immutably.
5. **Liquidity principal has no early exit.** Forever ("Abyssal Lock") means forever — there is
   no withdrawal function. Timed locks enforce a **≥ 180-day floor** in the factory, not in
   documentation.
6. **Boring money path.** No oracles in the swap path, no external calls in token transfers,
   no re-entrancy surface beyond standard audited patterns (OpenZeppelin 5.0.2, pinned).

## 2. Architecture overview

```
                         ┌────────────────────────────────────────────┐
                         │              LaunchFactory                  │
                         │  immutable: treasury Safe, certificate,     │
                         │  protocol constants                        │
                         └──────┬───────────────┬──────────────┬──────┘
                  launch()      │               │              │
              ┌─────────────────▼──┐  ┌─────────▼───────┐  ┌───▼──────────────┐
              │    LaunchToken   │  │ LaunchCertificate│  │   LaunchLocker   │
              │ ERC-20 + Permit  │  │ ERC-721 + stored │  │ holds v4 LP NFT  │
              │ wallet-cap guard │  │ launch record    │  │ Abyssal / Timed  │
              └──────────────────┘  └──────────────────┘  └───┬──────────────┘
                                                              │ (position NFT,
              ┌──────────────────┐  ┌──────────────────┐      │  minted by the
              │  VestingVault    │  │ AirdropDistributor│     │  pool layer)
              │ linear + cliff   │  │ Merkle, 0.0194   │      │
              │ (optional)       │  │ ETH flat fee     │  ┌───▼──────────────┐
              └──────────────────┘  └──────────────────┘  │    TCHook     │
                                                          │ v4 hook: volume  │
              Off-chain (DESIGNED ONLY, §10):             │ gate + launch    │
              Indexer · Whale/Unlock Radar · Batch        │ guard + fee      │
              Claimer · Snapshot Engine · Portal ·        └──────────────────┘
              CoinGuard tiers · Plus+ subscriptions
```

**Pool-creation boundary (honest split).** Creating the Uniswap v4 pool, minting the LP
position NFT, and attaching the hook requires the v4 PoolManager / PositionManager deployment
addresses for the target chain and the `v4-core` / `v4-periphery` libraries. The contract core
in this repo implements everything on the Pearls side of that boundary — token, distribution,
certificate, lock custody, vesting, airdrops, and the hook's accounting logic — and defines the
interfaces the pool layer must satisfy (`ITCHook`, `ILPPosition`). Pool wiring is the
integration phase (§7.4) and is **not** faked in the core.

## 3. Contract inventory

| Contract | Type | Admin keys | Purpose |
|---|---|---|---|
| `LaunchFactory` | Singleton per chain | None (immutable treasury) | One-transaction launches; validates and freezes all parameters; deploys token/vault/distributor/locker/hook-accounting; deploys the certificate contract in its own constructor and issues certificates through it |
| `LaunchToken` | ERC-20 + ERC20Permit | None | The launched token. Fixed supply minted once at deploy to the factory for distribution. Per-wallet cap guard for the first N blocks |
| `LaunchCertificate` | ERC-721 + record store | Mint restricted to the factory (set once, immutable) | "The pearl": one NFT per launch holding the full plain-language launch record on-chain |
| `LaunchLocker` | ERC-721 custodian | None | Holds the LP position NFT. Abyssal (forever) or Timed (≥180 d). Fee handling per launch choice: Creator Claimable or Dead/Compounded |
| `VestingVault` | Per-launch | None | Optional creator/team allocation: linear vesting with cliff, all terms immutable |
| `AirdropDistributor` | Per-campaign | None | Merkle-root airdrop. Flat **0.0194 ETH** fee per campaign, forwarded to the treasury at creation. Trustless claims |
| `TCCore` | Per-pool accounting | None (immutable treasury, threshold, guard params) | Volume tracking, $10M gate, fee calculation, launch-window max-swap guard — pure, unit-testable logic |
| `TCHook` | v4 hook adapter | None | Thin adapter between the v4 PoolManager callbacks and `TCCore`. **Partial — see §7** |
| `ITCHook` | Interface | — | The hook surface Pearls guarantees (callbacks + accounting views) |

Supporting test doubles (`MockQuoteAsset`, `MockLPPosition`) exist under `test/` only and are
never deployed by the production script.

## 4. Deploy-time configuration surface

One struct, one transaction — `LaunchFactory.launch(LaunchParams)`:

| Parameter | Type | Rules enforced on-chain |
|---|---|---|
| `name`, `symbol` | string | Non-empty |
| `totalSupply` | uint256 | > 0; minted once, to the factory, then distributed in the same tx |
| `creator` | address | Non-zero; receives claimable LP fees / unvested remainder paths per config |
| `quoteAsset` | address | Non-zero (WETH/USDC on Base); recorded on the certificate |
| `poolFeeTier` | uint24 | Recorded on the certificate; consumed by the pool layer |
| `volumeThresholdQuote` | uint256 | > 0. The $10M gate **already converted** to quote-asset base units (§6) |
| `usdGate` | uint256 | Display anchor for the certificate (concept value: 10,000,000 USD, 6-dec scaling); informational, never used in fee math |
| `lockMode` | enum | `Abyssal` (default, forever) or `Timed` |
| `lockDurationSeconds` | uint256 | Timed ⇒ **≥ 180 days**, checked in the factory. Abyssal ⇒ must be 0 |
| `lpFeeMode` | enum | `CreatorClaimable` or `DeadCompounded` |
| `vestingBps` | uint16 | Part of the distribution split (see below) |
| `vestingBeneficiary` | address | Required iff `vestingBps > 0` |
| `vestingCliffSeconds`, `vestingDurationSeconds` | uint256 | Duration > 0 and ≥ cliff when vesting is used |
| `airdropBps` | uint16 | Part of the distribution split |
| `airdropMerkleRoot` | bytes32 | Required iff `airdropBps > 0`; root is frozen at launch |
| `liquidityBps` | uint16 | Remainder of supply; routed to the liquidity allocation account (pool layer, §2) |
| `liquidityAllocation` | address | Non-zero; receives the liquidity tranche in the core (in production this is the pool-initialiser contract that mints the position into the locker in the same flow) |
| `walletCapAmount` | uint256 | 0 = disabled. Max balance per wallet during the guard window (pool/locker/vault/distributor/factory exempt) |
| `walletCapBlocks` | uint256 | Guard window length in blocks; cap is inert after `launchBlock + walletCapBlocks` |
| `maxSwapQuoteAmount` | uint256 | 0 = disabled. Max quote-side size per swap during the hook guard window |
| `maxSwapBlocks` | uint256 | Hook guard window length in blocks |

**Distribution invariant:** `vestingBps + airdropBps + liquidityBps == 10_000`, checked in
the factory. Rounding dust from bps splits goes to the liquidity tranche, so the distributed
total always equals `totalSupply` exactly.

**Immutability guarantee.** Every value above lands in `immutable` fields or in the
certificate's append-only record. There is no function in any core contract that writes
launch state after construction. The factory itself stores only the immutable treasury
address and the certificate contract address, both set in its constructor.

## 5. Launch certificate — "the pearl"

* One ERC-721 per launch, minted by the factory to the creator in the launch transaction.
  `tokenId` is the sequential launch id.
* The certificate contract stores the full `CertificateRecord`: token address, creator, quote
  asset, total supply, the three distribution splits, lock mode + unlock timestamp (0 =
  Abyssal), LP fee mode, vesting terms, pool fee tier, `volumeThresholdQuote`, `usdGate`,
  guard parameters, locker / vault / distributor / hook addresses, launch block, chain id.
* The record is written once, by the factory, in the same transaction as the launch. There is
  no update function. The NFT is transferable (it is a collectible receipt); transfer moves
  **no rights** — LP fee claim rights stay with the `creator` address recorded in the locker,
  not with the certificate holder. That separation is deliberate and printed on the rendered
  certificate.
* Rendering (off-chain, from the on-chain record + events): Pearl White `#FAF9F6` canvas,
  Nacre Cream `#F5EFE6` certificate surface, Abyssal Gold `#D4AF37` seal for Abyssal locks
  (Timed locks show the exact unlock timestamp instead), Signal Orange `#FF6B2B` for the
  volume-gate progress bar and actions, Abyssal Black `#0D0E11` type and framing.
* The $10M gate progress shown to users is `cumulativeVolume / volumeThresholdQuote` read
  from the hook accounting contract — the same numbers the fee logic uses.

## 6. Fee logic and the $10M gate

### 6.1 How cumulative volume is tracked

* Volume is tracked **per pool, in quote-asset base units**, inside `TCCore`:
  `cumulativeVolumeQuote` increases by the quote-side absolute amount of every swap the hook
  observes, in both directions (a buy and a sell both count — volume is volume).
* The accumulator is `uint256` and increases monotonically. It cannot be reset, decremented,
  or paused. Overflow is not a practical concern (2^256 quote base units) and Solidity 0.8
  checked arithmetic would revert rather than wrap.

### 6.2 The $10M gate

* USD is not measurable on-chain without an oracle, and the swap path must have **zero oracle
  dependencies** (concept principle 4). So the conversion happens **once, at deploy time**:
  the launcher (via the frontend) takes the spot price of the quote asset at the launch block,
  computes `volumeThresholdQuote = $10,000,000` expressed in quote base units, and passes it
  as a launch parameter. Both the USD anchor (`usdGate`) and the converted threshold are
  printed on the certificate, so anyone can re-derive and challenge the conversion using the
  launch block's price.
* Consequence, stated plainly: if the quote asset's price moves after launch, the *effective*
  USD value of the gate drifts. For USDC-quoted pools the drift is negligible. For WETH-quoted
  pools it is real and disclosed on the certificate ("gate fixed at N WETH at launch").
  This is the concept's locked trade-off (Decision 4) in exchange for an oracle-free swap
  path; the spec keeps it rather than quietly re-introducing price feeds.
* **Crossing semantics:** the swap that crosses the threshold is still fee-free. The fee
  applies to swaps whose *starting* cumulative volume is already ≥ threshold. This is simple,
  predictable, and printed on the certificate.

### 6.3 The fee itself

* Rate: **30 bps (0.3%)**, a protocol constant in `TCCore`, not a launch parameter —
  a creator cannot opt into a different rate and Pearls cannot raise it per-pool.
* Base: the fee is computed **only on the quote-asset side** of the swap.
  `fee = quoteAmount * 30 / 10_000`. Integer division rounds the fee **down** (in the
  trader's favour); sub-unit remainders are never taken.
* Destination: the platform treasury Safe, an immutable address in the factory and in each
  hook instance. Signer rotation happens inside the Safe and never touches these contracts.
* **Direction-dependence — the core risk, see §7.3.** Whether the quote asset is currency0
  or currency1, and whether a swap is exact-input or exact-output, determines which balance
  delta carries the quote amount. Taking the fee from the wrong delta would tax the launched
  token — the exact failure the product promises never to have. The accounting core therefore
  exposes fee computation as a pure function of an explicitly resolved `quoteAmount`, and the
  adapter's job — resolving that amount correctly for all four direction cases — is specified
  as a test matrix, not assumed.

### 6.4 AirdropDistributor fee

* Flat **0.0194 ETH per campaign**, paid in the creation transaction. The distributor's
  constructor requires `msg.value == 0.0194 ether` exactly and forwards it to the immutable
  treasury in the same transaction. Overpayment reverts rather than being kept.
* When a campaign is created at launch through the factory, the factory passes the fee
  through from the launcher's `msg.value` (the launch call must then carry exactly
  0.0194 ETH if — and only if — an airdrop tranche is configured). Post-launch campaigns are
  created directly against the distributor factory path with the same exact-fee rule.
* Pearls Plus+ Studio's "1 free deploy / month, 50% off extras" is an **off-chain rebate**
  settled by the portal (§10); the on-chain fee never changes, so the contract stays
  membership-blind. That is deliberate: no subscription state in the money path.

## 7. TCHook — design, risk centre, implementation status

### 7.1 Responsibilities

1. Enforce the launch-window **max swap size** (`maxSwapQuoteAmount` for the first
   `maxSwapBlocks` blocks) — the LaunchGuard half of the hook.
2. **Track cumulative quote volume** for the pool (§6.1).
3. **Take the 0.3% quote-side fee** once the gate is crossed (§6.3) and route it to the
   treasury.

### 7.2 v4 mechanics (what the adapter must do)

A Uniswap v4 hook does not move tokens directly. In `afterSwap`, the hook receives the
swap's `BalanceDelta` (amount0, amount1 — signed: positive = pool owes the swapper / hook
context, negative = owed to the pool, per v4 conventions) and the swap parameters
(`zeroForOne`, `amountSpecified`: negative = exact-input, positive = exact-output in v4).
To take a fee the hook must use the PoolManager's `take(currency, to, amount)` /
settlement flow inside the manager's unlock context. Getting any of — sign conventions,
specified-vs-unspecified currency, exact-in vs exact-out — wrong either reverts every swap
(pool is bricked) or taxes the wrong asset.

### 7.3 Why this is the risk centre of the whole platform

* **Blast radius:** a hook bug does not degrade one feature; it sits in *every swap* of
  *every pool* that uses it. A reverting hook = an untradeable token.
* **Direction-dependence:** the quote asset may be currency0 or currency1; swaps run both
  directions; exact-input and exact-output place the quote amount in different deltas.
  Four cases minimum, each needing its own fork-test proof before mainnet.
* **Immutability cuts both ways:** the same no-admin-keys property that makes the fee
  trustworthy makes a hook defect unfixable per-pool. The mitigation is pre-mainnet:
  dedicated audit scope for the hook alone (§9), fork tests against the real PoolManager,
  and a Sepolia soak period with dummy pools before any real launch.
* **Fee-on-transfer interactions:** Pearls tokens have no transfer tax, which removes the
  worst interaction class by design. Third-party tokens are never launched through this
  factory, so the hook only ever sees `LaunchToken`.

### 7.4 Implementation status in this repo (honest)

* **Built and tested:** `TCCore` — all accounting: volume accumulation, gate check,
  fee computation, guard-window enforcement, as a standalone immutable contract with a
  `recordSwap(quoteAmount)` entry point gated to a single immutable reporter address (the
  adapter, which deploys the core in its own constructor and names itself — no address
  prediction, no setters). Plus `ITCHook`, the guaranteed surface, and the adapter's
  `resolveQuoteAmount`, which turns a packed v4 BalanceDelta into the quote amount. The
  four direction cases are pinned by unit tests; the core's fee maths is identical for
  all of them.
* **Partial — adapter skeleton:** `TCHook.sol` implements the callback signatures
  mirroring v4's `IHooks` (declared locally in `ITCHook.sol` so the repo does not depend
  on an unpinned v4-core), forwards resolved amounts to the core, and marks with
  `PEARLHOOK-TODO` the exact points where PoolManager `take()` settlement must be wired
  against the pinned v4 deployment. **It compiles; it is not a deployable v4 hook yet.**
* **Gap to close in the integration phase:** pin `v4-core`/`v4-periphery` versions, deploy
  against the Base Sepolia PoolManager, implement settlement, and pass the §7.3 fork-test
  matrix (4 direction cases × below/above gate × guard window on/off). Until then, no
  document may claim the hook is complete.

## 8. Liquidity lock design (`LaunchLocker`)

* The locker is an ERC-721 receiver that takes custody of the pool's LP position NFT.
  Custody is recorded at `deposit(positionContract, tokenId)` — in production this is called
  by the pool-initialiser in the launch flow; the locker records `unlockTime` at deposit from
  its immutable terms (Abyssal ⇒ `type(uint256).max` sentinel rendered as "forever").
* **Principal:** there is **no withdraw function for Abyssal locks at all**. For Timed
  locks, `withdrawPrincipal()` exists but reverts before `unlockTime` (set at factory
  validation to ≥ 180 days after launch) and pays out only to the recorded creator.
* **LP fees, per launch choice:**
  * `CreatorClaimable` — `collectFees()` asks the position (via the `ILPPosition`
    fee-collection interface) to collect accrued fees to the locker, then forwards them to
    the creator. Principal never moves; the position NFT never leaves the locker.
  * `DeadCompounded` — `collectFees()` is disabled (reverts). Fees stay inside the
    position, compounding its value; the "dead" property comes from the principal lock,
    not from burning fee tokens the locker may never have held.
* The locker has no owner and no rescue function. A rescue function would be an admin key
  by another name; its absence is the product.

## 9. Security posture and the zero-cost audit path

Floor (all runnable at $0, in order — this is the v0.5/v0.6 locked path):

1. **Foundry unit + fuzz tests** (this repo): distribution invariants, gate crossing, fee
   maths, lock floors, vesting maths, Merkle claims, guard expiry. Stateful fuzz on the
   hook core's accumulator (monotonicity, fee only ≥ gate).
2. **Slither** static analysis — zero high/medium findings tolerated in the money path.
3. **Aderyn** static analysis — second engine, findings cross-checked against Slither's.
4. **Halmos** symbolic verification of the load-bearing invariants:
   locker principal cannot leave before `unlockTime`; hook fee is 0 below the gate and
   ≤ 30 bps of quote above it; distributor pays a leaf at most once.
5. **Adversarial fork tests** (integration phase): TCHook against the real v4
   PoolManager on a Base Sepolia fork — the §7.3 matrix.
6. **Public review before mainnet:** publish the full report (all four tools' outputs),
   apply for **Superchain / Base audit grants**, run a community review
   (e.g. CodeHawks First Flights). Mainnet stays gated on D'Vaughn + that review, in that
   order.

Operational notes: compiler pinned (`solc 0.8.24`, cancun, 200 optimiser runs — matching the
house Foundry pattern); dependencies pinned (`forge-std v1.9.2`, OpenZeppelin `v5.0.2`);
no floating pragmas beyond the pinned minor.

**Status at build time (2026-10-21):** step 1 is done (33 Foundry tests green, incl. a
stateful fuzz test on the hook accumulator). Slither (step 2) was run against the core:
10 results, all Low/Informational, **zero High/Medium in Pearls sources** — the remainder
are `reentrancy-events` (events emitted after external calls; state changes precede the
calls in every case), `timestamp` (inherent to vesting/lock design), one
`incorrect-equality` (the vesting zero-check), and one complexity note on the factory's
validator. Full output: `docs/slither-2026-10-21.txt`. Aderyn and Halmos (steps 3–4) have
not been run yet — Aderyn is not installed in this environment and Halmos proofs belong
with the integration phase. Do not quote the audit path as complete; steps 1–2 of six are
done.

## 10. Plus+ / CoinGuard suite — DESIGNED ONLY (do not build yet)

Everything in this section is off-chain. None of it touches the contracts above; the
contracts are deliberately membership-blind. Build order is gated on the contract core
proving out on Sepolia and on an audience existing (the founder-survey read-out is the
demand evidence).

### 10.1 Components

| Component | What it does | Key design points |
|---|---|---|
| **Indexer** | Watches the factory's `Launched` events + pool swaps; materialises per-launch state (holders, volume vs gate, lock status) into Postgres | Reorg-safe (process from `block - 12` confirmations), idempotent event application, one row per launch keyed by certificate tokenId |
| **Launch feed ("Pure Pearl")** | Filtered stream of new launches for Plus+ Base members | "Pure" = launches meeting disclosed criteria (Abyssal lock, no vesting, guards on); the filter rules are public and versioned |
| **Airdrop Claim Radar** | Scans all `AirdropDistributor` campaigns; shows a wallet its unclaimed allocations across campaigns | Read-only Merkle membership checks against published roots + claim bitmaps |
| **Batch claimer** | One transaction claiming across multiple distributors via a multicall wrapper | User signs; Pearls never custodies. Wrapper contract is a *separate* future build with its own review |
| **Whale radar** | Top-holder deltas + large-transfer alerts per token | Thresholds per token (bps of supply), computed by the indexer |
| **Unlock radar** | Countdowns for Timed locks, vesting cliffs/unlocks across launches | Pure function of on-chain timestamps the indexer already stores |
| **Snapshot engine** (Studio) | No-code Merkle snapshot builder for creators: holder set at a block, with sniper/bot filtering | Filters are explicit, named heuristics (e.g. "bought in first N blocks", "held < X blocks") shown to the creator before the root is generated — never silent exclusions |
| **Portal** | Next.js app: launch flow, certificate rendering, trust panel, Plus+ account area, vanity certificate URLs (`/p/<token>`) for Studio | Renders only what the indexer + chain prove; vanity URLs are cosmetic and resolve to the same certificate record |

### 10.2 Subscription tiers (locked pricing)

* **CoinGuard (per token, creator-paid):** Scout **$7/mo** — analytics + trust widget.
  Watchtower **$27/mo** — Scout + sniper/whale alerts + unlock countdowns.
  Citadel **$97/mo** — Watchtower + 24/7 monitoring, snapshot exports, incident support,
  certificate badge.
* **Pearls Plus+ (platform membership):** Base **$17/mo** — Pure Pearl feed, Claim Radar +
  batch claimer, whale/unlock tracking. Studio **$47/mo** — Base + 1 free airdrop deploy
  per month (off-chain rebate of the §6.4 fee), 50% off additional deploys, snapshot engine,
  vanity certificate URLs, Abyssal Gold Studio seal. Annual: $147 / $397.
* **Billing design:** card billing off-chain (Stripe-class processor), entitlement checked
  by the portal only. **No subscription state ever reaches the contracts.** Lapsed members
  lose portal features; nothing on-chain changes for their launches — that separation is a
  trust property, not an implementation detail.

## 11. Deployment plan (Sepolia phase — execution is D'Vaughn's gate)

1. `forge test` green locally + on a fresh Anvil instance (this repo, done at build time).
2. Slither + Aderyn clean; Halmos invariant proofs pass.
3. Deploy script (`script/Deploy.s.sol`) deploys `LaunchFactory` (which deploys the
   `LaunchCertificate` in its constructor) with the treasury set to a **test** Safe on
   Base Sepolia. Chain guard in the script: it refuses any chain id other than 84532
   (Base Sepolia) or 31337 (Anvil).
4. Dummy launch end-to-end on Sepolia (testnet dummy as "Pearl #0" — **not** SPINE; SPINE's
   sequencing is a separate open decision, §12), certificate rendered, locker custody proven.
5. Hook integration phase (§7.4) on a Sepolia fork, then live Sepolia pools, then a soak
   period before any mainnet conversation.

## 12. Open decisions and risks (not decided by this spec)

1. **SPINE sequencing.** v0.6 Decision 9 has SPINE deploying first as "Pearl #0", but SPINE
   was parked 2026-10-17 and its deploy is manual via Bankr — by D'Vaughn's 2026-10-12
   decision SPINE is *not* dogfooded on Pearls. This spec therefore uses a testnet dummy for
   Pearl #0. Whether SPINE's manual deploy still feeds the certificate design is his call.
2. **Treasury Safe address** (Sepolia test Safe now; mainnet Safe signers/threshold before
   any mainnet deploy). Internal signer rotation needs no contract change.
3. **TCHook** is the platform's risk centre (§7.3) and its adapter is incomplete (§7.4).
   Any timeline that quotes the hook as "done" before the fork-test matrix passes is wrong.
4. **Revenue realism.** By design the protocol fee pays ~$0 per launch until a launch crosses
   $10M volume; the airdrop fee (~0.0194 ETH/campaign) and subscriptions carry the business,
   and subscriptions need distribution that does not exist yet. The contracts are built to
   the concept regardless — but nobody should model fee income into a launch plan.
5. **Gate drift for WETH-quoted pools** (§6.2) — disclosed on the certificate, accepted in
   the locked concept.
6. **Regulatory:** neutral infrastructure posture per the concept; counsel's read on the
   treasury fee is a pre-mainnet item, on his timing per his standing legal-counsel rule.

---

## 13. AttestationRegistry — the Witness anchor (added 2026-10-22)

A Pearls platform contract outside the launch flow: the on-chain anchor for Glenride
attestations issued by ThinkTank OS ("Witness", attestation v2 — attestation embedded in
the manuscript process, with manual entry by authorized users and on-chain anchoring).

* **Purpose.** When ThinkTank OS issues an attestation, the issuer anchors its subject
  hash + public ID here, producing a public timestamp proof. ThinkTank OS remains the
  record of truth for the attestation itself; the registry proves *when* a hash was
  anchored and *by whom*.
* **Issuer model.** One privileged address — the Glenride issuer (a Safe) — set in the
  constructor as the immutable `ISSUER`; it is the only caller of `anchor()`. No owner,
  no setters, no pause, no proxy, no upgrade path, no delete — the standard Pearls
  invariant set (§1) applies unchanged.
* **Hash-only rule.** Only the SHA-256 subject hash, the public ID string, the issuer,
  and the block timestamp are stored. Content, evidence, and personal data never touch
  the chain. One anchor per public ID (`AlreadyAnchored`); a subject hash may be
  anchored under additional public IDs, and the reverse lookup returns the first.
* **Status.** Built 2026-10-22: contract + 8 unit tests (41/41 suite green) + local
  Anvil round-trip proof (`docs/attestation-registry-anvil-proof.md`). Deploy runbook:
  `ATTESTATION-ANCHORING.md`. **Not deployed anywhere** — Sepolia deploy is the owner's
  gate; mainnet requires the §9 third-party audit path first, in that order.
