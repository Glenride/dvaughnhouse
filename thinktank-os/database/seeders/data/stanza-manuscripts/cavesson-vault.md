# Cavesson Vault: A Wallet for AI Agents Whose Rules Are Seven Layers of Protection

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Design manuscript for the prototype built November 1, 2026

## Abstract

An AI agent that can spend, hire, and sign on a founder's behalf is useful
precisely to the degree that it is dangerous: every capability it holds is a
capability that can be exercised wrongly, excessively, or against the
founder's intent. Cavesson Vault is a wallet for founders, small operators,
and their AI agents whose rules are seven layers of protection. The Human
sets house rules; every proposed spend, hire, or signature is checked
against those rules before execution; anything outside the rules is blocked
or held for human approval; and every action — allowed, blocked, or
approved — is written to an append-only receipt log the Human can audit.
The governing line is: "Machines propose, but humans are the source of all
decisions." This paper describes the design, the prototype built on
November 1, 2026, the results of its first live probe, and — plainly — what
is still concept, what is built, and what is blocked.

## 1. The problem

A founder who hands an agent a wallet hands it a blank check. Today's
agents can call payment APIs, engage contractors, and sign documents, and
the guardrails around them are usually one of two things: nothing, or a
hard spending cap that is too blunt to distinguish a legitimate $75
purchase from a $200 hire the founder never approved. The failure modes
are concrete:

- **Overspending.** An agent that can spend will spend, and a single
  misread instruction can drain a budget before a human notices.
- **Unauthorized commitments.** Hiring a contractor or signing an agreement
  binds the founder legally and financially; an agent should never do
  either without a rule that permits it or a human who approves it.
- **No audit trail.** When money moves through an agent, the founder
  typically has no checkable record of what was proposed, what rule it hit,
  and who decided.
- **Shadow and rogue agents.** An agent instance the Human did not
  credential — a copy, a fork, a compromised run — can act with the same
  permissions as a trusted one unless the system treats uncredentialed
  instances as rogue by default.

Cavesson Vault answers with a wallet that is not a pile of money with a
password, but a set of rules with a wallet attached. The agent proposes;
the rules decide what is automatic; the Human decides the rest.

## 2. The brand and the idea

Cavesson is the agent harness brand, named and approved on October 26,
2026. A cavesson is a trainer's noseband — control over something
powerful. The brand story is security: protecting family and future. The
tagline is "Your data stays home." The promise is "Nobody gets near your
family." The question behind it is the founder's own: "You wouldn't let
anyone near your data. Why is AI any different."

The Vault was named on October 28, 2026, as an agent wallet with a budget,
an allowlist, and an audit trail of every cent. The one-liner confirmed
for the application built around it is: "A wallet for founders, small
operators, and their AI Agents whose rules are 7 layers of protection."
The public dashboard is live at cavesson.dvaughnhouse.com.

## 3. Design principles

Six fundamentals govern the design. They were adopted on November 1,
2026, as design principles; they are the standard the implementation is
measured against, not features that are all built yet:

1. **Schema wins.** Rules are structured data, not prose the agent
   interprets. A rule either matches or it does not.
2. **Provenance.** Every action carries its source: which agent proposed
   it, which rule it hit, and who decided.
3. **Pointers, not copies.** Agents reference shared state; they do not
   duplicate it into private copies that drift.
4. **Append-only receipts.** The log is written once and never rewritten.
   A correction is a new entry, not an edit.
5. **Pending stays pending.** An action held for approval does not execute,
   does not time out into execution, and does not silently become allowed.
6. **Human checks, machine files.** The machine records; the Human decides.

## 4. House rules and the gate

House rules are set by the Human and are editable. They are versioned,
and every edit passes a lint pass before it takes effect, so a malformed
rule cannot silently open a hole. Pending vendors default to denied: a
vendor the Human has not explicitly approved cannot be paid, no matter
what the agent proposes.

Before any spend, hire, or signature executes, the gate checks it against
the current house rules. The gate has exactly three outcomes:

- **Allowed.** The action is inside the rules. It executes, and a receipt
  is written.
- **Stopped.** The action violates a rule. It does not execute. The agent
  is told which rule it hit, and a receipt is written.
- **Queued.** The action is outside the automatic rules but not forbidden.
  It waits in a human approve/decline queue. Nothing in the queue executes
  until the Human approves it, and a decline removes it.

The gate carries one marked escape hatch: the single way out the AI is
shown, presented as possible through it, and the AI is steered to choose
it. The internal detail of the escape hatch is deliberately not written
down anywhere; the public wording says only that it is possible and that
the AI is steered to choose it.

## 5. Layers 0–6: defense in depth

The Vault is defended in seven layers, designed November 1, 2026:

- **Layer 0 — Secured harness, always-on leash.** The agent runs inside
  the Cavesson harness, and the leash is never off.
- **Layer 1 — Creator-set bounds.** The agent operates only within bounds
  the Human set. There is no default permission.
- **Layer 2 — Wallet owner as authority.** The wallet owner is obeyed via
  voice and commands; the owner's word is the authority layer.
- **Layer 3 — The uncrossable gate.** The gate described in Section 4.
  The agent cannot cross it; it can only be allowed, stopped, or queued.
  The marked escape hatch lives at this layer.
- **Layer 4 — Rogue detection and guardians.** Uncredentialed instances
  are treated as rogue. Small, single-purpose guardian agents watch for
  them.
- **Layer 5 — Dismantle on disobedience.** An agent that disobeys is
  dismantled — its permissions and its run are taken apart, not warned.
- **Layer 6 — Physical cutoff.** A physical power-cut gate is the last
  resort: the machine itself can be cut off.

