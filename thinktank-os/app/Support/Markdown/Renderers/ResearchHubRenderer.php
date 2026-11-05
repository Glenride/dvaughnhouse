<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\AttestationStudy;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

class ResearchHubRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $study = AttestationStudy::fromDatabase();

        return new MarkdownDocument(
            title: 'Research — Glenride',
            summary: 'Original statistics from Glenride\'s own data: one page per dataset, every number computed from the live record, with methodology and a suggested citation.',
            path: '/research',
            updatedAt: Markdown::date($study['last_updated']),
            sections: [
                ['heading' => 'Reports', 'body' => '- '.Markdown::link('Glenride Attestations '.$study['year'].': '.$study['total'].' Issued', '/research/attestations').' — '.AttestationStudy::headline($study)],
                ['heading' => 'How these pages are built', 'body' => 'Every number on a research page comes from one tested calculation over Glenride\'s own data. Findings are skipped when their sample is under '.AttestationStudy::MIN_FINDING_ROWS.' rows, small gaps are reported as "about the same", and every finding has a stable link. Nothing here is estimated or rounded up.'],
            ],
            related: [
                ['text' => 'Attestations registry', 'path' => '/attestations'],
                ['text' => 'Vanguard Library', 'path' => '/library'],
                ['text' => 'Home', 'path' => '/'],
            ],
        );
    }
}
