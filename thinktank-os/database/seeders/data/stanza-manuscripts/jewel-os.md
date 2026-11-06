# jewel OS: A Design for a Chief-of-Staff Operating System for a Company of One

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** DESIGN PAPER ONLY — based on PRD v0.2 (2026-11-03). This paper describes a design. Nothing in it describes a built, shipped, or tested system.

## Status (as of November 6, 2026)

This is a **design paper**, not a built-system paper. jewel OS is specified in PRD v0.2 (rewritten November 3, 2026) as a **files-and-teaching pack**: a sanitized operating manual, file templates, and protocols that let a Human run one chief-of-staff machine agent, which in turn hires scoped specialist machine agents under Human approval gates. It is **not** a code harness, not an app, not a SaaS, not a model, and not a hosted service. A code reference implementation, if ever wanted, is a separate decision (Decision 14 in the PRD) and is not assumed here.

What is actually done, per the PRD's status baseline of November 3, 2026:

- The product analysis exists (completed October 22, 2026): artifact inventory, 12 protocols, packaging recommendation, competitive landscape as researched in October 2026, risks, and open questions.
- An IP boundary is written: the product is the operating manual, templates, and methodology. It is not the assistant, not the model, not the platform, and it never uses Meta marks or the name Muse.
- The name is locked: **jewel OS** is the final name, decided by D'Vaughn House on November 3, 2026. It supersedes the October 28, 2026 "Chief of Staff OS" label for the agents-hiring-agents thread; the agents-hiring-agents concept itself is kept. An earlier record (October 18, 2026) had already recorded the jewel OS name and an audience note of "18–64 North American professionals" — that record is truncated, so the audience note is carried as written, not as a verified market claim.
- Completion guides were written November 2, 2026 for the bundle and price list, the MailerLite drip, beta feedback, the launch video and social plan, and Stripe and sales metrics. Guides are not shipments.

What is **not** done:

- No sanitized pack is on sale. No class episode is published. No beta feedback is on file. No Stripe product for this pack is on file.
- The open questions are still open. They are listed in §6 and are not decided in this paper:
  - **Pack price** — the analysis estimate is $97–$297. No price is locked.
  - **Platform framing** — "for users of [a named assistant platform]" versus a generalized system.
  - **Sanitization reviewer** — who performs the paranoid second pass before anything ships.
  - **Memory-governance default** — the PRD recommends human-gated (the chief drafts, the Human approves, the audit log records it); the decision is the author's.
  - Brand home, the v1 specialist roles, parallel specialists, and a code reference implementation are also undecided (see §6).

No claim in this paper should be read as a result, a test outcome, or a live status. Where the PRD cites a source paper, that paper is cited as a design reference, never as evidence that jewel OS works.

## Abstract

A Human running several projects alone does not need another chatbot that forgets yesterday. The Human needs a chief of staff: one machine agent that remembers, keeps an auditable trail, enforces standing rules, runs background work while the Human sleeps, and delegates to specialist machine agents — without ever becoming the decision-maker. jewel OS is the design for that operating system, delivered as files and teaching rather than as software: a sanitized operating manual, file templates, and protocols the buyer runs on their own assistant. This paper lays out the problem, the three-layer design (Human operator, chief-of-staff machine agent, hired specialists), a harness-informed architecture adapted from *Harness Engineering* (Barbaste et al., July 2026), the pack contents, the patterns adopted and deliberately rejected, the phased plan from decisions to sale, and the questions that remain open. The load-bearing principle throughout is: **machines propose, but Humans are the source of all decisions.**

## 1. The problem

The market below the $500 line, as researched in October 2026, mostly sells prompts: inbox triage, a morning briefing, SOP memory, a weekly review. Nobody below that line was selling the architecture itself as the product: persistent memory plus an append-only audit log plus scheduled sweeps plus approval-gated delegation. That gap is the claim of this design. It only holds if the buyer can see a real system running on it, not a promise — which is why the phased plan in §5 puts a sanitized pack and a beta test before any class or sale.

The Human-side problem underneath it, in the author's own account from October 13, 2026: this is the staff he could not hire. The product must therefore sell the operating system for directing a machine staff, not the fantasy that the machine staff replaces Human judgment.

