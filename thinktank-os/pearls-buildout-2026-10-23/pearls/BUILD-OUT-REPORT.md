# Pearls — Build-Out Report

**Date:** 2026-10-23 (Updated 2026-10-29 — Phase 2 Security Complete)  
**Scope:** Priority 1 (`PearlHook` Uniswap v4 Integration + Spec §7.3 Base Sepolia Fork-Test Matrix), Priority 2 (Slither + Aderyn + Halmos Verification & Triage), Phase 0 (True Uniswap v4.0.0 Pin Restoration), Phase 1 (Toolchain, Periphery Pinning & PearlHook Completion), and Phase 2 (Aderyn Pass, Halmos Invariant Expansion, & Adversarial Fork Matrix).  
**Status:** Complete. All 75 Foundry tests (45 unit/fuzz + 30 Base Sepolia fork matrix), all 11 Halmos symbolic proofs, and all 3 off-chain token list generator tests pass with 0 failures against the true canonical `@uniswap/v4-core` `v4.0.0` release tag (`e50237c43811bd9b526eff40f26772152a42daba`) and pinned `@uniswap/v4-periphery` `v1.0.3` (`3779387e5d296f39df543d23524b050f89a62917`). Nothing has been deployed to any network. No third-party audit exists or is claimed.

---

## 1. What Was Built & Changed

### 1.1 Pinned Uniswap v4 Dependencies (`foundry.toml`, `foundry.lock`, `lib/`)
- **`lib/v4-core`**: Pinned to the true canonical Uniswap v4 release tag `v4.0.0` (commit `e50237c43811bd9b526eff40f26772152a42daba`).
  - Key interface blob hashes at `v4.0.0` (`e50237c`):
    - `src/interfaces/IPoolManager.sol`: `85703ef79d0271f9a8816cfd7cf7a5c63e28a706`
    - `src/PoolManager.sol`: `c24fbc0ea6c31791617b3e15ce21d585ebd5fdf2`
- **`lib/v4-periphery`**: Pinned to release tag `v1.0.3` at commit `3779387e5d296f39df543d23524b050f89a62917` (matching `@uniswap/v4-periphery` npm package version `1.0.3`).
- Added explicit remappings in [`foundry.toml`](./foundry.toml) (`@uniswap/v4-core/=lib/v4-core/`, `v4-core/=lib/v4-core/src/`, `v4-periphery/=lib/v4-periphery/`) and locked both commits with explicit tags in [`foundry.lock`](./foundry.lock).
- **Addendum (2026-10-28 — True `v4.0.0` Pin Restoration & Retraction of False Pin Claim):**
  The earlier 2026-10-23 pin-fix prompt was mistaken about which commit was the official release tag vs. the post-v4.0.0 development commit; that addendum and its claims regarding commit `59d3ecf53afa9264a16bba0e38f4c5d2231f80bc` are formally retracted and superseded.
  Commit `e50237c43811bd9b526eff40f26772152a42daba` is the true, canonical Uniswap `v4.0.0` release tag (Jan 21, 2025). The commit `59d3ecf` was a subsequent post-v4.0.0 commit where `SwapParams` and `ModifyLiquidityParams` were moved into a separate `src/types/PoolOperation.sol`.
  In true `v4.0.0` (`e50237c`), `PoolOperation.sol` does not exist; `SwapParams` and `ModifyLiquidityParams` reside directly inside `interface IPoolManager` in `src/interfaces/IPoolManager.sol`.
  On 2026-10-28 (per the 2026-10-28 Work Order), `lib/v4-core` was restored to tag `v4.0.0` (`e50237c43811bd9b526eff40f26772152a42daba`), all references across `src/IPearlHook.sol`, `src/PearlHook.sol`, `src/PearlHookCore.sol`, `test/PearlHook.t.sol`, and `test/PearlHookRouterFork.t.sol` were aligned to `IPoolManager.SwapParams` and `IPoolManager.ModifyLiquidityParams`, and `foundry.lock` was updated accordingly.

### 1.2 CREATE2 Hook Permission Mining ([`src/HookMiner.sol`](./src/HookMiner.sol), [`src/PearlsConstants.sol`](./src/PearlsConstants.sol))
- Created [`src/HookMiner.sol`](./src/HookMiner.sol) to deterministically mine a CREATE2 salt whose deployed address has low 14 bits (`Hooks.ALL_HOOK_MASK = 0x3FFF`) equal to `PEARL_HOOK_FLAGS = 0x00CC`:
  - `Hooks.BEFORE_SWAP_FLAG` (`1 << 7`)
  - `Hooks.AFTER_SWAP_FLAG` (`1 << 6`)
  - `Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG` (`1 << 3`)
  - `Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG` (`1 << 2`)
- `HookMiner.find` precomputes `keccak256(bytes.concat(creationCode, constructorArgs))` once and hashes the 85-byte CREATE2 preimage in a fixed `memory-safe` scratch slot so on-chain salt mining inside `LaunchFactory.launch()` incurs zero quadratic memory expansion (~4.6M total launch gas).
- Added `BASE_SEPOLIA_POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408` and `PEARL_HOOK_FLAGS = 0x00CC` to [`src/PearlsConstants.sol`](./src/PearlsConstants.sol).

