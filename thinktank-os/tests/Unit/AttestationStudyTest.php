<?php

namespace Tests\Unit;

use App\Support\Markdown\AttestationStudy;
use PHPUnit\Framework\TestCase;

class AttestationStudyTest extends TestCase
{
    /** @return array<int, array{status: string, anchored: bool, subject_kind: string, issued_at: string}> */
    private function rows(int $issued, int $challenged, int $revoked, int $anchored = 0): array
    {
        $rows = [];
        $n = 0;

        foreach (['issued' => $issued, 'challenged' => $challenged, 'revoked' => $revoked] as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                $rows[] = [
                    'status' => $status,
                    'anchored' => $n < $anchored,
                    'subject_kind' => $i % 2 === 0 ? 'manuscript' : 'report',
                    'issued_at' => '2026-03-0'.(($i % 9) + 1),
                ];
                $n++;
            }
        }

        return $rows;
    }

    public function test_shares_add_up_to_100(): void
    {
        $study = AttestationStudy::computeStudy($this->rows(20, 5, 5, 10));

        $this->assertSame(30, $study['total']);
        $this->assertEqualsWithDelta(100.0, array_sum($study['shares']), 0.01);
        $this->assertSame(25, $study['in_force']);
    }

    public function test_status_counts_do_not_overlap(): void
    {
        $study = AttestationStudy::computeStudy($this->rows(12, 4, 4, 3));

        $this->assertSame(
            $study['total'],
            $study['by_status']['issued'] + $study['by_status']['challenged'] + $study['by_status']['revoked']
        );
    }

    public function test_comparison_flips_with_the_data(): void
    {
        $mostlyIssued = AttestationStudy::computeStudy($this->rows(25, 2, 0));
        $mostlyChallenged = AttestationStudy::computeStudy($this->rows(2, 25, 0));

        $byId = fn (array $study) => array_column($study['findings'], 'text', 'id');

        $this->assertStringContainsString('issued attestations outnumber challenged ones', $byId($mostlyIssued)['issued-vs-challenged']);
        $this->assertStringContainsString('challenged attestations outnumber issued ones', $byId($mostlyChallenged)['issued-vs-challenged']);
    }

    public function test_small_gaps_are_about_the_same(): void
    {
        $study = AttestationStudy::computeStudy($this->rows(11, 10, 0));
        $byId = array_column($study['findings'], 'text', 'id');

        $this->assertStringContainsString('about the same', $byId['issued-vs-challenged']);
    }

    public function test_thin_data_produces_no_share_findings(): void
    {
        $study = AttestationStudy::computeStudy($this->rows(3, 1, 0));

        $this->assertTrue($study['thin']);
        $this->assertCount(1, $study['findings']);
        $this->assertSame('total-attestations', $study['findings'][0]['id']);
    }

    public function test_finding_anchors_are_unique(): void
    {
        $study = AttestationStudy::computeStudy($this->rows(20, 5, 5, 10));
        $ids = array_column($study['findings'], 'id');

        $this->assertSame($ids, array_unique($ids));
    }

    public function test_empty_registry_headline_states_zero(): void
    {
        $study = AttestationStudy::computeStudy([]);

        $this->assertSame(0, $study['total']);
        $this->assertStringContainsString('No attestations have been issued yet', AttestationStudy::headline($study));
    }
}