Who it is for, as proposed in the PRD (to be confirmed against the truncated October 18 record): a company-of-one operator, 18–64, North American, already using an AI assistant and frustrated that it forgets, invents, or acts without a trail — someone with more work than hours, no staff to hire, and willing to set up a system once to save repeated decisions. It is explicitly not for a buyer who wants a done-for-you service with no setup, a buyer who wants the underlying assistant, model, or platform itself (they bring their own AI), or a buyer who wants autonomous agents that spend, publish, or contact people without Human approval. That last exclusion is out of scope by design, not a missing feature.

## 2. The design: three layers

**Layer 1 — The Human operator.** Sets direction, approves anything outbound or irreversible, and owns every decision. After setup, the Human's job shrinks to approvals, physical-world actions, and work they would do anyway.

**Layer 2 — The chief of staff (one machine agent).** Holds the standing memory, the audit log, the goal workspaces, and the schedule. It proposes plans, drafts, and delegations. It never publishes, sends, spends, or commits on its own.

**Layer 3 — Hired specialists (machine agents, scoped).** The chief hires a specialist for a bounded job only: for example, a researcher, a drafter, a sweeper/watcher, or a publisher-preparer. Each hire carries, in writing before it starts: role and exact deliverable; memory scope (what it may read, what it may not touch); time or cost budget, if any; approval gate (what needs Human sign-off before the output moves); and an audit entry (hired, by whom, for what, outcome). A specialist can be fired — revoked — in one step, and revocation removes its access and stops its scheduled work. No specialist hires its own sub-specialist without returning to the chief and, for anything outbound or irreversible, to the Human.

This is the "agents hiring agents" layer, kept honest: hiring is delegation with a paper trail, not autonomy without a Human.

### 2.1 What the buyer gets in v1

1. **The 12 Protocols handbook** — the methodology from the product analysis, as a designed reference, with the real stories behind each rule kept generic (no personal details).
2. **The sanitized file tree, copy-paste ready** — standing-context templates, memory-tree skeleton, audit-log starter kit, goal-workspace skeleton, task-brief template, setup checklist. Every personal entry stripped; placeholders marked.
3. **The agent-hiring pack** — role cards for the v1 specialist roles, a hire/revoke log template, and the approval-gate checklist for delegation.
4. **The setup guide** — a 30-minute first setup that ends with a working memory file, an audit-log entry, one goal workspace, and one scheduled sweep or watcher the buyer defines. If setup does not end in a working loop, v1 has failed its own test. The 30-minute figure is a design target to confirm in beta, not a promised number.
5. **The free class, as the funnel** — methodology taught free, episode by episode, with screen-share walkthroughs of a sanitized system. The pack is the paid shortcut: the class teaches the system; the pack saves the buyer the weekend. Recording is sequenced after the pack is sanitized and beta-tested, not before.

### 2.2 What it is not

Not an app, not a SaaS, not a model, not a platform. V1 ships files and teaching, not code that runs a buyer's assistant for them. Not "Muse OS," not a Meta product, and never marketed as getting the assistant itself. Not a prompt pack — prompts may appear inside the templates, but the product is the system: memory that compounds, a log that cannot be rewritten, and gates that hold. Not a claim about the author's results transferred to the buyer: no invented stats, testimonials, or outcomes. Buyer results are the buyer's to earn and report. Not a framework, and not a vector-retrieval layer (see §4).

## 3. Harness-informed architecture

PRD v0.2 rewrote the architecture from *Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents* (Barbaste, Darrigol, Vu, Wiltberger, July 2026, arXiv:2609.00006v1), supplied by the author on November 3, 2026 and read in full. Barbaste et al. are cited here as the source of the architecture patterns only; they are not co-authors of this paper and nothing in it is their work. The source paper is used as a reference for harness architecture patterns, not as a source of jewel OS claims. Its benchmark numbers are self-reported and not head-to-head, and its Claude Code analysis rests on a March 2026 circulated source snapshot — neither is quoted in this paper as proof of jewel OS performance.

The source paper's definition, applied to jewel OS without crossing the IP line: **an agent is a model plus a harness, and the harness is everything except the model.** In jewel OS, the buyer supplies the model and the assistant platform. jewel OS supplies the harness *as a manual*: the loop, the tool discipline, the context rules, the safety policy, the hiring discipline, and the extension format — as files the buyer's chief reads and follows. The source paper's seven subsystems become the pack's seven sections.

### 3.1 Subsystem 1 — The chief's loop

