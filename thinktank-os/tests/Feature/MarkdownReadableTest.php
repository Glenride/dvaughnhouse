<?php

namespace Tests\Feature;

use App\Models\Attestation;
use App\Models\Manuscript;
use App\Models\User;
use App\Support\Markdown\MarkdownRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarkdownReadableTest extends TestCase
{
    use RefreshDatabase;

    private function seedPublicData(): array
    {
        $user = User::factory()->create();

        $manuscript = Manuscript::create([
            'user_id' => $user->id,
            'title' => 'Test Brief on Supply Chains',
            'abstract' => 'A test abstract about supply chains.',
            'raw_file_path' => 'manuscripts/test.pdf',
            'status' => 'published',
            'word_count' => 1200,
            'published_at' => '2026-09-15 00:00:00',
        ]);

        $draft = Manuscript::create([
            'user_id' => $user->id,
            'title' => 'Unpublished Draft',
            'abstract' => 'Not public yet.',
            'raw_file_path' => 'manuscripts/draft.pdf',
            'status' => 'submitted',
        ]);

        $attestation = Attestation::create([
            'public_id' => 'GLEN-TEST-001',
            'attestable_type' => Manuscript::class,
            'attestable_id' => $manuscript->id,
            'subject_title' => 'Test Brief on Supply Chains',
            'claim' => 'This brief was verified by Glenride.',
            'evidence_manifest' => ['notes' => 'Checked against primary sources.'],
            'subject_hash' => str_repeat('a', 64),
            'signature' => str_repeat('b', 64),
            'verifier_id' => $user->id,
            'issuer_name' => 'Glenride',
            'method' => 'editorial_review_v1',
            'status' => 'issued',
            'issued_at' => '2026-09-16 00:00:00',
        ]);

        return compact('manuscript', 'draft', 'attestation');
    }

    public function test_md_suffix_returns_markdown_with_headers(): void
    {
        $response = $this->get('/standards.md');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/markdown; charset=utf-8');
        $response->assertHeader('X-Robots-Tag', 'noindex, follow');
        $response->assertHeader('Content-Location', 'https://dvaughnhouse.org/standards');
        $this->assertNotEmpty($response->headers->get('X-Markdown-Tokens'));
        $response->assertSee('# How Glenride Works', false);
        $response->assertSee('Canonical: https://dvaughnhouse.org/standards', false);
    }

    public function test_homepage_md_is_index_md(): void
    {
        $this->get('/index.md')->assertOk()->assertSee('# Glenride', false);
    }

    public function test_accept_markdown_negotiation_serves_markdown(): void
    {
        $response = $this->get('/standards', ['Accept' => 'text/markdown']);

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/markdown; charset=utf-8');
    }

    public function test_accept_markdown_with_lower_q_than_html_serves_html(): void
    {
        $response = $this->get('/standards', ['Accept' => 'text/html;q=0.9, text/markdown;q=0.5']);

        $response->assertOk();
        $this->assertStringContainsString('text/html', $response->headers->get('Content-Type'));
    }

    public function test_wildcard_accept_serves_html(): void
    {
        $response = $this->get('/standards', ['Accept' => '*/*']);

        $response->assertOk();
        $this->assertStringContainsString('text/html', $response->headers->get('Content-Type'));
    }

    public function test_unknown_md_returns_markdown_404(): void
    {
        $response = $this->get('/does-not-exist.md');

        $response->assertNotFound();
        $response->assertHeader('Content-Type', 'text/markdown; charset=utf-8');
        $response->assertSee('# Not found', false);
    }

    public function test_unpublished_brief_has_no_markdown(): void
    {
        ['draft' => $draft] = $this->seedPublicData();

        $this->get('/briefs/'.$draft->id.'.md')->assertNotFound();
    }

    public function test_published_brief_and_attestation_markdown_use_real_data(): void
    {
        ['manuscript' => $manuscript, 'attestation' => $attestation] = $this->seedPublicData();

        $this->get('/briefs/'.$manuscript->id.'.md')
            ->assertOk()
            ->assertSee('Test Brief on Supply Chains', false)
            ->assertSee('A test abstract about supply chains.', false);

        $this->get('/attestations/GLEN-TEST-001.md')
            ->assertOk()
            ->assertSee('This brief was verified by Glenride.', false)
            ->assertSee('GLEN-TEST-001', false);
    }

    public function test_api_md_returns_markdown_and_catalog_lists_routes(): void
    {
        $this->seedPublicData();

        $this->get('/api/md/standards')->assertOk()->assertSee('# How Glenride Works', false);

        $catalog = $this->get('/api/md/_catalog')->assertOk()->json();
        $paths = array_column($catalog['routes'], 'path');

        $this->assertContains('/standards', $paths);
        $this->assertContains('/research/attestations', $paths);
        $this->assertContains('/essays/power-wisdom-gap', $paths);
    }

    public function test_llms_txt_is_generated_from_the_registry(): void
    {
        $response = $this->get('/llms.txt');

        $response->assertOk();
        $response->assertSee('# Glenride', false);
        $response->assertSee('## Cite this site for', false);
        $response->assertSee('/standards.md', false);
        $response->assertSee('/llms-full.txt', false);
    }

    public function test_llms_full_txt_concatenates_pages_with_sources(): void
    {
        $response = $this->get('/llms-full.txt');

        $response->assertOk();
        $response->assertSee('<!-- source: https://dvaughnhouse.org/standards -->', false);
        $this->assertLessThanOrEqual(500000, strlen($response->getContent()));
    }

    public function test_ai_txt_has_identity_permissions_restrictions(): void
    {
        $response = $this->get('/ai.txt');

        $response->assertOk();
        $response->assertSee('[identity]', false);
        $response->assertSee('[permissions]', false);
        $response->assertSee('[restrictions]', false);
        $response->assertSee('no fabricated quotes', false);
        $response->assertSee('[scope]', false);
    }

    public function test_robots_txt_allows_search_bots_and_disallows_private_paths(): void
    {
        $response = $this->get('/robots.txt');

        $response->assertOk();
        $response->assertSee('OAI-SearchBot', false);
        $response->assertSee('Claude-SearchBot', false);
        $response->assertSee('Disallow: /dashboard', false);
        $response->assertSee('Disallow: /sops', false);
        $response->assertSee('Sitemap: https://dvaughnhouse.org/sitemap.xml', false);
        // Training crawlers are NOT newly allowed (no decision given).
        $response->assertDontSee('GPTBot', false);
        $response->assertDontSee('ClaudeBot', false);
    }

    public function test_sitemap_has_public_routes_but_no_md_urls(): void
    {
        $this->seedPublicData();

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertSee('https://dvaughnhouse.org/standards', false);
        $response->assertSee('https://dvaughnhouse.org/research/attestations', false);
        $response->assertDontSee('.md', false);
    }

    public function test_homepage_html_carries_organization_json_ld_and_describedby_link(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('"@type":"Organization"', false);
        $response->assertSee('"@type":"WebSite"', false);
        $this->assertStringContainsString('/llms.txt', (string) $response->headers->get('Link'));
    }

    public function test_homepage_html_carries_server_rendered_ai_summary_and_markdown_alternate(): void
    {
        // The app has no SSR, so ai-summary and the markdown alternate are
        // rendered by the Blade root view — they must be in the raw HTML,
        // not only in React <Head> (which only runs in the browser).
        $this->get('/')
            ->assertOk()
            ->assertSee('<meta name="ai-summary"', false)
            ->assertSee('<link rel="alternate" type="text/markdown" href="https://dvaughnhouse.org/index.md">', false);
    }

    public function test_login_page_carries_no_ai_signals(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertDontSee('ai-summary', false);
    }

    public function test_every_registered_static_route_has_a_renderer(): void
    {
        foreach (MarkdownRegistry::entries() as $entry) {
            if (str_contains($entry['pattern'], '{')) {
                continue;
            }

            $this->assertNotNull(
                MarkdownRegistry::render($entry['pattern']),
                'No markdown renderer for '.$entry['pattern']
            );
        }
    }

    public function test_private_routes_are_not_markdown_routes(): void
    {
        foreach (['/dashboard', '/profile', '/sops', '/manuscripts', '/credits', '/attestations/create'] as $path) {
            $this->assertFalse(MarkdownRegistry::isMarkdownRoute($path), $path.' must never be a markdown route');
        }
    }
}