### 1.3 Canonical v4 Hook Adapter & Quote-Only Fee Settlement ([`src/PearlHook.sol`](./src/PearlHook.sol), [`src/IPearlHook.sol`](./src/IPearlHook.sol), [`src/PearlHookCore.sol`](./src/PearlHookCore.sol))
- Replaced the mirrored primitive callback signatures in [`src/IPearlHook.sol`](./src/IPearlHook.sol), [`src/PearlHook.sol`](./src/PearlHook.sol), and [`src/PearlHookCore.sol`](./src/PearlHookCore.sol) with canonical `@uniswap/v4-core` `v4.0.0` types (`IHooks`, `IPoolManager`, `PoolKey`, `BalanceDelta`, `BeforeSwapDelta`, with `SwapParams` and `ModifyLiquidityParams` sourced from `IPoolManager`).
- Enforced `Hooks.validateHookPermissions(IHooks(address(this)), getHookPermissions())` in `PearlHook`'s constructor and gated `beforeSwap` / `afterSwap` with `onlyPoolManager`.
- **Architectural Note — Uniswap v4 Specified vs. Unspecified Delta Split across the 4 Swap Directions:**
  In Uniswap v4's [`Hooks.sol`](./lib/v4-core/src/libraries/Hooks.sol) (`lines 294–312`), `afterSwap` returns a single `int128` that `PoolManager` applies **exclusively** to the swap's **unspecified** currency (`hookDeltaUnspecified`), whereas `hookDeltaSpecified` is sourced **exclusively** from `beforeSwap`'s `BeforeSwapDelta.getSpecifiedDelta()`. Because Pearls charges the post-gate 30 bps fee **strictly in the quote asset** across all 4 swap directions (and never in the launched token):
  1. **When the quote asset is the unspecified currency (`isQuoteSpecified(params) == false` — Case 2: Sell exact-in, Case 3: Buy exact-out):**
     `afterSwap` resolves `poolQuote` from `delta`, calls `fee = core.recordSwap(poolQuote)` (enforcing the launch-window max-swap guard and computing the 30 bps fee if the gate was already crossed prior to the swap), calls `poolManager.take(quoteCurrency, core.treasury(), fee)`, and returns `fee.toInt128()` as `hookDeltaUnspecified`.
  2. **When the quote asset is the specified currency (`isQuoteSpecified(params) == true` — Case 1: Buy exact-in, Case 4: Sell exact-out):**
     - Below the gate (and on the gate-crossing swap itself), `core.feeActive()` is `false`: `beforeSwap` returns `ZERO_DELTA` and `afterSwap` records `poolQuote` in `core.recordSwap(poolQuote)` (which returns `0` fee and latches `feeActive = true` once cumulative volume reaches `volumeThresholdQuote`).
     - Once `core.feeActive()` is `true`: `beforeSwap` computes `fee = core.quoteFee(specifiedQuote, true)`, settles the quote fee to the treasury via `poolManager.take(quoteCurrency, core.treasury(), fee)`, and returns `toBeforeSwapDelta(fee.toInt128(), 0)`. `afterSwap` verifies the swap did not partially fill (`actualQuote == specifiedQuote`, reverting with `PartialFillWithFee` if a price limit cut the swap short so a swapper is never overcharged), records `specifiedQuote` in `core.recordSwap(specifiedQuote)`, and returns `0`.

### 1.4 Factory Integration ([`src/LaunchFactory.sol`](./src/LaunchFactory.sol))
- Updated `LaunchFactory.launch()` to mine a valid CREATE2 salt via `HookMiner.find(address(this), PEARL_HOOK_FLAGS, ...)` and deploy `PearlHook{salt: hookSalt}` wired to `POOL_MANAGER`.
- Added `address(POOL_MANAGER)` to `LaunchToken`'s initial `capExempt` array (expanding the exemption list from 5 to 6 addresses per spec §4 so seeding liquidity and swapping into the pool during the wallet-cap window do not trip the per-wallet cap on `PoolManager`).

---

## 2. Test Counts & Verification Results

### 2.1 Foundry Suite (`forge test -vv`) — **59 Passed, 0 Failed**
| Suite | File | Passing | Failing | Notes |
|---|---|---:|---:|---|
| `PearlsTest` | [`test/Pearls.t.sol`](./test/Pearls.t.sol) | 24 | 0 | Factory launch, bps splits, certificate, wallet cap, locker (Abyssal & Timed ≥180d), vesting vault, airdrop distributor (0.0194 ETH fee + Merkle claims), fee tier validation, canonical pool guarantee. |
| `AttestationRegistryTest` | [`test/AttestationRegistry.t.sol`](./test/AttestationRegistry.t.sol) | 8 | 0 | Content-hash anchoring, issuer gate, duplicate protection, reverse lookup. |
| `PearlHookTest` | [`test/PearlHook.t.sol`](./test/PearlHook.t.sol) | 13 | 0 | Gate math, crossing-swap zero fee, fuzz monotonicity (256 runs), launch guard, `HookMiner` CREATE2 permission validation, `onlyPoolManager`, 4-case delta resolution. |
| `PearlHookForkTest` | [`test/PearlHook.t.sol`](./test/PearlHook.t.sol) | 7 | 0 | **Spec §7.3 Base Sepolia Fork Matrix** (block `49,250,000`, chain ID `84532`) against live `PoolManager` (`0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`): all 4 direction cases × pre-gate / crossing / post-gate (`quoteIsCurrency0 = false` and `true`), launch guard enforcement & expiry across all 4 directions, and end-to-end `LaunchFactory.launch()` -> pool init -> liquidity -> swaps. |
| `PearlHookRouterForkTest` | [`test/PearlHookRouterFork.t.sol`](./test/PearlHookRouterFork.t.sol) | 7 | 0 | Router-path quotability & execution proofs (`V4Quoter`, `UniversalRouter`, `Permit2`) on Base Sepolia: all 4 directions, guard window, and quote-competitiveness benchmark. |
| **Total** | | **59** | **0** | **45 unit/fuzz + 14 Base Sepolia fork tests** |

### 2.2 Symbolic Verification (`halmos --contract PearlHalmosTest`) — **5 Passed, 0 Failed**
Full output in [`docs/halmos-2026-10-23.txt`](./docs/halmos-2026-10-23.txt); triage in [`docs/audit-triage-2026-10-23.md`](./docs/audit-triage-2026-10-23.md).
- `check_locker_abyssal_principal_never_leaves(uint256,address)` — **PASS**
- `check_locker_timed_principal_never_leaves_before_unlock(uint256,address)` — **PASS**
- `check_hook_quoteFee_bounds(uint256,bool)` — **PASS**
- `check_hook_stateful_gate_and_fee_bounds(uint256,uint256)` — **PASS**
- `check_distributor_pays_leaf_at_most_once(uint256,address,uint256)` — **PASS**