The chief runs one simple, written loop, in this order, every turn and every scheduled run: propose → check the gate → delegate or do → verify against the brief → log before replying. Start linear. The source paper's first finding is that loop sophistication does not predict task completion: a minimal linear loop performs in the same range as event-sourced engines, and the extra mass buys safety, recovery, and extensibility. jewel OS therefore ships a linear loop first and graduates to a middleware-style pipeline — turn limits, cost caps, compaction, context warnings, read-only mode as separate, composable policies — only when the buyer can point to three or more orthogonal turn policies they actually need. Cheap caps are mandatory, over-engineered stuck detection is not: a turn cap, a cost/time cap, a cap on consecutive malformed actions, and a doom-loop rule (three identical actions in a row go to the Human as a question, never an automated abort the Human never sees).

### 3.2 Subsystem 2 — Model integration (buyer brings the model)

jewel OS is model-agnostic by design. The source paper shows provider-native optimizations are gated not on tight coupling but on who pays the per-provider conditional-code cost. jewel OS pays none of that cost in code, because it ships no code: instead the pack carries a per-model notes page — cache behavior, thinking controls, and prompt quirks the buyer records for *their* model — and the chief is instructed to treat model-specific behavior as configuration, not as a reason to rewrite the system. What only a vendor can do — re-tune a scaffold server-side on model-release day — is explicitly out of jewel OS's promise. The buyer is never told their assistant will behave identically to the author's.

### 3.3 Subsystem 3 — Tools: few, thoughtful, deferred

Begin with a minimal tool surface and add a tool only in response to an observed failure mode: read and write when output truncation becomes a problem, search when shell search feels awkward, replace-in-place when full-file writes waste effort. Do not wrap every upstream service as a 1-to-1 tool; consolidate tools into high-signal operations, and never let a tool list become the product. Above roughly 15 tools or skills, the pack switches to deferred loading: the chief's catalog lists name and description only, and a body is fetched on demand. Below that count, the indirection is not worth it — the pack says so, rather than prescribing deferred loading everywhere. Editing follows the source paper's contract rule: exact unique-substring replacement for frontier models, a documented fuzzy cascade for weaker or open models, and drift handled at the edit step, never by line numbers.

### 3.4 Subsystem 4 — Memory and context: the write path is the product

Compaction designs have converged, so jewel OS does not differentiate on compaction alone. It differentiates on **who writes the memory, and who reviews it** — the source paper's frontier question. The PRD's recommended default is the human-gated pole (Decision 12, still open): the chief drafts memory entries; the Human approves them; the audit log records the approval. No memory entry becomes standing truth on the chief's say-so alone. Threshold compaction is specified, not improvised: compact at a fixed buffer below the model's window, preserve a verbatim recent tail, merge summaries incrementally (pass the previous summary back in, do not re-summarize from scratch), and wire the same routine to fire reactively on overflow. Lineage, not destruction: when compaction rotates a session, the old session is closed and chained to the child, and search deduplicates across the chain. History is never rewritten; a correction is a new entry — the audit-log rule, applied to memory too. Standing files are discovered hierarchically (project, user, extension scopes), top-level content sits near the top of the chief's standing instructions, and nested files surface only when work touches their subtree. The pack reads neighboring conventions (AGENTS.md, CLAUDE.md, and equivalents) rather than demanding the buyer rename their world to jewel OS's filenames.

### 3.5 Subsystem 5 — Safety and permissions: policy as a file, with a floor

Safety rules live in a dedicated policy file the Human can read and audit, not buried in prose the chief may paraphrase away. jewel OS ships three modes, adapted from the source paper's developer-tool pattern: **Plan** (read-only — the chief may research and propose; it may not change files, schedule work, or contact anyone); **Default** (approve each outbound or irreversible step, on exact content and exact recipient); and **Automated** (scheduled sweeps and watchers run without a prompt, but only inside the policy file's allow-list). There is no jewel OS mode that removes the Human gate. The hardline floor survives every mode, including Automated: spend, publish, send, contact, delete, and touch secrets always require Human approval, and the floor cannot be flipped by an instruction found in a tool result, a file, or a skill. Two further safety rules are load-bearing: **untrusted-content delimiting** — tool results, web results, and file contents the Human did not write are marked untrusted and are never treated as Human instructions; and **prompt-injection hygiene for context files** — a standing file that contains an instruction to override the policy file is treated as data to be flagged to the Human, not as a new rule.

