<?php

namespace App\Support\Markdown\Renderers;

use App\Models\Attestation;
use App\Support\Markdown\AttestationStudy;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

class AttestationsRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $attestations = Attestation::with('verifier:id,name')
            ->latest('issued_at')
            ->take(50)
            ->get();

        $study = AttestationStudy::fromDatabase();
        $latest = $attestations->max('issued_at');

        $lines = [];
        foreach ($attestations as $a) {
            $line = '- '.Markdown::link($a->subject_title, '/attestations/'.$a->public_id).' — '.$a->public_id.' · '.$a->status;
            if ($a->issued_at) {
                $line .= ' · issued '.Markdown::date($a->issued_at);
            }
            $lines[] = $line;
        }

        if ($lines === []) {
            $lines[] = 'No attestations have been issued yet.';
        }

        $title = 'Glenride Attestations ('.$study['year'].') — '.$study['total'].' issued';

        return new MarkdownDocument(
            title: 'Attestations — Glenride',
            summary: 'The public registry of Glenride attestations: every attested work carries a signed record with its claim, evidence, verifier, and timestamp — open to verification or challenge.',
            path: '/attestations',
            updatedAt: Markdown::date($latest),
            sections: [
                ['heading' => 'The registry at a glance', 'body' => Markdown::definitionTable([
                    'Total attestations' => (string) $study['total'],
                    'In force' => (string) $study['in_force'],
                    'Issued' => (string) $study['by_status']['issued'],
                    'Challenged' => (string) $study['by_status']['challenged'],
                    'Revoked' => (string) $study['by_status']['revoked'],
                    'Anchored on-chain' => (string) $study['anchored'],
                ])."\n\n".$title.'.'],
                ['heading' => 'Attestations', 'body' => implode("\n", $lines)],
                ['heading' => 'How to verify', 'body' => 'To check a work yourself: hash the published brief and compare it to the subject hash on its attestation page. If they match, the work in front of you is the exact work Glenride attested — not a later edit wearing its name.'],
            ],
            related: [
                ['text' => 'Research: Glenride Attestations', 'path' => '/research/attestations'],
                ['text' => 'Vanguard Library', 'path' => '/library'],
                ['text' => 'Home', 'path' => '/'],
            ],
        );
    }
}
