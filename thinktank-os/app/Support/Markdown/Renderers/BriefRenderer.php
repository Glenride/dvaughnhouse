<?php

namespace App\Support\Markdown\Renderers;

use App\Models\Manuscript;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * A published brief. Markdown is public-only: unpublished manuscripts
 * return null (markdown 404), even though the HTML page allows an
 * editorial preview for authorised users.
 */
class BriefRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $key = $params['manuscript'] ?? '';
        $model = null;

        if ($key === 'featured-monograph-1') {
            $model = Manuscript::with('user:id,name,email')
                ->where('title', 'Autonomous Agentic Governance in High-Assurance Sectors')
                ->first();

            if (! $model) {
                $model = new Manuscript([
                    'title' => 'Autonomous Agentic Governance in High-Assurance Sectors',
                    'abstract' => 'A strategic framework addressing the latency gap between rapid algorithmic decision-making and human moral verification across clinical trial data pipelines and defense infrastructure.',
                    'status' => 'published',
                    'word_count' => 940,
                    'published_at' => '2026-09-15 00:00:00',
                ]);
                $model->id = 'featured-monograph-1';
                $defaultAuthor = \App\Models\User::where('name', "D'Vaughn House")->first()
                    ?? new \App\Models\User(['name' => "D'Vaughn House", 'email' => 'host@centersun21.com']);
                $model->setRelation('user', $defaultAuthor);
            }
        } elseif (Str::isUuid($key)) {
            $model = Manuscript::with('user:id,name,email')->find($key);
        }

        if (! $model || $model->status !== 'published') {
            return null;
        }

        $content = '';
        if ($model->synthesized_brief_path && Storage::disk('local')->exists($model->synthesized_brief_path)) {
            $content = Storage::disk('local')->get($model->synthesized_brief_path);
        }

        $attestation = $model->exists ? $model->activeAttestation() : null;
        $record = $model->exists ? $model->latestRecord : null;
        $author = $model->user?->name ?? 'Glenride Fellow';
        $year = $model->published_at ? $model->published_at->format('Y') : '2026';
        $readTime = max(1, (int) ceil(($model->word_count ?: ($content !== '' ? str_word_count($content) : 850)) / 220));

        $atAGlance = Markdown::definitionTable([
            'Author' => $author,
            'Published' => Markdown::date($model->published_at),
            'Word count' => $model->word_count ? (string) $model->word_count : null,
            'Reading time' => $readTime.' min',
            'Status' => 'Published',
            'Attestation' => $attestation ? $attestation->public_id.' ('.$attestation->status.')' : null,
            'SpinWave record' => $record ? 'v'.$record->version : null,
        ]);

        $sections = [
            ['heading' => 'At a glance', 'body' => $atAGlance],
        ];

        if ($model->abstract) {
            $sections[] = ['heading' => 'Executive abstract', 'body' => $model->abstract];
        }

        if ($content !== '') {
            $sections[] = ['heading' => 'Brief', 'body' => $content];
        }

        $related = Manuscript::published()
            ->when($model->exists, fn ($q) => $q->where('id', '!=', $model->id))
            ->latest('published_at')
            ->take(3)
            ->get();

        $relatedLinks = [['text' => 'Vanguard Library', 'path' => '/library']];
        foreach ($related as $other) {
            $relatedLinks[] = ['text' => $other->title, 'path' => '/briefs/'.$other->id];
        }
        if ($attestation) {
            $relatedLinks[] = ['text' => 'Attestation '.$attestation->public_id, 'path' => '/attestations/'.$attestation->public_id];
        }

        return new MarkdownDocument(
            title: $model->title,
            summary: $model->abstract ?? 'A published Vanguard Policy Brief from Glenride.',
            path: '/briefs/'.$key,
            updatedAt: Markdown::date($model->published_at),
            sections: array_merge($sections, [
                ['heading' => 'Citation', 'body' => "{$author} ({$year}). \"{$model->title}\". Glenride Institutional Monographs, Document ID: {$model->id}."],
            ]),
            related: $relatedLinks,
        );
    }
}
