# Henry: The Ecom Ad Factory

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026

## Abstract

Henry is a Telegram bot that makes ad creatives for D'Vaughn House's projects.
A user messages Henry, Henry walks through the job, a local model on the Mac
Studio writes the ad copy, and the finished job waits in Telegram for human
approval before anything is used. Image variants are mock renders, flagged as
mock, because no image generator runs on the Studio. Henry was built
October 20–21, 2026, as one of the four Hermes bots, and deployed on the Mac
Studio on October 26, 2026. This paper records the design as built, the
first-job failure and fix that moved it from mixtral to llama3.1, and what
remains unverified as of November 6, 2026.

## 1. The problem

Making an ad creative for a project meant doing the copy, the angles, and the
variants by hand each time. The goal for Henry was a small, local, interactive
tool: ask for an ad in Telegram, get back finished copy with variants, and
keep a human in the loop — nothing is used until the owner approves it in
Telegram.

## 2. Design

### 2.1 The Telegram bot

Henry is the Ecom Ad Factory bot on Telegram,
`@Glenride_Henry_Ecom_bot`. Sending `/start` starts a walkthrough that
collects what the ad is for and produces the creative. Finished jobs wait in
Telegram for D'Vaughn's approval. Henry is one of the four Hermes bots, and
he shows up on the Bot HQ dashboard through the Bot HQ bridge wired in at
deploy time.

### 2.2 The ad-creative pipeline

The pipeline has two parts, and they are not at the same stage of completion.

Ad copy comes from a local model on the Studio, served through Ollama. The
model generates ad angles for the job; a template-angle fallback exists so a
copy-generation failure completes the job with template angles instead of
killing it (added after the first-job failure described in Section 3).

Image variants are mock renders, not generated images. No image generator
runs on the Studio — Stable Diffusion was absent at deploy time — so the bot
falls back to Pillow mock variants. The approval message flags them as mock.
Real image generation is not built; the mock is the design as it stands, not
a placeholder that was later replaced.

### 2.3 The model change: mixtral to llama3.1

Henry was first configured to use `gdisney/mixtral-uncensored:latest`. That
model never served a successful job: its blob on the Studio was corrupt
(Ollama reported a missing tensor, `blk.0.ffn_down_exps.weight`, and returned
HTTP 500 on generation). The fix, made the same night, was to pull llama3.1
(8B), verify generation, and set it as the model. Two further defects
found during the same failure were fixed at the same time: the pipeline had
no runtime fallback for a copy failure, and the response parser rejected the
keyed-object answer shape llama3.1 returns. The corrupt 26 GB mixtral blob
was later deleted by D'Vaughn intentionally, to save hard-drive space; no
re-download was needed, because Henry already ran on llama3.1.

## 3. Deployment status

Henry was built October 20–21, 2026, with the rest of the Hermes bot team,
passing 8/8 smoke tests. Deployment waited until D'Vaughn supplied the
BotFather token, which he did on October 26, 2026.

Deployment on the Mac Studio is native, not Docker: a Homebrew Python 3.13
virtual environment with a launchd service
(`com.dvaughnhouse.ecom-ad-factory`). Docker was blocked on the Studio
because Docker Hub pulls from SSH fail on the locked macOS keychain. At
deploy time the bot was verified live — launchd running, configuration
loaded, Telegram `getMe` and `getUpdates` returning 200, scheduler and
heartbeat jobs running, and no errors in the log.

The first job, a Pearls Walk Through ad job ($2), failed at 01:22 ET on
October 26 with an internal error — the corrupt mixtral blob described
above. After the fixes in Section 2.3, the job was reset and re-ran at
01:30 ET to awaiting approval, with four real llama3.1 ad angles and mock
images only.

## 4. Status (as of November 6, 2026)

**Built:** the Telegram bot and `/start` walkthrough; the ad-copy pipeline
on a local Ollama model (llama3.1); the template-angle fallback; the
keyed-object response parser; the Telegram approval gate (finished jobs wait
for approval); the Bot HQ dashboard bridge; native Mac Studio deployment
(Homebrew Python 3.13 venv, launchd) verified live on October 26, 2026.

**Concept / design only — not built:** real image generation. Image
variants are Pillow mock renders, flagged as mock in the approval message.
No image generator runs on the Studio as far as the record shows.

**Blocked or unverified:** the outcome of the first job is unverified — it
was awaiting D'Vaughn's approval in Telegram on October 26, and no approval
or use of it is recorded. No Henry-specific live check after October 26 is
on record, and the Mac Studio was reported offline since about 01:30 EST on
November 5, 2026 (in the Project M4 record), so Henry's running state on
November 6 is unverified and is not claimed here as live. No jobs beyond the
first, and no performance or volume figures, are on record; none are stated
in this paper.

**Separate system:** Project M4, the Autonomous Local Affiliate Ad Engine
(PRD v1.0 supplied November 5, 2026), is a new build, not an update to
Henry. Henry was left untouched. M4 is an autonomous pipeline (scrape,
deconstruct, generate, assemble, distribute); Henry makes creatives when
messaged. Henry is a candidate for M4's FR-6.1 Telegram approval front-end
later, not a rebuild target now.

## 5. Conclusion

Henry is a small, working tool with an honest limit: the copy side is real
and locally run, the image side is mock, and a human approves every job
before use. Its first night in production surfaced the two failure modes
that mattered — a corrupt model blob and no fallback — and both were fixed
the same night, with the model moved to llama3.1. What the record does not
show is whether the first job was ever approved or the bot has run since
October 26; that is stated here as unverified rather than assumed.
