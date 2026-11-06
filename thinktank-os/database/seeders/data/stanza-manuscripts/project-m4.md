# Project M4: An Autonomous Local Affiliate Ad Engine

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Design manuscript — Phase 1 infrastructure built and validated locally; install blocked; Phases 2–3 not yet built

## Abstract

Project M4 is a fully local, zero-monthly-cost pipeline for producing short-form affiliate video ads, designed to run entirely on a single Apple Mac Studio (M2 Ultra, 64 GB unified memory). The system ingests proven winning ads from the Meta Ad Library and TikTok Creative Center, deconstructs them into hook, body, and call-to-action segments, rewrites the script for a target affiliate offer with a local large language model, synthesizes voiceover and a short AI-generated visual hook, assembles the result in the "Sandwich" format (AI hook + real product B-roll + visual call-to-action), randomizes the output's metadata and perceptual fingerprint, and distributes it through a self-hosted Postiz instance — with a human approval gate in Telegram before anything publishes. Phase 1 (core infrastructure: OrbStack compose, install script, database schema, and the FR-5.3 anti-fingerprinting tooling) was built and validated locally on November 5, 2026. Installation on the Mac Studio is blocked because the Studio has been offline since approximately 01:30 EST on November 5, 2026. Phases 2 (synthesis stack) and 3 (automation wiring) are design only at the time of writing. This manuscript documents the design as specified in PRD v1.0 (supplied November 5, 2026), the corrections verified during the Phase 1 build, and the validation results obtained so far — and states plainly what is built, what is design only, and what is blocked.

## 1. Problem

Commercial software stacks for AI affiliate marketing cost, per the PRD, $300–$500 per month, and carry three recurring defects: generic cloud-generated templates, credit limits, and platform shadowbans triggered by duplicate metadata across reposted creatives. Project M4 replaces the paid wrappers (named in the PRD as GetHookd, Higgsfield, Revana, and hosted Postiz) with a local, autonomous pipeline running entirely on one 64 GB Mac Studio M2 Ultra, at a target operating cost of $0.00 per month using a 100% local and open-source stack.

The design constraint that shapes the whole architecture is the M2 Ultra's single shared 64 GB unified memory pool (approximately 48–52 GB allocatable to Metal/MPS). Pipeline stages must therefore unload memory strictly sequentially — the large language model is unloaded before video synthesis begins, and the diffusion models are purged before assembly — to prevent swap thrashing or out-of-memory crashes. No stage runs concurrently with another heavy stage.

Project M4 is a new build, not an update to Henry, D'Vaughn House's existing Telegram ad-creative bot. Henry is untouched by this project; Henry is a candidate for the FR-6.1 Telegram approval front-end at a later date.

## 2. Pipeline Design

The pipeline has six stages, specified in PRD v1.0 §3–§4.

### 2.1 Offer and asset registry (FR-1)

A local PostgreSQL database holds affiliate offers (`affiliate_offers`: product name, niche keywords, target-audience pain points, commission structure, affiliate link, clean bridge-page URL) and a B-roll vault of local folder paths for authentic mid-roll proof assets — screen recordings for SaaS offers, product unboxings or demonstrations for physical direct-to-consumer products, and transparent `.png` product cutouts — stored under `assets/{offer_id}/broll/`. The schema for this and the two further tables below is given in PRD §6 and was reproduced verbatim in the Phase 1 build.

### 2.2 Ad intelligence and scraping (FR-2)

A headless Playwright script queries the Meta Ad Library and TikTok Creative Center by niche keyword, filtering strictly for video media, active status, and `days_active >= 60` — longevity being treated as evidence of profitable ad spend. Raw `.mp4` streams are downloaded via yt-dlp, and perceptual hashes (pHash) are computed to prevent duplicate ingestion. FFmpeg scene detection (`select='gt(scene,0.35)'`) locates exact frame cuts in the critical first 3.5 seconds, splitting each reference video into `hook.mp4`, `body.mp4`, and `cta.mp4`. mlx-whisper (whisper-large-v3-turbo) extracts word-level timestamps, at a design target of under 2 seconds per minute of video. Scraped ads are recorded in the `scraped_ads` table with source platform, external ad ID, days active, local path, hook type, and transcript JSON.

### 2.3 Script and angle adaptation (FR-3)

A local LLM (Ollama, Qwen-2.5-32B or Llama-3.3-70B-Q4) classifies the psychological mechanism of the reference hook — pattern interrupt, negative hook, us-vs.-them, secret reveal, and similar categories — then rewrites the script for the target affiliate offer, preserving the syllable cadence and sentence length of the viral reference while swapping the core problem and solution. Output is structured JSON containing the spoken script (punctuated, with pacing tags for text-to-speech), the ComfyUI hook prompt, and B-roll selection tags matched against the vault. The LLM is then unloaded from unified memory immediately (`keep_alive: 0`) before video synthesis begins.

