<?php

namespace App\Support\Markdown\Renderers;

use App\Models\Attestation;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;
use Illuminate\Support\Str;

class AttestationRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $key = $params['key'] ?? '';
        $attestation = Attestation::where('public_id', $key)->first();

        if (! $attestation && Str::isUuid($key)) {
            $attestation = Attestation::find($key);
        }

        if (! $attestation) {
            return null;
        }

        $attestation->load(['verifier:id,name', 'challenges.challenger:id,name']);

        $evidence = $attestation->evidence_manifest;
        $evidenceLines = [];
        if (is_array($evidence)) {
            foreach ($evidence as $k => $v) {
                if (is_array($v)) {
                    foreach ($v as $item) {
                        $evidenceLines[] = '- '.ucfirst((string) $k).': '.(is_string($item) ? $item : json_encode($item));
                    }
                } elseif ($v !== null && $v !== '') {
                    $evidenceLines[] = '- '.ucfirst((string) $k).': '.(is_string($v) ? $v : json_encode($v));
                }
            }
        }
        if ($evidenceLines === []) {
            $evidenceLines[] = 'No evidence manifest was recorded at issuance.';
        }

        $challengeLines = [];
        foreach ($attestation->challenges as $challenge) {
            $challengeLines[] = '- '.($challenge->challenger?->name ?? 'Fellow').' ('.$challenge->status.'): '.$challenge->grounds;
        }
        if ($challengeLines === []) {
            $challengeLines[] = 'No challenges have been raised against this attestation.';
        }

        $atAGlance = Markdown::definitionTable([
            'Public ID' => $attestation->public_id,
            'Subject' => $attestation->subject_title,
            'Subject kind' => $attestation->subject_kind ? str_replace('_', ' ', $attestation->subject_kind) : null,
            'Status' => $attestation->status,
            'Issuer' => $attestation->issuer_name ?: 'Glenride',
            'Verified by' => $attestation->verifier?->name ?? 'Glenride',
            'Issued' => Markdown::date($attestation->issued_at),
            'Method' => $attestation->method ?: 'editorial_review_v1',
            'Entry' => $attestation->entered_via === 'manual' ? 'Manual entry' : 'Manuscript pipeline',
            'Subject hash (SHA-256)' => $attestation->subject_hash,
            'Signature fingerprint' => $attestation->signatureFingerprint(),
            'On-chain anchor' => $attestation->anchor_tx
                ? ($attestation->anchor_platform ?: 'pearls').' · '.($attestation->anchor_chain ?: 'base').' · '.$attestation->anchor_tx.($attestation->anchor_contract ? ' · contract '.$attestation->anchor_contract : '').($attestation->anchored_at ? ' · anchored '.Markdown::date($attestation->anchored_at) : '')
                : 'Not anchored yet',
            'Revoked' => $attestation->revoked_at ? Markdown::date($attestation->revoked_at).($attestation->revocation_reason ? ' — '.$attestation->revocation_reason : '') : null,
        ]);

        return new MarkdownDocument(
            title: $attestation->subject_title,
            summary: 'Glenride attestation '.$attestation->public_id.' ('.$attestation->status.'): '.$attestation->claim,
            path: '/attestations/'.$attestation->public_id,
            updatedAt: Markdown::date($attestation->issued_at),
            sections: [
                ['heading' => 'At a glance', 'body' => $atAGlance],
                ['heading' => 'The claim', 'body' => $attestation->claim],
                ['heading' => 'The evidence recorded at issuance', 'body' => implode("\n", $evidenceLines)],
                ['heading' => 'How to verify', 'body' => 'Hash the published brief and compare it to the subject hash above. If they match, the work in front of you is the exact work Glenride attested — not a later edit wearing its name.'],
                ['heading' => 'Challenges', 'body' => "An attestation authority that cannot be questioned is just a priesthood. Any signed-in Fellow can challenge this record with stated grounds; a challenge marks the record as challenged in public until it is resolved.\n\n".implode("\n", $challengeLines)],
            ],
            related: [
                ['text' => 'Attestations registry', 'path' => '/attestations'],
                ['text' => 'Research: Glenride Attestations', 'path' => '/research/attestations'],
            ],
        );
    }
}
