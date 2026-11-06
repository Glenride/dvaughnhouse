# Motion Bot: A Story-First Video Creator

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026

## Abstract

Motion Bot is a video bot that renders motion video on the iMac, using Remotion plus FFmpeg. It began on October 24, 2026 as a tool for making videos for D'Vaughn House's projects. On November 3, 2026 it was remade — at his direction — from a hooks-first renderer into a story-first content creator. This paper describes that remake: the problem it answers, the story-first pipeline as built in its Phase 1 form, the weekly ponder loop that gives the bot a theme to think with, the episodes released under the new design, and, plainly, what is built, what is still design only, and what is blocked. Stories are the basis of everything Motion Bot makes; a hook is one format among others, not the work itself.

## 1. The problem

A short video can be technically clean and still say nothing. Motion Bot's early output proved the point: clips rendered, captions landed, and motion was applied, but the pieces did not hold together as stories. On October 29, 2026, at D'Vaughn's direction — "you're lacking in story" — a story gate was added: a brief must carry a story, in the form of a `Story:` block with two or more beats, or two or more narrative sentences. A hook plus labels alone no longer renders.

The November 3 remake went further, because the correction behind it went further. D'Vaughn corrected that he never said hooks only; he needs a content creator, and stories are the basis of everything. A hooks-only tool can only vary its opening line. A story-first creator has to carry a narrative through beats, scenes, voice, and motion — and to keep getting less ignorant about the subjects it covers, rather than rendering each brief as if it had never seen one before. That is the design problem this paper records: how to make a small rendering bot into a creator that starts from story, checks itself against that story, and learns from a weekly theme.

## 2. Design: the story-first pipeline

### 2.1 How a brief becomes a video

Motion Bot works harness-first. Since October 25, 2026 the non-Signalwood path has been Director, Builder, and Critic: the Director storyboards, the Builder makes the motion, and the Critic checks the result against seven checks. D'Vaughn corrected the name on October 25, 2026: "Harness not furnace." A brief that is missing what it needs is blocked, not guessed at. Clips no longer show "Motion Bot" on screen; only an explicit `Project:` label names a project. The bar he set is that clips must be unique and artistic, not flat.

The story-first pipeline, Phase 1 of which is live, works as follows. It reads the whole brief, including its completionSteps beat sheet, turns the beats into scenes, and the Critic checks that the beats appear on screen. The pipeline does not yet invent beats from plain prose — a limit recorded on November 3, 2026, and carried in the Status section below.

### 2.2 Voice, captions, and stock

A narrated mode (v2) was proven on October 26, 2026: Edge-TTS voiceover, sentence-level captions, and Pixabay stock footage, at 1280x720 and 30 frames per second, with a 10-second proof at -24.0 dB and a Critic PASS. The Pixabay key lives in authd on the virtual machine only. Pexels is not used; D'Vaughn's standing position, recorded November 3, 2026, is that Pexels is not giving out new keys, so it was dropped entirely and no new keys are pursued.

A creative upgrade (v2.1), proven on October 28, 2026 at his tap "Full creative upgrade," added an LLM Director for storyboarding, with a hard rule: the voiceover words come only from the hook. Its proof was an 11-second clip at 1280x720 and -24.5 dB, Critic PASS. On a genuine creative fork only, the bot asks one question per brief.

### 2.3 Motion craft

Version 2.2, built and proven on October 29, 2026, added vertical video — 720x1280 with short-form safe areas, picked automatically for vertical, reel, Short, or 9:16 briefs (proof: 12 seconds, 30 frames per second) — and a skill router built from a motion-skills repository he linked, an index of 9 packs and 30 skills. The router matches each brief to a craft pack; the skills change how a clip moves, never what it says. A verify loop probes resolution, frame rate, and duration, and a mismatch blocks the brief. The limits are craft guidance only: no After Effects, no true 3D, and no CSV-to-chart yet.

The same day added a chart rung (proven with ASHP counts), a transparent lower-third path (ProRes 4444, alpha verified), and a purple-free synthwave preset (navy sky, cyan grid, orange sun). Also on October 29, after his feedback that every video used the same ingredients, four motion languages were added and now rotate by brief — orbit, kinetic, sweep, and rise — with a `Variant:` line forcing one.

On November 3, 2026, at his "Wire them" tap, two tools were wired in, both opt-in only: Auto-Editor 29.3.1 for silence-cutting, via `Silence-cut: on`, and D3 7.9.0 for charts, via `Chart: d3`, the same version on the virtual machine and the iMac. The proofs were an 11-second clip cut to 7.3 seconds with audio intact, and a 12-second D3 chart render at 1280x720 and 30 frames per second using the same ASHP figures. The limits are that silence-cutting needs audio, and the D3 chart takes bars from brief rows, not from CSV files.

### 2.4 The weekly ponder

