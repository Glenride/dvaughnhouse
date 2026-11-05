<?php

namespace App\Support\Markdown\Renderers;

use App\Http\Controllers\EssayController;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;
use Illuminate\Support\Facades\File;

/**
 * Source of truth is the markdown in resources/essays/*.md — the
 * markdown version serves that file directly, not a re-typed copy.
 * Only slugs in the manifest are routable (no path traversal).
 */
class EssayRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $slug = $params['slug'] ?? '';
        $manifest = EssayController::manifest();

        if (! array_key_exists($slug, $manifest)) {
            return null;
        }

        $meta = $manifest[$slug];
        $mdPath = resource_path('essays/'.str_replace('.html', '.md', $meta['file']));

        if (! File::exists($mdPath)) {
            return null;
        }

        $body = File::get($mdPath);
        $body = (string) preg_replace('/^# .*\n/', '', $body, 1);
        $updated = date('Y-m-d', File::lastModified($mdPath));

        return new MarkdownDocument(
            title: $meta['title'],
            summary: $meta['description'],
            path: '/essays/'.$slug,
            updatedAt: $updated,
            sections: [
                ['heading' => 'At a glance', 'body' => Markdown::definitionTable([
                    'Document ID' => $meta['id'],
                    'Status' => $meta['status'],
                    'Length' => $meta['meta'],
                ])],
                ['body' => trim($body)],
            ],
            related: [
                ['text' => 'Essays', 'path' => '/essays'],
                ['text' => 'Institutional Thesis', 'path' => '/thesis'],
                ['text' => 'Standards', 'path' => '/standards'],
            ],
        );
    }
}
