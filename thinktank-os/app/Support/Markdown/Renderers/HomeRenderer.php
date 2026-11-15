<?php

namespace App\Support\Markdown\Renderers;

use App\Http\Controllers\EssayController;
use App\Models\Attestation;
use App\Models\Manuscript;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

class HomeRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $featured = Manuscript::published()
            ->latest('published_at')
            ->take(3)
            ->get(['id', 'title', 'abstract', 'published_at']);

        $publishedCount = Manuscript::published()->count();
        $attestationCount = Attestation::active()->count();
        $essayCount = count(EssayController::publishedSlugs());
        $latest = Manuscript::published()->max('published_at');

        $briefLines = [];
        foreach ($featured as $brief) {
            $line = '- '.Markdown::link($brief->title, '/briefs/'.$brief->id);
            if ($brief->abstract) {
                $line .= ' — '.$brief->abstract;
            }
            $briefLines[] = $line;
        }

        if ($briefLines === []) {
            $briefLines[] = '- '.Markdown::link('Autonomous Agentic Governance in High-Assurance Sectors', '/briefs/featured-monograph-1').' — A strategic framework addressing the latency gap between rapid algorithmic decision-making and human moral verification across clinical trial data pipelines and defense infrastructure.';
        }

        return new MarkdownDocument(
            title: 'Glenride — Independent, AI-Native Think Tank',
            summary: 'Glenride is an independent, AI-native think tank. We find where critical systems break before the break becomes harm — and we publish a record anyone can check.',
            path: '/',
            updatedAt: Markdown::date($latest),
            sections: [
                ['heading' => 'What Glenride is', 'body' => "Glenride is an independent, AI-native think tank. We find where critical systems break before the break becomes harm — and we publish a record anyone can check.\n\nWe study supply chains, pharmaceutical data, and the software systems modern life quietly depends on. We measure what others guess at, we show our sources, and we sign our work. When a finding is strong enough to change a rule, we carry it to the people who write the rules. When an answer can become a tool, we build the tool. Our money comes from our work, so our conclusions answer to evidence, not to a sponsor.\n\n— D'Vaughn House, Founder"],
                ['heading' => 'Research areas', 'body' => "- **Supply-Chain Resilience** — How critical supply chains fail, where they bend, and what keeps them running.\n- **Pharmaceutical Data Evaluation** — Clinical and regulatory data, evaluated for what it actually shows.\n- **Applied AI & Enterprise Software Systems** — Autonomous systems under non-negotiable human primacy — AI prepares, humans decide."],
                ['heading' => 'Proof, not promises', 'body' => "Every attested work carries a signed Glenride record: the claim, the evidence behind it, the verifier who checked it, and the timestamp. The record is public, and anyone can verify it — or challenge it.\n\nThe registry currently holds {$attestationCount} attestations across {$publishedCount} published briefs in the Vanguard Library."],
                ['heading' => 'From the Vanguard Library', 'body' => implode("\n", $briefLines)],
                ['heading' => 'Go deeper', 'body' => "- ".Markdown::link('Essays', '/essays')." — Long-form foundational writing".($essayCount > 0 ? " — {$essayCount} published" : '')."\n- ".Markdown::link('Standards', '/standards')." — The standards Glenride works to\n- ".Markdown::link('The Store', '/store')." — Commercial work and executive salons\n- ".Markdown::link('Attestations', '/attestations')." — The public registry\n- ".Markdown::link('Research', '/research')." — Original statistics from Glenride's own data"],
            ],
            related: [
                ['text' => 'Vanguard Library', 'path' => '/library'],
                ['text' => 'Attestations', 'path' => '/attestations'],
                ['text' => 'Essays', 'path' => '/essays'],
                ['text' => 'Standards', 'path' => '/standards'],
                ['text' => 'The Store', 'path' => '/store'],
                ['text' => 'Contact', 'path' => 'https://dvaughnhouse.com/#contact'],
            ],
        );
    }
}