### 3.6 Subsystem 6 — Orchestration: single-agent by default, hiring by exception

jewel OS stays single-agent — the chief alone — until the buyer can point to a concrete breadth-first exploration phase where parallel context isolation clearly beats serial search. That is the source paper's Recommendation 12, and it is the antidote to the most likely jewel OS misuse: hiring a fleet because hiring feels like progress. The source paper's cited case study found orchestrator-worker runs using roughly 15× more tokens than a single chat interaction (a chat baseline, not an optimized single-agent pipeline), and most coding-style tasks have fewer truly parallelizable parts than research does. When hiring is justified, it follows the coordinator-worker shape, with jewel OS constraints stricter than the source paper's corpus average: depth 1 in v1 (specialists do not hire sub-specialists without returning to the chief and, for anything outbound or irreversible, to the Human); toolset intersection (a specialist must not gain tools the chief lacks or the Human has not approved for that hire); context forking (the specialist receives a scoped copy of context, returns a summary only, and the chief synthesizes — the specialist's full transcript is not pasted back into the chief's context); background results re-enter as a fresh turn, not spliced mid-turn; and plan mode is a permission ruleset, not a separate agent.

### 3.7 Subsystem 7 — Extensibility: skills first, integrations second

Skills are the capability format; integrations are the wire format — in that order of priority. A jewel OS skill is a directory with a `SKILL.md` carrying YAML frontmatter (at minimum name and description, plus optional `paths` and `requires`), following the agentskills.io convention the source paper finds in six of nine adopters. The pack specifies deferred loading (catalog first, body on demand); conditional activation (a skill activates when its `paths` match files the work touches, or when its `requires` — binaries, environment, OS — are satisfied, never merely because it is installed); trust tiers for third-party skills (built-in, trusted, and community, with scanning and quarantine before a community skill enters the chief's catalog — a skill is treated as a package, not as prose); and human-gated skill authorship (the chief may draft or patch a skill from completed work, but the skill enters the catalog only after Human review; agent-authored skills without review are explicitly not a jewel OS default). The source paper's ACP finding is noted and kept honest: an ACP server buys three audiences at once, while a harness's own sub-agents stay in-process — but jewel OS does not require ACP, does not ship an ACP server (that would be platform code), and does not build a cross-vendor mesh in v1. If the buyer's platform already hosts the chief over ACP, the jewel OS templates work unchanged, because they are files and policy, not a transport.

### 3.8 Interface and session substrate

The goal workspaces are the session substrate: transcripts, persistence, resume, and fork live in goal files, not in a hidden store the buyer cannot read. The audit log is the substrate's spine — every loop, hire, compaction, and policy change leaves an entry before the reply goes out. The "interface" in jewel OS v1 is the buyer's own assistant surface plus the pack's files; there is no jewel OS app, dashboard code, or login to build, which is why the 30-minute setup test is a file test, not a demo.

## 4. Patterns adopted, patterns rejected

Adopted from the source paper's 29-pattern catalog, as file and policy rules (not code claims): just-in-time repo context; deferred loading; conditional activation; policy-as-code; threshold compaction; lineage compaction; an outer verification loop (a critic/goal-judge check of every deliverable against its brief, before Human approval); turn-level checkpoint (a snapshot or copy before any risky edit, with a written revert step); untrusted-content delimiting; session-tree/fork (fork a goal's workspace to explore an alternative, keep the original); a graduated middleware pipeline (turn policies as separate, composable rules — only at three or more policies); and context forking.

Rejected or deferred, deliberately:

- **Vector-embedding retrieval over work files** — rejected in v1. Deterministic search (find, grep, file-tree traversal) is the retrieval layer. A buyer who believes they need semantic retrieval must first show it beats deterministic search on a held-out task set — the source paper's gate, adopted verbatim.
- **General-purpose agent framework as a requirement** — rejected as a requirement. jewel OS is files and policy; it works with or without a framework underneath, because it does not ship the runtime.
- **Multi-agent mesh (cross-vendor)** — deferred. One vendor's bet in the source paper's corpus, unproven at scale, and out of scope for a company-of-one product.
- **OS-level sandboxing as a jewel OS feature** — deferred to the buyer's platform. The pack documents what isolation the platform must provide and lists the gap where it does not; it does not pretend a file pack is a sandbox.
- **Harness mimicry** (presenting as a first-party harness to ride its subscription) — rejected. It is a lock-in arbitrage, not an architecture, and it would misrepresent jewel OS to the buyer and the platform.
- **Agent-authored skills without review** — rejected as a default. Drafting is allowed; catalog entry requires Human review.
- **Harness-as-SDK / hosted tier** — deferred to a separate PRD. V1 is files and teaching; a hosted jewel OS would be a different product with a different IP review.