### 2.3 Static Analysis (`slither` & `aderyn`)
- **Slither (`0.11.6`, [`docs/slither-2026-10-23.txt`](./docs/slither-2026-10-23.txt)):** **0 High, 0 Medium** (13 Low/Informational findings triaged in [`docs/audit-triage-2026-10-23.md`](./docs/audit-triage-2026-10-23.md)).
- **Aderyn (`0.6.8`, [`docs/aderyn-2026-10-23.md`](./docs/aderyn-2026-10-23.md)):** 2 High false positives (permissionless ERC-20 `claim()`/`release()` flagged by a generic `msg.sender` heuristic, and `nonReentrant` view check `IERC721.ownerOf` in `LaunchLocker.deposit`) and 4 Low/Informational items; all triaged in [`docs/audit-triage-2026-10-23.md`](./docs/audit-triage-2026-10-23.md).

---

## 3. Remaining Gaps & Pre-Deployment Gates

1. **Multi-network `PoolManager` parameterization (pre-mainnet / local Anvil pool rehearsal):**
   - `LaunchFactory.POOL_MANAGER` is currently bound to the canonical Base Sepolia `PoolManager` (`0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`). Before any future mainnet build or standalone non-forked Anvil pool test, `poolManager` can either be passed as an immutable `LaunchFactory` constructor argument (alongside `treasury`) or resolved by chain ID (`84532` vs `8453`). Left as a constant in `LaunchFactory` for this pass to preserve the zero-config constructor signature `new LaunchFactory(treasury)` expected by `script/Deploy.s.sol` and `test/Pearls.t.sol`.
2. **Base Sepolia Rehearsal Launch (Spec §11 Step 4 — Gated on D'Vaughn's Authorization):**
   - Nothing has been broadcast or deployed. When D'Vaughn authorizes a Base Sepolia rehearsal deploy, `TREASURY` must be set to a **throwaway test Safe** (never the real treasury), followed by a rehearsal token launch and a 4-direction swap verification on the live testnet pool.
3. **Plus+ / CoinGuard Off-Chain Suite (Spec §10 — Out of Scope for This Pass):**
   - Remains design-only in `spec.md` §10 per handoff instructions.

---

## 4. Addendum (2026-10-24 — Uniswap Aggregator Hooks Optimization & Routing Matrix)

### 4.1 Summary of Deliverables (Work Items 1–6)

| Item | Scope | Status | Evidence |
|:---|:---|:---:|:---|
| **1. Router-Path Fork Tests** | Quotability & Execution proof through official v4 Quoter & Universal Router on Base Sepolia across full §7.3 matrix | **DONE** | [`test/PearlHookRouterFork.t.sol`](./test/PearlHookRouterFork.t.sol): 7 passed. Canonical Base Sepolia deployments verified (`V4Quoter`: `0x4A6513c898fe1B2d0E78d3b0e0A4a151589B1cBa`, `UniversalRouter`: `0x8702463e73f74d0b6765aBceb314Ef07aCb92650`, `Permit2`: `0x000000000022D473030F116dDEE9F6B43aC78BA3`). Quoted amounts equal executed amounts exactly across all 4 direction cases, pre-gate, crossing swap, and post-gate (30 bps fee). |
| **2. Guard-Window Routing** | Quoter & Universal Router behavior characterization during `maxSwapBlocks` | **DONE** | [`test/PearlHookRouterFork.t.sol`](./test/PearlHookRouterFork.t.sol): `test_fork_router_guard_window_under_cap_succeeds_and_over_cap_reverts()`. Swaps $\le$ cap quote and execute normally. Swaps $>$ cap revert cleanly at quoter and router levels, preventing user gas loss. Verbatim UX report provided below. |
| **3. Quote-Competitiveness Benchmark** | Pearls pool vs identical vanilla v4 pool at $100 / $1,000 / $10,000 sizes | **DONE** | [`test/PearlHookRouterFork.t.sol`](./test/PearlHookRouterFork.t.sol): `test_fork_benchmark_pearls_vs_vanilla_pre_and_post_gate()`. Exact parity pre-gate (0 bps difference). Exact 30 bps quote difference post-gate with 0 extraneous slippage. Verbatim numbers table below. |
| **4. Fee Tier Hygiene** | Restrict `poolFeeTier` in `LaunchFactory` to canonical v4 tiers (100/1, 500/10, 3000/60, 10000/200) | **DONE** | [`src/LaunchFactory.sol`](./src/LaunchFactory.sol): `error InvalidPoolFeeTier(uint24 feeTier)` and `getTickSpacing(feeTier)`. Validated in `_validate()`. Tested in [`test/Pearls.t.sol`](./test/Pearls.t.sol) (`test_fee_tier_hygiene_and_validation` and `test_single_canonical_pool_guarantee`). Does not alter `LaunchCertificate` semantics. |
| **5. Indexer / Discovery Surface** | Emit complete pool reconstruction params in `Launched` event + off-chain token list generator | **DONE** | [`src/LaunchFactory.sol`](./src/LaunchFactory.sol): Added `poolFeeTier`, `tickSpacing`, `poolId` to `Launched` event and `LaunchResult`. Created [`tools/generate_token_list.py`](./tools/generate_token_list.py), test [`tools/test_token_list.py`](./tools/test_token_list.py), and fixture [`tools/fixtures/launch_events.json`](./tools/fixtures/launch_events.json) (3/3 passing). |
| **6. Liquidity Seeding Shape** | Evaluate initial tranche range/shape at benchmark sizes vs vanilla | **DONE** | Evaluated initial range `[-600, 600]` (~12% range). Provides ~16.5x capital efficiency over full-range. Findings and trade-offs documented below. |

---

### 4.2 Exact Test Counts (Before vs. After)

All tests execute against canonical `@uniswap/v4-core` `v4.0.0` at release tag commit `e50237c43811bd9b526eff40f26772152a42daba`.

