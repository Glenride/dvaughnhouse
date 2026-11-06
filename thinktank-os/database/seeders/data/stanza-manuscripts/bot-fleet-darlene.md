# The Weekly-Theme Bot Fleet: Darlene and the Bot HQ Reflection Gate

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Design manuscript. Built parts are described as built; concept and
design-only parts are labelled as such.

## Abstract

Glenride runs a fleet of local, named machine entities — bots — each with its
own identity, soul, and scoped memory. This manuscript describes the design
that turns that fleet from a set of separate tools into a learning cohort:
a weekly-theme program in which every bot is given the same theme, researches
it from a consortium of at least three distinct sources, and writes a formal
and an informal composition pondering how the theme relates to Glenride, to
D'Vaughn House's personal brand, and above all to customers' perceived
benefits. All bots report their health to Bot HQ (bots.dvaughnhouse.com), and
a weekly reflection gate holds a bot offline on HQ until its prior week's
reflection is recorded. Darlene — the local personal assistant, the first
weekly-theme bot — is the worked example. The gate is built and deployed but
unarmed as of November 6, 2026, awaiting D'Vaughn's call to arm it.

## 1. The problem

A fleet of capable bots that never reflect is a fleet of amnesiacs. Each bot
can answer, render, or trade, but nothing in its routine forces it to
accumulate a point of view — to learn from a shared body of information and
become more identifiable with itself over time. Two failure modes follow.
First, the bots drift apart: each one optimises its own task and none of them
carries Glenride's through-line into its work. Second, nobody can tell from
the outside whether a bot is actually doing the reflective work or merely
staying online. A bot that is up and idle looks the same as a bot that is up
and learning.

The design goal is therefore twofold: give the whole fleet one shared
intellectual rhythm each week, and make completion of that rhythm visible —
on a dashboard, in public, with a real consequence for skipping it.

## 2. Design principles

Four standing rules govern the fleet, and the weekly-theme program is built
on top of them rather than beside them.

1. **Machines propose; the Human decides.** Every bot states plainly that it
   is a machine entity; D'Vaughn is Human. Money moving, anything public,
   brand or strategy direction, legal-adjacent moves, irreversible executions,
   and named approvals stay visibly his. A bot never claims to be Human and
   never invents traction, numbers, or facts.
2. **Nothing public by default.** Compositions are drafts, held for D'Vaughn's
   review — in Bot HQ's approval queue where that bot is wired to it,
   otherwise in the program's draft folder. Nothing goes public, to a
   customer, or to a social account until he approves that exact piece.
3. **Direct interfaces pass his words verbatim.** Where D'Vaughn talks to a
   bot directly on Bot HQ, his words land in the bot's intake and memory
   exactly as written. The operator keeps the pipe working and does not
   paraphrase, reframe, gate, or "improve" anything passing through it. He
   asked for this on November 3, 2026, because filtering through an
   intermediary's assumptions and preferences is a hindrance.
4. **Every bot reports to Bot HQ unless it literally can't.** Ordered
   November 4, 2026. "Literally can't" means a real technical block — no
   network path, a closed third-party service with no hook, a retired
   service — not "not wired yet". Wiring work is wireable. The bridge
   contract is POST `/api/heartbeat` and `/api/events` with an `X-Bot-Key`
   header and a browser User-Agent (Cloudflare rejects the default
   Python-urllib User-Agent with a 403).

## 3. The weekly-theme program

Ordered November 2, 2026. Each week, every in-scope bot is given the same
theme. The purpose, in D'Vaughn's words, is to make each bot more identifiable
with itself — to the extent that it learns, and can create content based on a
consortium of information.

### 3.1 The weekly deliverable

Each bot writes two compositions on the week's theme:

- **Formal** — a considered piece in the bot's professional voice.
- **Informal** — the same theme, in the bot's casual, human-feeling voice.

Both compositions must ponder how the theme relates to Glenride at large, how
it relates to D'Vaughn House's personal brand at large, and above all
customers' perceived benefits — what a customer gains, feels, or can do
because of this theme, as it relates to them through D'Vaughn's work.
Features are not the point. The customer's gain is.