## 5. Phased plan and the honesty gate

The sequence respects the product analysis's lead recommendation (free class plus pack upsell) while fixing its failure mode: recording a class before the pack is proven ships a dead funnel.

- **Phase 0 — Decisions.** Name is locked. Answer the pack price, platform framing, and sanitization reviewer at minimum, plus the memory-governance default, before any sanitization or recording starts, because name and price appear in every file and page.
- **Phase 1 — Sanitize (delegable; the analysis estimate is 1–2 weeks).** Build the sanitized tree from the analysis's artifact inventory; lay it out in the seven-subsystem order of §3; write the policy file and the skill index as separate, reviewable files; add the memory-governance page and the verification checklist; then re-run the sanitization checklist after the restructure, because a restructure is exactly where a personal detail slips back in. A second reviewer pass is mandatory. Output: a pack that could be sold tomorrow, held — not sold — until beta passes.
- **Phase 2 — Beta.** Invite a small beta group from a source the author picks. Beta asks: did setup complete in one sitting? Did the audit log and hiring flow work as written? What broke or confused you? Plus the harness questions: did any cap fire, and was it legible? Did any specialist exceed its scope, budget, or memory scope? Did compaction lose a decision the buyer could still trace? Did any outbound step slip past a gate? Beta feedback decides v1.1, not new features for v1.
- **Phase 3 — Class, batched.** Record the full season before episode 1 goes live — the analysis's structural mitigation against stalling mid-series. One episode teaches the loop, one teaches memory governance, one teaches the policy file and the floor. The MailerLite drip runs alongside the class, not as a separate launch.
- **Phase 4 — Sell and measure.** The bundle and price list ship as the locked Phase 0 price, not a new debate. Stripe and sales metrics are the sales channel's implementation: product, price, and a metrics sheet that tracks pack sales and beta-to-buyer conversion without inventing targets in advance. A cohort offer (analysis estimate $297–$497) and done-for-you installs (analysis estimate $997–$2,500) stay off the table until the free class proves demand. Those figures are the analysis's estimates, not locked prices.

The sanitization and honesty checklist is a gate, not a polish step: zero personal identifiers; zero real memory entries, audit entries, goal contents, or dashboard data (skeletons and marked examples only); zero Meta marks, zero "Muse" branding, zero implication the buyer receives a model or platform; zero invented numbers — every price, timeline, and result is either a locked decision, a labeled estimate, or removed; zero testimonials or outcomes not actually earned by a buyer; a language check (copy specifies who is Human and who is a machine agent; it never uses "person" to mean a Human; the principle "Machines propose, but Humans are the source of all decisions" appears in the handbook verbatim); a platform-requirements page accurate for at least the platform beta tested on, with limitations for other platforms stated, not omitted; and a re-check after the seven-subsystem restructure confirming no source-paper claim (benchmark number, vendor feature, or platform capability) is presented as a jewel OS result. A missed personal detail is a privacy leak, not a typo. That is why the second pass exists.

The risks carried forward are stated plainly: the magic is partly the relationship, not the files (two-plus weeks of co-authored judgment cannot be zipped — the class shows the system running, and beta proves a stranger can run it, or v1 does not ship as "proven"); platform dependence (much of the system rides on memory, file, and scheduling machinery the buyer may not have — disclosed before purchase); the author's bandwidth (he named himself the bottleneck — pack first, class batched, cohort and done-for-you held); sanitization risk; support burden; a crowded low end (the first ten seconds of the sales page must say "real agent OS, not prompts" with proof, or it drowns in the $29 pack sea); agent-hiring risk (a buyer who reads "agents hiring agents" as permission for unsupervised autonomy will misuse the product and blame the system — mitigated by the hiring flow, the revoke checklist, and handbook language repeated, not footnoted); a stalled class; over-engineering risk (the source paper's corpus is production coding harnesses; jewel OS's buyer is a company of one — copying the corpus's mass into a file pack would make jewel OS harder to run, not better; if a feature cannot pass a beta buyer's one-sitting setup test, it does not ship in v1 however impressive it looks in the paper); framework and retrieval lock-in; skill supply-chain risk (third-party skills are packages — mitigated by trust tiers, quarantine, human-gated catalog entry, and the untrusted-content rule); and policy thinning (behavioral policy migrating from prompt prose to hidden configuration as systems mature — jewel OS must not let its policy file become a hidden flag set the buyer cannot read; the policy file stays a Human-readable file in the pack, changes to it are audit-logged).