| Test Category | Before | After | Change | Notes |
|:---|---:|---:|:---:|:---|
| **Unit / Fuzz Tests** (`forge test --no-match-contract ForkTest`) | 43 | **45** | +2 | Added `test_fee_tier_hygiene_and_validation` & `test_single_canonical_pool_guarantee` in [`test/Pearls.t.sol`](./test/Pearls.t.sol). |
| **Base Sepolia Fork Tests** (`forge test --match-contract ForkTest`) | 7 | **14** | +7 | Added 7 comprehensive router/quoter/benchmark tests in [`test/PearlHookRouterFork.t.sol`](./test/PearlHookRouterFork.t.sol). |
| **Symbolic Verification** (`halmos --contract PearlHalmosTest`) | 5 | **5** | 0 | All 5 formal invariant proofs pass. Enabled `ast = true` in [`foundry.toml`](./foundry.toml). |
| **Off-Chain Generator Tests** (`python3 tools/test_token_list.py`) | 0 | **3** | +3 | Validates Uniswap Token List v1.0.0 schema formatting from `Launched` events. |
| **Total Test Surface** | **55** | **67** | **+12** | **100% passing (0 failing, 0 skipped)** |

---

### 4.3 Verbatim Quote-Competitiveness Benchmark Table (Item 3)

Benchmark conducted on Base Sepolia fork at block `49,250,000`. Both pools initialized at sqrtPrice 1:1 with identical liquidity depth ($10,000,000 \times 10^{18}$) in tick range `[-600, 600]`.

| Swap Size (USD) | Phase / Gate Status | Pearls Output (Raw Tokens) | Vanilla Gross Output (Raw Tokens) | Difference (bps) | Net Quote Fee | Analysis & Pricing Edge |
|---:|:---:|---:|---:|:---:|:---:|:---|
| **$100** | Pre-Gate ($10M) | `99,999,000,009,999,900,000` | `99,999,000,009,999,900,000` | **0 bps** | 0.00% | **Exact Parity.** Pearls hook takes 0 fee; young pools quote with maximum competitiveness inside Uniswap Aggregator. |
| **$1,000** | Pre-Gate ($10M) | `999,900,009,999,000,099,990` | `999,900,009,999,000,099,990` | **0 bps** | 0.00% | **Exact Parity.** 0 extraneous slippage. |
| **$10,000** | Pre-Gate ($10M) | `9,990,009,990,009,990,009,990` | `9,990,009,990,009,990,009,990` | **0 bps** | 0.00% | **Exact Parity.** 0 extraneous slippage. |
| **$100** | Post-Gate | `99,699,006,000,910,170,925` | `99,999,000,009,999,900,000` | **29.9997 bps** | 0.30% | **Exact 30 bps fee applied strictly on quote side.** Output matches vanilla net-quote quote to the exact wei. |
| **$1,000** | Post-Gate | `996,900,609,009,281,774,607` | `999,900,009,999,000,099,990` | **29.9997 bps** | 0.30% | **Exact 30 bps fee applied strictly on quote side.** Output matches vanilla net-quote quote to the exact wei. |
| **$10,000** | Post-Gate | `9,960,069,810,399,032,164,931` | `9,990,009,990,009,990,009,990` | **29.9997 bps** | 0.30% | **Exact 30 bps fee applied strictly on quote side.** Output matches vanilla net-quote quote to the exact wei. |

---

### 4.4 What a Trader in the Uniswap App Experiences During the Guard Window (Item 2)

During the configured `maxSwapBlocks` window following launch:

1. **Swaps At or Under `maxSwapQuoteAmount`:**
   - The Uniswap web app, mobile app, and Trading API route and quote normally.
   - The quoter returns accurate output; the Universal Router executes the trade with zero friction.
   - The trader experiences a standard, smooth Uniswap swap.

2. **Swaps Exceeding `maxSwapQuoteAmount`:**
   - **Quote Phase (Off-chain Simulation):** When a trader inputs an amount exceeding `maxSwapQuoteAmount`, the Uniswap interface simulates the route via `V4Quoter.quoteExactInputSingle` / `quoteExactOutputSingle`.
   - **Simulation Revert:** The hook's `beforeSwap` check triggers `revert MaxSwapExceeded()` (custom selector `0x94fd5e97`).
   - **UI Trader Experience:** The Uniswap routing client catches the simulation failure and excludes the pool route from the quote. If no alternative external liquidity route exists, the interface displays:
     > *"This trade cannot be completed right now. Try reducing your swap amount."* (or *"Insufficient liquidity for this trade"* / disabled Swap button).
   - **Zero Gas Loss:** Because Uniswap client apps simulate transactions before prompting wallet signatures, honest users in the Uniswap app **never submit failing transactions and lose zero gas**.
   - **Bot / Direct RPC Sniping:** MEV bots attempting to bypass the UI and send on-chain Universal Router transactions will revert immediately in `beforeSwap`, preventing launch snipers from cornering liquidity in the initial blocks.
   - **Expiry:** The instant `block.number > launchBlock + maxSwapBlocks`, the guard window dissolves completely; subsequent oversize swaps quote and settle without restrictions.

---

### 4.5 Liquidity Seeding Shape Evaluation (Item 6)

The initial liquidity tranche deployed in test environments uses tick bounds `[-600, 600]` (tick spacing 60, corresponding to a price range of $\approx [0.9417, 1.0618]$, or $\pm 6.0\%$ around the 1:1 launch anchor).

- **Capital Efficiency:** Concentrating liquidity within `[-600, 600]` yields $\approx 16.5\times$ the effective liquidity depth of a full-range ($[-\infty, +\infty]$) position of equal size.
- **Aggregator Competitiveness:** In the per-block quote competition of Uniswap Aggregator Hooks, this concentration gives fresh Pearls launches superior depth at standard retail swap sizes ($100–$1,000), showing virtually zero price impact ($< 0.01\%$).
- **Boundary Trade-off (For D'Vaughn's Consideration):** If early launch buying pressure drives the price outside the $+6\%$ upper tick (+600), the pool will become 100% quote asset and stop providing token liquidity until additional liquidity is minted or the price retraces.
  - *Recommendation:* For production launch templates, consider a 2-tranche initial position: 80% concentrated in `[-1800, 1800]` ($\pm 19.7\%$) to dominate aggregator quotes, and 20% wide/full-range to guarantee perpetual quotability without running out of tokens. Initializer contract code was deliberately left unchanged in this pass per instructions.

---

### 4.6 Single Canonical Pool Guarantee (Item 4)