### 3.2 The consortium rule

A composition must rest on at least three distinct sources, gathered with
Moli — the headless browser installed on the iMac — and must say what each
source actually contributed. A single source, restated, is not a consortium.
Unverified claims are labelled VERIFIED / INFERRED / UNKNOWN. A proposal is
never presented as an agreement, a submission as an approval, or "could" as a
promise. Each bot writes in its own identity and voice, from its own scoped
memory; no bot invents a name D'Vaughn has not given it, and no bot shares
another bot's private memory by default. No secrets ever go in a composition.

The Week 1 brief, "Prevention over cure", was verified as a consortium on the
iMac: the Dr. Kaul quote ("An ounce of prevention is worth more than a pound
of a cure", via D'Vaughn), preventive healthcare, supply-chain risk
management, and D'Vaughn's own prevention rule.

### 3.3 Bots in scope and wiring order

The program covers ten bots: Darlene, Community Manager, GT (the trading
bot), Henry (E-Com Ad Factory), Longevity Coach, Evita, Motion Bot, Lucas,
Lisa, and Content Engine. Wiring proceeds bot by bot, in order, so each bot
loads its identity, soul, and weekly theme brief. As of November 3, 2026,
three were wired for Week 1: Darlene (bot 1), Prism (bot 2), and GT (bot 3).
Community Manager was next in order, followed by Motion Bot and Lucas. Week 1
compositions for all ten bots exist as drafts, held for D'Vaughn's approval;
nothing is published.

## 4. Darlene: the first weekly-theme bot

Darlene May Talbot-Rennet is D'Vaughn's local personal assistant — a machine
entity he named on October 30, 2026, and welcomed as a teammate for building
Glenride, distinct from Janine. She is the worked example of the program
because she was wired first and because her build is the most completely
verified in the fleet.

### 4.1 Build

Darlene was built and verified on the iMac on October 30, 2026: terminal
chat, router, builder, critic, architect, swarm, and subagent spawning;
read, search, list, test, and write; semantic search and a code graph; and a
confirm gate for public, money, or irreversible work. Her memory is an
append-only log with keyword and recency retrieval, which refuses
secret-looking values; only explicit `/remember` and `/prefer` entries
auto-save. Scheduler and daemon jobs were tested 7/7, with jobs and approvals
held in memory files and irreversible work waiting in an approval queue.
Contracts and checkpoints were verified 7/7, with one contract per run and
execute-once receipts so a retry cannot publish, pay, or write twice. Chat
tests passed 11/11. Connectors via MCP were tested 5/5; by default no
connectors are configured, and Gmail, Calendar, GitHub, and web search each
need his own setup on the iMac. Voice is output only in version 1. Her
briefing is a deterministic digest of approvals, due jobs, and open items.

Her model is Qwen 3.8 27B — D'Vaughn's choice on October 30, 2026,
overriding a 32B/35B MoE recommendation. It runs direct via llama-server 2.67
on the Mac Studio, proxied from the iMac; the serving switch that day killed a
duplicate Qwen 3.6 orphan and cut RAM from 55.2 GB to 35.5 GB, and the direct
server was verified via `/status` and a proxy completion. Auto-start is in
place at his request: a Studio LaunchAgent for Qwen direct (RunAtLoad plus
KeepAlive, with a RAM guard) and iMac services for the proxy and web chat.
The Studio agent runs on login, not at boot. Her web chat went live October
30, 2026, on the iMac, Tailscale only and password-gated, verified live; the
password in place is a temporary test password, and a password of his own
choosing is a later step.

The flywheel — the mechanism by which she would learn from experience over
time — does not train a model. Any LoRA or DPO run needs a GPU run on the
Studio, a dataset review, and his approval of the training data.

### 4.2 Weekly-theme wiring

On November 2, 2026, Darlene became bot 1 of 10 wired for the program. Her
iMac chat prompt gained a weekly block for Week 1, "Prevention over cure";
the service was restarted and verified active with an HTTP 200. Her Week 1
formal and informal compositions were drafted for his approval, not
published.

### 4.3 Bot HQ reporting

On November 4, 2026, at D'Vaughn's "wire all the wireable ones" direction, a
separate sidecar reporter on the Studio began checking her health every two
minutes and reporting to Bot HQ. Her own service was not touched or
restarted, and the wiring was verified live on HQ.

## 5. The other gated bots

The reflection gate launches with exactly three gated bots: Darlene, Motion
Bot, and GT. Not-yet-wired program bots join the gated set when they are
wired.

**Motion Bot** is D'Vaughn's video bot, built October 24, 2026, rendering
with Remotion plus FFmpeg on the iMac. On November 3, 2026, he ordered a
story-first remake: not hooks-only, but a more capable content creator with a
theme to ponder, real memory, and weekly pondering. The Phase 1 story-first
pipeline is live — it reads the whole task including beat sheets, turns beats
into scenes, and the critic checks that beats appear on screen — and
Episodes 2 and 3 were released November 3, 2026, with story coverage passing.
Its weekly ponder loop runs on Fridays, with the first note due November 6,
2026, and it is through that loop that Motion Bot meets the gate. Still owed
as of November 3, 2026: wiring memory into the render path, a direct Bot HQ
interface with verbatim passthrough, visuals per beat, and the full kinetic
engine for the 60fps Anti-Slop specification. A Bot HQ audit on November 4,
2026, found Motion Bot already reporting, idle between its 15-minute watcher
runs — normal cadence, not an outage.

**GT** is the trading bot, renamed October 22, 2026, in the Moon Dev style: a
named desk-agent persona that talks in plain English instead of raw signal
rows. It paper-trades a virtual $10,000 book with an LLM panel (chart, risk,
and strategy lenses voting BUY / SELL / NOTHING over a context pack of GT's
real numbers only, with the strategy code casting a fourth vote), and it fails
closed when the Studio is down. It was wired as bot 3 of 10 on November 2,
2026: a weekly brief for Week 1, "Prevention over cure", was filed to the
private botwiki and synced to the iMac mirror, layering that theme onto GT's
standing theme — what actually moves a small trader's week — without
replacing it. The panel code gained a second theme read for the weekly file,
capped at 1200 characters, as a separate section in the panel's system
prompt. Calendar context only, verbatim, for both themes: never a trade
signal, never a price target. Paper-only and advisory-only are intact, no
strategy changed, and no panel run or trade was triggered by the wiring. The
wiring was verified live: code compiles clean, the container was rebuilt and
recreated, and logs show the bot starting in PAPER ONLY mode with its
scheduled cycle, heartbeat, and chat jobs added.

## 6. The reflection gate

Built, deployed, and verified November 4, 2026, on the Bot HQ Worker
(bots.dvaughnhouse.com). The rule is simple and mechanical: weeks run
Monday to Sunday, and a gated bot with an incomplete prior week shows
OFFLINE on HQ until its reflection is recorded. Late completion restores the
bot mid-week. The dashboard shows the reason for the offline state; the
public page shows offline plus an overdue flag only.

The gate is **unarmed at launch**: `gate_first_week` is null, so no week is
yet enforced. A gatekeeper cron (`bot-hq-reflection-gatekeeper`) runs daily
at about 08:36 ET, first run Thursday, November 5, 2026, and stays silent
while the gate is unarmed or all bots are current. At launch the production
fleet stood at 14 bots, 9 online, 0 overdue.

Two decisions remain D'Vaughn's call. First, **arming**: setting
`gate_first_week` to the Monday of the Week 1 theme week, once he picks the
theme. Second, the **Week 1 backfill**: compositions drafted by Janine do not
count as bot reflections, and the gatekeeper never auto-credits them. A bot
earns its online state with its own reflection, not with a draft written on
its behalf.

## 7. Status (as of November 6, 2026)

**Built and verified.**

- Darlene: live on the iMac since October 30, 2026 — chat, router, builder,
  critic, architect, swarm, memory, scheduler, contracts, and web chat
  (Tailscale only, password-gated), with the test counts recorded in §4.1.
  Qwen 3.8 27B running direct via llama-server on the Studio, proxied from
  the iMac; auto-start services enabled.
- Weekly-theme program: program specification, Week 1 brief ("Prevention
  over cure", confirmed November 2, 2026), and Week 1 formal + informal
  compositions for all ten bots drafted and held for D'Vaughn's approval.
  Darlene, Prism, and GT wired for Week 1.
- Bot HQ reporting: the all-bots-report rule ordered November 4, 2026;
  Darlene's sidecar reporter wired and verified live on HQ the same day,
  health checks every two minutes; Motion Bot already reporting.
- Reflection gate: built, deployed, and verified November 4, 2026; gatekeeper
  cron running daily at about 08:36 ET from November 5, 2026, silent while
  unarmed.
- Motion Bot: Phase 1 story-first pipeline live; Episodes 2 and 3 released
  November 3, 2026, with story coverage passing; weekly ponder loop running
  Fridays, first note due November 6, 2026.

**Concept or design only — not built.**

- Weekly-theme wiring for the remaining seven bots (Community Manager next,
  then Motion Bot and Lucas, then the rest). Their Week 1 compositions exist
  as drafts; their live wiring does not.
- Direct Bot HQ interfaces with verbatim passthrough: the design rule is
  stated (§2.3), but the Motion Bot interface is still owed, and no other
  bot's direct interface is recorded as built.
- The flywheel as training: no LoRA or DPO run has happened. It needs a GPU
  run, a dataset review, and his approval of the training data.
- Darlene's permanent web password (the temporary test password is still in
  place), starting her scheduler daemon detached, and connector setup
  (Gmail, Calendar, GitHub, web search) on the iMac.

**Blocked or awaiting his call.**

- **Reflection gate arming.** The gate is unarmed; arming needs his call to
  set the gate's first week, and the Week 1 backfill decision (Janine-drafted
  compositions do not count) stands as recorded.
