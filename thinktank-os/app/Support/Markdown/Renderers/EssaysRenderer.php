<?php

namespace App\Support\Markdown\Renderers;

use App\Http\Controllers\EssayController;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

class EssaysRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $lines = [];
        foreach (EssayController::manifest() as $slug => $meta) {
            $lines[] = '- '.Markdown::link($meta['title'], '/essays/'.$slug).' — '.$meta['description'];
        }

        return new MarkdownDocument(
            title: 'Essays — Glenride',
            summary: 'Long-form foundational writing from Glenride: the flagship essay and founder\'s thesis on the power-wisdom gap and independent infrastructure.',
            path: '/essays',
            updatedAt: '2026-10-01',
            sections: [
                ['heading' => 'Published essays ('.count($lines).')', 'body' => implode("\n", $lines)],
            ],
            related: [
                ['text' => 'Institutional Thesis', 'path' => '/thesis'],
                ['text' => 'Standards', 'path' => '/standards'],
                ['text' => 'Home', 'path' => '/'],
            ],
        );
    }
}
