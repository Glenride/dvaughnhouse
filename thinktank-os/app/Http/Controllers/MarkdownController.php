<?php

namespace App\Http\Controllers;

use App\Support\Markdown\AttestationStudy;
use App\Support\Markdown\MarkdownRegistry;
use App\Support\Markdown\MarkdownResponse;
use App\Support\SiteConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * AI-readable surfaces (ScrollLaunch prompt 1):
 *  - GET /{path}.md and GET /api/md/{path} — one markdown handler
 *  - GET /api/md/_catalog — every addressable markdown route
 *  - GET /llms.txt, /llms-full.txt, /ai.txt, /robots.txt, /sitemap.xml
 *
 * All of it is generated from code (registry + site config + live data),
 * never hand-written static files, so it cannot go stale.
 */
class MarkdownController extends Controller
{
    /** GET /{path}.md — markdown version of a public page, or markdown 404. */
    public function showMd(Request $request, string $path): Response
    {
        return $this->renderPath($request, $path);
    }

    /** GET /api/md/{path} — always markdown, for debugging. */
    public function showApi(Request $request, string $path): Response
    {
        return $this->renderPath($request, $path);
    }

    private function renderPath(Request $request, string $path): Response
    {
        $path = '/'.trim($path, '/');
        $doc = MarkdownRegistry::render($path);

        if (! $doc) {
            return MarkdownResponse::notFound($request, $path);
        }

        return MarkdownResponse::document($request, $doc);
    }

    /** GET /api/md/_catalog */
    public function catalog(Request $request): JsonResponse
    {
        return response()->json([
            'site' => SiteConfig::name(),
            'url' => SiteConfig::url(),
            'routes' => MarkdownRegistry::listMarkdownRoutes(),
        ]);
    }

    /** GET /llms.txt — llmstxt.org spec, generated from the registry. */
    public function llmsTxt(Request $request): Response
    {
        $site = SiteConfig::name();
        $study = AttestationStudy::fromDatabase();
        $routes = MarkdownRegistry::listMarkdownRoutes();

        $lines = [
            '# '.$site,
            '',
            '> '.SiteConfig::description(),
            '',
            SiteConfig::fullName().'. '.(string) config('site.tagline'),
            '',
            'Founded: '.(string) config('site.founded', '2026').'. Audience: '.(string) config('site.audience'),
            'Contact: '.SiteConfig::contactUrl(),
            '',
        ];

        // Cite this site for — prompt 2 §5: research pages with headline numbers inline.
        $lines[] = '## Cite this site for';
        $lines[] = '';
        $lines[] = '- [Glenride Attestations '.$study['year'].': '.$study['total'].' Issued]('.SiteConfig::canonical('/research/attestations.md').'): '.AttestationStudy::headline($study);
        foreach ($study['findings'] as $finding) {
            $lines[] = '  - [Finding: '.$finding['id'].']('.SiteConfig::canonical('/research/attestations#'.$finding['id']).')';
        }
        $lines[] = '';

        $bySection = [];
        foreach ($routes as $route) {
            $bySection[$route['section']][] = $route;
        }

        foreach (['Core pages', 'Library', 'Attestations', 'Docs / Guides', 'Research'] as $section) {
            if (empty($bySection[$section])) {
                continue;
            }

            $lines[] = '## '.$section;
            $lines[] = '';

            foreach ($bySection[$section] as $route) {
                $mdUrl = SiteConfig::canonical($route['md_url']);
                $lines[] = '- ['.$route['title'].']('.$mdUrl.'): '.$route['description'];
            }

            $lines[] = '';
        }

        $lines[] = '## Machine-readable';
        $lines[] = '';
        $lines[] = '- [Full content]('.SiteConfig::canonical('/llms-full.txt').'): every page concatenated';
        $lines[] = '- [Markdown catalog]('.SiteConfig::canonical('/api/md/_catalog').')';
        $lines[] = '- [Sitemap]('.SiteConfig::canonical('/sitemap.xml').')';
        $lines[] = '- [AI usage policy]('.SiteConfig::canonical('/ai.txt').')';
        $lines[] = '';
        $lines[] = '## Optional';
        $lines[] = '';
        $lines[] = '- [Terms](https://dvaughnhouse.com/terms): terms for this site and its offers';
        $lines[] = '- [Privacy](https://dvaughnhouse.com/privacy): how this site handles your information';
        $lines[] = '';
        $lines[] = '<!-- keep in sync with /ai.txt and /robots.txt -->';

        return $this->plainText($request, implode("\n", $lines), 'public, s-maxage=86400, stale-while-revalidate=604800');
    }

    /** GET /llms-full.txt — every page, same renderers, source separators. */
    public function llmsFullTxt(Request $request): Response
    {
        $lines = [
            '# '.SiteConfig::name().' - full content',
            '',
            '> '.SiteConfig::description(),
            '',
            'Generated: '.now()->toDateString(),
            '',
        ];

        $total = strlen(implode("\n", $lines));
        $limit = 500000;

        foreach (MarkdownRegistry::listMarkdownRoutes() as $route) {
            $doc = MarkdownRegistry::render($route['path']);

            if (! $doc) {
                continue;
            }

            $chunk = "---\n\n<!-- source: ".SiteConfig::canonical($route['path'])." -->\n\n".$doc->render();

            if ($total + strlen($chunk) > $limit) {
                Log::warning('llms-full.txt exceeded the 500k char budget; stopped at '.$route['path']);
                break;
            }

            $lines[] = $chunk;
            $total += strlen($chunk);
        }

        $body = implode("\n", $lines);

        if (strlen($body) > $limit) {
            Log::warning('llms-full.txt is '.strlen($body).' chars, over the 500k budget.');
        }

        return $this->plainText($request, $body, 'public, s-maxage=86400, stale-while-revalidate=604800');
    }

