<?php

namespace App\Support\Markdown;

use App\Support\SiteConfig;
use Carbon\CarbonInterface;

/**
 * Shared markdown formatting helpers for every renderer.
 *
 * All internal links point at the canonical HTML URL, never the .md one,
 * and all dates are real dates from the underlying record.
 */
class Markdown
{
    public static function esc(string $text): string
    {
        return str_replace(['\\', '[', ']'], ['\\\\', '\\[', '\\]'], $text);
    }

    public static function link(string $text, string $pathOrUrl): string
    {
        $url = str_starts_with($pathOrUrl, 'http') ? $pathOrUrl : SiteConfig::canonical($pathOrUrl);

        return '['.static::esc($text).']('.$url.')';
    }

    public static function date(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof CarbonInterface) {
            return $value->format('Y-m-d');
        }

        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    /** One decimal place, no trailing noise: 66.7, 100, 0. */
    public static function pct(float $share): string
    {
        $rounded = round($share, 1);

        return rtrim(rtrim(number_format($rounded, 1, '.', ''), '0'), '.');
    }

    /** A two-column label/value table, as used by the at-a-glance blocks. */
    public static function definitionTable(array $rows): string
    {
        $out = ["| Fact | Value |", "| --- | --- |"];

        foreach ($rows as $label => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $out[] = '| '.str_replace('|', '\\|', (string) $label).' | '.str_replace('|', '\\|', (string) $value).' |';
        }

        return implode("\n", $out);
    }

    /** Strip HTML tags and collapse whitespace for use in plain markdown. */
    public static function plainText(string $html): string
    {
        $text = strip_tags(str_replace(['</p>', '</li>', '</h1>', '</h2>', '</h3>', '<br>', '<br/>'], "\n", $html));

        return trim((string) preg_replace('/[ \t]+/', ' ', html_entity_decode($text, ENT_QUOTES | ENT_HTML5)));
    }
}
