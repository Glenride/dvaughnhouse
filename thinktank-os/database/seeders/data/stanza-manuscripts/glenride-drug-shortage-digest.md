# The Glenride Drug-Shortage Digest: A Weekly Record of Public U.S. Drug Shortages

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Design manuscript — describes a running weekly digest and its harness, Lucas. Figures are cited to the retrieval date of the run that produced them.

## Abstract

Drug shortages are a recurring failure of a critical system: a medicine a clinic, hospital, or patient depends on is suddenly unavailable, and the reason is often buried in a listing that changes without notice. The Glenride Drug-Shortage Digest is a weekly Monday record built from public U.S. listings — principally the American Society of Health-System Pharmacists (ASHP) current-shortages list and the U.S. Food and Drug Administration (FDA) drug-shortages listing — that reports what changed since the last retrieval, what resolved, and where shortages concentrate, each figure carrying its source and retrieval date. The digest is produced by Lucas, a harness whose standing rule is to listen openly and objectively and to report what the data says without spin, guessing, or hype. The full Monday digest is Glenride's paid product; a public summary serves as a free funnel through The Dispatch and never contains the full lists. This manuscript describes the problem, the pipeline, the baseline finding from the first run on October 2, 2026, the product model, and — plainly — what is built, what is design only, and what is blocked as of November 6, 2026. Figures are for research citation only. No clinical guidance is ever offered.

## 1. The problem

A drug shortage is a supply failure with a human cost, and it is usually discovered late: by the time a shortage reaches a clinician, the listing that announced it may already have changed, and the record of when it appeared, what it affected, and when it resolved is scattered across sources that do not agree with each other. ASHP maintains a live list of current shortage bulletins; the FDA maintains its own shortages database; trade press and secondary reporting add further numbers that are often undated snapshots using different methods. A single headline number therefore proves very little. What a researcher, an operator, or a decision-maker needs is a dated, checkable record: this list, on this date, showed this many bulletins; since the last check, these items appeared and these resolved; here is the source for each claim.

That need is the first of Glenride's research questions in its own terms: find where critical systems break before harm, publish a checkable record, carry strong findings to rule-writers, and turn answers into tools. The digest is the instrument paired to that question for medicines. Its overgoal for 2031 is that Glenride's record becomes a first check on shortages, supply failures, and disputed claims; its annual goal for fiscal year 2027 is 52 weekly digests — one every Monday, 52 of 52.

## 2. Design principles

Four rules govern the digest, and they have held since the first run:

1. **Public sources only.** Every figure comes from a public listing — ASHP, the FDA, and, for context, dated trade-press reporting. Nothing in the digest depends on a private feed or an undisclosed source.
2. **Separate what measures different things.** A live bulletin count, a quarterly national statistic, and a database tabulation are different measurements. They are reported side by side and never merged into one number.
3. **Date everything, and say what could not be determined.** Each figure carries its retrieval date. When a source is unreachable, the digest says so instead of substituting a secondary figure. When a week-over-week change cannot be determined — as on the first run, which had no prior retrieval to compare against — the digest says that too.
4. **No clinical guidance, no legal advice.** The digest is a research record. It never tells a pharmacist, clinic, or patient what to do, clinically or legally.

Lucas, the harness behind the digest, is held to the same standard in plainer language: it listens openly and visibly and objectively — its listening shows in every summary, in what changed and why it matters — and it reports what the data says without spin, guessing, or hype. Where a claim cannot be supported by a cited source, it is not made.

## 3. The pipeline: Lucas

Lucas was named the digest harness on October 24, 2026, replacing Lisa as the digest harness the same day Lisa was named; Lisa remains a separate listener — the standalone conversational app — and the two must not be merged in copy or product. The weekly run is scheduled for Monday mornings at 8:36 AM ET.

Each run follows the same shape:

