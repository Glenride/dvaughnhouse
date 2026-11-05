<?php

namespace App\Support\Markdown\Renderers;

use App\Http\Controllers\StoreController;
use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

/**
 * The store catalog, from the same StoreController data as the HTML
 * storefront — same products, same prices, same statuses. Prices as of
 * October 2026, updated October 19, 2026 (per the storefront).
 */
class StoreRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        $catalog = (new StoreController)->publicCatalog();
        $products = $catalog['products'];
        $faq = $catalog['faqAnswer'];

        $sections = [];
        $sections[] = ['heading' => 'What the store is', 'body' => 'Field guides from Reynard\'s, tools and publications from Glenride, and executive briefings for institutions. Every listing tells you exactly what you get — no product takes payment before its price and terms are published.'];

        $byCategory = [];
        foreach ($products as $p) {
            $byCategory[$p['category']][] = $p;
        }

        foreach ($catalog['categories'] as $category) {
            $lines = [];
            foreach ($byCategory[$category['id']] ?? [] as $p) {
                $line = '- **'.$p['name'].'** — '.$p['tagline'];
                if (! empty($p['priceLabel'])) {
                    $line .= ' — '.$p['priceLabel'];
                }
                $line .= ' ('.$p['statusLabel'].'). '.$p['description'];
                $lines[] = $line;
            }

            $sections[] = ['heading' => $category['name'].' — '.$category['tagline'], 'body' => implode("\n", $lines)];
        }

        $sections[] = ['heading' => 'Frequently asked questions', 'body' => "### What can I buy from the store?\n\n".$faq];

        return new MarkdownDocument(
            title: 'The Glenride Store',
            summary: 'Everything has a price. Nothing is promised. Field guides from Reynard\'s, tools and publications from Glenride, and executive briefings for institutions.',
            path: '/store',
            updatedAt: '2026-10-19',
            sections: $sections,
            related: [
                ['text' => 'Home', 'path' => '/'],
                ['text' => 'Vanguard Library', 'path' => '/library'],
                ['text' => 'Glenride App Store', 'path' => 'https://glenride-app-store.pages.dev'],
            ],
        );
    }
}
