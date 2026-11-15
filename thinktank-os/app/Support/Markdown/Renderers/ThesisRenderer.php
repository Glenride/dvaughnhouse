<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\MarkdownDocument;

class ThesisRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        return new MarkdownDocument(
            title: 'The Foundational Thesis — Glenride',
            summary: 'Two foundational essays exploring why technological velocity has outpaced institutional wisdom — and how human moral judgment must anchor autonomous execution.',
            path: '/thesis',
            updatedAt: '2026-10-01',
            sections: [
                ['heading' => 'Essay I — The Power-Wisdom Gap: Institutional Fragility in the Age of Exponential Velocity', 'body' => "Why cognitive leverage without moral clarity accelerates systemic breakdown across civil and industrial infrastructure.\n\nThroughout industrial history, technological leverage has expanded linearly, granting institutions time to mature ethical conventions, legal doctrine, and regulatory guardrails. In the current era, however, algorithmic velocity expands exponentially while institutional wisdom remains bounded by human biological cognition.\n\n> \"When an institution gains infinite analytical horsepower without corresponding ethical maturity, it does not become enlightened. It merely accelerates its capability to make catastrophic misjudgments at light speed.\"\n\nThe mission of Glenride is to close this power-wisdom gap. By combining autonomous agentic synthesis with local-first verification, we reduce thirty-page empirical monographs into concise four-page policy briefs — ensuring that leaders receive uncorrupted truth in time to act with decisive moral clarity."],
                ['heading' => 'Essay II — The Agentic Enterprise: Autonomous Execution, Local-First Intelligence, and Human Primacy', 'body' => "Architecting organizations where autonomous agents execute with machine precision while human orchestrators keep ethical oversight.\n\n1. **Zero-Friction Autonomous Distillation** — Autonomous model pipelines ingest raw, complex research and instantly distill empirical takeaways, freeing human experts from administrative transcription.\n2. **Local-First Intelligence** — Proprietary intelligence must run local-first. Core organizational data cannot be siphoned into public training loops that degrade competitive moat and compromise privacy.\n3. **Non-Negotiable Human Moral Primacy** — No policy brief is released, no capital is committed, and no protocol is enacted without decisive human verification. Machines provide analytical velocity; human orchestrators provide moral responsibility.\n\nThis is the architecture Glenride runs on today. Leaders who adopt it move faster with less systemic risk — because machines do the work, and humans make the calls."],
                ['heading' => 'Author', 'body' => "By D'Vaughn House, Founder and Independent AI Orchestrator."],
            ],
            related: [
                ['text' => 'Essays', 'path' => '/essays'],
                ['text' => 'The Power-Wisdom Gap (full essay)', 'path' => '/essays/power-wisdom-gap'],
                ['text' => 'Vanguard Library', 'path' => '/library'],
            ],
        );
    }
}
