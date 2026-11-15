# Pearls — Antigravity Build-Out Handoff

**From:** Janine (for D'Vaughn House) · **Date:** 2026-10-23
**What this is:** Everything that exists on Pearls, packaged for build-out.
**Read first:** `README.md`, then `spec.md` (technical specification v1.0 — it governs).
**Concept history (context only, spec wins on any conflict):** the `pearls-concept/`
folder packaged alongside this one — the v0.6 concept the spec was built from, the
v0.7 redline draft, and the earlier launchpad concept note.

---

## State of the work (verified 2026-10-21/22 — do not re-verify from zero, build on it)

**BUILT and tested — the contract core is done:**

- Foundry project, solc 0.8.24 / cancun / via_ir, pinned in `foundry.toml` + `foundry.lock`.
- Contracts in `src/`: PearlsConstants, LaunchFactory, LaunchToken, LaunchCertificate,
  LaunchLocker, VestingVault, AirdropDistributor, TCCore, TCHook, ITCHook,
  AttestationRegistry.
- Tests: **33 passing, 0 failing** (`forge test`) — Pearls.t.sol (core), TCHook.t.sol
  (hook), AttestationRegistry.t.sol, Mocks.sol.
- Slither: **zero High / zero Medium** (`docs/slither-2026-10-21.txt`). Aderyn/Halmos were
  NOT run — that gap is stated in the spec; closing it is fair game.
- AttestationRegistry: proven on local Anvil (`docs/attestation-registry-anvil-proof.md`,
  design in `ATTESTATION-ANCHORING.md`).
- **Nothing is deployed anywhere.** `script/Deploy.s.sol` is hard-gated to Base Sepolia
  (84532) and local Anvil (31337).

## The build-out work (in priority order)

1. **TCHook v4 integration — THE critical path.** The accounting core (TCCore)
   is complete and tested. The adapter (`src/TCHook.sol`) is a deliberate PARTIAL:
   its header lists exactly what is missing — read spec §7 before touching it.
   - Pin Uniswap v4-core / v4-periphery as dependencies (do not float versions).
   - Replace the mirrored callback signatures with the canonical v4 interfaces.
   - Implement CREATE2 salt mining so the hook address encodes its callback permissions.
   - Implement fee settlement inside the unlock context (PoolManager.take()/settle()) —
     today `afterSwap` computes the fee and claims a delta of 0, i.e. it takes nothing.
   - Run the spec §7.3 fork-test matrix (4 direction cases × gate state × guard state)
     against a Base Sepolia fork.
2. **Aderyn + Halmos passes** on the full core, findings triaged into the docs folder.
3. **Plus+ / CoinGuard — DESIGNED ONLY, in spec.md. Do not build yet.** D'Vaughn locked
   the Plus+ ladder (Trader/Airdrop Pass = entry tier; Creator & Studio Pass = upgrade),
   but the build order for the off-chain suite is his separate call.

## Invariants — breaking any of these breaks the product

- Configured at launch, immutable after. Core contracts have **no admin keys, no owner,
  no setters, no pause, no proxy, no upgrade path**.
- No platform fee until $10M cumulative volume; above the gate, **30 bps, quote asset
  only** (WETH/USDC), crossing swap pays no fee; the gate is fixed in quote units at
  deploy (no swap-time oracle).
- LaunchLocker: Abyssal (forever) or Timed **≥ 180 days**. Airdrop campaign fee is a flat
  **0.0194 ETH**. All money in contracts is handled per spec — when in doubt, spec wins.

## Hard guardrails (D'Vaughn's gates — not yours, not mine)

- **Testnet/local only.** Never point anything at mainnet. Deployment anywhere —
  including Sepolia — is D'Vaughn's explicit call, not part of this build-out.
- If a Sepolia deploy is ever authorized, the factory treasury must be a **throwaway
  test Safe** — the treasury address is immutable once deployed.
- **Naming:** the gold colour and Studio seal are **Abyssal Gold** everywhere. The word
  it replaced is on D'Vaughn's banned list for all his brands — never use it, including
  in code comments, variable names, or quotations of the v0.6 concept text. Also banned
  across his brands: "sovereign", "ventures". Glenride is never called an institute.
- Do not change fee constants, the $10M gate, or lock minimums to make tests pass.
  If a design point seems wrong, flag it in your report instead of silently changing it.

## Definition of done for this pass

- `forge test` fully green, including the new §7.3 fork-test matrix.
- Hook takes the correct fee on a forked pool in all four direction cases, pre- and
  post-gate, and takes nothing below the gate.
- A short BUILD-OUT-REPORT.md in the repo root: what you built, what you changed and
  why, test counts, remaining gaps. Janine re-verifies before anything moves further.
