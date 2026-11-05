<?php

namespace App\Http\Middleware;

use App\Support\Markdown\MarkdownRegistry;
use App\Support\Markdown\MarkdownResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Content negotiation + .md handling (prompt 1 §1), and the global
 * Link header advertising llms.txt / llms-full.txt / ai.txt.
 *
 *  - GET /page.md is handled by the explicit route in web.php; this
 *    middleware handles Accept: text/markdown negotiation for HTML
 *    routes in the registry (markdown only when its q beats text/html;
 *    a wildcard or a missing Accept header always gets HTML).
 *  - Never applies to /llms.txt, /llms-full.txt, /ai.txt, /robots.txt,
 *    /sitemap.xml, /api/*, static assets, or any route outside the
 *    registry allowlist — auth and private pages are untouched.
 *  - OPTIONS preflights for markdown routes are answered here.
 */
class MarkdownNegotiation
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = '/'.trim($request->path(), '/');

        // CORS preflight for markdown-addressable paths.
        if ($request->isMethod('OPTIONS') && MarkdownRegistry::isMarkdownRoute($path)) {
            $response = response('', 204);
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Accept');

            return $response;
        }

        if (($request->isMethod('GET') || $request->isMethod('HEAD'))
            && MarkdownRegistry::isMarkdownRoute($path)
            && MarkdownResponse::prefersMarkdown($request)
        ) {
            $doc = MarkdownRegistry::render($path);

            if ($doc) {
                return MarkdownResponse::document($request, $doc);
            }

            return MarkdownResponse::notFound($request, $path);
        }

        $response = $next($request);

        // Advertise the AI-readable files from every HTML page.
        if (str_contains((string) $response->headers->get('Content-Type', ''), 'text/html')) {
            $base = rtrim(config('site.url', 'https://dvaughnhouse.org'), '/');
            $describedBy = '<'.$base.'/llms.txt>; rel="describedby", <'.$base.'/llms-full.txt>; rel="describedby", <'.$base.'/ai.txt>; rel="describedby"';
            $existing = $response->headers->get('Link');
            $response->headers->set('Link', $existing ? $existing.', '.$describedBy : $describedBy);
        }

        return $response;
    }
}
