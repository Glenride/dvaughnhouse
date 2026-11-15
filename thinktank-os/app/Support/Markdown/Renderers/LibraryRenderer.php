<?php

namespace App\Support\Markdown\Renderers;

use App\Models\Manuscript;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

class LibraryRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $published = Manuscript::published()->latest('published_at')->get();
        $latest = $published->max('published_at');

        $lines = [];
        foreach ($published as $brief) {
            $line = '- '.Markdown::link($brief->title, '/briefs/'.$brief->id);
            if ($brief->published_at) {
                $line .= ' — published '.Markdown::date($brief->published_at);
            }
            if ($brief->abstract) {
                $line .= ' — '.$brief->abstract;
            }
            $lines[] = $line;
        }

        if ($lines === []) {
            $lines[] = 'No briefs have been published yet.';
        }

        return new MarkdownDocument(
            title: 'The Vanguard Library — Glenride',
            summary: 'The Vanguard Library is Glenride\'s public reading room: published policy briefs, each with its evidence, verifier, and date.',
            path: '/library',
            updatedAt: Markdown::date($latest),
            sections: [
                ['heading' => 'Published briefs ('.count($published).')', 'body' => implode("\n", $lines)],
            ],
            related: [
                ['text' => 'Home', 'path' => '/'],
                ['text' => 'Institutional Thesis', 'path' => '/thesis'],
                ['text' => 'Attestations', 'path' => '/attestations'],
            ],
        );
    }
}
