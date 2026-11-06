# License It From Anywhere: A Cross-Chain Design for Licensing Scholarly Works

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Design manuscript for the system implemented as `stanza-crosschain`
(NEAR Build Beyond Boundaries Hackathon 2026)

## Abstract

Scholarly licensing breaks at the payment step: a reader on one chain cannot
easily license a work whose scholar settles on another, and the scholar has no
verifiable, tamper-proof record that a license was granted. This manuscript
describes the design implemented in `stanza-crosschain`: a reader deposits
native crypto (NEAR, SOL, ETH, or USDC) on their home chain; NEAR Intents
1Click settles USDC on Base directly to the scholar's address; NEAR Chain
Signatures (MPC, contract `v1.signer`, derivation path `ethereum-1`) signs the
license-record transaction; and a `LicenseRegistry` contract on Base records
the license immutably, with replay protection and a relayer-only gate. No EVM
private key exists anywhere in the system. The scholar's STANZA credit in this
design is recognition — an on-chain record and event — not a token transfer;
an actual STANZA transfer would be a separate, explicit decision.

## 1. The problem

A manuscript or dataset is recorded in a repository. A reader wants a license:
read, citation, or commercial. Today that means accounts, paywalls, and
middlemen, and the scholar is paid — if at all — through channels that leave
no record the reader can point to and no record the scholar can verify.
The design goal is one action, from any chain, ending in two facts that
anyone can check: the scholar was paid in USDC on Base, and a license was
recorded on-chain for that buyer, that work, and that tier.

## 2. System overview

1. **Buyer selects a work, a tier, and an origin asset** in the checkout UI
   (Laravel 12 + Inertia + React).
2. **Quote.** The agent requests a 1Click quote for exact-output USDC on Base
   (chain 8453), addressed to the scholar. 1Click returns a unique deposit
   address and a quote ID.
3. **Deposit and settlement.** The buyer deposits their native asset to the
   1Click address. 1Click settles USDC directly to the scholar's address on
   Base. The relayer never custodies scholar proceeds; it holds only gas ETH
   for Base execution.
4. **Four-gate verification.** Before any signature is requested, the watcher
   agent verifies: (i) 1Click status is `SUCCESS`; (ii) `amountOut` and
   destination match the scholar address and the stored quote exactly;
   (iii) work ID, tier, and buyer address match the licensed entity;
   (iv) `isSettled` on Base is false for that payment.
5. **MPC signing.** NEAR Chain Signatures signs the record transaction.
   The relayer address is the deterministic EVM address derived from the
   NEAR account `stanza_glenride.near` via path `ethereum-1`:
   `0x4D538abf011e0885a6f87667Db466837B10b49f9`. No EVM private key exists
   in the repository, in configuration, on the server, or in memory.
6. **On-chain record.** The relayer calls `recordLicense(buyer, workId,
   tier, proofHash)` on `LicenseRegistry`. The contract enforces
   `onlyRelayer`, rejects replays (`settled[proofHash]`), and rejects
   unknown works, then emits `LicenseRecorded` and `ScholarCredited`.

## 3. The registry contract

`LicenseRegistry` (Solidity ^0.8.24, Base) is deliberately small:

- `registerWork(workId, scholar, metadataUri)` — records a work and its
  scholar. The work ID is `keccak256`-style: `0x` + SHA-256 of a manuscript
  key, matching the catalog's `work_id`.
- `recordLicense(buyer, workId, tier, proofHash)` — relayer-only. Each
  1Click payment produces a unique `proofHash = keccak256(depositTxHash)`,
  so a payment can never be reused to mint a duplicate license.
- Events `WorkRegistered`, `LicenseRecorded`, `ScholarCredited` form the
  public, checkable record of who licensed what, from whom, and when.

Contract tests (Foundry, 4 tests) pass: non-relayer calls revert, the
relayer records a license, replays revert, and unknown works revert.

## 4. Tiers

Each work carries three license tiers — read, citation, commercial —
priced in USDC. The tier is part of the signed record, so the license a
buyer holds is for exactly the tier they paid for, and the scholar's
portfolio page shows licenses by tier.

## 5. What STANZA credit is — and is not

In this design, STANZA is the mode through which research is licensed and
scholars are recognized: licensing follows payment, and the scholar is
credited in STANZA as a recorded, on-chain recognition. That credit is an
event and a record, **not** a token transfer in the current implementation.
Presenting it as a transfer would misdescribe the contract. If a future
version moves actual STANZA, that is a separate design decision, to be
made explicitly before deployment — not silently added.

## 6. Implementation status

The full flow — guest checkout, license lookup, read-only scholar
portfolio, 1Click quote agent, settlement watcher, MPC relay, and the
registry contract with its test suite — was built November 5, 2026, and
verified green across the contract, agent, and UI suites (14 feature
tests, 138 assertions). The Base deployment was scheduled for the
November 6, 10:00 AM–12:00 PM ET block; deployment itself is a separate,
verifiable event and is not asserted as complete in this manuscript.

## 7. Conclusion

Cross-chain licensing does not need a new trusted intermediary. It needs
three things that already exist, composed carefully: an intents layer to
move value to the scholar's chain, a threshold-signature layer to authorize
the record without a private key, and a minimal registry that refuses
anything it cannot verify. That composition is what this manuscript
describes, and what `stanza-crosschain` implements.

## References

- NEAR Intents / 1Click API (quote, deposit, settlement status).
- NEAR Chain Signatures, MPC contract `v1.signer`, derivation path
  `ethereum-1`.
- `stanza-crosschain` repository: `src/LicenseRegistry.sol`,
  `test/LicenseRegistry.t.sol`, `scripts/derive-mpc-address.py`,
  `docs/antigravity/README.md` (work orders 1–7).
- Buterin, Hitzig & Weyl (2020), arXiv:1809.06421v2 — the quadratic-funding
  paper replicated in the companion manuscript in this catalog.
