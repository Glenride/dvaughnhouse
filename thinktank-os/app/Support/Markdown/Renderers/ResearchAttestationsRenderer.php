<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\AttestationStudy;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;
use App\Support\SiteConfig;

/**
 * /research/attestations — the one statistics page per dataset (prompt 2).
 * Every number comes from AttestationStudy; the HTML page, this markdown
 * version, llms.txt and the FAQ all read the same calculation.
 */
class ResearchAttestationsRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $study = AttestationStudy::fromDatabase();
        $year = $study['year'];
        $total = $study['total'];
        $month = date('F Y');

        $findingLines = [];
        foreach ($study['findings'] as $finding) {
            $findingLines[] = "### {$finding['text']}\n\n[Link to this finding](".SiteConfig::canonical('/research/attestations#'.$finding['id']).')';
        }

        if ($study['thin']) {
            $findingLines[] = "Only {$total} attestation".($total === 1 ? ' has' : 's have')." been issued so far, below the ".AttestationStudy::MIN_FINDING_ROWS."-row minimum for share findings. The count above stands; percentage findings will appear once the registry reaches ".AttestationStudy::MIN_FINDING_ROWS." attestations.";
        }

        $byStatusRows = [];
        foreach ($study['by_status'] as $status => $count) {
            $byStatusRows[] = '| '.ucfirst($status).' | '.$count.' | '.Markdown::pct($study['shares'][$status]).'% |';
        }

        $byKindRows = [];
        foreach ($study['by_subject_kind'] as $kind => $count) {
            $byKindRows[] = '| '.str_replace('_', ' ', $kind).' | '.$count.' | '.Markdown::pct($total > 0 ? $count / $total * 100 : 0).'% |';
        }
        if ($byKindRows === []) {
            $byKindRows[] = '| — | 0 | — |';
        }

        $sections = [
            ['heading' => 'Key findings', 'body' => implode("\n\n", $findingLines)],
            ['heading' => 'Breakdown by status', 'body' => "| Status | Count | Share |\n| --- | --- | --- |\n".implode("\n", $byStatusRows)],
            ['heading' => 'Breakdown by subject kind', 'body' => "| Subject kind | Count | Share |\n| --- | --- | --- |\n".implode("\n", $byKindRows)],
            ['heading' => 'Methodology', 'body' => "- **Source:** the Glenride attestations table — every attestation Glenride has issued, including challenged and revoked records. Counts are computed at request time from the live database, never typed by hand.\n- **Denominator:** every share uses the total number of attestations ({$total}) as its denominator.\n- **Excluded:** nothing is excluded. Challenged and revoked attestations stay in the totals and are shown in the status breakdown.\n- **Refresh:** the page recomputes on every request, so it changes when an attestation is issued, challenged, revoked, or anchored.\n- **Rounding:** shares are rounded to one decimal place.\n- **Small samples:** findings whose denominator is under ".AttestationStudy::MIN_FINDING_ROWS." rows are skipped; gaps under 5 points are reported as \"about the same\", not as a difference."],
            ['heading' => 'Frequently asked questions', 'body' => "### How many attestations has Glenride issued?\n\n{$total} attestations have been issued in total, of which {$study['in_force']} remain in force. [Link to this answer](".SiteConfig::canonical('/research/attestations#faq-how-many').")\n\n### What share of Glenride attestations are anchored on-chain?\n\n{$study['anchored']} of {$total} attestations (".Markdown::pct($study['anchored_share'])."%) carry an on-chain anchor. [Link to this answer](".SiteConfig::canonical('/research/attestations#faq-anchored-share').")"],
            ['heading' => 'Suggested citation', 'body' => "Glenride. \"Glenride Attestations {$year}: {$total} Issued.\" ".SiteConfig::canonical('/research/attestations')." ({$month})."],
        ];

        return new MarkdownDocument(
            title: "Glenride Attestations {$year}: {$total} Issued",
            summary: AttestationStudy::headline($study),
            path: '/research/attestations',
            updatedAt: Markdown::date($study['last_updated']),
            sections: $sections,
            related: [
                ['text' => 'Research hub', 'path' => '/research'],
                ['text' => 'Attestations registry', 'path' => '/attestations'],
                ['text' => 'Vanguard Library', 'path' => '/library'],
            ],
        );
    }
}