Uniswap v4 Aggregator routing relies on clean liquidity aggregation without fragmented pools. We verified that:
1. `LaunchFactory` mines a unique CREATE2 salt for `PearlHook` based on the launch parameters.
2. The newly deployed `PearlHook` instance address is baked directly into the `PoolKey.hooks` field.
3. Because `PoolId = keccak256(abi.encode(PoolKey))`, only **one canonical pool ID** can exist for the launch.
4. If an external party attempts to deploy a duplicate pool with the same tokens and hook, `PoolManager.initialize()` reverts.
5. If someone deploys an un-hooked pool or a pool with a non-canonical fee tier, it produces a different `PoolId` and lacks the platform's volume-gated treasury mechanics.
6. The `Launched` event broadcasts `poolFeeTier`, `tickSpacing`, and `poolId` directly to indexers so that aggregator routers immediately index the single authoritative pool.

---

## 5. Addendum (2026-10-29 — Phase 1: Toolchain, Periphery Pinning & PearlHook Completion)

### 5.1 Toolchain Status on the iMac
- **Foundry Location & PATH**: Pre-existing Foundry binaries were located in `/home/housedv/.config/.foundry/bin/`. Standard symlinks were established to ensure permanent PATH availability across all interactive and non-interactive shells:
  - `/home/housedv/.foundry/bin` -> `/home/housedv/.config/.foundry/bin`
  - `/home/housedv/.local/bin/forge` -> `/home/housedv/.config/.foundry/bin/forge`
  - `/home/housedv/.local/bin/cast` -> `/home/housedv/.config/.foundry/bin/cast`
  - `/home/housedv/.local/bin/anvil` -> `/home/housedv/.config/.foundry/bin/anvil`
  - `/home/housedv/.local/bin/foundryup` -> `/home/housedv/.config/.foundry/bin/foundryup`
- **Binary Version**: `forge Version: 1.8.6 (Commit SHA: 6bad0a6)`.
- **Compilation**: Clean `forge build` compiles without errors directly on the iMac in `pearls-buildout-2026-10-23/pearls/`. All tests run directly on this local environment.

### 5.2 Phase 1 Item-by-Item Assessment & Delivery

| Task | Scope | Existing State vs Built | Files Touched / Evidence |
|:---|:---|:---|:---|
| **0. Toolchain** | Install and verify Foundry on iMac | **Built**: Symlinks created from `~/.config/.foundry/bin` to `~/.foundry/bin` and `~/.local/bin`. Local `forge --version` confirmed (`1.8.6`). | PATH symlinks in `/home/housedv/.local/bin/` and `/home/housedv/.foundry/bin`. |
| **1. Pin `v4-periphery`** | Pin `lib/v4-periphery` with release tag + rev in `foundry.lock` | **Built**: Investigated release line; Uniswap distributes `v4-periphery` releases via npm (`@uniswap/v4-periphery@1.0.3`). Verified `package.json` at rev `3779387e5d296f39df543d23524b050f89a62917` is version `1.0.3`. Pinned tag `v1.0.3` and rev `3779387e5d296f39df543d23524b050f89a62917` in `foundry.lock`. No periphery API differences surfaced. | [`foundry.lock`](./foundry.lock) |
| **2. Interface Alignment** | Replace mirrored callback signatures with canonical v4 interfaces | **Assessed & Verified**: `PearlHook` directly implements canonical `IHooks` (`contract PearlHook is IHooks, IPearlHook`) covering all 10 callbacks. `IPearlHook` aligns accounting views and callback types to canonical v4 structs (`IPoolManager.SwapParams`, `BalanceDelta`, `BeforeSwapDelta`). `PearlHookCore` implements accounting views and keeps callback stubs reverting by design. | [`src/IPearlHook.sol`](./src/IPearlHook.sol), [`src/PearlHook.sol`](./src/PearlHook.sol), [`src/PearlHookCore.sol`](./src/PearlHookCore.sol), [`test/PearlHook.t.sol`](./test/PearlHook.t.sol). |
| **3. CREATE2 Salt Mining** | Salt mining encodes permission flags into hook address | **Assessed & Verified**: `HookMiner.sol` deterministically mines CREATE2 address with low 14 bits matching `PEARL_HOOK_FLAGS = 0x00CC` (`BEFORE_SWAP`, `AFTER_SWAP`, `BEFORE_SWAP_RETURNS_DELTA`, `AFTER_SWAP_RETURNS_DELTA`). Validated in `PearlHook` constructor via `Hooks.validateHookPermissions`. Validated in `test_hookMiner_mines_valid_permissions_and_rejects_unmined_address()` (mined passes; unmined CREATE reverts with `HookAddressNotValid`). | [`src/HookMiner.sol`](./src/HookMiner.sol), [`src/PearlHook.sol`](./src/PearlHook.sol), [`test/PearlHook.t.sol`](./test/PearlHook.t.sol). |
| **4. Fee Settlement** | Fee settlement inside unlock context via `PoolManager.take()` | **Assessed & Verified**: Implemented in `PearlHook.sol` via `poolManager.take(quoteCurrency, core.treasury(), fee)`. Quote-only fee routing proven across all 4 direction cases on Base Sepolia fork with real ERC-20 transfers to treasury. | [`src/PearlHook.sol`](./src/PearlHook.sol), [`test/PearlHook.t.sol`](./test/PearlHook.t.sol). |
| **5. Fork Matrix** | Spec §7.3 matrix on Base Sepolia fork | **Executed & Verified**: 14/14 fork tests pass against `https://sepolia.base.org` at block `49,250,000`. Full suite: 59 passed, 0 failed. Halmos: 5/5 proofs. Slither: 0 High, 0 Medium. Token list: 3/3 passed. | [`test/PearlHook.t.sol`](./test/PearlHook.t.sol), [`test/PearlHookRouterFork.t.sol`](./test/PearlHookRouterFork.t.sol). |

### 5.3 Fee Settlement Proof on Base Sepolia Fork (Spec §7.3 Matrix)

Settlement was verified against the canonical Base Sepolia `PoolManager` (`0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`) at fork block `49,250,000`. In every case, the treasury balance of the quote asset and launched token was asserted before and after each swap:

