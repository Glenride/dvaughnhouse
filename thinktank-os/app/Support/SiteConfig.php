<?php

namespace App\Support;

use Illuminate\Support\Facades\Config;

/**
 * Single source of truth for Glenride site identity.
 *
 * Everything AI-facing (llms.txt, ai.txt, robots.txt, sitemap, markdown
 * pages, JSON-LD) reads config('site.*') through here, so the facts in
 * those files can never drift apart.
 */
class SiteConfig
{
    public static function name(): string
    {
        return (string) Config::get('site.name', 'Glenride');
    }

    public static function fullName(): string
    {
        return (string) Config::get('site.full_name', static::name());
    }

    public static function url(): string
    {
        return rtrim((string) Config::get('site.url', 'https://dvaughnhouse.org'), '/');
    }

    public static function description(): string
    {
        return (string) Config::get('site.description', '');
    }

    public static function contactUrl(): string
    {
        return (string) Config::get('site.contact_url', 'https://dvaughnhouse.com/#contact');
    }

    public static function contactEmail(): string
    {
        return (string) Config::get('site.contact_email', '');
    }

    /** Absolute canonical URL for a site path (leading slash optional). */
    public static function canonical(string $path = '/'): string
    {
        $path = '/'.ltrim($path, '/');

        return $path === '/' ? static::url().'/' : static::url().$path;
    }

    /** Absolute URL for a public asset path, or null when there is none. */
    public static function assetUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return static::url().'/'.ltrim($path, '/');
    }

    /**
     * Organization + WebSite JSON-LD for the homepage, built from the
     * same config as llms.txt and ai.txt. Logo is omitted when no logo
     * file ships in the repo — never claim an asset that is not there.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function organizationJsonLd(): array
    {
        $org = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => static::name(),
            'url' => static::url().'/',
            'description' => static::description(),
            'founder' => [
                '@type' => 'Person',
                'name' => (string) Config::get('site.founder', "D'Vaughn House"),
                'jobTitle' => (string) Config::get('site.founder_title', ''),
            ],
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'url' => static::contactUrl(),
                'contactType' => 'general',
            ],
        ];

        if ($logo = static::assetUrl(Config::get('site.logo'))) {
            $org['logo'] = $logo;
        }

        if ($sameAs = Config::get('site.same_as', [])) {
            $org['sameAs'] = $sameAs;
        }

        return [
            $org,
            [
                '@context' => 'https://schema.org',
                '@type' => 'WebSite',
                'name' => static::fullName(),
                'url' => static::url().'/',
                'description' => static::description(),
                'publisher' => ['@type' => 'Organization', 'name' => static::name(), 'url' => static::url().'/'],
            ],
        ];
    }

    /** JSON-LD string safe to drop inside a <script> tag (matches the store pattern). */
    public static function organizationJsonLdString(): string
    {
        $json = json_encode(static::organizationJsonLd(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return str_replace('</script', '<\/script', (string) $json);
    }

    /**
     * Server-rendered AI head signals for a page (prompt 1 §6):
     * ai-summary meta + markdown alternate link.
     *
     * This app has no SSR, so React <Head> alone would only reach
     * crawlers that run JS. These signals are rendered by the Blade
     * root view into the raw HTML, from the same facts as the markdown
     * documents. Returns null for non-public pages (auth, dashboard,
     * admin) — they get no AI head signals.
     *
     * @param array{component?: string, props?: array<string, mixed>} $page
     * @return array{summary: string, md_url: string}|null
     */
    public static function headSignals(array $page): ?array
    {
        $component = $page['component'] ?? null;
        $props = $page['props'] ?? [];
        $base = static::url();

        $static = [
            'Home/Landing' => ['Glenride is an independent, AI-native think tank. We find where critical systems break before the break becomes harm — and we publish a record anyone can check: supply chains, pharmaceutical data, and enterprise software systems.', '/index.md'],
            'Library/Index' => ["The Vanguard Library is Glenride's public reading room: published policy briefs, each with its evidence, verifier, and date.", '/library.md'],
            'Library/Thesis' => ['The Foundational Thesis: two essays on why technological velocity has outpaced institutional wisdom, and how human moral judgment must anchor autonomous execution.', '/thesis.md'],
            'Attestations/Index' => ['The public registry of Glenride attestations: every attested work carries a signed record with its claim, evidence, verifier, and timestamp — open to verification or challenge.', '/attestations.md'],
            'Essays/Index' => ["Long-form foundational writing from Glenride: the flagship essay and founder's thesis on the power-wisdom gap and independent infrastructure.", '/essays.md'],
            'Standards/Show' => ['How Glenride Works: how Glenride uses AI, sources and verifies, corrects mistakes, and what it will not do — in plain language.', '/standards.md'],
            'Store/Index' => ["The Glenride Store: field guides from Reynard's, tools and publications from Glenride, and executive briefings for institutions. Everything has a price; nothing is promised. Prices as of October 2026.", '/store.md'],
            'Research/Index' => ["Glenride research: original statistics from Glenride's own data, one page per dataset, every number computed from the live record with methodology and a suggested citation.", '/research.md'],
        ];

        if (isset($static[$component])) {
            return ['summary' => $static[$component][0], 'md_url' => $base.$static[$component][1]];
        }

        switch ($component) {
            case 'Library/Show':
                $m = $props['manuscript'] ?? [];
                if (empty($m['id'])) {
                    return null;
                }

                return [
                    'summary' => $m['abstract'] ?? ($m['title'].' — a published Vanguard Policy Brief from Glenride.'),
                    'md_url' => $base.'/briefs/'.$m['id'].'.md',
                ];

            case 'Attestations/Show':
                $a = $props['attestation'] ?? [];
                if (empty($a['public_id'])) {
                    return null;
                }

                return [
                    'summary' => 'Glenride attestation '.$a['public_id'].' ('.$a['status'].'): '.$a['subject_title'].'. '.$a['claim'],
                    'md_url' => $base.'/attestations/'.$a['public_id'].'.md',
                ];

            case 'Essays/Show':
                $d = $props['document'] ?? [];
                if (empty($d['slug']) || empty($d['description'])) {
                    return null;
                }

                return [
                    'summary' => $d['description'],
                    'md_url' => $base.'/essays/'.$d['slug'].'.md',
                ];

            case 'Research/Attestations':
                $s = $props['study'] ?? [];
                if (empty($s['headline'])) {
                    return null;
                }

                return [
                    'summary' => $s['headline'],
                    'md_url' => $base.'/research/attestations.md',
                ];

            default:
                return null;
        }
    }
}
