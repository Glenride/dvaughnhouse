# Pearls — Phase 2 Addendum: H-2 Triage Correction — Thursday, October 29, 2026

**Prepared by:** Janine, from independent verification of the Phase 2 report
**For:** Antigravity, on the iMac
**Branch:** `pearls-buildout` (currently at `d06fa6b`). Commit and push on `pearls-buildout` only — never commit directly to `main`.
**Status:** Small correction to Phase 2, not a new phase. Everything else in the Phase 2 report stands as verified (75/75 forge suite re-run by Janine, report files present, counts match).

---

## The correction

The security report (`docs/security-report-2026-10-29.md`, findings table line for H-2) states that `LaunchLocker.deposit` "is protected by OpenZeppelin's `nonReentrant` modifier." That is not true of the code as committed:

- `deposit` (in `src/LaunchLocker.sol`, lines ~104–113) carries NO `nonReentrant` modifier, and `LaunchLocker` does not inherit or use `ReentrancyGuard` anywhere.
- The one-shot `hasPosition` guard also does not cover this finding: `hasPosition` is set AFTER the external call (`IERC721(collection).ownerOf(tokenId)` at line 107, state set at lines 110–112). A malicious `collection` contract whose `ownerOf` reenters `deposit` would still pass the guard on reentry, because `hasPosition` is still false at that point.
- Realistic risk is low (production flow calls `deposit` from the pool-initialiser in the same transaction that mints the position, with a legitimate collection), but the report's stated protection does not exist, and a security report must not claim a protection that is not in the code.

## What to do (in order)

1. Add OpenZeppelin's `nonReentrant` modifier to `LaunchLocker.deposit` (import `ReentrancyGuard` and inherit it; do not reorder the state assignments — setting `hasPosition` before the `ownerOf` check would brick the locker on a failed check, since deposit is one-shot).
2. Re-run the full suite (`forge build` clean, `forge test` green) and the Aderyn pass; confirm H-2 is gone or re-triaged on the new code.
3. Correct the H-2 line in `docs/security-report-2026-10-29.md` (and any matching line in `BUILD-OUT-REPORT.md`): state the actual protection now in place, or the accurate trust assumption if the fix takes a different form. Do not leave the `nonReentrant` claim in place unless the modifier is actually on the function.
4. Run the pre-commit language check (`bash check-language.sh` from the repo root) — never commit if it fails — then commit and push on `pearls-buildout`.

## Definition of done for this addendum

- `deposit` carries a real reentrancy protection, proven by code (not by report text).
- Suite green, Aderyn re-run, report lines corrected to match the code.
- Commit pushed on `pearls-buildout`. Nothing merged to `main`, nothing deployed.

Janine re-verifies the fix (modifier present on the function + suite re-run + report lines match) before Phase 2 is marked complete.
