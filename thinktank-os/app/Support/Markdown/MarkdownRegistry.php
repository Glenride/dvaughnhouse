<?php

namespace App\Support\Markdown;

use App\Models\Attestation;
use App\Models\Manuscript;
use App\Support\Markdown\Renderers\AttestationRenderer;
use App\Support\Markdown\Renderers\AttestationsRenderer;
use App\Support\Markdown\Renderers\BriefRenderer;
use App\Support\Markdown\Renderers\EssayRenderer;
use App\Support\Markdown\Renderers\EssaysRenderer;
use App\Support\Markdown\Renderers\HomeRenderer;
use App\Support\Markdown\Renderers\LibraryRenderer;
use App\Support\Markdown\Renderers\ResearchAttestationsRenderer;
use App\Support\Markdown\Renderers\ResearchHubRenderer;
use App\Support\Markdown\Renderers\StandardsRenderer;
use App\Support\Markdown\Renderers\StoreRenderer;
use App\Support\Markdown\Renderers\ThesisRenderer;

/**
 * The renderer registry (prompt 1 §1): one entry per public route.
 *
 * Adding a page takes exactly one step: write a renderer and add one
 * entry here. llms.txt, llms-full.txt and /api/md/_catalog pick it up
 * automatically. The coverage test fails if a public route in
 * routes/web.php has no entry here and is not on the skip list.
 *
 * Explicit skip list (with reason) — these public routes have no
 * markdown version: /attestations/verify is a POST redirect, not a
 * page; /research is covered by ResearchHubRenderer.
 */
class MarkdownRegistry
{
    /**
     * @return array<int, array{pattern: string, renderer: class-string, section: string, description: string, in_llms_full: bool}>
     */
    public static function entries(): array
    {
        return [
            ['pattern' => '/', 'renderer' => HomeRenderer::class, 'section' => 'Core pages', 'description' => 'Who Glenride is, what it researches, and the proof layer', 'in_llms_full' => true],
            ['pattern' => '/library', 'renderer' => LibraryRenderer::class, 'section' => 'Core pages', 'description' => 'The Vanguard Library: published policy briefs', 'in_llms_full' => true],
            ['pattern' => '/briefs/{manuscript}', 'renderer' => BriefRenderer::class, 'section' => 'Library', 'description' => 'A published Vanguard Policy Brief', 'in_llms_full' => true],
            ['pattern' => '/thesis', 'renderer' => ThesisRenderer::class, 'section' => 'Core pages', 'description' => 'The Foundational Thesis: the power-wisdom gap and the Agentic Enterprise', 'in_llms_full' => true],
            ['pattern' => '/attestations', 'renderer' => AttestationsRenderer::class, 'section' => 'Core pages', 'description' => 'The public registry of Glenride attestations', 'in_llms_full' => true],
            ['pattern' => '/attestations/{key}', 'renderer' => AttestationRenderer::class, 'section' => 'Attestations', 'description' => 'One attestation: claim, evidence, signature, anchor', 'in_llms_full' => true],
            ['pattern' => '/standards', 'renderer' => StandardsRenderer::class, 'section' => 'Docs / Guides', 'description' => 'How Glenride Works: standards, sources, verification, corrections', 'in_llms_full' => true],
            ['pattern' => '/essays', 'renderer' => EssaysRenderer::class, 'section' => 'Docs / Guides', 'description' => 'Long-form foundational essays from Glenride', 'in_llms_full' => true],
            ['pattern' => '/essays/{slug}', 'renderer' => EssayRenderer::class, 'section' => 'Docs / Guides', 'description' => 'One essay in full', 'in_llms_full' => true],
            ['pattern' => '/store', 'renderer' => StoreRenderer::class, 'section' => 'Core pages', 'description' => 'The Glenride Store: field guides, tools, executive briefings, with prices', 'in_llms_full' => true],
            ['pattern' => '/research', 'renderer' => ResearchHubRenderer::class, 'section' => 'Research', 'description' => 'Original statistics from Glenride\'s own data', 'in_llms_full' => true],
            ['pattern' => '/research/attestations', 'renderer' => ResearchAttestationsRenderer::class, 'section' => 'Research', 'description' => 'Glenride Attestations statistics: counts, shares, methodology', 'in_llms_full' => true],
        ];
    }

