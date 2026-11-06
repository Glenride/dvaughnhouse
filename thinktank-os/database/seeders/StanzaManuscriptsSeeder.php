<?php

namespace Database\Seeders;

use App\Models\Manuscript;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StanzaManuscriptsSeeder extends Seeder
{
    /**
     * Publish D'Vaughn's 12 STANZA manuscripts (Nov 6, 2026) to the
     * Vanguard Library (/library) and stage them for SpinWave.
     *
     * Source: stanza-crosschain docs/manuscripts, commit 076c172 —
     * 3 catalog works (QF replication, STANZA license-design, harness
     * replication) + 9 systems papers. Triple-checked Nov 6
     * (docs/manuscripts/TRIPLE_CHECK.md): facts vs source,
     * authorship/status honesty, cross-paper consistency. Status
     * labels live in the file bodies and are preserved verbatim —
     * Meg is CONCEPT ONLY, jewel OS is DESIGN ONLY.
     *
     * Each manuscript is a published Manuscript row whose
     * synthesized_brief_path points at the full .md text, copied here
     * from database/seeders/data/stanza-manuscripts/ into storage on
     * first run. The SpinWave record itself is created separately by
     * `php artisan spinwave:backfill-records`, which hashes that file.
     *
     * Deliberately NOT wired into DatabaseSeeder: the test suite seeds
     * the 3 preexisting briefs and counts on them. Run standalone:
     *   php artisan db:seed --class=StanzaManuscriptsSeeder
     *   php artisan spinwave:backfill-records
     *
     * Idempotent: firstOrCreate by title; brief files are written
     * only when missing, never overwritten.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'host@centersun21.com'],
            [
                'name' => "D'Vaughn House",
                'password' => Hash::make(Str::random(32)),
                'role' => 'orchestrator',
            ]
        );

        foreach ($this->manuscripts() as $m) {
            // raw_file_path is NOT NULL in the schema, so the full text is
            // stored in both places (raw = submitted draft, synthesized =
            // the brief the Library reads). Same bytes either way.
            $rawPath = 'manuscripts/raw/' . $m['id'] . '.md';
            $briefPath = 'manuscripts/synthesized/' . $m['id'] . '.md';
            $source = __DIR__ . '/data/stanza-manuscripts/' . $m['slug'] . '.md';

            if (is_file($source)) {
                if (! Storage::disk('local')->exists($rawPath)) {
                    Storage::disk('local')->put($rawPath, file_get_contents($source));
                }
                if (! Storage::disk('local')->exists($briefPath)) {
                    Storage::disk('local')->put($briefPath, file_get_contents($source));
                }
            }

            Manuscript::firstOrCreate(
                ['title' => $m['title']],
                [
                    'id' => $m['id'],
                    'user_id' => $user->id,
                    'abstract' => $m['abstract'],
                    'raw_file_path' => $rawPath,
                    'synthesized_brief_path' => $briefPath,
                    'status' => 'published',
                    'compliance_ethics_verified' => true,
                    'compliance_transparency_verified' => true,
                    'compliance_citations_verified' => true,
                    'word_count' => $m['word_count'],
                    'grant_amount' => 0.00,
                    'published_at' => $m['published_at'],
                ]
            );
        }
    }

    /**
     * The 12 manuscripts, catalog works first.
     *
     * @return array<int, array{slug: string, id: string, title: string, abstract: string, word_count: int, published_at: string}>
     */
    private function manuscripts(): array
    {
        return [
            [
                'slug' => 'qf-replication',
                'id' => '728fc5e0-175a-57a0-95c1-95d43414643e',
                'title' => 'A Replication of "A Flexible Design for Funding Public Goods"',
                'abstract' => 'We reconstruct, in code, every mechanism in Buterin, Hitzig, and Weyl (2020) — private contributions, one-person-one-vote, quadratic finance (QF), deficit-aware QF, capital-constrained QF (CQF), signed (±) QF, the β-norm family, and the dynamic assurance contract — and verify Propositions 1–5 and the worked collusion examples of Section 5.2 numerically. The paper states its results for arbitrary smooth, increasing, strictly concave valuations; we instantiate the parametric testbed V_i(F) = 2·θ_i·√F, for which the social optimum is F* = (Σθ_i)² and V′(F*) = 1. All nine verification targets match the paper\'s claims: private contributions underfund by a factor of N in the homogeneous case (V′ = 10 at N = 10); 1p1v funds at the median rather than the mean (F = 25 vs. F* = 225 in the skewed case); QF attains the optimum exactly (F^QF = F* = 400, V′ = 1); deficit financing gives V′ → 1 + Λ; CQF gives V′ → 1/α; the Sybil and cartel arithmetic on page 19 reproduces exactly (40x on 20x; +$801 defection gain); signed QF attains the optimum (F = 64, V′ = 1); the β-family underfunds for β < 2, is optimal at β = 2, and overfunds for β > 2; and the assurance contract escapes the F = 0 cold-start trap (F* = 58.58 > 50). Full provenance, code, and run records are in the replication harness (`buterin_2020_qf/`: `code/mechanisms.py`, `code/run_all_targets.py`, seed 202607).',
                'word_count' => 1029,
                'published_at' => '2026-11-06 12:02:00',
            ],
            [
                'slug' => 'stanza-license-design',
                'id' => 'dcade1be-cf34-52aa-a059-65d4a659b676',
                'title' => 'License It From Anywhere: A Cross-Chain Design for Licensing Scholarly Works',
                'abstract' => 'Scholarly licensing breaks at the payment step: a reader on one chain cannot easily license a work whose scholar settles on another, and the scholar has no verifiable, tamper-proof record that a license was granted. This manuscript describes the design implemented in `stanza-crosschain`: a reader deposits native crypto (NEAR, SOL, ETH, or USDC) on their home chain; NEAR Intents 1Click settles USDC on Base directly to the scholar\'s address; NEAR Chain Signatures (MPC, contract `v1.signer`, derivation path `ethereum-1`) signs the license-record transaction; and a `LicenseRegistry` contract on Base records the license immutably, with replay protection and a relayer-only gate. No EVM private key exists anywhere in the system. The scholar\'s STANZA credit in this design is recognition — an on-chain record and event — not a token transfer; an actual STANZA transfer would be a separate, explicit decision.',
                'word_count' => 922,
                'published_at' => '2026-11-06 12:01:00',
            ],
            [
                'slug' => 'harness-replication',
                'id' => '36d4ca42-54e3-5e9c-9b18-10ba7149f3d9',
                'title' => 'A Replication of "Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents"',
                'abstract' => 'We reconstruct the empirical core of Barbaste et al. (2026) — a source-code anatomy of eleven production coding harnesses plus the Omnigent meta-harness — and verify its quantitative claims deterministically. Because the ~4M lines of source across the eleven repositories (and the circulated Claude Code snapshot) cannot be re-cloned offline, we encode the paper\'s own Tables 1–18 as a structured corpus and verify every count, ratio, and longitudinal diff for internal consistency, then execute reconstructed implementations of its key mechanisms: Claude Code\'s concurrency batching, OpenHands\' resource-lock batching, the three editing matcher families, Aider\'s recursive halving, Gemini CLI\'s threshold compaction, Hermes\' SQLite lineage rotation, Pi\'s session tree, Codex\'s Starlark policy validation, OpenCode\'s arity-scoped grants, and Listing 3\'s 90-line Minimum Viable Harness. All nine verification targets match. The headline finding survives: across the corpus, 0/11 runtimes import a general-purpose agentic framework and 0/11 retrieve code with vector embeddings. Three draft numbers in the replication record did not survive re-computation and are corrected here (Section 3); none changes a conclusion.',
                'word_count' => 1331,
                'published_at' => '2026-11-06 12:00:00',
            ],
            [
                'slug' => 'bot-fleet-darlene',
                'id' => '1e5fa2c1-64c1-57a2-af0e-ad8981d1668d',
                'title' => 'The Weekly-Theme Bot Fleet: Darlene and the Bot HQ Reflection Gate',
                'abstract' => 'Glenride runs a fleet of local, named machine entities — bots — each with its own identity, soul, and scoped memory. This manuscript describes the design that turns that fleet from a set of separate tools into a learning cohort: a weekly-theme program in which every bot is given the same theme, researches it from a consortium of at least three distinct sources, and writes a formal and an informal composition pondering how the theme relates to Glenride, to D\'Vaughn House\'s personal brand, and above all to customers\' perceived benefits. All bots report their health to Bot HQ (bots.dvaughnhouse.com), and a weekly reflection gate holds a bot offline on HQ until its prior week\'s reflection is recorded. Darlene — the local personal assistant, the first weekly-theme bot — is the worked example. The gate is built and deployed but unarmed as of November 6, 2026, awaiting D\'Vaughn\'s call to arm it.',
                'word_count' => 2816,
                'published_at' => '2026-11-06 11:08:00',
            ],
            [
                'slug' => 'cavesson-vault',
                'id' => 'cf366755-d192-5a1d-aa4b-ef2f7312e4f7',
                'title' => 'Cavesson Vault: A Wallet for AI Agents Whose Rules Are Seven Layers of Protection',
                'abstract' => 'An AI agent that can spend, hire, and sign on a founder\'s behalf is useful precisely to the degree that it is dangerous: every capability it holds is a capability that can be exercised wrongly, excessively, or against the founder\'s intent. Cavesson Vault is a wallet for founders, small operators, and their AI agents whose rules are seven layers of protection. The Human sets house rules; every proposed spend, hire, or signature is checked against those rules before execution; anything outside the rules is blocked or held for human approval; and every action — allowed, blocked, or approved — is written to an append-only receipt log the Human can audit. The governing line is: "Machines propose, but humans are the source of all decisions." This paper describes the design, the prototype built on November 1, 2026, the results of its first live probe, and — plainly — what is still concept, what is built, and what is blocked.',
                'word_count' => 2140,
                'published_at' => '2026-11-06 11:07:00',
            ],
            [
                'slug' => 'glenride-drug-shortage-digest',
                'id' => 'f451f193-a6b6-574d-a42e-f3c7eb2e38cb',
                'title' => 'The Glenride Drug-Shortage Digest: A Weekly Record of Public U.S. Drug Shortages',
                'abstract' => 'Drug shortages are a recurring failure of a critical system: a medicine a clinic, hospital, or patient depends on is suddenly unavailable, and the reason is often buried in a listing that changes without notice. The Glenride Drug-Shortage Digest is a weekly Monday record built from public U.S. listings — principally the American Society of Health-System Pharmacists (ASHP) current-shortages list and the U.S. Food and Drug Administration (FDA) drug-shortages listing — that reports what changed since the last retrieval, what resolved, and where shortages concentrate, each figure carrying its source and retrieval date. The digest is produced by Lucas, a harness whose standing rule is to listen openly and objectively and to report what the data says without spin, guessing, or hype. The full Monday digest is Glenride\'s paid product; a public summary serves as a free funnel through The Dispatch and never contains the full lists. This manuscript describes the problem, the pipeline, the baseline finding from the first run on October 2, 2026, the product model, and — plainly — what is built, what is design only, and what is blocked as of November 6, 2026. Figures are for research citation only. No clinical guidance is ever offered.',
                'word_count' => 3130,
                'published_at' => '2026-11-06 11:06:00',
            ],
            [
                'slug' => 'henry-ecom-ad-factory',
                'id' => 'edd48b1e-ff78-5eaf-b1ec-1afb11228332',
                'title' => 'Henry: The Ecom Ad Factory',
                'abstract' => 'Henry is a Telegram bot that makes ad creatives for D\'Vaughn House\'s projects. A user messages Henry, Henry walks through the job, a local model on the Mac Studio writes the ad copy, and the finished job waits in Telegram for human approval before anything is used. Image variants are mock renders, flagged as mock, because no image generator runs on the Studio. Henry was built October 20–21, 2026, as one of the four Hermes bots, and deployed on the Mac Studio on October 26, 2026. This paper records the design as built, the first-job failure and fix that moved it from mixtral to llama3.1, and what remains unverified as of November 6, 2026.',
                'word_count' => 1026,
                'published_at' => '2026-11-06 11:05:00',
            ],
            [
                'slug' => 'jewel-os',
                'id' => '9be1d335-aab2-58e1-99ea-be88e5ec1d21',
                'title' => 'jewel OS: A Design for a Chief-of-Staff Operating System for a Company of One',
                'abstract' => 'A Human running several projects alone does not need another chatbot that forgets yesterday. The Human needs a chief of staff: one machine agent that remembers, keeps an auditable trail, enforces standing rules, runs background work while the Human sleeps, and delegates to specialist machine agents — without ever becoming the decision-maker. jewel OS is the design for that operating system, delivered as files and teaching rather than as software: a sanitized operating manual, file templates, and protocols the buyer runs on their own assistant. This paper lays out the problem, the three-layer design (Human operator, chief-of-staff machine agent, hired specialists), a harness-informed architecture adapted from *Harness Engineering* (Barbaste et al., July 2026), the pack contents, the patterns adopted and deliberately rejected, the phased plan from decisions to sale, and the questions that remain open. The load-bearing principle throughout is: **machines propose, but Humans are the source of all decisions.**',
                'word_count' => 4954,
                'published_at' => '2026-11-06 11:04:00',
            ],
            [
                'slug' => 'meg-inbox-judge',
                'id' => '00b07e8e-3034-576c-ade3-ebc91abdca51',
                'title' => 'Meg — Inbox Judge: A Concept Paper',
                'abstract' => 'Meg — Inbox Judge — is a proposed email-triage offering for small operators whose inboxes are dominated by promotional noise while the costly failures run in the other direction: a real ask from a customer, a money matter, or a deadline that gets missed. The concept is deliberately narrow: one channel (email), one workflow (triage). A decision engine reads each message, tags it against the client\'s own taxonomy, routes it, scores its urgency, and delivers a ranked morning digest. The governing rule is that Meg proposes and the human decides. Phase 1 has no auto-replies, no auto-sends, and no auto-deletes; spam is quarantined, not deleted. Pricing is locked: free inside the First Build package, otherwise $17, $37, or $97 per month per account, with a 90-day off-ramp for departing clients. This paper sets out the problem, the concept design, the pricing, and what would still need to be built before Meg could serve a real inbox.',
                'word_count' => 1706,
                'published_at' => '2026-11-06 11:03:00',
            ],
            [
                'slug' => 'motion-bot',
                'id' => 'd34cf08d-df03-5082-92fe-bc148aade944',
                'title' => 'Motion Bot: A Story-First Video Creator',
                'abstract' => 'Motion Bot is a video bot that renders motion video on the iMac, using Remotion plus FFmpeg. It began on October 24, 2026 as a tool for making videos for D\'Vaughn House\'s projects. On November 3, 2026 it was remade — at his direction — from a hooks-first renderer into a story-first content creator. This paper describes that remake: the problem it answers, the story-first pipeline as built in its Phase 1 form, the weekly ponder loop that gives the bot a theme to think with, the episodes released under the new design, and, plainly, what is built, what is still design only, and what is blocked. Stories are the basis of everything Motion Bot makes; a hook is one format among others, not the work itself.',
                'word_count' => 1933,
                'published_at' => '2026-11-06 11:02:00',
            ],
            [
                'slug' => 'project-m4',
                'id' => '836a5ca9-565a-5fd2-b913-031b7b63c283',
                'title' => 'Project M4: An Autonomous Local Affiliate Ad Engine',
                'abstract' => 'Project M4 is a fully local, zero-monthly-cost pipeline for producing short-form affiliate video ads, designed to run entirely on a single Apple Mac Studio (M2 Ultra, 64 GB unified memory). The system ingests proven winning ads from the Meta Ad Library and TikTok Creative Center, deconstructs them into hook, body, and call-to-action segments, rewrites the script for a target affiliate offer with a local large language model, synthesizes voiceover and a short AI-generated visual hook, assembles the result in the "Sandwich" format (AI hook + real product B-roll + visual call-to-action), randomizes the output\'s metadata and perceptual fingerprint, and distributes it through a self-hosted Postiz instance — with a human approval gate in Telegram before anything publishes. Phase 1 (core infrastructure: OrbStack compose, install script, database schema, and the FR-5.3 anti-fingerprinting tooling) was built and validated locally on November 5, 2026. Installation on the Mac Studio is blocked because the Studio has been offline since approximately 01:30 EST on November 5, 2026. Phases 2 (synthesis stack) and 3 (automation wiring) are design only at the time of writing. This manuscript documents the design as specified in PRD v1.0 (supplied November 5, 2026), the corrections verified during the Phase 1 build, and the validation results obtained so far — and states plainly what is built, what is design only, and what is blocked.',
                'word_count' => 2084,
                'published_at' => '2026-11-06 11:01:00',
            ],
            [
                'slug' => 'tress-column',
                'id' => '49bb0bdd-dd34-51a5-a0ac-7e3d764cd79f',
                'title' => 'Tress Column: A Fair-Launch Platform on Base',
                'abstract' => 'Token launches fail their communities before they fail their markets: insiders and bots take the early supply, terms change after the fact, and the people who believed in the project earliest are the ones left holding the loss. Tress Column is a fair-launch platform on Base built to reverse that order. Launches are configured once, locked in public, and proven still standing afterward — Configure, Lock, Prove. The fee rule is fixed at inception and immutable: a locked-liquidity launch pays $10M / 0.30%; an unlocked launch pays $20K / ~0.58%. Access runs through a monthly Plus ladder — Sapphire $7, Emerald $27, Ruby $97 — with launch tiers (Platinum, Gold, Silver) tied to how much of the launch is locked and for how long. This paper sets out the problem, the design, and the honest state of the build as of November 6, 2026, including the contract-size blocker that currently holds the Sepolia deployment.',
                'word_count' => 1569,
                'published_at' => '2026-11-06 11:00:00',
            ],
        ];
    }
}