1. **Retrieve.** The run reads the ASHP current-shortages list in full and checks the FDA drug-shortages listing. The FDA listing's text fetch has repeatedly returned a 404 that is specific to the fetch method, not to the page itself; the FDA figures in the digest are therefore taken from a live-browser check of the same page, using the Current/Resolved Shortages tab's client-side filter, and the method is stated alongside the figure so the reading can be reproduced and its limits seen.
2. **Compare against state.** The run compares the live list against the previous retrieval's stored state — bulletin identifiers and counts — and reports only what changed: new bulletins by created date, resolutions by name where they can be individually identified, and the net movement of the total.
3. **Add context, kept separate from the counts.** Two kinds of context ride with the numbers but never alter them. The first is the concentration finding: how much of the year's new shortage activity involves a single manufacturer, drawn from ASHP quarterly data as reported in dated trade press. The second is the law behind the numbers (Section 4).
4. **Deliver in two layers.** Every run is delivered as a full layer for manuscript and research use and a public-summary draft for The Dispatch. The two layers are written from the same run; the public summary is a draft, never auto-posted, and never contains the full lists.
5. **Write it up through the Publication Desk.** Editions intended for publication go through Glenride's Publication Desk — Writer drafts, Checker One verifies, Writer revises, then Checker Two, a separate context with fresh eyes, checks again — and nothing publishes without D'Vaughn House's sign-off.

## 4. The law behind the numbers: the gov-context layer

On October 25, 2026, a second layer was built and verified live: Lucas's weekly digest now adds the law behind why a shortage gets reported, drawn from Firecrawl's Government & Legal Index, a free-to-search index of U.S. law — statutes, regulations, agency guidance, and bills. The integration was tested against the live endpoint first, fixed after its first run failed on a client-side read error, and re-run until all four standing queries passed.

The standing queries, kept stable week to week, are:

- **The notification statute.** 21 U.S.C. § 356c: manufacturers must notify the FDA six months ahead of a discontinuance or interruption, or as soon as practicable; § 356c-1 requires an annual report to Congress. The digest also cites the FDA's § 506C notification guidance.
- **Non-compliance.** What happens when a firm fails to notify: non-compliance letters are public, and the digest states plainly that the FDA cannot force a company to manufacture.
- **Pending bills.** Bills in Congress on shortages — pending, not enacted. The standing example is S. 2665, the Drug Shortage Prevention Act of 2025, introduced August 1, 2025, in the 119th Congress and referred to committee. The script's rule is explicit: a bill is not a law, and an introduced bill is never presented as enacted, in force, or as something a reader must comply with.

The gov-context layer is additive and never blocks the digest: if the gov search fails, the digest still ships on ASHP and FDA alone, and the failure is logged in the run log rather than hidden. Per-drug context is added only when the gov search actually returns it for that drug; if it returns nothing, the digest says nothing rather than inventing context. The script and its first verified run (October 25, 2026) live in the digest goal workspace under `files/lucas-gov-context/`.

## 5. The baseline finding: October 2, 2026

The first baseline digest was delivered on October 2, 2026. Its headline finding, from ASHP's live current-shortages page, was **190 active shortage bulletins**. Two companion figures were reported alongside it, kept strictly separate because they measure different things: an ASHP second-quarter 2026 statistic of **227 active U.S. shortages**, cited from secondary reporting, and the aggregate finding that **nearly half of new 2026 shortages involved a single manufacturer**. The FDA's full listing was unreachable on that first run, and the digest stated that explicitly; first-run week-over-week deltas were not determinable, and the digest said that too. The edition was framed for manuscript research, not as clinical guidance.

The runs since the baseline, each delivered in chat with a run log on file, are:

| Retrieval date | ASHP live bulletins | FDA (live-browser tab reading) | Notable change |
|---|---|---|---|
| Oct 2, 2026 (baseline) | 190 | Listing unreachable | Baseline; no prior retrieval to compare |
| Oct 5, 2026 | 190 (unchanged) | 69 currently in shortage of 74 tab listings | Semaglutide reported resolved in secondary reporting; not yet on the resolved list |
| Oct 19, 2026 | 192 (up from 193 on Oct 12) | 69 of 74 (third identical reading) | Adalimumab-adbm created Oct 15, verified new |
| Oct 26, 2026 | 192 (net unchanged vs Oct 19) | 69 of 74 (fourth identical reading) | Vinblastine Sulfate Injection created Oct 25, verified new; ASHP Q3 2026 figure of 225 active reported, kept separate from the bulletin count |
| Nov 2, 2026 | 190 (down 2 net from 192) | 69 of 74 (fifth identical reading) | Zero new bulletins since Oct 26; two resolutions identified individually for the first time — Imatinib Mesylate Tablets (resolved Oct 29) and Mercaptopurine Tablets (resolved Oct 27), corroborated by the ASHP resolved-bulletins total rising from 965 to 967 |

Two patterns in that short series are worth stating because they are the reason the digest exists in weekly form. First, the bulletin count moves slowly — 190, 190, 192, 192, 190 — while the composition underneath it turns over: items appear and resolve without the headline number betraying much. Second, the FDA tabulation has read identically five consecutive times (69 of 74), which is a finding about the stability of that source's display, not evidence that nothing changed in the underlying database; the digest reports the reading and its method rather than treating repetition as confirmation.

The November 2, 2026 edition was approved by D'Vaughn House ("Otherwise approved"), covering both the full layer and the public-summary draft. That approval is not attestation and not publication: the public summary still goes through the Dispatch gate and has not been posted anywhere. One earlier edition did reach publication: the digest for the week of October 12–19, 2026 was published on October 26, 2026 at blog.dvaughnhouse.com and live-verified (HTTP 200, title, dek, and feature image present). The November 2 slot edition was slid, not published, because the November 2 run executed before the slot and voided the edition's grounding statement; it remains ready but must be re-grounded to the November 2 run and re-cleared before any future slot.

## 6. Product model

The model was decided on October 23, 2026, as part of Glenride's fiscal year 2027 plan, and it has not changed:

- **The full Monday digest is the paid product ($25/month).** It is the complete weekly record — the full lists, the deltas, the concentration flags, the gov context — for subscribers and for Glenride manuscript work.
- **The public summary is a free funnel.** A labeled Dispatch draft, never auto-posted, never containing the full lists. It exists so a stranger can see the record's quality before subscribing.
- **The annual goal is 52 of 52 digests** in fiscal year 2027, alongside the plan's other goals (four attested flagships, 40+40 subscribers, six Salon seats plus one $25K retainer, Reynard's first 100 orders, revenue to the $75K founder stipend). The digest is one of five research questions in that plan, each paired to a live instrument and a paid product.

The digest's primary buyers, as locked for the Glenride homepage on November 4, 2026, are operators and decision-makers — the people who have to act when a system breaks, not only the people who study it.

## 7. Status (as of November 6, 2026)

**Built and running.**

- The weekly Monday digest runs on its schedule (Mondays, 8:36 AM ET) and has run five times: October 2, October 5, October 19, October 26, and November 2, 2026. Each run was delivered with its figures, sources, and retrieval date, and a run log is on file for October 5, October 19, and November 2. (Figures for October 12 and October 26 are recorded in the daily record rather than in standalone run-log files.)
- The Lucas harness is named, its listening standard is set, and its gov-context layer is built and verified live (October 25, 2026, all four standing queries passing). The gov-context script, its README, and its first verified output are on disk in the digest goal workspace.
- The two-layer delivery (full layer plus public-summary draft) is in use, and the November 2 edition was approved in both layers.
- The Publication Desk pipeline that writes up digest editions for publication is operating, and one digest edition (week of October 12–19, 2026) has been published and live-verified.
- The next scheduled run is Monday, November 9, 2026.

**Concept and design only — not built.**