The remake gives Motion Bot a theme to ponder. A weekly ponder loop runs on Fridays; the first note is due Friday, November 6, 2026. The ponder is the mechanism by which the bot becomes more identifiable with itself as it learns and creates — reflecting on a week's theme in its own formal and informal compositions — rather than rendering each brief in isolation. The reflection gate built, deployed, and verified on November 4, 2026 ties this loop to the bot's standing: Motion Bot is in the launch gated set (Darlene, Motion Bot, and GT), gated through its Friday ponder, on Monday-to-Sunday weeks. A gated bot with an incomplete prior week shows OFFLINE until its reflection is recorded, with late completion restoring it mid-week. The gate is unarmed at launch: arming needs his pick of a Week 1 theme. Compositions drafted by Janine do not count as the bot's reflections.

### 2.5 Direct interface

On November 3, 2026, D'Vaughn said he wants to communicate with Motion Bot directly on Bot HQ rather than filter through Janine, because her assumptions and preferences are a hindrance. The design rule for such an interface is verbatim passthrough: his words land in the bot's intake and memory exactly as written, with the pipe kept working and nothing paraphrased, reframed, gated, or "improved" in transit. This interface is design, not yet built; see the Status section.

## 3. Released episodes

Episodes 2 and 3 were released on November 3, 2026, at D'Vaughn's "start the tasks over" direction, after the Anti-Slop beat sheets were restored that day. Episode 1 stayed open as the story-first proof. Episodes 2 and 3 were re-rendered the same day at 14:22 and 14:23 ET, with story coverage passing: Episode 2, 4 of 4 beats; Episode 3, 3 of 3 beats. A palette check (`palette_present`) failed on those renders and was flagged as cosmetic only.

Earlier work that the remake builds on includes "The People" slideshow (54 seconds, October 29, 2026) and a second 60-second slideshow cycling all four motion languages, all clips critic-PASS.

No episode subjects, titles, view counts, or audience figures are stated here, because none are recorded in the sources this paper is grounded in.

## 4. What Motion Bot is not: vidbot

vidbot is a separate bot, not a modification of Motion Bot, and the two must not be conflated. On November 3, 2026, D'Vaughn asked how to make Motion Bot work to generate a video he can use first shot, then directed a new bot instead of further modification of Motion Bot, and named it vidbot. vidbot is a separate scaffold for narrated stock-footage video, live on the iMac. It starts from copies of Motion Bot's brain as a starting point — beat-sheet intake, story gate, critic, memory — but it is its own bot with its own engine. Motion Bot stays untouched by vidbot's pilots, including the SnapCN text-reveal pilot ordered November 4, 2026, which went into vidbot only.

## 5. Status (as of November 6, 2026)

**Built and proven.**

- Story-first pipeline, Phase 1: live. It reads the whole brief including completionSteps beat sheets, turns beats into scenes, and the Critic checks beats appear on screen.
- Harness: Director, Builder, and Critic with seven checks; story gate requiring two or more beats or two or more narrative sentences.
- Narrated mode (v2) and creative upgrade (v2.1): proven October 26 and 28, 2026, with Critic PASS proofs on record.
- Vertical video, skill router, chart rung, lower-third path, synthwave preset, and four motion languages (v2.2): built and proven October 29, 2026.
- Tool wiring: Auto-Editor 29.3.1 and D3 7.9.0, opt-in only, proven November 3, 2026.
- Episodes 2 and 3: released and re-rendered November 3, 2026, story coverage passing (4 of 4 and 3 of 3).
- Reflection gate: built, deployed, and verified November 4, 2026; Motion Bot in the launch gated set via its Friday ponder.
- Rendering: Remotion plus FFmpeg on the iMac.

**Concept and design only — not built.**

- Wiring real memory into the render path, so the bot carries what it has learned into the next render rather than starting ignorant each time.
- A direct Bot HQ interface with verbatim passthrough, so D'Vaughn communicates with Motion Bot directly.
- Visuals per beat — a distinct visual for each story beat, rather than stock or motion standing in for the beat.
- The full kinetic engine for the 60-frames-per-second Anti-Slop specification.
- Generated stills and b-roll: image generation (Grok or Gemini, his preference) is still unwired.

**Blocked or not yet armed.**

- The weekly ponder's first note is due Friday, November 6, 2026 — the day of this paper — so no ponder note exists yet to evaluate.
- The reflection gate is unarmed at launch; arming needs his Week 1 theme pick.
- Render limits recorded November 3, 2026, still open: output was 720x1280 at 30 frames per second despite a 1080x1920 60-frames-per-second header; accent colours did not land, flagged as cosmetic only; and the pipeline does not yet invent beats from plain prose.

## 6. Conclusion

Motion Bot is now, by design, a story-first content creator rather than a hooks-only renderer. The Phase 1 pipeline proves the core loop works: beats in, scenes out, and a Critic that checks the beats actually appear on screen — with Episodes 2 and 3 released on that proof. What would make it the creator D'Vaughn ordered is still ahead of it: memory wired into the render path, visuals per beat, the full kinetic engine for the 60-frames-per-second Anti-Slop specification, and a direct interface that carries his words verbatim. The weekly ponder, beginning November 6, 2026, is the first step toward the less ignorant half of that order — a bot that thinks about a theme each week and brings what it learned back into the work. Until the items in the Status section move from design to built, the honest description of Motion Bot is: story-first pipeline live, episodes released, memory and kinetic engine still owed.
