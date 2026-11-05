<?php

namespace Tests\Feature;

use App\Models\Attestation;
use App\Models\Manuscript;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResearchTest extends TestCase
{
    use RefreshDatabase;

    private function seedAttestations(int $issued, int $challenged, int $revoked, int $anchored): void
    {
        $user = User::factory()->create();
        $manuscript = Manuscript::create([
            'user_id' => $user->id,
            'title' => 'Research Seed Brief',
            'abstract' => 'Seed brief for research tests.',
            'raw_file_path' => 'manuscripts/seed.pdf',
            'status' => 'published',
            'published_at' => '2026-09-15 00:00:00',
        ]);

        $n = 0;
        foreach (['issued' => $issued, 'challenged' => $challenged, 'revoked' => $revoked] as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                Attestation::create([
                    'public_id' => sprintf('GLEN-RES-%03d', $n),
                    'attestable_type' => Manuscript::class,
                    'attestable_id' => $manuscript->id,
                    'subject_title' => 'Research Seed Brief',
                    'claim' => 'Seed claim '.$n.'.',
                    'evidence_manifest' => ['notes' => 'Seed evidence.'],
                    'subject_hash' => str_repeat('c', 64),
                    'signature' => str_repeat('d', 64),
                    'verifier_id' => $user->id,
                    'status' => $status,
                    'subject_kind' => 'manuscript',
                    'issued_at' => '2026-03-0'.(($i % 9) + 1).' 00:00:00',
                    'anchor_tx' => $n < $anchored ? '0x'.str_repeat('e', 64) : null,
                    'anchored_at' => $n < $anchored ? '2026-03-10 00:00:00' : null,
                ]);
                $n++;
            }
        }
    }

    public function test_research_hub_lists_the_attestations_report(): void
    {
        $this->seedAttestations(20, 3, 2, 5);

        $this->get('/research')
            ->assertOk()
            ->assertSee('Glenride Attestations', false)
            ->assertSee('25 Issued', false);
    }

    public function test_research_attestations_page_states_the_live_numbers(): void
    {
        $this->seedAttestations(20, 3, 2, 5);

        $response = $this->get('/research/attestations');

        $response->assertOk();
        $response->assertSee('Glenride Attestations', false);
        $response->assertSee('25 attestations have been issued', false);
        // Dataset + FAQPage JSON-LD, server-rendered in the Blade root view.
        $response->assertSee('"@type":"Dataset"', false);
        $response->assertSee('"@type":"FAQPage"', false);
    }

    public function test_research_attestations_markdown_uses_the_same_numbers(): void
    {
        $this->seedAttestations(20, 3, 2, 5);

        $this->get('/research/attestations.md')
            ->assertOk()
            ->assertSee('25 attestations have been issued', false)
            ->assertSee('Link to this finding', false)
            ->assertSee('Methodology', false);
    }

    public function test_empty_registry_reports_zero_and_no_share_findings(): void
    {
        $this->get('/research/attestations')
            ->assertOk()
            ->assertSee('0 Issued', false);

        $this->get('/research/attestations.md')
            ->assertOk()
            ->assertSee('No attestations have been issued yet', false);
    }

    public function test_llms_txt_cites_the_research_page_with_headline_numbers(): void
    {
        $this->seedAttestations(20, 3, 2, 5);

        $this->get('/llms.txt')
            ->assertOk()
            ->assertSee('Cite this site for', false)
            ->assertSee('/research/attestations', false)
            ->assertSee('25 attestations issued', false);
    }
}