- Automated attestation of digests. A product requirements document dated October 29, 2026 proposes that a Monday digest release trigger an automatic attestation row (title exactly as published, kind `report`, claim templated from the digest's figures, canonical file plus SHA-256 hash), checked against six deterministic gates and then signed — but the document is a draft for approval, not a built system. No digest has ever been officially attested: as of October 29 the live registry held three attestations, all pipeline manuscripts from October 24, and zero digests, and that was confirmed again on November 2. Five decisions in that draft remain open and awaiting D'Vaughn House's picks: the backfill range, the claim-template wording, the job host, what proof the first automated issuance should carry, and which artifact is attested (the draft recommends the full paid digest). The one-click hand-attestation path in the same draft exists on paper only, as a fallback to the automatic path.
- The public reader and triage interface sketched for the Meta hackathon build. Triage work began in the first build block on October 26, 2026 and was about halfway through at the midday check; the build was never completed (see below).

**Blocked, moot, or held.**

- The Meta hackathon build window (October 26–November 4, 2026) is moot. The application was submitted and rejected on capacity — the review capped at 20,000 participants on a rolling basis, and the rejection notice arrived the morning of October 26, 2026. That is a capacity rejection, not a late entry. D'Vaughn House's direction the same evening stands: Lucas still gets built, just not on the hackathon's clock.
- The November 2 slot edition is held for re-grounding (Section 5): ready, but it must be re-grounded to the November 2 run and re-cleared before any future slot, and it must not be published as-is.
- A store-listing discrepancy flagged on November 2, 2026 remains open: a shop listing for the digest describes it as $25 per month while the product is set up as a one-time $25 item. The decided product model in Section 6 is $25/month; the listing needs a billing-or-copy fix before it sells. This manuscript states the decided model, not the listing's wording.
- A gov-context digest run has been built and verified, but D'Vaughn House has not yet seen a delivered digest edition carrying the new gov context. That first sighting is still an open thread.

## 8. Conclusion

The digest is a small instrument aimed at a large failure mode: critical systems break quietly, and by the time the break is obvious the record of how it happened is gone. Five weekly runs have established that the record can be kept — dated, sourced, comparable week to week, and honest about what it could not determine. The baseline is 190 ASHP bulletins on October 2, 2026; the latest reading is 190 again on November 2, with two named resolutions and no new bulletins in between, and a law layer now attached that explains why each shortage is reported at all.

What remains is the part the digest was designed to earn: a full year of Mondays, 52 of 52, each one checkable by anyone who reads it, and an attestation layer that lets a reader verify a digest edition without taking Glenride's word for it. The weekly record is running. The proof layer is designed and awaiting decisions. The work from here is cadence, not invention — keep the Monday run, keep the figures separate and dated, and do not publish what has not been cleared.

## Sources and verification notes

- Glenride mission, fiscal year 2027 plan (52/52 digests; full digest $25/month paid, public summary free Dispatch funnel draft, never auto-posted, never full lists), and primary buyer (operators and decision-makers): author's record, October 23 and November 4, 2026.
- Baseline and weekly figures: run logs for October 5, October 19, and November 2, 2026 (digest goal workspace, `hidden_files/`), and the daily record for October 2, October 12, and October 26, 2026. ASHP bulletin counts are live-list readings on the stated retrieval dates; FDA figures are live-browser readings of the Current/Resolved Shortages tab's client-side filter, because the text fetch of the same page returns a 404 specific to the fetch method.
- Lucas naming (October 24, 2026), listening standard, and separation from Lisa: author's record (`memory/people/lucas.md`).
- Gov-context integration and verified run (October 25, 2026): `files/lucas-gov-context/README.md`, `gov_context.py`, and `gov-context-2026-10-25.json/.md`.
- Publication Desk process and the October 26, 2026 published edition: Publication Desk goal record and daily record for October 26, 2026.
- Meta hackathon submission, capacity rejection, and moot build window: author's record, October 26, 2026 (`memory/people/lucas.md`).
- Attestation status (zero digests attested; draft requirements document of October 29, 2026; five open decisions; November 2 confirmation): attestation requirements document (`thinktank-os-automated-digest-attestation/files/thinktank-os-digest-attestation-prd-2026-10-29.md`) and daily record for November 2, 2026.
- November 2, 2026 approval, slot slide, and store-listing discrepancy: daily record for November 2, 2026.

*Figures are for research citation only. No clinical guidance is offered in this manuscript or in the digest it describes.*
