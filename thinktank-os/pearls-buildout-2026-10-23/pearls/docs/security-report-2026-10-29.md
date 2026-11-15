# Pearls — Security Assessment & Verification Report (Phase 2)

**Date:** October 29, 2026  
**Scope:** Core Smart Contracts (12 files in `src/`), Commit `3cf98d9` on branch `pearls-buildout`  
**Author:** Antigravity (Pair Programming with D'Vaughn House & Janine)  
**Status:** Complete. All 75 Foundry tests (45 unit/fuzz + 30 Base Sepolia fork), all 11 Halmos formal invariant proofs, Slither static analysis (0 High / 0 Medium), Aderyn static analysis (2 High false positives, 0 Medium, 5 Low), and off-chain token list tests passed.

---

> [!IMPORTANT]
> **Audit Status Disclaimer:**  
> **No third-party audit exists and none is claimed.** This document reflects internal automated security analysis, formal symbolic invariant proofs, and adversarial fork testing conducted directly on the codebase against live Base Sepolia Uniswap v4 deployments.

---

## 1. Scope & Toolchain

### 1.1 In-Scope Codebase
All 12 Solidity contracts, interfaces, and libraries in `src/`:
1. `src/AirdropDistributor.sol` (Merkle-tree trustless token distribution)
2. `src/AttestationRegistry.sol` (Immutable on-chain attestation and content-hash anchoring)
3. `src/HookMiner.sol` (Memory-safe assembly CREATE2 salt miner for hook permission bits)
4. `src/IPearlHook.sol` (Accounting views and canonical Uniswap v4 hook interface)
5. `src/LaunchCertificate.sol` (ERC-721 launch provenance & immutability certificate)
6. `src/LaunchFactory.sol` (Atomic token launch, pool wiring, LP lock, and vesting orchestrator)
7. `src/LaunchLocker.sol` (Custody of Uniswap v4 LP position NFT with Abyssal or Timed lock)
8. `src/LaunchToken.sol` (ERC-20 token with fixed supply and launch wallet-cap guard)
9. `src/PearlHook.sol` (Uniswap v4 hook adapter with unlock context quote-only fee settlement)
10. `src/PearlHookCore.sol` (Volume accumulation, $10M gate, and 30 bps fee accounting)
11. `src/PearlsConstants.sol` (Protocol-wide constants and canonical deployment addresses)
12. `src/VestingVault.sol` (Immutable linear vesting schedule with cliff)

### 1.2 Toolchain & Execution Environment
All tools were executed natively on the iMac in `pearls-buildout-2026-10-23/pearls/`:
- **Foundry / Forge:** `1.8.6 (Commit SHA: 6bad0a6)`
- **Aderyn:** `0.6.8`
- **Halmos:** `0.3.3` (Symbolic execution via Z3 SMT solver)
- **Slither:** `0.11.6`
- **Solidity Compiler:** `solc 0.8.24` (`via_ir = true`, EVM target: Cancun)
- **Dependencies:** Canonical `@uniswap/v4-core` release tag `v4.0.0` (`e50237c`), `@uniswap/v4-periphery` release `v1.0.3` (`3779387`), `@openzeppelin/contracts` `v5.0.2`.

---

## 2. Test & Verification Summary Counts

| Tool / Test Suite | Scope / Target | Tests / Checks | Passed | Failed | Status |
|:---|:---|---:|---:|---:|:---:|
| **Foundry — Unit & Fuzz** | `PearlsTest`, `AttestationRegistryTest`, `PearlHookTest` | 45 | 45 | 0 | **PASS** |
| **Foundry — Spec §7.3 Fork** | `PearlHookForkTest` (Base Sepolia 84532) | 7 | 7 | 0 | **PASS** |
| **Foundry — Router Fork** | `PearlHookRouterForkTest` (Base Sepolia 84532) | 7 | 7 | 0 | **PASS** |
| **Foundry — Adversarial Fork** | `PearlAdversarialForkTest` (Base Sepolia 84532) | 16 | 16 | 0 | **PASS** |
| **Total Forge Suite** | **All 6 Test Suites** | **75** | **75** | **0** | **PASS** |
| **Halmos Formal Invariants** | `PearlHalmosTest` (Z3 symbolic proofs) | 11 | 11 | 0 | **PROVEN** |
| **Slither Static Analysis** | Core contracts (`src/`) | 13 findings | 0 High, 0 Med | 0 | **TRIAGED** |
| **Aderyn Static Analysis** | Core contracts (`src/`) | 7 findings | 2 High (FP), 0 Med | 0 | **TRIAGED** |
| **Token-List Generator** | `tools/test_token_list.py` (Uniswap Token List v1.0.0) | 3 | 3 | 0 | **PASS** |
| **Mandatory Language Check** | `check-language.sh` | — | Pass | 0 | **PASS** |

---

## 3. Halmos Symbolic Invariant Verification Matrix

Every specified platform invariant was modeled in [`test/PearlHalmos.t.sol`](../test/PearlHalmos.t.sol) and proven across unbounded or bounded symbolic domains using Halmos (`0.3.3`):

| Invariant Category | Invariant Description | Symbolic Test Name | Paths Explored | Time (s) | Status |
|:---|:---|:---|---:|---:|:---:|
| **Lock: Abyssal** | Abyssal locker principal can NEVER be withdrawn by any caller at any timestamp | `check_locker_abyssal_principal_never_leaves` | 2 | 0.02s | **PROVEN** |
| **Lock: Timed** | Timed locker principal can never be withdrawn before `unlockTime`, and only by `creator` at/after unlock | `check_locker_timed_principal_never_leaves_before_unlock` | 5 | 0.09s | **PROVEN** |
| **Lock: One-Shot** | Position deposit is strictly one-shot; cannot deposit again once a position is held | `check_locker_deposit_is_one_shot` | 4 | 0.03s | **PROVEN** |
| **Lock: Compounded** | DeadCompounded lock mode rejects all fee collection calls unconditionally | `check_locker_dead_compounded_fees_cannot_be_collected` | 2 | 0.02s | **PROVEN** |
| **Vesting: Cliff** | VestingVault yields strictly 0 releasable tokens before cliff timestamp | `check_vesting_before_cliff_yields_zero` | 1 | 0.04s | **PROVEN** |
| **Vesting: Full** | VestingVault yields 100% of allocation at/after duration | `check_vesting_at_or_after_duration_yields_total` | 1 | 0.04s | **PROVEN** |
| **Vesting: Linear** | VestingVault releases linearly proportional to elapsed time within duration | `check_vesting_linear_schedule_within_window` | 4 | 0.98s | **PROVEN** |
| **Fee: Bounds** | Hook fee is strictly 0 when gate is inactive, and exactly 30 bps ($\le$ quoteAmount) when active | `check_hook_quoteFee_bounds` | 5 | 0.45s | **PROVEN** |
| **Fee: Crossing Swap** | Gate crossing swap pays 0 fee; subsequent swaps pay 30 bps | `check_hook_stateful_gate_and_fee_bounds` | 8 | 0.67s | **PROVEN** |
| **Distribution** | Airdrop leaf index can be claimed at most once | `check_distributor_pays_leaf_at_most_once` | 9 | 0.30s | **PROVEN** |
| **Architecture** | Immutability of core parameters (`volumeThresholdQuote`, `treasury`, `poolReporter`, `feeBps`) | `check_hook_immutability_and_no_admin` | 1 | 0.01s | **PROVEN** |

**Total Symbolic Execution Time:** 2.79s (11/11 invariants proven).

---

## 4. Adversarial Fork Test Attack Matrix

Attacker-perspective tests were executed against the Base Sepolia Uniswap v4 deployment (`PoolManager` `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`) in [`test/PearlAdversarialFork.t.sol`](../test/PearlAdversarialFork.t.sol). In every scenario, the attack was proven to fail cleanly without compromising safety invariants:

### 4.1 Fee Bypass Attacks
1. **`test_adversarial_fee_bypass_below_gate_cannot_extract_fees`**
   - *Attack:* Attacker executes multiple trades below the $10M cumulative volume threshold attempting to trigger premature fee collection.
   - *Result:* `feeActive` remains `false`. Treasury quote balance $\Delta = 0$. Launched token balance $\Delta = 0$.
2. **`test_adversarial_crossing_swap_not_double_counted`**
   - *Attack:* Attacker executes the exact gate-crossing swap and attempts to trigger retroactive taxation or double-counting.
   - *Result:* Gate-crossing swap pays strictly $0$ fee. Subsequent swap pays exact 30 bps fee without double-counting crossing volume.
3. **`test_adversarial_quote_orientation_confusion`**
   - *Attack:* Attacker constructs pool with quote as `currency0` attempting to trick hook into taxing the launched token (`currency1`).
   - *Result:* Fee is extracted strictly in `currency0` (quote asset). Treasury launched token balance remains $0$.
4. **`test_adversarial_fee_asset_substitution`**
   - *Attack:* Attacker attempts to divert or substitute launched token for quote fees.
   - *Result:* `PoolManager.take` routes strictly the quote currency to the treasury Safe.

### 4.2 Launch Guard Attacks
5. **`test_adversarial_max_swap_guard_blocks_whale_buy`**
   - *Attack:* Sniping bot attempts an oversize buy (`maxSwapQuoteAmount + 1`) during the configured guard window.
   - *Result:* Reverts with `PearlHookCore.SwapTooLarge`.
6. **`test_adversarial_max_swap_guard_expires_cleanly`**
   - *Attack:* Attacker tests trade execution immediately after the guard window expires (`block.number > launchBlock + maxSwapBlocks`).
   - *Result:* Swaps exceeding earlier cap execute cleanly with zero restriction.
7. **`test_adversarial_token_cap_bypass_blocked`**
   - *Attack:* Attacker attempts secondary-market accumulation exceeding the 2% per-wallet holding cap during the `walletCapBlocks` window.
   - *Result:* Reverts with `LaunchToken.WalletCapExceeded`.
8. **`test_adversarial_guard_boundary_enforcement`**
   - *Attack:* Attacker probes boundary blocks (`launchBlock + maxSwapBlocks` vs. `launchBlock + maxSwapBlocks + 1`).
   - *Result:* Reverts at the exact boundary block; succeeds at block $+1$.

### 4.3 Locker Attacks
9. **`test_adversarial_locker_abyssal_principal_withdrawal_fails`**
   - *Attack:* Attacker (and creator) attempts to call `withdrawPrincipal()` on an Abyssal locker.
   - *Result:* Reverts with `LaunchLocker.AbyssalNeverUnlocks`.
10. **`test_adversarial_locker_timed_early_withdrawal_fails`**
    - *Attack:* Creator attempts premature withdrawal before `unlockTime`.
    - *Result:* Reverts with `LaunchLocker.StillLocked`.
11. **`test_adversarial_locker_timed_non_creator_cannot_withdraw`**
    - *Attack:* Unauthorized third-party attempts to withdraw principal after `unlockTime`.
    - *Result:* Reverts with `LaunchLocker.NotCreator`.
12. **`test_adversarial_locker_deposit_reentry_blocked`**
    - *Attack:* Attacker attempts to overwrite or re-enter `deposit()` on an active locker.
    - *Result:* Reverts with `LaunchLocker.AlreadyHasPosition`.
13. **`test_adversarial_locker_compounded_fee_collection_blocked`**
    - *Attack:* Attacker attempts fee collection on a `DeadCompounded` LP lock.
    - *Result:* Reverts with `LaunchLocker.FeesAreDeadCompounded`.

### 4.4 Callback Abuse & Spoofing
14. **`test_adversarial_direct_callbacks_not_from_pm_revert`**
    - *Attack:* Attacker calls `PearlHook.beforeSwap` or `afterSwap` directly bypassing `PoolManager`.
    - *Result:* Reverts with `PearlHook.NotPoolManager`.
15. **`test_adversarial_unmined_hook_deployment_reverts`**
    - *Attack:* Attacker deploys `PearlHook` using standard `new` without mining required low-14-bit permission flags.
    - *Result:* Constructor reverts with `Hooks.HookAddressNotValid`.
16. **`test_adversarial_unauthorized_record_swap_on_core_reverts`**
    - *Attack:* Attacker calls `PearlHookCore.recordSwap` directly bypassing the adapter.
    - *Result:* Reverts with `PearlHookCore.NotReporter`.

---

## 5. Static Analysis Triage (Aderyn & Slither)

### 5.1 Aderyn (`0.6.8`) Findings & Dispositions

| ID | Detector | Severity | Location | Disposition & Rationale |
|:---|:---|:---:|:---|:---|
| **H-1** | ETH transferred without address checks | High | `AirdropDistributor.claim`, `VestingVault.release` | **False Positive.** Neither function transfers native ETH; both transfer ERC-20 tokens via `safeTransfer(account, amount)` and `safeTransfer(beneficiary, amount)`. Recipient addresses are authenticated via Merkle proofs (`claim`) or immutable contract state (`beneficiary`). |
| **H-2** | Reentrancy: State change after external call | High | `LaunchLocker.deposit` | **False Positive / Mitigated.** The external call is `IERC721(collection).ownerOf(tokenId) != address(this)`, which is a read-only view check. Per Phase 2 Addendum (`PEARLS-WORK-ORDER-PHASE2-ADDENDUM-H2-2026-10-29.md`), `LaunchLocker` inherits OpenZeppelin's `ReentrancyGuard` and `deposit` is protected by `nonReentrant` and the one-shot `hasPosition` guard. |
| **L-1** | Large Numeric Literal | Low | `LaunchFactory`, `PearlHook`, `PearlHookCore` | **Accepted / Design.** Denominator `10_000` (100.00% bps) and Uniswap v4 fee tier `10000` (1.00%) represent standard domain constants. |
| **L-2** | Literal Instead of Constant | Low | `AirdropDistributor`, `LaunchFactory`, `PearlHook` | **Accepted / Informational.** Standard bit shifts (`128`, `256`) and fee rate constants (`30`) are documented inline. |
| **L-3** | PUSH0 Opcode | Low | All contracts (`pragma ^0.8.24`) | **Accepted.** Base Sepolia and Base Mainnet EVM execution environments natively support `PUSH0` (Cancun EVM). |
| **L-4** | Unchecked Return Value | Low | `LaunchFactory._validate` (`getTickSpacing`) | **Accepted / Design.** `getTickSpacing` reverts with `InvalidPoolFeeTier` on invalid tiers; returned `tickSpacing` is deliberately used for validation side effects. |
| **L-5** | Unspecific Solidity Pragma | Low | All contracts | **Accepted.** Pinned to exact compiler `solc 0.8.24` via `foundry.toml`. |

### 5.2 Slither (`0.11.6`) Findings & Dispositions

- **High:** 0
- **Medium:** 0
- **Low / Informational:** 13 findings across 6 detector categories:
  - `incorrect-equality`: `VestingVault.release()` (`amount == 0`) — **By design.** Reverts with `NothingToRelease()` on zero-value releases.
  - `reentrancy-events`: Events emitted after external transfers (`claim`, `collectFees`, `withdrawPrincipal`, `release`, `launch`) — **Safe.** State mutations occur strictly before calls; entrypoints carry `nonReentrant`.
  - `timestamp`: Comparisons against multi-day lock durations (≥180-day floor) — **Acceptable.** Sequencer drift is negligible.
  - `assembly`: Memory-safe assembly in `HookMiner.find` — **Reviewed & Safe.** Uses a fixed 85-byte scratchpad to prevent quadratic memory expansion.
  - `cyclomatic-complexity`: Sequential validation in `LaunchFactory._validate` — **Acceptable.** Upfront parameter sanity checking.
  - `too-many-digits`: Address bitmasks and CREATE2 prefixes — **Acceptable.** Standard Ethereum EVM constants.

### 5.3 Phase 2 Addendum: H-2 Implementation & Re-Verification (2026-11-01)

Per the Phase 2 Addendum (`PEARLS-WORK-ORDER-PHASE2-ADDENDUM-H2-2026-10-29.md`), `LaunchLocker` was updated and re-verified:
- **Code Change**: Imported and inherited `@openzeppelin/contracts/utils/ReentrancyGuard.sol` in `LaunchLocker`. Added `nonReentrant` modifier to `LaunchLocker.deposit(address collection, uint256 tokenId)`. State assignments remain sequentially after the `ownerOf` check to avoid bricking one-shot state on failure.
- **Verification**:
  - `forge build`: Clean compile (`solc 0.8.24`, `via_ir = true`).
  - `forge test`: 75 passed, 0 failed, 0 skipped across 6 test suites (including `test_adversarial_locker_deposit_reentry_blocked`).
  - `halmos --contract PearlHalmosTest`: 11 formal invariant proofs passed (2.83s).
  - `aderyn .`: Re-run saved to `docs/aderyn-2026-11-01.md`.
  - `slither .`: Re-run saved to `docs/slither-2026-11-01.txt` (0 High, 0 Medium).
  - `test_token_list.py`: 3 passed, 0 failed.

---

## 6. Known Limitations & Pre-Deployment Gates

1. **Third-Party External Audit:**
   No independent third-party audit firm has reviewed these contracts. Formal verification and static analysis significantly mitigate common vulnerabilities, but do not replace an external audit before mainnet deployment.
2. **Multi-Network `PoolManager` Parameterization:**
   `LaunchFactory.POOL_MANAGER` is currently bound as an immutable constant to Base Sepolia (`0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`). Multi-chain/mainnet parameterization is deferred to Phase 3 per project scheduling.
3. **Rehearsal Deployment Gate:**
   Deployment to live networks is hard-gated on D'Vaughn's explicit authorization with a dedicated throwaway test Safe.
