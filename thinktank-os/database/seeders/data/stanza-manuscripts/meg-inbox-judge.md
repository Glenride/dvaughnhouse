# Meg — Inbox Judge: A Concept Paper

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026

**Status: CONCEPT ONLY.** This paper describes a product concept. It is not a report on a built system. As of November 6, 2026, Meg has no runtime, no inbox wired to her, and no pilot run. Nothing in this paper should be read as a claim that the system exists, has been tested, or has produced results.

---

## Abstract

Meg — Inbox Judge — is a proposed email-triage offering for small operators whose inboxes are dominated by promotional noise while the costly failures run in the other direction: a real ask from a customer, a money matter, or a deadline that gets missed. The concept is deliberately narrow: one channel (email), one workflow (triage). A decision engine reads each message, tags it against the client's own taxonomy, routes it, scores its urgency, and delivers a ranked morning digest. The governing rule is that Meg proposes and the human decides. Phase 1 has no auto-replies, no auto-sends, and no auto-deletes; spam is quarantined, not deleted. Pricing is locked: free inside the First Build package, otherwise $17, $37, or $97 per month per account, with a 90-day off-ramp for departing clients. This paper sets out the problem, the concept design, the pricing, and what would still need to be built before Meg could serve a real inbox.

## 1. The Problem

Small operators drown in inbox volume. Most of it is promo and noise. The costly failures are the other two directions: missing the one real ask — a customer, money, a deadline — or spending attention on spam and scams. D'Vaughn's own inbox shows the same shape: a heavy daily promotional load crowding out real asks. Meg exists to sort the real from the noise before a human spends attention on it.

This is a problem of attention, not of volume alone. A missed customer message or a missed deadline costs more than the time spent reading promotions. The concept therefore treats triage — deciding what deserves a human today — as the whole job, and refuses to expand into answering, sending, or deleting in its first phase.

## 2. Concept Design

### 2.1 One channel, one workflow

Phase 1 is deliberately one channel and one workflow: email triage. Email first (Gmail). Later phases may add DMs and form submissions — not Phase 1. The narrow scope is a design choice, not a limitation to be worked around later: one workflow done reliably is the offer.

### 2.2 The triage workflow

Each message passes through four judgments, then a delivery step:

1. **Ingest.** Email is read in. Access is via OAuth scopes (read access); Meg never handles passwords and never stores credentials.
2. **Judge.** Every message goes through Levanto Sage (model `levanto-sage-2`) as the decision engine:
   - **Tags** — per-message labels from the client's own taxonomy (spam, scam, promotion, urgent, billing, customer, opportunity, newsletter, and others). The labels belong to the client; Meg applies them.
   - **Choice** — route: answer-now / queue / escalate / archive / quarantine-spam.
   - **Scale** — urgency 0–4.
   - **Sort** — the morning digest, most urgent first.
   - **Yes/No** — "does this need a human today?"
3. **Deliver.**
   - A morning digest: ranked items, one line each — what it is, why it matters, what to do.
   - Intraday alerts only for true urgents.
   - If nothing needs a human, the digest says so in one line.

### 2.3 The rule that makes her trustworthy: Meg proposes, the human decides

This is the product's spine, taken from the First Build principle (a human check built in) and from how Sage works:

- Sage's answer is `null` when it isn't sure — `null` always goes to a human, never to an action.
- Phase 1: no auto-replies, no auto-sends, no auto-deletes. Spam is quarantined, not deleted; the human confirms.
- Meg never invents a sender, a fact, or a message. A missing input is stated as missing, never guessed.

### 2.4 Identity

Meg is a machine entity, not a human — her identity states that plainly, and no copy ever presents her as human. Her voice is plain and short: one line per item — what it is, why it matters, what to do. No hype, no thought-leader polish. She never claims to be human, never sends without approval, never deletes anything, never invents content, and never presents a guess as a verdict. Unsure means human.

A tagline has been proposed — "Meg reads the inbox so you don't have to" — but it is a proposal, not locked.

Meg's identity and soul were written on November 3, 2026, as drafts for D'Vaughn's correction, following the fleet templates. They are concept artifacts, not a running system.

### 2.5 Boundaries with the existing fleet

Meg does not take over other bots' work. Evita stays the secretary (reminders, notes, briefings); Meg does not take reminders or notes. The Community Manager triages community rooms; Meg triages a client's inbox. Different rooms, different jobs — Meg's taxonomy is per-client inbox labels, not the Community Manager's room taxonomy.

### 2.6 Privacy — stated, not buried