### 2.4 Synthesis — the "Sandwich" (FR-4)

Voiceover is generated by text-to-speech and normalized to −14 LUFS, with dead air over 250 ms stripped via FFmpeg `silenceremove`. The 0–3 second AI visual hook is rendered by headless ComfyUI (`--force-fp16` on Apple Metal) in one of two modes: Mode A, product/character swap — Wan 2.2 14B (Q8_0 GGUF) with ControlNet depth/pose and IPAdapter, using the first 3 seconds of the scraped reference ad as motion driver and the affiliate product `.png` as reference; or Mode B, talking-avatar hook — a base character generated with Flux.1-Dev (Q8 GGUF), animated with LivePortrait and LatentSync driven by the first 3 seconds of the synthesized audio. On completion, ComfyUI models are purged via `POST /free` (`{"unload_models": true, "free_memory": true}`).

One correction to the PRD, verified during the Phase 1 build: the PRD names F5-TTS as the voice engine, but the F5-TTS pretrained weights are licensed CC-BY-NC-4.0 (non-commercial). The Phase 2 text-to-speech default is therefore Kokoro-82M (Apache 2.0). F5-TTS-MLX itself is real and installable (`pip install f5-tts-mlx`); only its weights carry the non-commercial restriction.

### 2.5 Assembly and anti-fingerprinting (FR-5)

The assembler stitches the 0–3 s AI hook, 3–22 s real product or screen B-roll with dynamic pan/zoom, and a 22–25 s visual CTA, synced to the master text-to-speech audio track, with word-by-word animated captions (Hormozi/TikTok style) rendered via Remotion or FFmpeg libass from the word-level timestamps. The final render uses the M2 Ultra hardware encoder (`-c:v hevc_videotoolbox -b:v 15M`).

FR-5.3, algorithmic anti-fingerprinting, is the stage with the most validation so far (see §3). Every variation passes through an FFmpeg randomization filter: imperceptible pitch shift (±1.5%), subtle speed variance (0.98x–1.02x), random 1–2% crop/scale jitter and a subtle color EQ shift (saturation 1.02, brightness 0.01), stripping of all AI/FFmpeg metadata (`-map_metadata -1`), and injection of randomized Apple iPhone EXIF/QuickTime atoms (`com.apple.quicktime.make=Apple`, `com.apple.quicktime.model=iPhone 16 Pro`).

### 2.6 Distribution and the human gate (FR-6)

Before publishing, n8n sends the rendered `.mp4`, caption, and target account to a private Telegram bot with inline buttons: Approve & Schedule, Re-roll Hook, Discard. Nothing publishes without a human tap. Approved videos are pushed to the local Postiz MCP server (`/mcp`), scheduling staggered uploads across TikTok, Instagram Reels, and YouTube Shorts during peak engagement windows. Account warmup guardrails limit posting to a maximum of 1 post per day for days 1–7, rising to a maximum of 3 posts per day after day 14, to prevent automated shadowbans. Generated creatives are tracked in the `generated_creatives` table with approval status (`PENDING`, `APPROVED`, `REJECTED`, `PUBLISHED`), the Postiz job ID, and the publish timestamp.

A second correction to the PRD, verified during the Phase 1 build: the PRD's Phase 1 step deploys "n8n, Postiz (with MCP enabled), PostgreSQL, and Redis" but omits Temporal. Postiz's canonical compose (gitroomhq/postiz-app, `main`) requires Temporal (`TEMPORAL_ADDRESS=temporal:7233`). The M4 compose therefore includes the full Temporal stack plus the dynamic configuration the install script fetches from the canonical repository. Postiz keeps its own Postgres/Redis; M4's affiliate tables live in a separate `m4-postgres` database. Postiz's MCP interface was verified as real and built into the backend (`/mcp` with a Bearer API key, `/mcp/:apiKey`, `/mcp-oauth`; 13 tools, per docs.postiz.com/mcp/introduction). Postiz runs on port 4007:5000 in the M4 compose.

## 3. Phase 1 Validation

Phase 1 was built and validated locally on November 5, 2026 — locally, on the build machine, not on the Mac Studio. The package comprises a `docker-compose.yml` with 10 services (n8n, Postiz, the Temporal stack, M4 Postgres/Redis), with per-service resource limits summing to 7.5 CPU and 5888 MB after a trim; `schema.sql` reproducing the PRD §6 tables verbatim; a `.env.example`; an idempotent install script (`install-m4-phase1.sh`, `bash -n` clean, covering OrbStack plus native Ollama `qwen2.5:32b`, FFmpeg, yt-dlp, and mlx-whisper); and a README runbook. The YAML was parsed and structure-checked.

