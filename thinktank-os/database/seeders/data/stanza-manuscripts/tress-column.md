# Tress Column: A Fair-Launch Platform on Base

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Design manuscript — the platform described here is in staged development; see "Status (as of November 6, 2026)" for what is built, what is design only, and what is blocked.

## Abstract

Token launches fail their communities before they fail their markets: insiders and bots take the early supply, terms change after the fact, and the people who believed in the project earliest are the ones left holding the loss. Tress Column is a fair-launch platform on Base built to reverse that order. Launches are configured once, locked in public, and proven still standing afterward — Configure, Lock, Prove. The fee rule is fixed at inception and immutable: a locked-liquidity launch pays $10M / 0.30%; an unlocked launch pays $20K / ~0.58%. Access runs through a monthly Plus ladder — Sapphire $7, Emerald $27, Ruby $97 — with launch tiers (Platinum, Gold, Silver) tied to how much of the launch is locked and for how long. This paper sets out the problem, the design, and the honest state of the build as of November 6, 2026, including the contract-size blocker that currently holds the Sepolia deployment.

## 1. The problem

A fair launch is a promise about who gets in first and on what terms. In practice that promise is usually unenforceable: the terms live in a post or a chat message, the liquidity can be pulled, and the fee the platform takes is whatever it decides to take that day. The result is a launch where the earliest believers carry the most risk and the least protection, and where trust depends on the character of the launcher rather than on anything checkable.

Three failures repeat:

1. **Terms that move.** A launch announces one set of conditions and operates under another. Nothing in the system makes the announced terms the executed terms.
2. **Liquidity that leaves.** Liquidity provided at launch can be withdrawn, and the community has no durable claim on it. A launch that looked solid on day one can be hollow by day thirty.
3. **Fees that are negotiated after the fact.** When the platform's cut is discretionary, the launcher and the community are both guessing at the real cost of the launch — and the guess is settled in the platform's favor.

Tress Column is built on the premise that a launch should be checkable: the terms are set, locked, and then shown still standing. Hype is scaffolding that comes down; the column stays.

## 2. Design

### 2.1 Configure, Lock, Prove

The platform is organized around three acts, which are also its product mapping:

- **Configure — laying the foundation.** The launcher sets the terms of the launch: supply, pricing, lock duration, and the fee tier that follows from those choices.
- **Lock — setting it upright.** The configured terms are locked. The lock is the commitment: what was configured is what launches.
- **Prove — showing it still standing.** After the launch, the record is public and checkable: the terms did not change, the locked liquidity is where it was promised to be, and the launch stood after the storm.

The design rule is deliberate, not accidental: a column standing upright, on purpose, holding weight that would otherwise fall. The paper's working tagline candidate, "There's power in Tress Column," is not locked and is not presented here as the platform's tagline.

### 2.2 Base only

Tress Column is a Base-only platform. There is no wrapped or bridged route to another chain and no multi-chain leg. That constraint is a design choice, not a limitation to be worked around later: one chain, one set of contracts, one record to check.

### 2.3 The fee rule (immutable)

The fee rule is fixed at inception and immutable — it does not change per launch, per launcher, or per negotiation:

- **Locked liquidity:** $10M / 0.30%.
- **Unlocked liquidity:** $20K / ~0.58%.

The rule prices the thing the community actually wants: locked liquidity costs the launcher more in absolute terms and less in rate, because a locked launch is the safer launch. An unlocked launch is cheaper in absolute terms and carries the higher rate, because the community bears the risk the lock would have carried.

### 2.4 Access: the Plus ladder

Access to the platform runs through a monthly Plus ladder, locked November 2, 2026:

| Tier | Price (monthly) |
|---|---|
| Sapphire | $7 |
| Emerald | $27 |
| Ruby | $97 |

### 2.5 Launch tiers

Launches themselves are tiered by how much of the launch is locked, and for how long:

| Launch tier | Lock / burn | Fee |
|---|---|---|
| Platinum | Burn or lock, 180 days or more; $10M | 0.30% (locked) |
| Gold | Short lock; $250K | 0.45% (proposed — not locked) |
| Silver | No lock or burn; $20K | ~0.58% (modeled) |

