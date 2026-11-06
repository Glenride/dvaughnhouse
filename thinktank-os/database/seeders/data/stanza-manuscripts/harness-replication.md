# A Replication of "Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents"

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Independent replication study — manuscript for the STANZA / License It From Anywhere catalog

## Authorship note

This manuscript is an independent replication study, authored by D'Vaughn House.
The work being replicated — Barbaste, Darrigol, Vu, and Wiltberger, "Harness
Engineering: Anatomy, Architecture, and Evolution of Coding Agents — A
Source-Code Study of Eleven Systems," arXiv:2609.00006v1 (July 2026) — is by
Paul Barbaste, Tristan Darrigol, Germain Vu, and Tom Wiltberger. That paper is
cited throughout as the source of the corpus, the observations, and the
mechanisms verified here. It is not claimed as the author's work. Licensing
this manuscript licenses this replication study, not the original paper.

## Abstract

We reconstruct the empirical core of Barbaste et al. (2026) — a source-code
anatomy of eleven production coding harnesses plus the Omnigent meta-harness —
and verify its quantitative claims deterministically. Because the ~4M lines of
source across the eleven repositories (and the circulated Claude Code
snapshot) cannot be re-cloned offline, we encode the paper's own Tables 1–18
as a structured corpus and verify every count, ratio, and longitudinal diff
for internal consistency, then execute reconstructed implementations of its
key mechanisms: Claude Code's concurrency batching, OpenHands' resource-lock
batching, the three editing matcher families, Aider's recursive halving,
Gemini CLI's threshold compaction, Hermes' SQLite lineage rotation, Pi's
session tree, Codex's Starlark policy validation, OpenCode's arity-scoped
grants, and Listing 3's 90-line Minimum Viable Harness. All nine verification
targets match. The headline finding survives: across the corpus, 0/11 runtimes
import a general-purpose agentic framework and 0/11 retrieve code with vector
embeddings. Three draft numbers in the replication record did not survive
re-computation and are corrected here (Section 3); none changes a conclusion.

## 1. Method

The corpus is encoded as structured records for all eleven systems
(OpenHands, Aider, Claude Code, Codex, Gemini CLI, Mistral Vibe,
Mini-SWE-Agent, Hermes, Pi, OpenCode, OpenClaw) plus Omnigent, across the
paper's seven subsystems (D1–D7). Counts in this manuscript are computed
from that encoding, never transcribed from the paper's prose. Mechanisms are
re-implemented in Python from the paper's descriptions and listings
(Listing 3's glyph artifacts restored to valid Python 3 syntax, semantics
unchanged) and executed against deterministic mock models and fixtures —
no live API keys, no network access to the repositories.

## 2. Results

### 2.1 Observation 9 — The twin absences (Abstract; Sec. 13.2)

Framework imports in agent runtimes: **0/11** (0/12 including Omnigent).
Vector-embedding retrieval over code: **0/11**. Boundary cases preserved
exactly as the paper states them: Aider's llama-index use is opt-in
`/help` documentation RAG only (not code); OpenClaw enables hybrid
sqlite-vec KNN + FTS5/BM25 by default for chat recall only; Hermes relies
on deterministic SQLite FTS5 in core, with embeddings relegated to opt-in
memory plugins. The field runs on hand-rolled async loops and deterministic
retrieval (ripgrep, tree-sitter, glob, auto-discovered Markdown context files).

### 2.2 D1 — Agent loops and concurrency (Sec. 6)

Loop paradigms: **9** iterative action-observation systems, **1**
reflection-augmented loop (Aider, max 3 reflections), **3** coordinator-worker
overlays (Claude Code, Codex, configuration-gated Hermes). OpenClaw's
event-driven ACP loop is a distinct paradigm and is not counted in the 9.
On the 5-call trace [R1(fileA), R2(fileB), W3(fileA), R4(fileC), W5(fileB)],
Claude Code's single-pass reduce yields **4** batches [[R1,R2],[W3],[R4],[W5]],
versus **2** waves [[R1,R2],[W3,R4,W5]] under OpenHands' per-resource lock
manager. Hermes' verify-on-stop guard vetoes a premature text exit when a
file-mutating call occurs after the last verification call; Pi's truncation
guard aborts pending calls on `max_tokens`.

### 2.3 D2 — LLM integration, caching, rhetoric (Sec. 7)

Full prompt caching: **4** systems (Claude Code's Blake2b boundary,
Hermes' system-and-3 bit-perfect prefix, Pi's breakpoints, OpenCode's
6-dialect fanout). Prompt rhetoric census: **9/11** verbosity rules,
**6/11** explicit anti-gold-plating rules, **0/11** policy-level harm
refusal language.

### 2.4 D3 — Tools and editing (Sec. 8)

