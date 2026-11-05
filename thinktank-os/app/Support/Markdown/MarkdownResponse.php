<?php

namespace App\Support\Markdown;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * HTTP envelope for every markdown response (prompt 1 §1).
 *
 * Content-Type text/markdown, X-Markdown-Tokens, X-Robots-Tag noindex
 * (the HTML page stays canonical), Content-Location + Link canonical,
 * Vary: Accept, long cache, Last-Modified when known, CORS *.
 */
class MarkdownResponse
{
    public static function document(Request $request, MarkdownDocument $doc, int $status = 200): Response
    {
        $body = $doc->render();

        return static::raw($request, $body, $doc->canonicalUrl(), $doc->tokens(), $doc->updatedAt, $status);
    }

    public static function raw(
        Request $request,
        string $body,
        ?string $canonicalUrl = null,
        ?int $tokens = null,
        ?string $lastModified = null,
        int $status = 200,
    ): Response {
        $response = new Response($request->isMethod('HEAD') ? '' : $body, $status);
        $response->headers->set('Content-Type', 'text/markdown; charset=utf-8');
        $response->headers->set('X-Markdown-Tokens', (string) ($tokens ?? (int) ceil(strlen($body) / 4)));
        $response->headers->set('X-Robots-Tag', 'noindex, follow');
        $response->headers->set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        $response->headers->set('Vary', 'Accept');
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Accept');

        if ($canonicalUrl) {
            $response->headers->set('Content-Location', $canonicalUrl);
            $response->headers->set('Link', '<'.$canonicalUrl.'>; rel="canonical"');
        }

        if ($lastModified) {
            try {
                $response->headers->set('Last-Modified', \Carbon\Carbon::parse($lastModified)->toRfc7231String());
            } catch (\Throwable) {
                // Unknown date format: omit the header rather than lie.
            }
        }

        return $response;
    }

    public static function notFound(Request $request, string $path): Response
    {
        $doc = new MarkdownDocument(
            title: 'Not found',
            summary: 'No public page exists at this address.',
            path: $path,
            sections: [['body' => 'This address has no markdown version. The page may not exist, may not be published yet, or may be a private page that is never exposed as markdown.']],
            related: [['text' => 'Home', 'path' => '/'], ['text' => 'Vanguard Library', 'path' => '/library']],
        );

        return static::document($request, $doc, 404);
    }

    /**
     * Parse an Accept header into media type => q value.
     * A missing Accept header, or a wildcard accept, means HTML
     * (never markdown) — handled by callers.
     *
     * @return array<string, float>
     */
    public static function acceptQuality(?string $header): array
    {
        $out = [];

        foreach (explode(',', (string) $header) as $part) {
            $segments = explode(';', trim($part));
            $type = strtolower(trim(array_shift($segments)));
            $q = 1.0;

            foreach ($segments as $segment) {
                if (str_starts_with(trim($segment), 'q=')) {
                    $q = (float) substr(trim($segment), 2);
                }
            }

            if ($type !== '') {
                $out[$type] = $q;
            }
        }

        return $out;
    }

    /** Markdown only when text/markdown outranks text/html. */
    public static function prefersMarkdown(Request $request): bool
    {
        $accept = static::acceptQuality($request->header('Accept'));
        $md = $accept['text/markdown'] ?? 0.0;
        $html = $accept['text/html'] ?? 0.0;

        return $md > 0 && $md > $html;
    }
}