Only the Platinum terms are locked. The Gold fee is a proposal and the Silver fee is a model; neither is presented here as a final term.

### 2.6 Three surfaces

The platform is built as three mutually exclusive, interlocking surfaces:

1. **Launchpad** — where launches are configured and locked.
2. **Trading Terminal** — where launched tokens trade.
3. **Back Office Ops Console** — where operations are run.

The three surfaces are staged together, each with its own route, and the Trading Terminal and the Ops Console each carry their own sign-in, separate from one another. One open design question remains on the Terminal: its routing markup is currently hardcoded at 0%, and it is not yet decided whether that is intentional or whether the previously proposed 0.05–0.1% routing fee for non–Tress Column swaps applies.

### 2.7 Relation to SpinWave

Within Glenride's wider system, Tress Column serves as the anchor gateway for SpinWave: SpinWave is the database and storage layer, STANZA is the mode of transfer through which research is licensed, and Tress Column is the Base-side anchor for that record. That architecture is design, not a live integration — see the Status section.

## 3. History: Pearls to Tress Column

Tress Column was formerly Pearls, the same fair-launch platform under an earlier name. The rename was locked on November 1, 2026. An intermediate name, Buttress Launchpad, was locked and superseded the same day and was never executed. The rename propagated across the platform's surfaces; the live site is at tc.dvaughnhouse.com, with pearls.dvaughnhouse.com redirecting to it. The contract names PearlHook and LaunchLocker remain pending the author's picks.

## 4. Status (as of November 6, 2026)

### Built

- **Live site and waitlist.** The live deploy was completed November 2, 2026, at tc.dvaughnhouse.com, and the waitlist is live there.
- **Three-app staging.** The Launchpad, Trading Terminal, and Back Office Ops Console were built as a staged three-app build-out on November 4, 2026, on staging routes only (/staging/tress-column, /staging/terminal, /staging/ops-console). The build was reported with a clean Vite build and a full test suite passing (59/59).
- **Topology decided.** On November 5, 2026, the subdomain topology and the separate sign-in for the Trading Terminal and the Ops Console were decided.
- **Test Safe verified.** A new Base Sepolia test Safe, `0xC0132b5782F129c6d552c6aB725D2341349a084d`, was verified as a real Safe contract. It is test configuration only.

### Concept / design only

- **Launch tiers Gold and Silver.** The Gold fee (0.45%) is proposed, not locked; the Silver fee (~0.58%) is modeled, not locked.
- **Terminal routing fee.** Whether the Terminal's 0% routing markup is intentional or the proposed 0.05–0.1% fee applies is undecided.
- **Contract names.** PearlHook and LaunchLocker are pending the author's picks.
- **Tagline.** No tagline is locked. "There's power in Tress Column" is the leading candidate only.
- **SpinWave anchor integration.** The anchor-gateway role described in §2.7 is architecture, not a live integration.

### Blocked

- **Sepolia deployment.** The Sepolia deploy is blocked: the LaunchFactory contract is 27,495 bytes against the 24,576-byte contract size limit. A factory-split work order (Task 252, opened November 5, 2026) is the path to unblocking it; the decomposition direction is still pending.
- **Safe wiring.** The verified Base Sepolia test Safe is explicitly **not approved for wiring**. Nothing is deployed to it, and wiring it into the test deployment configuration requires the author's explicit approval naming the address.
- **Testnet only.** The platform is Sepolia/testnet-only. There is no mainnet deployment and no mainnet timeline stated in this paper.

## 5. Conclusion

Tress Column is a small, strict idea: a launch is a column, and a column either stands or it does not. The platform makes the standing checkable — terms configured once, locked in public, and proven afterward — and it prices locked liquidity as the safer, cheaper-rate choice. The design is settled in its essentials: Base only, an immutable fee rule, a locked Plus ladder, three surfaces with separate sign-in. What remains is execution: splitting the factory contract past the size limit, deciding the open fee and naming questions, and wiring a test Safe only when the author approves it by name. Until the Sepolia deployment lands, the platform is a live waitlist and a staged build, not a live launchpad — and this paper says so plainly, because a fair-launch platform that overstates its own state would fail its own test.

---

*D'Vaughn House, Glenride — November 6, 2026. Tress Column, formerly Pearls. Base only. Testnet only.*