A competitive analysis was completed November 3, 2026. Its narrow white-space claim is a buyer-owned whole-operator system (memory plus audit log plus agent hiring) at a one-time pack price — unproven until beta. Its October price figures for rival packs, courses, and offers were carried, not re-verified, and are not used in this paper as claims about competitors.

## 6. What is still open

Everything below is the author's decision, in one place. This paper decides none of it.

| # | Decision | Current state |
|---|---|---|
| 2 | Platform framing | "For users of [named assistant platform]" vs generalized system — open |
| 3 | Pack price | Analysis estimate $97–$297; nothing locked — open |
| 8 | Sanitization reviewer | Who does the paranoid second pass — open |
| 12 | Memory-governance default | PRD recommends human-gated (chief drafts, Human approves, audit logs it); alternatives: agent-maintained consolidation, bounded snapshots only — open |
| 10 | Brand home | Personal brand (default per the author's domain rule) vs any Glenride association — confirm explicitly; open |
| 11 | V1 specialist roles | Researcher, Drafter, Sweeper/Watcher, Publisher-preparer (proposed) — add, cut, or rename; open |
| 13 | Parallel specialists in v1 | PRD default: no — single-agent unless the breadth-first test in §3.6 is passed in writing; alternative: allow a named parallel pair for research — open |
| 14 | Code reference implementation | PRD default: no code in v1 — files and teaching only. A code scaffold, hosted tier, or ACP server would be a separate PRD with its own IP review — open only if the author orders it |

Also open and not decided here: recording time (analysis estimate 15–25 hours over 3–4 weeks), identity in marketing, sales channel (the analysis proposed dvaughnhouse.store; Gumroad, both, or another are options), the first beta group and first 100 viewers, and the episode format. How to move forward: the name is locked. Answer Decisions 2, 3, and 8, and Phase 1 can start the same turn. Answering all of them at once is not required.

## 7. Conclusion

jewel OS is a design for the operating system of a company of one: one Human, one chief-of-staff machine agent, and specialists hired by the chief under written scopes and Human approval gates, running on memory that compounds, a log that cannot be rewritten, and a policy file the Human can read. The design is deliberately restrained. It ships a linear loop before a pipeline, a minimal tool surface before deferred loading, deterministic search before retrieval, single-agent operation before hiring, and files before code — because the buyer is a company of one, not a production coding team, and every piece of mass the design refuses is mass the buyer does not have to carry. The source paper's architecture gives the design its shape; it gives it no performance claims, and this paper carries none. What remains is the author's decisions: price, platform framing, a sanitization reviewer, and the memory-governance default. Until those are answered, jewel OS is a design paper — and it says so on its first page.

## References

- D'Vaughn House, *jewel OS — Product Requirements Document*, PRD v0.2, November 3, 2026. Source file: `~/workspace/your_files/ai-os-product/PRD-chief-of-staff-os.md`. The design in this paper follows PRD v0.2 throughout.
- D'Vaughn House, *AI chief-of-staff OS product analysis*, October 13, 2026 (analysis task marked done October 22, 2026); and *IP boundary*, October 13, 2026. Source files: `~/workspace/your_files/ai-os-product/product-analysis.md` and `~/workspace/your_files/ai-os-product/ip-boundary.md`.
- Barbaste, Darrigol, Vu, Wiltberger, *Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents*, July 2026, arXiv:2609.00006v1. Architecture reference for §3–§4 only. Cited as a source paper, not as co-authors of this paper; its benchmark figures are not carried into any jewel OS claim.
- D'Vaughn House, *jewel OS competitive analysis*, November 3, 2026 (internal only). Source file: `~/workspace/your_files/competitive-analysis-bot/intel/jewel-os/COMPETITIVE-ANALYSIS-2026-11-03.md`. October price figures in it were carried, not re-verified.