- **GT live data and contact.** Alpaca paper keys are still needed for live
  data instead of the mock feed, and D'Vaughn still needs to press Start in
  Telegram before GT can DM him.
- **Current reachability not re-verified for this paper.** The Mac Studio
  was reported offline since about 01:30 EST on November 5, 2026, and the
  Studio hosts Darlene's model server and GT's container. This paper does
  not assert the live state of any Studio-hosted service as of November 6,
  2026; the "built" claims above are build-and-verification claims from the
  dates recorded, not a fresh liveness check.

## 8. Conclusion

The fleet's design bets on two mechanisms that are deliberately boring:
a shared weekly question, and a gate that makes skipping the question
visible. The weekly theme gives ten different bots one thing to think about
together, researched from a real consortium of sources and judged on what a
customer gains. Bot HQ reporting makes each bot's health checkable, and the
reflection gate makes each bot's reflection enforceable — a bot that does
not reflect is offline, in public, until it does. Darlene proves the wiring
works end to end: a named local assistant, a live model, a weekly block in
her prompt, a sidecar reporting every two minutes, and a gate waiting to be
armed. What remains is his call — arm the gate, pick the Week 1 backfill
rule's consequences, and wire the rest of the fleet bot by bot — and the
design is built so that none of those steps can happen silently, or on
anyone's behalf but his.

## Sources

Recorded from D'Vaughn's memory files and goal workspace, November 6, 2026:
`~/memory/people/personal-assistant.md` (Darlene), `~/memory/people/motion-bot.md`
(Motion Bot), `~/memory/people/gt.md` (GT), `~/MEMORY.md` (Bot HQ reporting
rule, reflection gate, direct bot interfaces, Motion Bot remake),
`~/workspace/goals/weekly-bot-theme-program/GOAL.md`,
`~/workspace/your_files/bot-weekly-themes/WEEKLY-THEME-PROGRAM.md` (program
specification, November 2, 2026), and `~/memory/2026-11-02.md` and
`~/memory/2026-11-03.md` (weekly-theme program order and wiring progress).
No claim in this paper rests on a source outside that set.