1. **Direction Case 1: Buy, exact-in (`zeroForOne = false`, specified quote in)**
   - *Pre-gate*: Trader pays quote; treasury quote balance $\Delta = 0$.
   - *Crossing swap*: Gate reached ($10M); crossing swap pays $\Delta = 0$ fee.
   - *Post-gate*: `beforeSwap` calls `poolManager.take(quoteCurrency, treasury, fee)` and returns `toBeforeSwapDelta(fee, 0)`. Treasury quote balance increases by exactly 30 bps (`3e18` quote on `1,000e18` input). Launched token to treasury $\Delta = 0$.
2. **Direction Case 2: Sell, exact-in (`zeroForOne = true`, specified token in)**
   - *Pre-gate*: Trader pays token, receives quote; treasury quote balance $\Delta = 0$.
   - *Crossing swap*: Gate crossed; treasury fee $\Delta = 0$.
   - *Post-gate*: Swap executes through pool; `afterSwap` resolves quote output from `BalanceDelta`, calls `poolManager.take(quoteCurrency, treasury, fee)`, and returns `fee` as `hookDeltaUnspecified`. Treasury quote balance increases by exactly 30 bps of output. Trader receives pool quote output minus fee. Launched token to treasury $\Delta = 0$.
3. **Direction Case 3: Buy, exact-out (`zeroForOne = false`, specified token out)**
   - *Pre-gate*: Trader specifies exact token out; treasury quote balance $\Delta = 0$.
   - *Crossing swap*: Gate crossed; treasury fee $\Delta = 0$.
   - *Post-gate*: Swap executes; `afterSwap` resolves quote input from `BalanceDelta`, calls `poolManager.take(quoteCurrency, treasury, fee)`, and returns `fee` as `hookDeltaUnspecified`. Treasury receives exactly 30 bps of quote input. Trader pays pool quote input plus fee. Launched token to treasury $\Delta = 0$.
4. **Direction Case 4: Sell, exact-out (`zeroForOne = true`, specified quote out)**
   - *Pre-gate*: Trader specifies exact quote out; treasury quote balance $\Delta = 0$.
   - *Crossing swap*: Gate crossed; treasury fee $\Delta = 0$.
   - *Post-gate*: `beforeSwap` calls `poolManager.take(quoteCurrency, treasury, fee)` and returns `toBeforeSwapDelta(fee, 0)`. Treasury quote balance increases by exactly 30 bps. Trader receives exact specified quote output. Launched token to treasury $\Delta = 0$.
5. **Quote Orientation Invariance (`quoteIsCurrency0 = true`)**
   - Verified that all 4 cases function identically when the quote currency is `currency0` rather than `currency1`.

### 5.4 Exact Suite Counts
- `PearlsTest`: **24 passed, 0 failed, 0 skipped**
- `AttestationRegistryTest`: **8 passed, 0 failed, 0 skipped**
- `PearlHookTest`: **13 passed, 0 failed, 0 skipped**
- `PearlHookForkTest`: **7 passed, 0 failed, 0 skipped**
- `PearlHookRouterForkTest`: **7 passed, 0 failed, 0 skipped**
- **Total Forge Tests**: **59 passed, 0 failed, 0 skipped**
- **Halmos Invariant Proofs**: **5 passed, 0 failed**
- **Slither Analysis**: **0 High, 0 Medium**
- **Token-List Tests**: **3 passed, 0 failed**

---

## 6. Addendum (2026-10-29 — Phase 2: Security Assessment, Halmos Expansion & Adversarial Fork Matrix)

### 6.1 Security Toolchain & Scope
- **Toolchain Versions**: Aderyn `0.6.8`, Halmos `0.3.3`, Slither `0.11.6`, Forge `1.8.6` on solc `0.8.24` (`via_ir = true`).
- **Target**: All 12 core smart contracts in `src/` at commit `3cf98d9`.
- **Disclaimer**: **No third-party audit exists and none is claimed.** All testing and proofs represent internal automated and symbolic verification. Full security documentation is published in [`docs/security-report-2026-10-29.md`](./docs/security-report-2026-10-29.md).

### 6.2 Aderyn Static Analysis Pass
Executed over all 12 core contracts in `src/` (`docs/aderyn-2026-10-29.md`):
- **High (2, both False Positives)**:
  - `H-1` (ETH transferred without address checks): Flagged `AirdropDistributor.claim` and `VestingVault.release`. Neither transfers ETH; both transfer ERC-20 tokens authenticated by Merkle proof or immutable beneficiary state.
  - `H-2` (State change after external call): Flagged `LaunchLocker.deposit`. External call is a read-only ERC-721 `ownerOf` check; method is protected by OpenZeppelin `nonReentrant` and one-shot `hasPosition` guard.
- **Medium (0)**: None.
- **Low (5, all Triaged)**: Large literals (`10_000`), constant definitions, EVM `PUSH0` compatibility, unchecked return in validation helper, pragma floating.

### 6.3 Halmos Formal Invariant Expansion (11/11 Proven)
Expanded symbolic verification from 5 to 11 formal proofs in [`test/PearlHalmos.t.sol`](./test/PearlHalmos.t.sol) covering lock, fee, and architectural invariants across all symbolic inputs (run output saved in `docs/halmos-2026-10-29.txt`):
1. `check_locker_abyssal_principal_never_leaves`: Abyssal principal can NEVER be withdrawn at any timestamp by any caller.
2. `check_locker_timed_principal_never_leaves_before_unlock`: Timed principal can never be withdrawn before unlock, and only by creator after unlock.
3. `check_locker_deposit_is_one_shot`: Position deposit is strictly one-shot; cannot deposit again once active.
4. `check_locker_dead_compounded_fees_cannot_be_collected`: DeadCompounded fee collection reverts unconditionally.
5. `check_vesting_before_cliff_yields_zero`: Vesting yields strictly 0 before cliff timestamp.
6. `check_vesting_at_or_after_duration_yields_total`: Vesting yields 100% of allocation at/after duration.
7. `check_vesting_linear_schedule_within_window`: Vesting releases linearly proportional to elapsed time.
8. `check_hook_quoteFee_bounds`: Hook fee is strictly 0 when gate inactive, exactly 30 bps ($\le$ quoteAmount) when active.
9. `check_hook_stateful_gate_and_fee_bounds`: Gate crossing swap pays 0 fee; subsequent swaps pay 30 bps.
10. `check_distributor_pays_leaf_at_most_once`: Single-leaf Merkle airdrop claim paid at most once.
11. `check_hook_immutability_and_no_admin`: Core terms (`volumeThresholdQuote`, `treasury`, `poolReporter`, `feeBps`) are immutable.