Tool-count spectrum, verified exactly: **[1, 7, 12, 13, 17, 25, 27, 35, 43,
69, 109]** (Mini-SWE-Agent 1 to OpenClaw 109). All three reconstructed
editing matchers pass: exact unique-substring replacement (Claude Code,
Mistral Vibe) rejects ambiguous multi-matches; Pi's NFKC / smart-quote /
trailing-whitespace canonicalizer matches drifted quotes while preserving
untouched original bytes; the OpenCode/Hermes fuzzy cascade resolves an
indentation-drifted hunk at stage 3.

### 2.5 D4 — Memory and compaction (Sec. 9)

Memory strategies sum to 11/11: **1** Linear (Mini-SWE-Agent), **2**
Recursive Summarization (Aider, OpenClaw), **1** Condensation (OpenHands),
**7** Threshold Compaction. Aider's recursive halving compresses a 2,400-char
history within its 3-level cap; Gemini CLI's 50%-trigger / 30%-tail rule
compacts a 20-message transcript to 1 summary + 6 tail messages; Hermes'
lineage compaction produces a 3-node SQLite session chain with
`end_reason='compression'`; Pi's append-only JSONL tree branches via
`id`/`parentId` with a movable leaf pointer.

### 2.6 D5 — Safety and sandboxing (Sec. 10)

Native 3-OS sandboxes by default: **2/11** (Codex, Gemini CLI). Hermes
(~642K LoC) and OpenCode (~578K LoC) ship **0** OS-level sandbox
primitives — large scale does not imply OS sandboxing. Codex's Starlark
`prefix_rule` validates `match` and `not_match` examples at parse time
(3 examples validated; injecting `["git", "push"]` into `match` raises).
OpenCode arity scoping: `["git", "commit", "-m", "fix"]` → `"git commit *"`,
`["npm", "run", "build", "--watch"]` → `"npm run build *"`.

### 2.7 D6 — Multi-agent orchestration and protocols (Sec. 11)

Multi-agent support: **9/11** — 8 in core, plus Pi via its reference
extension (Table 9's own counting). ACP ships in **6/11** systems
(including Gemini CLI's A2A mesh server). Among the 9 multi-agent systems,
**8/9** coordinate their own sub-agents via in-process primitives or
non-standard IPC; OpenClaw is the lone system spawning its own sub-agents
over ACP.

### 2.8 D7 — Extensibility and the platform turn (Sec. 12, 14)

Skills adoption **9/11** vs. MCP **8/11**; deferred skill loading **8/9**
adopters; remote skill registries **4/11**; agent-authored skills **2/11**;
hooks **9/11**. Pattern catalog: **29** patterns (17 April + 12 July).
Longitudinally (April → July 2026): Codex grew 621K → 1.12M LoC (+80.4%)
and 89 → 126 crates (+37); Mistral Vibe grew 35.6K → 63K LoC (+77.0%).
Omnigent wraps 23 canonical adapters (+16 aliases) across 5 integration
modes while implementing 0 editing loops of its own.

### 2.9 Listing 3 — Minimum Viable Harness (Sec. 16.10)

The ~90-line harness implements **10/18** recommendations directly
(compatible with the remaining 8), with **4** tools (bash, read_file,
write_file, search_replace), root-to-leaf AGENTS.md discovery, turn/cost
caps, and compaction retaining 1 system + 1 summary + max(4, 30% tail) = 8
messages on a 20-message transcript. The end-to-end edit (write, then
search-replace) verifies against the filesystem with a deterministic mock
model.

## 3. Corrections to the draft record

Three numbers in the supplied draft replication record did not survive
re-computation from the supplied code, and are corrected here. Conclusions
are unchanged:
- **Claude batches: 4, not 3.** The draft matrix claimed 3 Claude batches
  on the 5-call trace; the single-pass reduce yields 4
  ([[R1,R2],[W3],[R4],[W5]]). The draft's own subsection listed those 4
  batches while calling them 3.
- **Multi-agent 9/11 = 8 core + Pi via extension.** The corpus encodes 8
  core multi-agent systems; the 9th is Pi via its reference extension
  (Table 9, Sec. 11), not a 9th core system. The 8/9 off-standard-protocol
  figure follows from that same counting.
- **Provider strategies: 7 labels, not 5.** The corpus encodes 7 distinct
  provider-strategy labels; the paper's "5 strategies" is a grouping of
  those labels, not a directly countable field.
- **Fuzzy-cascade ratio is input-dependent.** The draft claimed similarity
  0.88; this run's test input resolves at stage 3 with 0.97. The stage-3
  outcome is the verified invariant.

## 4. Conclusion

The paper's empirical claims verify — including its most striking one, the
twin absences — and its mechanisms execute as described when reconstructed
from the listings. For builders, the durable lesson is the paper's own:
start minimal (the 90-line scaffold), keep the loop hand-rolled, defer
loading, put policy in code with a floor under it, and stay single-agent
until breadth-first parallelism clearly wins.

## References

Barbaste, P., Darrigol, T., Vu, G., & Wiltberger, T. (2026). Harness
Engineering: Anatomy, Architecture, and Evolution of Coding Agents — A
Source-Code Study of Eleven Systems. arXiv:2609.00006v1.
https://arxiv.org/abs/2609.00006
