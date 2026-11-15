<?php

namespace App\Support\Markdown;

use App\Support\SiteConfig;

/**
 * One markdown page: title, summary, canonical URL, last-updated date,
 * body sections, and related links. Rendered identically by the .md
 * endpoint, content negotiation, /api/md/*, and llms-full.txt.
 */
class MarkdownDocument
{
    /** @param array<int, array{heading?: string|null, body: string}> $sections */
    public function __construct(
        public readonly string $title,
        public readonly string $summary,
        public readonly string $path,
        public readonly ?string $updatedAt = null,
        public readonly array $sections = [],
        /** @var array<int, array{text: string, path: string}> */
        public readonly array $related = [],
    ) {}

    public function canonicalUrl(): string
    {
        return SiteConfig::canonical($this->path);
    }

    public function markdownUrl(): string
    {
        $path = $this->path === '/' ? '/index' : $this->path;

        return SiteConfig::canonical($path.'.md');
    }

    public function render(): string
    {
        $lines = ['# '.$this->title, ''];

        if ($this->summary !== '') {
            $lines[] = '> '.$this->summary;
            $lines[] = '';
        }

        $lines[] = 'Canonical: '.$this->canonicalUrl();
        $lines[] = 'Last updated: '.($this->updatedAt ?? 'unknown');
        $lines[] = '';

        foreach ($this->sections as $section) {
            if (! empty($section['heading'])) {
                $lines[] = '## '.$section['heading'];
                $lines[] = '';
            }

            $lines[] = $section['body'];
            $lines[] = '';
        }

        if ($this->related !== []) {
            $lines[] = '## Related';
            $lines[] = '';

            foreach ($this->related as $link) {
                $lines[] = '- '.Markdown::link($link['text'], $link['path']);
            }

            $lines[] = '';
        }

        return implode("\n", $lines);
    }

    public function tokens(): int
    {
        return (int) ceil(strlen($this->render()) / 4);
    }
}
