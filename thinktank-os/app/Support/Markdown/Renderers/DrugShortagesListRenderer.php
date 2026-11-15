<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

/**
 * Source of truth is resources/js/Pages/DrugShortages/List.jsx.
 * Every figure below mirrors that page exactly.
 */
class DrugShortagesListRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        return new MarkdownDocument(
            title: 'Drug Shortage List | Glenride',
            summary: 'The drug shortage list in the United States, explained. FDA and ASHP counts side by side from the latest verified weekly record, retrieved October 19, 2026.',
            path: '/drug-shortages/list',
            updatedAt: '2026-10-19',
            sections: [
                ['body' => "Figures last verified October 19, 2026. The Digest publishes every Monday.\n\nThe drug shortage list in the United States is two lists. The FDA and ASHP lists count current shortages differently, so Glenride reports both side by side in the weekly Digest through 2026 and never merges them into one number."],
                ['heading' => 'The two lists', 'body' => "**ASHP Drug Shortages List**\n\nThe broader list. ASHP publishes shortage bulletins with created and revision dates, so the list shows what is new and what changed. Glenride links to the list and cites its counts. It does not republish bulletin text.\n\nLatest verified count: 192 active bulletins, retrieved October 19, 2026.\n\n".Markdown::link('ASHP Drug Shortages List', 'https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list')."\n\n**FDA Drug Shortages database**\n\nThe official list. The FDA publishes a searchable database of drugs in shortage, built mostly from what manufacturers report, and updates it daily. It counts fewer entries than the ASHP list. That is a difference in what each list counts, not a mistake in either one.\n\nLatest verified reading: 69 of 74 tab entries currently in shortage, retrieved October 19, 2026.\n\n".Markdown::link('FDA Drug Shortages database', 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm')],
                ['heading' => 'The counts, retrieved October 19, 2026', 'body' => "- **192** active ASHP shortage bulletins. Retrieved October 19, 2026. Down 1 net from 193 on October 12, 2026. Source: ASHP current-shortages list.\n- **69 of 74** tab entries currently in shortage on the FDA listing. Retrieved October 19, 2026 at about 8:37 a.m. Eastern. The third consecutive identical reading. Source: FDA drug shortages listing.\n- **227** active shortages in the ASHP quarterly statistic for Q2 2026. No newer quarterly figure was found by the October 19, 2026 run. Source: ASHP quarterly statistics."],
                ['heading' => 'Entry counts are not distinct-drug counts', 'body' => "A bulletin is a drug-product listing, not necessarily a unique active ingredient. The ASHP list counts product-level bulletins and the FDA listing counts tab entries, so their totals were never going to match. Read the full explanation on the comparison page.\n\n".Markdown::link('ASHP vs FDA drug shortage list', '/drug-shortages/ashp-vs-fda')],
                ['heading' => 'How often the list changes', 'body' => "Weekly, in the Digest. Every Monday, Glenride publishes the weekly U.S. drug shortage digest, built from FDA and ASHP data. The digest is the record. This page is the map to it.\n\nThe FDA database itself is updated daily, and ASHP bulletins carry created and revision dates, so both lists move between Digest editions. The counts on this page are the latest verified weekly retrieval, not a live feed.\n\n".Markdown::link('The Glenride Drug-Shortage Digest', '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb')."\n\n".Markdown::link('Weekly Drug-Shortage Digest, week of October 12 to 19, 2026', 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/')],
                ['heading' => 'Keep reading', 'body' => '- '.Markdown::link('Current Drug Shortages', '/drug-shortages/current')." The latest verified weekly record, what changed this week, and what is not yet verified.\n- ".Markdown::link('FDA Drug Shortage List', '/drug-shortages/fda-list')." What the FDA list says, what it counts, and what it does not show.\n- ".Markdown::link('ASHP vs FDA Drug Shortage List', '/drug-shortages/ashp-vs-fda').' Why the two lists disagree, what each one counts, and how Glenride reads them together.'],
                ['heading' => 'About these figures', 'body' => 'Figures on this page are for research citation only. A shortage listing is not a pharmacy-stock check, and nothing here is clinical guidance. If a drug you need is in shortage, talk to your pharmacist or clinician. Glenride is an independent, AI-native think tank. AI prepares. Humans decide.'],
            ],
            related: [
                ['text' => 'Current Drug Shortages', 'path' => '/drug-shortages/current'],
                ['text' => 'FDA Drug Shortage List', 'path' => '/drug-shortages/fda-list'],
                ['text' => 'ASHP vs FDA Drug Shortage List', 'path' => '/drug-shortages/ashp-vs-fda'],
                ['text' => 'Home', 'path' => '/'],
            ],
        );
    }
}
