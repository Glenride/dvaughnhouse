<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\MarkdownDocument;

/**
 * One renderer per public route. Adding a page takes exactly one step:
 * write a renderer and register it in MarkdownRegistry.
 *
 * Renderers reuse the same data the HTML page uses (same models, same
 * queries, same source files) and return null when the page or entity
 * does not exist or is not public — the caller turns that into a
 * markdown 404. Never expose unpublished, draft, or auth-gated content.
 */
interface MarkdownRenderer
{
    /** @param array<string, string> $params route parameters */
    public static function render(array $params): ?MarkdownDocument;
}
