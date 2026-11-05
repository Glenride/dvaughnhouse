<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\MarkdownDocument;
use Illuminate\Support\Facades\File;

/**
 * Source of truth is the markdown in resources/standards/*.md — the
 * markdown version serves that file directly, not a re-typed copy.
 */
class StandardsRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $path = resource_path('standards/how-glenride-works.md');

        if (! File::exists($path)) {
            return null;
        }

        $body = File::get($path);
        // The file's own H1 becomes the document title; drop it from the body.
        $body = (string) preg_replace('/^# How Glenride Works\s*/', '', $body);
        $updated = date('Y-m-d', File::lastModified($path));

        return new MarkdownDocument(
            title: 'How Glenride Works',
            summary: 'How Glenride operates, in plain language: how we use AI, how we source and verify, how we correct mistakes, and what we will not do.',
            path: '/standards',
            updatedAt: $updated,
            sections: [['body' => trim($body)]],
            related: [
                ['text' => 'Home', 'path' => '/'],
                ['text' => 'Essays', 'path' => '/essays'],
                ['text' => 'Attestations', 'path' => '/attestations'],
            ],
        );
    }
}