Meg reads inbox content through Levanto's cloud API. That must be disclosed to every client in the offer itself. Meg never handles passwords (read access via OAuth scopes, never credential storage). Clients with sensitive inboxes are a future decision: a local-only mode is not Phase 1.

## 3. Cost and Pricing

### 3.1 The Sage math, honestly

Decisions are input-priced at $0.05 per million tokens, and a decision's answer is free. The following is an estimate, not a quote: a 50-message-a-day inbox is about 1,500 messages a month; at roughly 1,000 input tokens per judged message that is about 1.5M tokens, about **$0.08 a month** in Sage usage. The client's own Levanto key covers that many times over on the free tier (20M input tokens / $1 usage a month).

Traps carried over from the Sage skill, stated in the offer, not hidden: reasoning tokens are output-priced (keep reasoning off); grounding web searches are $0.10 each (don't use them for inbox triage); when a period's usage runs out, calls return 402 — so Meg always has a fallback (local rules plus human review), never a hard dependency on the API.

### 3.2 Pricing (locked November 3, 2026, by D'Vaughn's word)

- **Free inside the First Build package.** The First Build is a fixed-scope offer: one week, one workflow, one working system, human check built in; $126/hour, first three clients at a $75/hour founding rate. Meg is delivered as the workflow inside that package.
- **Otherwise, per account per month:** $17 (maximum 50 messages/day), $37 (200 messages/day), $97 (unlimited).
- Sage usage stays far below these prices even at high volume (estimate: 200 messages/day is roughly $0.30/month in Sage input tokens), so the tiers are margin, not cost recovery.

### 3.3 The off-ramp (locked November 3, 2026)

First Build clients get Meg unlimited and free, ongoing, for as long as they are clients. When they stop being a client, they get a **90-day off-ramp** — Meg keeps running for 90 days while they transition — or they can purchase a subscription tier to keep her.

## 4. Status (as of November 6, 2026)

**CONCEPT ONLY.** The following is the plain state of the work:

- The concept was written on November 3, 2026, at D'Vaughn's direction. He named her **Meg**; the name is locked by his word.
- Meg's identity and soul were written the same day as drafts for his correction.
- Pricing and the 90-day off-ramp are locked by his word (November 3, 2026).
- **No runtime exists. No inbox is wired to Meg. No pilot has run.** There are no test results, no accuracy figures, and no usage numbers to report, and this paper invents none.
- The proposed pilot — dogfooding Meg on D'Vaughn's own inbox for one week, then the first three founding clients at the founding rate — is a proposal only. It needs his explicit go: an earlier Gmail review (October 13) was for learning about him, not ongoing inbox access, and is not treated as consent here.
- Open decisions still his: digest timing and alert threshold; pilot go or no-go; the tagline; and the full specification.

## 5. What Would Need to Be Built Next

Before Meg could serve a real inbox, the following would need to exist. None of it exists as of November 6, 2026:

1. **A runtime** — the service that ingests mail, calls the decision engine, and produces the digest, with the 402 fallback (local rules plus human review) built in.
2. **Inbox wiring** — OAuth read access to a real inbox, scoped to reading, with the Levanto-cloud disclosure in the offer.
3. **A memory store** — scoped to Meg's role, so client taxonomies and judgments persist across days.
4. **The pilot** — one week of dogfooding on D'Vaughn's own inbox, with his explicit go, before any founding client is offered the service.
5. **A full specification** — turning the concept's workflow into exact behavior: digest timing, alert thresholds, and the per-client taxonomy setup.

Phase 2 proposals (not locked, not built): draft replies for one-tap approval, confirmed-promo auto-archive, and team inboxes.

## 6. Conclusion

Meg is a small, honest idea: one inbox, one workflow, one rule. A machine reads the mail, judges what needs a human today, and ranks it in a morning digest — and the human decides everything. Spam is quarantined, never deleted. Uncertainty goes to a human, never to an action. The pricing is locked, the off-ramp is locked, and the name is locked. What is not locked — and not built — is everything else. This paper is a concept paper because the system it describes does not yet exist. The next step is a build decision and a pilot, both his to make.

---

*Sources: concept record at `~/workspace/your_files/inbox-judge/concept.md` (November 3, 2026); D'Vaughn House memory record (`~/MEMORY.md`, `~/memory/2026-11-03.md`, `~/memory/people/meg.md`). All facts in this paper are drawn from those records. Where the record labels something a proposal, this paper labels it a proposal. Where the record is silent — on performance, accuracy, or live status — this paper claims nothing.*