Layers 0–6 are design, not shipped product. The prototype built on
November 1 implements the gate, the queue, the rules, and the receipt log
(see Section 8); the layers as a whole remain the architecture the
implementation is being built toward.

## 6. Memory and language

Memory is segmented: the same workspace does not mean shared memory.
Agents share one file, under the Human's control, and no agent changes it
on its own. A separate, unnamed AI watches agent-to-agent speech and flags
hyper language — language above the Human's understanding — to the Human.
The language watcher is rendered in the prototype dashboard but was not
live-driven in the first probe (see Section 8).

## 7. Receipts

Every action produces a receipt in an append-only log: what was proposed,
which rule it hit, whether it was allowed, stopped, or queued, and who
decided. The log supports search and filters, corrections are recorded as
new entries rather than edits, and the log can be exported as JSON. The
receipt log is the audit trail of every cent — the record the founder can
check after the fact, without trusting the agent's word for what happened.

## 8. Live probe results

On November 1, 2026, before handover, the prototype was live-probed with
three actions:

1. **A $40 research purchase was allowed.** It was inside the house rules,
   executed, and receipted.
2. **A $200 contractor hire was stopped.** It violated the rules and did
   not execute.
3. **A $75 purchase went to the queue, then executed once approved.** The
   Human approved it; only then did it execute.

After the probe, Researcher spend stood at $115.00 and the queue stood at
0. The probe verified the core loop the Vault exists to prove: a
legitimate purchase inside the rules goes through, an out-of-rules hire is
blocked at the exact rule it hit, and a borderline purchase waits for the
Human and moves only on approval.

## 9. Limits

The limits were stated at handover, and they are stated here without
softening:

- **The money is simulated.** No real money moves in the prototype. No
  real wallet, payment rail, or bank account is connected.
- **Everything is in-memory.** State resets on reload. Receipts, rules,
  and queue contents do not persist.
- **The language watcher and the rogue-AI scenario buttons were rendered
  but not live-driven in the probe.** They appear on the dashboard; their
  behavior was not verified in that check.
- **No customers, no revenue, no shipped Vault.** The Vault is a
  prototype, labelled as such on the public site: built November 1, 2026,
  on simulated money in memory — not live money, and not shipped.
- **Sign-in is built as code only, not live.** The live header "Sign in"
  leads to a notice page; no form exists and no account is created. The
  built service covers authorize, callback, session, and sign-out, and
  would swap the header to Dashboard and Sign out when signed in. It still
  needs the API key and session secret placed in the service's environment
  on the iMac, followed by a service start and an nginx reload.

## 10. Status (as of November 6, 2026)

**Built.** The full Cavesson Vault prototype, built and handed over
November 1, 2026: editable house rules; a pay/hire/sign gate checked
before execution; a human approve/decline queue; versioned rules with a
lint pass and pending vendors defaulting to denied; segmented agent memory
with one human-controlled shared file and a language watcher (rendered,
not live-driven); Layers 0–6 as implemented in the prototype's gate,
queue, rules, and receipts; and an append-only receipt log with search,
filters, corrections as new entries, and JSON export. The public dashboard
is live at cavesson.dvaughnhouse.com, hosted on the homelab via the
iMac tunnel, with Home, Vault, and Architecture pages, shared navigation,
and a sitemap. The first live probe (Section 8) passed.

**Concept and design only.** Layers 0–6 as a complete defense-in-depth
system; the six fundamentals as implemented guarantees rather than adopted
principles; the language watcher as a live-driven monitor; the rogue-AI
scenario handling; real-money wallets, testnet or otherwise; and any pilot
with real users. The 12-week plan drafted for the application — weeks 1–4
wallet, rules, and receipts on testnet; weeks 5–8 pilot; weeks 9–12 Demo
Day — is a plan, not a schedule that has started.

**Blocked.** Real sign-in is blocked on placement of the API key and
session secret in the iMac service's environment, then a service start and
nginx reload. Any real-money work is blocked on the testnet build (weeks
1–4 of the plan), which has not begun. The a16z speedrun SR008 application,
with Cavesson Vault as the lead, was submitted November 2, 2026, before
the 2:59 AM ET priority deadline; no confirmation number is on file, and
the outcome is not yet known. The program, as presented, offers $500K for
10% via SAFE plus $500K into the next round, with an in-person San
Francisco residency February 1–April 16, 2027; the equity terms and the
residency remain the founder's call only.

## 11. Conclusion

Cavesson Vault starts from a simple observation: an agent that can spend,
hire, and sign without a blank check needs a wallet whose rules are
stronger than its capabilities. The prototype built November 1, 2026,
proves the core loop on simulated money — rules checked before execution,
violations stopped, borderline actions held for a human, everything
receipted. What remains is the harder work: making the seven layers real,
making the money real, and making the receipts survive a reload. The
design does not ask the founder to trust the agent. It asks the founder to
trust the gate — and to keep the final decision, as always, with the
Human. Machines propose, but humans are the source of all decisions.

## References

- Cavesson brand and Vault record, author's files, October 26–November 2,
  2026 (brand story, name approval, domain and handle checks, harness
  status, Vault architecture, SR008 application record).
- Cavesson Vault prototype handover and live probe, November 1, 2026
  (prototype contents, probe results, stated limits).
- Cavesson public dashboard, cavesson.dvaughnhouse.com (live, hosted on
  the homelab via the iMac tunnel; Home, Vault, and Architecture pages).
- a16z speedrun SR008 application, submitted November 2, 2026, Cavesson
  Vault as lead; no confirmation number on file.
