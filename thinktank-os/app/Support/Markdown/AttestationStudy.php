<?php

namespace App\Support\Markdown;

use App\Models\Attestation;
use App\Models\Manuscript;
use Illuminate\Support\Collection;

/**
 * One number, one calculation (prompt 2 §1).
 *
 * The research page, its markdown version, llms.txt and the FAQ all call
 * this module — never a hand-typed number. computeStudy() is pure: it
 * takes plain rows and returns findings, so it is unit-testable without
 * a database. fromDatabase() is the only place that touches the live
 * tables.
 *
 * A row is: ['status' => issued|challenged|revoked, 'anchored' => bool,
 * 'subject_kind' => string|null, 'issued_at' => date|string|null].
 *
 * Findings are skipped when their denominator is under 20 rows, and
 * small gaps are reported as "about the same", never as a difference.
 * Every finding has a stable id and a "Link to this finding" anchor.
 */
class AttestationStudy
{
    public const MIN_FINDING_ROWS = 20;

    /**
     * @param array<int, array{status: string, anchored?: bool, subject_kind?: string|null, issued_at?: mixed}> $rows
     * @return array<string, mixed>
     */
    public static function computeStudy(array $rows): array
    {
        $total = count($rows);
        $byStatus = ['issued' => 0, 'challenged' => 0, 'revoked' => 0];
        $anchored = 0;
        $byKind = [];
        $years = [];

        foreach ($rows as $row) {
            $status = $row['status'] ?? '';
            if (isset($byStatus[$status])) {
                $byStatus[$status]++;
            }

            if (! empty($row['anchored'])) {
                $anchored++;
            }

            $kind = $row['subject_kind'] ?? 'other';
            $byKind[$kind] = ($byKind[$kind] ?? 0) + 1;

            if (! empty($row['issued_at'])) {
                $years[] = (int) \Carbon\Carbon::parse($row['issued_at'])->format('Y');
            }
        }

        $inForce = $byStatus['issued'] + $byStatus['challenged'];
        $shares = [];

        foreach ($byStatus as $status => $count) {
            $shares[$status] = $total > 0 ? $count / $total * 100 : 0.0;
        }

        $anchoredShare = $total > 0 ? $anchored / $total * 100 : 0.0;
        $inForceShare = $total > 0 ? $inForce / $total * 100 : 0.0;

        arsort($byKind);
        $topKind = $byKind !== [] ? array_key_first($byKind) : null;

        $findings = [];
        $year = date('Y');

        // Finding 1 — the headline count. A count is a count, not a share,
        // so it stands even on a small sample; shares below do not.
        $findings[] = [
            'id' => 'total-attestations',
            'text' => "Glenride has issued {$total} attestation".($total === 1 ? '' : 's')." in total, of which {$inForce} (".Markdown::pct($inForceShare)."%) remain in force.",
            'count' => $total,
            'denominator' => $total,
        ];

        if ($total >= self::MIN_FINDING_ROWS) {
            $findings[] = [
                'id' => 'status-breakdown',
                'text' => "Of {$total} attestations, {$byStatus['issued']} are issued (".Markdown::pct($shares['issued'])."%), {$byStatus['challenged']} are challenged (".Markdown::pct($shares['challenged'])."%), and {$byStatus['revoked']} are revoked (".Markdown::pct($shares['revoked'])."%).",
                'count' => $byStatus['issued'],
                'denominator' => $total,
            ];

            $findings[] = [
                'id' => 'anchored-share',
                'text' => "{$anchored} of {$total} attestations (".Markdown::pct($anchoredShare)."%) carry an on-chain anchor; the rest are signed Glenride records awaiting anchoring.",
                'count' => $anchored,
                'denominator' => $total,
            ];

            if ($topKind !== null) {
                $findings[] = [
                    'id' => 'most-common-subject',
                    'text' => "The most common subject kind is {$topKind}, with {$byKind[$topKind]} of {$total} attestations (".Markdown::pct($byKind[$topKind] / $total * 100)."%).",
                    'count' => $byKind[$topKind],
                    'denominator' => $total,
                ];
            }

            // A comparison that flips with the data: issued vs challenged.
            // Gaps under 5 points are "about the same", never a difference.
            $gap = abs($shares['issued'] - $shares['challenged']);
            $comparison = $gap < 5
                ? 'issued and challenged attestations are about the same share of the registry'
                : ($shares['issued'] > $shares['challenged']
                    ? 'issued attestations outnumber challenged ones'
                    : 'challenged attestations outnumber issued ones');
            $findings[] = [
                'id' => 'issued-vs-challenged',
                'text' => "By status, {$comparison} ({$byStatus['issued']} issued vs {$byStatus['challenged']} challenged, a ".Markdown::pct($gap)."-point gap).",
                'count' => $byStatus['issued'],
                'denominator' => $total,
            ];
        }

        return [
            'total' => $total,
            'in_force' => $inForce,
            'by_status' => $byStatus,
            'shares' => $shares,
            'anchored' => $anchored,
            'anchored_share' => $anchoredShare,
            'by_subject_kind' => $byKind,
            'year_range' => $years !== [] ? [min($years), max($years)] : null,
            'year' => $year,
            'min_rows' => self::MIN_FINDING_ROWS,
            'findings' => $findings,
            'thin' => $total < self::MIN_FINDING_ROWS,
        ];
    }

    /** Live study from the database, plus the manuscript context counts. */
    public static function fromDatabase(): array
    {
        $rows = Attestation::query()
            ->get(['status', 'subject_kind', 'issued_at', 'anchor_tx'])
            ->map(fn (Attestation $a) => [
                'status' => $a->status,
                'anchored' => ! empty($a->anchor_tx),
                'subject_kind' => $a->subject_kind,
                'issued_at' => $a->issued_at,
            ])
            ->all();

        $study = static::computeStudy($rows);
        $study['published_manuscripts'] = Manuscript::published()->count();
        $study['last_issued_at'] = Attestation::max('issued_at');
        $study['last_updated'] = $study['last_issued_at'] ?? Attestation::max('updated_at');
        $study['generated_at'] = now()->toDateString();

        return $study;
    }

    /** Headline numbers for llms.txt, in one line, from the live study. */
    public static function headline(array $study): string
    {
        $total = $study['total'];
        $year = $study['year'];

        if ($total === 0) {
            return "No attestations have been issued yet as of {$year}; the registry is empty and this page will update when the first attestation is issued.";
        }

        return "{$total} attestations issued ({$study['in_force']} in force), {$study['anchored']} anchored on-chain — see /research/attestations for the breakdown.";
    }
}