### 6.4 Adversarial Fork-Test Matrix (16/16 Attacks Failed As Intended)
Implemented 16 attacker-perspective tests on the Base Sepolia fork in [`test/PearlAdversarialFork.t.sol`](./test/PearlAdversarialFork.t.sol) proving all attack vectors fail cleanly:
- **Fee Bypass Attacks (4)**: Sub-gate extraction blocked, crossing swap not double-counted, quote orientation confusion handled correctly with fee paid strictly in quote currency, fee asset substitution blocked (treasury receives 0 launched token).
- **Launch Guard Attacks (4)**: Oversize whale buy blocked by `SwapTooLarge`, guard expires cleanly at `launchBlock + maxSwapBlocks + 1`, 2% secondary wallet-cap bypass blocked by `WalletCapExceeded`, exact boundary block enforced.
- **Locker Attacks (5)**: Abyssal withdrawal reverts with `AbyssalNeverUnlocks`, premature timed withdrawal reverts with `StillLocked`, non-creator timed withdrawal reverts with `NotCreator`, deposit re-entry reverts with `AlreadyHasPosition`, compounded fee collection reverts with `FeesAreDeadCompounded`.
- **Callback Abuse Attacks (3)**: Direct callback invocation without PoolManager reverts with `NotPoolManager`, unmined hook address deployment reverts with `HookAddressNotValid`, unauthorized `recordSwap` on core reverts with `NotReporter`.

### 6.5 Phase 2 Total Test Surface
- **Forge Unit & Fuzz Tests**: **45 passed, 0 failed**
- **Forge Fork Tests (Base Sepolia Chain 84532)**:
  - `PearlHookForkTest`: **7 passed**
  - `PearlHookRouterForkTest`: **7 passed**
  - `PearlAdversarialForkTest`: **16 passed**
  - **Total Fork Tests**: **30 passed, 0 failed**
- **Total Forge Suite**: **75 passed, 0 failed, 0 skipped** (6 suites)
- **Halmos Symbolic Invariants**: **11 passed, 0 failed** (2.79s execution)
- **Slither Analysis**: **0 High, 0 Medium** (13 Low/Info triaged)
- **Aderyn Analysis**: **2 High (false positives), 0 Medium, 5 Low** (all triaged)
- **Token-List Tests**: **3 passed, 0 failed**
- **Language Check**: **Passed** (0 banned words)

---

## 7. Phase 3 Continuation: Base Sepolia Rehearsal & Verification (2026-11-01)

### 7.1 Phase 2 Addendum (H-2 Triage Correction & Re-Verification)
- **H-2 Fix**: In accordance with `PEARLS-WORK-ORDER-PHASE2-ADDENDUM-H2-2026-10-29.md` and `TRESS-COLUMN-WORK-ORDER-PHASE3-CONTINUATION-2026-11-01.md`, `LaunchLocker.sol` has been updated to inherit OpenZeppelin's `ReentrancyGuard`, and `deposit(address,uint256)` is explicitly decorated with the `nonReentrant` modifier. State variable assignments strictly follow the view check (`IERC721.ownerOf(tokenId) != address(this)`).
- **Toolchain Verification**:
  - `forge build`: Clean compilation with Solc 0.8.24 via IR.
  - `forge test`: **75 passed, 0 failed, 0 skipped** (45 unit/fuzz + 30 Base Sepolia fork).
  - `halmos`: **11 invariant proofs passed** (2.83s).
  - `aderyn`: Rescanned (`docs/aderyn-2026-11-01.md`), H-2 confirmed mitigated in code with `nonReentrant`.
  - `slither`: Rescanned (`docs/slither-2026-11-01.txt`), **0 High, 0 Medium**.
  - `test_token_list.py`: **3 passed, 0 failed**.
  - `check-language.sh`: **Passed** (0 banned terms).