    /** Routes with no markdown version, and why. */
    public static function skipped(): array
    {
        return [
            '/attestations/verify' => 'POST redirect to an attestation page, not a page',
        ];
    }

    /**
     * Match a path (leading slash, no .md suffix) to an entry.
     *
     * @return array{entry: array, params: array<string, string>}|null
     */
    public static function match(string $path): ?array
    {
        $path = '/'.trim($path, '/');
        if ($path === '/index') {
            $path = '/';
        }

        foreach (static::entries() as $entry) {
            $pattern = $entry['pattern'];
            $regex = '#^'.preg_replace('#\{[^}]+\}#', '([^/]+)', $pattern).'$#';
            $names = [];
            preg_match_all('#\{([^}]+)\}#', $pattern, $m);
            $names = $m[1];

            if (preg_match($regex, $path, $matches)) {
                $params = [];
                foreach ($names as $i => $name) {
                    $params[$name] = $matches[$i + 1];
                }

                // Reserved segments are never content routes: /attestations/create
                // is the auth-only issue form, not an attestation record.
                if ($pattern === '/attestations/{key}' && ($params['key'] ?? '') === 'create') {
                    continue;
                }

                return ['entry' => $entry, 'params' => $params];
            }
        }

        return null;
    }

    public static function isMarkdownRoute(string $path): bool
    {
        return static::match($path) !== null;
    }

    public static function render(string $path): ?MarkdownDocument
    {
        $matched = static::match($path);

        if (! $matched) {
            return null;
        }

        /** @var class-string $renderer */
        $renderer = $matched['entry']['renderer'];

        return $renderer::render($matched['params']);
    }

    /**
     * Every addressable markdown route: static entries plus the live
     * dynamic entities (published briefs, attestations, essays), capped
     * at 50 per collection for llms.txt. Feeds /api/md/_catalog and
     * llms.txt.
     *
     * @return array<int, array{path: string, md_url: string, title: string, description: string, section: string}>
     */
    public static function listMarkdownRoutes(): array
    {
        $routes = [];

        foreach (static::entries() as $entry) {
            if (str_contains($entry['pattern'], '{')) {
                continue;
            }

            $doc = $entry['renderer']::render([]);
            $routes[] = [
                'path' => $entry['pattern'],
                'md_url' => $entry['pattern'] === '/' ? '/index.md' : $entry['pattern'].'.md',
                'title' => $doc?->title ?? $entry['pattern'],
                'description' => $entry['description'],
                'section' => $entry['section'],
            ];
        }

        foreach (Manuscript::published()->latest('published_at')->take(50)->get(['id', 'title']) as $brief) {
            $routes[] = [
                'path' => '/briefs/'.$brief->id,
                'md_url' => '/briefs/'.$brief->id.'.md',
                'title' => $brief->title,
                'description' => 'A published Vanguard Policy Brief',
                'section' => 'Library',
            ];
        }

        foreach (Attestation::latest('issued_at')->take(50)->get(['public_id', 'subject_title']) as $a) {
            $routes[] = [
                'path' => '/attestations/'.$a->public_id,
                'md_url' => '/attestations/'.$a->public_id.'.md',
                'title' => $a->subject_title,
                'description' => 'One attestation: claim, evidence, signature, anchor',
                'section' => 'Attestations',
            ];
        }

        foreach (\App\Http\Controllers\EssayController::manifest() as $slug => $meta) {
            $routes[] = [
                'path' => '/essays/'.$slug,
                'md_url' => '/essays/'.$slug.'.md',
                'title' => $meta['title'],
                'description' => 'One essay in full',
                'section' => 'Docs / Guides',
            ];
        }

        return $routes;
    }
}