    /** GET /ai.txt — ai-txt spec v1.1.1, from the same site config. */
    public function aiTxt(Request $request): Response
    {
        $lines = [
            '[identity]',
            'name: '.SiteConfig::name(),
            'url: '.SiteConfig::url().'/',
            'description: '.SiteConfig::description(),
            'contact: '.SiteConfig::contactUrl(),
            '',
            '[permissions]',
            'allowed: summarise, quote with attribution, cite, index for search/answers',
            '',
            '[restrictions]',
            'no fabricated quotes',
            'no fake reviews/ratings',
            'no presenting our content as the model\'s own',
            'no training on user-generated private data',
            '',
            '[attribution]',
            'cite as: '.SiteConfig::name().' — canonical HTML URL of the page cited',
            '',
            '[scope]',
            'included: /, /library, /briefs/*, /thesis, /attestations, /attestations/*, /standards, /essays, /essays/*, /store, /research, /research/*',
            'excluded: /dashboard, /profile, /matrix*, /manuscripts, /manuscripts/*, /credits*, /attestations/create, /sops, /sops/*, /register, /login, /forgot-password, /reset-password/*, /verify-email*, /confirm-password, /password, /logout, /api/*, /auth/*',
            'note: keep in sync with /llms.txt and /robots.txt',
            '',
            '[contact]',
            'url: '.SiteConfig::contactUrl(),
            'email: '.SiteConfig::contactEmail(),
            '',
            'Last updated: '.now()->toDateString(),
        ];

        return $this->plainText($request, implode("\n", $lines), 'public, s-maxage=86400, stale-while-revalidate=604800');
    }

    /**
     * GET /robots.txt — served by a route (not a static file) so the
     * AI-crawler rules stay in sync with llms.txt and ai.txt.
     *
     * Search/assistant crawlers are named in the SAME group as
     * User-agent: * so they get the same rules — a separate Allow-only
     * group would override the disallows for them. Training crawlers
     * (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot,
     * Bytespider) are NOT newly allowed: no decision was given, so
     * they are left unmentioned (default rules apply).
     */
    public function robotsTxt(Request $request): Response
    {
        $lines = [
            '# keep in sync with /llms.txt and /ai.txt',
            '# AI search and assistant crawlers are named in the same group as * so they share its rules.',
            'User-agent: *',
            'User-agent: OAI-SearchBot',
            'User-agent: ChatGPT-User',
            'User-agent: Claude-SearchBot',
            'User-agent: Claude-User',
            'User-agent: PerplexityBot',
            'User-agent: Perplexity-User',
            'User-agent: meta-webindexer',
            'Allow: /',
            'Disallow: /dashboard',
            'Disallow: /profile',
            'Disallow: /matrix',
            'Disallow: /manuscripts',
            'Disallow: /credits',
            'Disallow: /attestations/create',
            'Disallow: /sops',
            'Disallow: /register',
            'Disallow: /login',
            'Disallow: /forgot-password',
            'Disallow: /reset-password',
            'Disallow: /verify-email',
            'Disallow: /confirm-password',
            'Disallow: /password',
            'Disallow: /logout',
            'Disallow: /api/',
            'Disallow: /auth/',
            '',
            '# AI-readable entry points',
            '# llms.txt: '.SiteConfig::canonical('/llms.txt'),
            '# ai.txt: '.SiteConfig::canonical('/ai.txt'),
            '',
            'Sitemap: '.SiteConfig::canonical('/sitemap.xml'),
        ];

        return $this->plainText($request, implode("\n", $lines), 'public, s-maxage=86400');
    }

    /** GET /sitemap.xml — public routes only, real lastmod, no .md URLs. */
    public function sitemapXml(Request $request): Response
    {
        $urls = [];

        foreach (MarkdownRegistry::listMarkdownRoutes() as $route) {
            $doc = MarkdownRegistry::render($route['path']);
            $urls[] = [
                'loc' => SiteConfig::canonical($route['path']),
                'lastmod' => $doc?->updatedAt,
            ];
        }

        $xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

        foreach ($urls as $url) {
            $xml[] = '  <url>';
            $xml[] = '    <loc>'.htmlspecialchars($url['loc'], ENT_XML1).'</loc>';
            if (! empty($url['lastmod'])) {
                $xml[] = '    <lastmod>'.$url['lastmod'].'</lastmod>';
            }
            $xml[] = '  </url>';
        }

        $xml[] = '</urlset>';

        $response = new Response(implode("\n", $xml), 200);
        $response->headers->set('Content-Type', 'application/xml; charset=utf-8');
        $response->headers->set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

        return $response;
    }

    private function plainText(Request $request, string $body, string $cache): Response
    {
        $response = new Response($request->isMethod('HEAD') ? '' : $body, 200);
        $response->headers->set('Content-Type', 'text/plain; charset=utf-8');
        $response->headers->set('Cache-Control', $cache);
        $response->headers->set('Access-Control-Allow-Origin', '*');

        return $response;
    }
}
