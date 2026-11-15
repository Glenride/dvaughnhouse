<?php

namespace App\Http\Controllers;

use App\Support\Markdown\AttestationStudy;
use App\Support\SiteConfig;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use Inertia\Response;

/**
 * /research — original statistics from Glenride's own data (prompt 2).
 * Numbers come from AttestationStudy::fromDatabase(); nothing here is
 * hand-typed. If the registry is empty, the page says so instead of
 * inventing a headline.
 */
class ResearchController extends Controller
{
    public function index(): Response
    {
        $study = AttestationStudy::fromDatabase();

        return Inertia::render('Research/Index', [
            'study' => $this->studyProps($study),
            'reports' => [
                [
                    'path' => '/research/attestations',
                    'title' => 'Glenride Attestations '.$study['year'].': '.$study['total'].' Issued',
                    'summary' => AttestationStudy::headline($study),
                ],
            ],
        ]);
    }

    public function attestations(): Response
    {
        $study = AttestationStudy::fromDatabase();

        View::share('pageJsonLd', $this->researchJsonLd($study));

        return Inertia::render('Research/Attestations', [
            'study' => $this->studyProps($study),
        ]);
    }

    /** Only plain, JSON-safe values cross into Inertia props. */
    private function studyProps(array $study): array
    {
        return [
            'total' => $study['total'],
            'in_force' => $study['in_force'],
            'by_status' => $study['by_status'],
            'shares' => array_map(fn ($s) => round($s, 1), $study['shares']),
            'anchored' => $study['anchored'],
            'anchored_share' => round($study['anchored_share'], 1),
            'by_subject_kind' => $study['by_subject_kind'],
            'year' => $study['year'],
            'year_range' => $study['year_range'],
            'min_rows' => $study['min_rows'],
            'thin' => $study['thin'],
            'findings' => $study['findings'],
            'headline' => AttestationStudy::headline($study),
            'published_manuscripts' => $study['published_manuscripts'],
            'last_issued_at' => $study['last_issued_at'] ? (string) $study['last_issued_at'] : null,
            'generated_at' => $study['generated_at'],
        ];
    }

    /** WebPage + Dataset + FAQPage JSON-LD, matching the visible page exactly. */
    private function researchJsonLd(array $study): string
    {
        $url = SiteConfig::canonical('/research/attestations');
        $month = date('F Y');

        $jsonLd = [
            [
                '@context' => 'https://schema.org',
                '@type' => 'WebPage',
                'name' => 'Glenride Attestations '.$study['year'].': '.$study['total'].' Issued',
                'url' => $url,
                'description' => AttestationStudy::headline($study),
                'dateModified' => $study['last_updated'] ?? $study['generated_at'],
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'Dataset',
                'name' => 'Glenride Attestations '.$study['year'],
                'description' => 'Every attestation Glenride has issued, by status, subject kind, and on-chain anchor. '.$study['total'].' attestations in total.',
                'creator' => ['@type' => 'Organization', 'name' => SiteConfig::name(), 'url' => SiteConfig::url().'/'],
                'dateModified' => $study['last_updated'] ?? $study['generated_at'],
                'variableMeasured' => ['attestation status', 'subject kind', 'on-chain anchor'],
                'measurementTechnique' => 'Count of rows in the Glenride attestations table, computed at request time; shares use the total attestation count as denominator.',
                'distribution' => [
                    '@type' => 'DataDownload',
                    'encodingFormat' => 'text/markdown',
                    'contentUrl' => SiteConfig::canonical('/research/attestations.md'),
                ],
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => [
                    [
                        '@type' => 'Question',
                        'name' => 'How many attestations has Glenride issued?',
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => $study['total'].' attestations have been issued in total, of which '.$study['in_force'].' remain in force.',
                        ],
                    ],
                    [
                        '@type' => 'Question',
                        'name' => 'What share of Glenride attestations are anchored on-chain?',
                        'acceptedAnswer' => [
                            '@type' => 'Answer',
                            'text' => $study['anchored'].' of '.$study['total'].' attestations ('.round($study['anchored_share'], 1).'%) carry an on-chain anchor.',
                        ],
                    ],
                ],
            ],
        ];

        $json = json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return str_replace('</script', '<\/script', (string) $json);
    }
}