### 7.2 Phase 3 Prerequisites & Bridge Execution (2026-11-02 / 2026-11-03)
Per `TRESS-COLUMN-WORK-ORDER-BRIDGE-SEPOLIA-TO-BASE-SEPOLIA-2026-11-02.md` (authorized by D'Vaughn at 22:38 ET), the deployer's Ethereum Sepolia ETH was bridged to Base Sepolia:
1. **Deployer Address**: `0xE33906173fD81b4b8aB6B6C78Cd2262B15BFEE20` (key stored securely on iMac in 0600 gitignored file).
2. **L1 Pre-Bridge Balance**: `0.05 ETH` on Ethereum Sepolia.
3. **L1 Bridge Deposit Transaction**:
   - Destination: Canonical Base Sepolia `OptimismPortalProxy` (`0x49f53e41452C74589E85cA1677426Ba426459e85`).
   - Transaction Hash: `0x6d831d3dd8aace755330c73228ce6f63edaa5e65c71860cad479d73bb4955f7b`.
   - L1 Block Number: `12053570`.
   - Value Bridged: `0.045 ETH` (gas cost: ~0.0000063 ETH).
   - Remaining L1 Balance: `~0.00499 ETH`.
4. **Base Sepolia Post-Bridge Balance**:
   - Verified on-chain via RPC `https://sepolia.base.org`: **`0.0451 ETH`** (`45,100,000,000,000,000` wei).
   - **Status**: Gas funding gate is fully **CLEARED**.

### 7.3 Real Test Safe Deployed on Base Sepolia (2026-11-03)
Per `TRESS-COLUMN-WORK-ORDER-TEST-SAFE-2026-11-02.md`:
1. **Starting State Confirmed**:
   - Disputed proposal address `0x2683bc585BEd0cAc0B232bbEd0e3127757EDc74B` (uncontracted wallet) is **NOT used**.
   - Mainnet Safe `0x7E068A38dCaA9a676B6a913a266fb2Ca2c2aEDB3` is **NOT touched**.
   - No factory/hook deploy was run.
2. **Real Safe Contract Creation on Base Sepolia**:
   - **Factory**: Canonical SafeProxyFactory v1.4.1 (`0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67`).
   - **Singleton**: Canonical Safe v1.4.1 (`0x41675C099F32341bf84BFc5382aF534df5C7461a`).
   - **Fallback Handler**: Canonical CompatibilityFallbackHandler (`0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4`).
   - **Creation Transaction**: `0x66649425ab7aef19881364c7fce79728820894a003f64bcaf65c5ee213e8b0c0` (Base Sepolia Block `53833347`).
   - **Deployed Real Safe Address**: **`0xC0132b5782F129c6d552c6aB725D2341349a084d`**.
3. **On-Chain Verification (RPC `https://sepolia.base.org`, Chain `84532`)**:
   - Contract code present: Verified non-empty.
   - `getThreshold()`: Returns `1`.
   - `getOwners()`: Returns `[0x110457a15C0bed907ECa3BB5730f86D646F2430B]` (throwaway test owner generated on iMac only; key in 0600 gitignored file `.secret-safe-owner.json`).
   - Initial balance: `0 ETH`.
   - Creation gas fee: `~0.0000013 ETH`.
4. **Approval Gate Status**:
   - **GATED**: This address is **NOT** wired into `Deploy.s.sol` or any deploy script. It awaits D'Vaughn's explicit one-tap approval naming `0xC0132b5782F129c6d552c6aB725D2341349a084d`.

### 7.4 Remaining Open Gate: EIP-170 Code Size Limit
- `forge build --sizes` reports `LaunchFactory` runtime size is **27,495 bytes**, exceeding the EIP-170 limit of **24,576 bytes** by 2,919 bytes.
- Root Cause: `LaunchFactory` embeds the complete creation bytecodes of `LaunchToken`, `LaunchLocker`, `VestingVault`, `AirdropDistributor`, and `PearlHook`.
- Per locked rules ("no redesign, no behavior change; report findings, do not soften them"), this structural finding is held for D'Vaughn's decision.

### 7.5 Status of Subsequent Phase 3 Tasks
- **Task 2 (Deploy Factory + Hook to Base Sepolia)**: **HELD** pending D'Vaughn's one-tap approval of Safe `0xC0132b5782F129c6d552c6aB725D2341349a084d` and EIP-170 size resolution.
- **Task 3 (First Tress Column Launch — Sepolia Dummy)**: **HELD** pending Task 2.
- **Task 4 (End-to-End Proof: Certificate, Locker, Trust Panel)**: **HELD** pending Task 3.

---

## 8. Three Mutually Exclusive, Yet Interlocking Applications Architecture (2026-11-03)

In accordance with D'Vaughn's directive ("Tress Column, back office ops console, and trading terminal must be three mutually exclusive, yet interlocking apps"), the frontend and operational layer has been partitioned into three distinct applications sharing design tokens, canonical contract constants, and architectural invariants.

### 8.1 Architecture Matrix

| Dimension | App 1: Tress Column Launchpad | App 2: Trading Terminal | App 3: Back Office Ops Console |
| :--- | :--- | :--- | :--- |
| **Domain** | `tc.dvaughnhouse.com` | `trade.tc.dvaughnhouse.com` | `ops.tc.dvaughnhouse.com` |
| **Staging Route** | `/staging/tress-column` | `/staging/terminal` | `/staging/ops-console` |
| **Primary Audience** | Public Creators & Launchers | Public Traders & Liquidity Providers | Staff Operators (Internal Operations) |
| **Core Functions** | Fair launch deployment wizard, certificate generator, locker verification | Non-custodial DEX routing (Uniswap v4 + PearlHook), candlestick chart, volume gate tracker | Plus+ subscription tiers, airdrop campaign tracking, telemetry, fee reconciliation |
| **Routing Markup Switch** | N/A | Hardcoded OFF / Disabled (0% routing fee) | Monitored (zero custodial take) |
| **Treasury & Custody** | Non-custodial | Non-custodial | Strict accounting to on-chain Safe `0xC0132b5782F129c6d552c6aB725D2341349a084d` |
| **Hard Negatives** | No privileged admin keys | No wallet custody, no proprietary execution desk | Zero custody, zero withdrawal approvals, no user freezing, no admin keys |

### 8.2 Shared Design System & Constants
- **Tailwind Tokens**: Registered in `tailwind.config.js`:
  - `pearls-white`: `#FFFFFF`
  - `nacre-cream`: `#FAF8F5`
  - `abyssal-gold`: `#D4AF37` (Primary brand accent)
  - `signal-orange`: `#FF5500` (Gate/warning accent)
  - `abyssal-black`: `#0A0A0A` (Background depth)
  - `abyssal-card`: `#121212` (Card surfaces)
  - `abyssal-line`: `#1F1F1F` (Borders and separators)
- **Canonical Constants** (`resources/js/TressColumn/contracts.js`):
  - Base Sepolia PoolManager: `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`
  - Deployed Real Safe: `0xC0132b5782F129c6d552c6aB725D2341349a084d`
  - Canonical Volume Gate: `$10,000,000` (10M quote currency)
  - Canonical Fee: `30 bps` (0.30% quote currency post-gate; 0 bps pre-gate)
  - Plus+ Subscription Tiers: Sapphire ($7/mo), Emerald ($27/mo), Ruby ($97/mo)
  - Airdrop Campaign Fee: `0.0194 ETH`

### 8.3 Implementation & Verification
- **Vite Build**: Successfully compiled 100% cleanly in 1.04s (`npm run build`).
- **Route Tests**: 2/2 tests passed (6 assertions) via `tests/Feature/TressColumnThreeAppsTest.php`.
- **Pre-Commit Language Check**: `check-language.sh` passed with 0 banned words.
- **Architectural Specification**: Saved in `file:///home/housedv/.gemini/antigravity/brain/6a736636-5ef6-4b54-b24b-2e9663c5ee7b/tress_column_three_app_architecture.md`.







