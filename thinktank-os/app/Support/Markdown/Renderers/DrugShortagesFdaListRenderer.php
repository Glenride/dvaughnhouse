<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

/**
 * Source of truth is resources/js/Pages/DrugShortages/FdaList.jsx.
 * Every figure below mirrors that page exactly.
 */
class DrugShortagesFdaListRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        return new MarkdownDocument(
            title: 'FDA Drug Shortage List | Glenride',
            summary: 'The FDA drug shortage list, explained. What the FDA counts, how it differs from ASHP, and the latest verified reading, retrieved October 19, 2026.',
            path: '/drug-shortages/fda-list',
            updatedAt: '2026-10-19',
            sections: [
                ['body' => "Figures last verified October 19, 2026. The Digest publishes every Monday.\n\nThe FDA drug shortage list is the federal record of current drug shortages in the United States. In 2026 it counts fewer entries than the ASHP list, because the two lists count different things, and Glenride reads the FDA listing every week for the weekly Digest."],
                ['heading' => 'What the FDA list says right now', 'body' => "- **69 of 74** tab entries currently in shortage on the FDA listing. Retrieved October 19, 2026 at about 8:37 a.m. Eastern. The third consecutive identical reading, after October 5 and October 12, 2026. Source: FDA drug shortages listing.\n\nThe Current/Resolved Shortages tab showed 69 entries currently in shortage, filtered from 74 total entries. The digest records the reading. It does not interpret whether the repeated reading reflects genuine stability or a listing that updates on its own schedule."],
                ['heading' => 'What the FDA list is', 'body' => "The FDA Drug Shortages database is the FDA's own searchable list of drugs in shortage. Most of the information comes from manufacturers, and the FDA updates the database daily. You can search it by generic name and see each listing's status and dates. The statuses are Currently in Shortage, Resolved, and Discontinuation.\n\n".Markdown::link('FDA Drug Shortages database', 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm')."\n\n".Markdown::link('FDA Drug Shortages FAQ', 'https://accessdata.fda.gov/scripts/drugshortages/dsp_faq.cfm')." The FDA's own answers on where the list comes from and how it works."],
                ['heading' => 'What it does not show', 'body' => "The FDA list is narrower than the ASHP list. The FDA's program focuses on shortages of medically necessary products. Shortages expected to resolve quickly, shortages involving only one strength or package size, and shortages where a substitute strength or package size is available are not usually the focus of the FDA program. A drug can be on the ASHP list and not on the FDA list, and the other way around. If you only watch the FDA list, you are watching part of the shortage picture.\n\n".Markdown::link('ASHP vs FDA drug shortage list', '/drug-shortages/ashp-vs-fda')],
                ['heading' => 'How Glenride reads the FDA listing', 'body' => "The October 19, 2026 reading comes from a live-browser check of the Current/Resolved Shortages tab. A plain text fetch of the same page returns a 404. That is a fetch-method artifact, not evidence the page is down, and it has appeared on prior runs as well.\n\nThe full edition behind this reading is the weekly Digest for the week of October 12 to 19, 2026.\n\n".Markdown::link('Weekly Drug-Shortage Digest, week of October 12 to 19, 2026', 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/')."\n\n".Markdown::link('The Glenride Drug-Shortage Digest', '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb')],
                ['heading' => 'Keep reading', 'body' => '- '.Markdown::link('Current Drug Shortages', '/drug-shortages/current')." The latest verified weekly record, what changed this week, and what is not yet verified.\n- ".Markdown::link('Drug Shortage List', '/drug-shortages/list')." The U.S. drug shortage list, explained. The two lists, the counts, and how often they change.\n- ".Markdown::link('ASHP vs FDA Drug Shortage List', '/drug-shortages/ashp-vs-fda').' Why the two lists disagree, what each one counts, and how Glenride reads them together.'],
                ['heading' => 'About these figures', 'body' => 'Figures on this page are for research citation only. A shortage listing is not a pharmacy-stock check, and nothing here is clinical guidance. If a drug you need is in shortage, talk to your pharmacist or clinician. Glenride is an independent, AI-native think tank. AI prepares. Humans decide.'],
            ],
            related: [
                ['text' => 'Current Drug Shortages', 'path' => '/drug-shortages/current'],
                ['text' => 'Drug Shortage List', 'path' => '/drug-shortages/list'],
                ['text' => 'ASHP vs FDA Drug Shortage List', 'path' => '/drug-shortages/ashp-vs-fda'],
                ['text' => 'Home', 'path' => '/'],
            ],
        );
    }
}