FR-5.3 anti-fingerprinting was built and tested locally (`antifingerprint.sh` and `inject_iphone_atoms.py`) on a generated 5-second clip. Results: the same seed produced an identical SHA-256 hash; a different seed produced a different hash; ffprobe reported `make=Apple` and `model=iPhone 16 Pro`; the keyed `com.apple.quicktime.*` atoms were present in the file bytes; a full decode was clean; moov-at-end layout was correct; and re-injection was idempotent.

Three findings from that testing were baked into the tooling. First, `ffmpeg -metadata` cannot write `com.apple.quicktime.*` atoms — verified, the muxer drops them — so the injector writes them at the MP4 box level with `stco`/`co64` offset fixes, writing both the keyed form and the ©mak/©mod form because ffprobe 8 surfaces only the 4CC form. Second, `mawk`'s `srand()` is not deterministic across processes, so seeding uses bash `RANDOM` integer math. Third, piping ffmpeg into `grep -q` under `pipefail` breaks on SIGPIPE (exit 141), so encoder detection captures output once and matches it in bash.

## 4. Status (as of November 6, 2026)

**Built and validated (locally, November 5, 2026):** the Phase 1 package — OrbStack compose (10 services: n8n, Postiz + Temporal, M4 Postgres/Redis), the verbatim PRD §6 database schema, `.env.example`, the idempotent install script, and the README runbook; and the FR-5.3 anti-fingerprinting tooling, tested on a generated 5-second clip as described in §3. Two PRD corrections were verified during this build: Postiz requires Temporal (omitted from the PRD), and the Phase 2 text-to-speech default is Kokoro-82M (Apache 2.0) because F5-TTS weights are CC-BY-NC.

**Concept and design only:** the full end-to-end pipeline (scraping, deconstruction, LLM script rewriting, voice synthesis, ComfyUI hook rendering, Sandwich assembly, and Postiz distribution) as specified in PRD v1.0; Phase 2 (ComfyUI + models + Kokoro TTS) and Phase 3 (n8n master workflow, Telegram approval webhook, Postiz MCP scheduling node). None of these stages has run. The throughput target in the PRD — a full Sandwich variation in under 6 minutes end-to-end, allowing 80–100 unique variations per 8-hour overnight batch — is a design target, not a measured result. No ad has been scraped, rewritten, rendered, approved, or published by this system.

**Blocked:** installation on the Mac Studio. The Studio has been offline since approximately 01:30 EST on November 5, 2026, and was still offline at the 20:48 ET check that day; the cause is unestablished. Nothing has been installed on the Studio yet. The next step when it returns is to copy the Phase 1 files to the Studio and run `install-m4-phase1.sh`, then Phase 2 (ComfyUI + models + Kokoro TTS) on D'Vaughn House's go. A related standing item is the LM Studio rebind after Studio reboots — a fix plan for after the machine returns, not a resolution.

**Untouched:** Henry, the existing Telegram ad-creative bot, is a separate system and has not been modified by this project.

## 5. Conclusion

Project M4 is a deliberately boring answer to an expensive problem: instead of renting a cloud stack that generates generic creatives and gets them shadowbanned, run the whole pipeline on hardware already owned, keep every stage local, unload memory between heavy stages, randomize each output's fingerprint, and keep a human in the approval loop before anything reaches a platform. The design is fully specified in PRD v1.0, its two known errors have been corrected and verified, and its riskiest single component — the anti-fingerprinting that the whole distribution strategy depends on — has been built and tested against a real clip with deterministic, repeatable results. What remains is execution gated on one fact outside the project's control: the Mac Studio coming back online. Until it does, M4 is a validated Phase 1 package and a design document, not a running system — and this manuscript says so plainly.

## Sources

- PRD v1.0, "Autonomous Local Affiliate Ad Engine (Project M4)," supplied by D'Vaughn House, November 5, 2026 (saved verbatim in the project goal workspace; cited sections §1–§7).
- Phase 1 build and validation record, November 5, 2026 (goal workspace `project-m4-autonomous-local-affiliate-ad-engine`, files `phase-1/` and `phase-3/`; daily log `memory/2026-11-05.md`).
- Verified corrections: Postiz requires Temporal (canonical compose, gitroomhq/postiz-app); F5-TTS weights CC-BY-NC-4.0, Kokoro-82M Apache 2.0; Postiz MCP interface (docs.postiz.com/mcp/introduction).
