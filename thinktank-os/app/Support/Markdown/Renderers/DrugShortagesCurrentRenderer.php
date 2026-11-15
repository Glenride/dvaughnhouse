<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

/**
 * Source of truth is resources/js/Pages/DrugShortages/Current.jsx.
 * Every figure below mirrors that page exactly.
 */
class DrugShortagesCurrentRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        return new MarkdownDocument(
            title: 'Current Drug Shortages | Glenride',
            summary: 'Current drug shortages in the United States, from the latest verified weekly record. FDA and ASHP counts retrieved October 19, 2026, in the Glenride weekly Digest.',
            path: '/drug-shortages/current',
            updatedAt: '2026-10-19',
            sections: [
                ['body' => "Figures last verified October 19, 2026. The Digest publishes every Monday.\n\nCurrent drug shortages in the United States, measured the same way every week. The latest verified record below comes from the FDA and ASHP lists retrieved October 19, 2026, and the Glenride weekly Digest is the record that carries each new retrieval through 2026."],
                ['heading' => 'A weekly record, not a live feed', 'body' => "The counts on this page are the latest verified weekly retrieval, dated October 19, 2026. They do not update between Digest editions. For the daily record, see the daily drug-shortage tracker.\n\n".Markdown::link('Daily drug-shortage tracker', 'https://drugs.dvaughnhouse.com/')],
                ['heading' => 'The latest verified counts', 'body' => "- **192** active ASHP shortage bulletins. Retrieved October 19, 2026. Down 1 net from 193 on October 12, 2026. Source: ASHP current-shortages list.\n- **69 of 74** tab entries currently in shortage on the FDA listing. Retrieved October 19, 2026 at about 8:37 a.m. Eastern. The third consecutive identical reading. Source: FDA drug shortages listing.\n- **227** active shortages in the ASHP quarterly statistic for Q2 2026. No newer quarterly figure was found by the October 19, 2026 run. Source: ASHP quarterly statistics.\n- **48%** of new 2026 shortages involve a product made by a single manufacturer. July 2026 AJMC aggregate for the 2026 cohort. This is a standing aggregate, not a new weekly reading. Source: AJMC, July 2026."],
                ['heading' => 'What changed in the week of October 12 to 19, 2026', 'body' => "New: adalimumab-adbm subcutaneous injection. Bulletin created October 15, 2026, and verified new since the October 12 retrieval. Adalimumab-adbm is Cyltezo, a biosimilar biologic presentation. The identity was verified against an FDA announcement consulted October 22, 2026.\n\nBoundary case: irinotecan hydrochloride injection. Bulletin created October 12, 2026. It may post-date the prior week retrieval, so it is carried as a boundary case and not counted as verified new.\n\nResolved: bumetanide injection. One corroborated resolution, supported by a resolved-list entry dated September 30, 2026, and confirmed absent from the October 19 ASHP live page. It cannot be proven to be one of the 2 to 3 departures behind the weekly net change, because departures are not individually identifiable.\n\nWith 1 to 2 additions and a net change of minus 1, 2 to 3 bulletins left the ASHP live list during the week."],
                ['heading' => 'Why the two counts differ', 'body' => "ASHP counts product-level bulletins. The FDA counts listing entries. The two lists measure different units under different definitions, so Glenride reports them side by side and never merges them into one number.\n\n".Markdown::link('ASHP vs FDA drug shortage list', '/drug-shortages/ashp-vs-fda')],
                ['heading' => 'What is not yet verified', 'body' => "The digest run for the week of October 26, 2026 had not executed when the October 12 to 19 edition was written. No figures for October 19 to 26 exist in that edition.\n\nNo ASHP quarterly figure newer than Q2 2026 was found by the October 19, 2026 run.\n\nASHP departures are not individually identifiable, so the weekly net cannot be broken into named resolutions beyond the one corroborated case above."],
                ['heading' => 'Where the numbers come from', 'body' => '- '.Markdown::link('ASHP Drug Shortages List', 'https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list')." The live list of shortage bulletins Glenride counts each week.\n- ".Markdown::link('FDA Drug Shortages database', 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm')." The federal listing, read by live browser check.\n- ".Markdown::link('Weekly Drug-Shortage Digest, week of October 12 to 19, 2026', 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/')." The full edition behind every figure on this page.\n- ".Markdown::link('The Glenride Drug-Shortage Digest', '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb').' The weekly record. Published every Monday.'],
                ['heading' => 'Keep reading', 'body' => '- '.Markdown::link('Drug Shortage List', '/drug-shortages/list')." The U.S. drug shortage list, explained. The two lists, the counts, and how often they change.\n- ".Markdown::link('FDA Drug Shortage List', '/drug-shortages/fda-list')." What the FDA list says, what it counts, and what it does not show.\n- ".Markdown::link('ASHP vs FDA Drug Shortage List', '/drug-shortages/ashp-vs-fda').' Why the two lists disagree, what each one counts, and how Glenride reads them together.'],
                ['heading' => 'About these figures', 'body' => 'Figures on this page are for research citation only. A shortage listing is not a pharmacy-stock check, and nothing here is clinical guidance. If a drug you need is in shortage, talk to your pharmacist or clinician. Glenride is an independent, AI-native think tank. AI prepares. Humans decide.'],
            ],
            related: [
                ['text' => 'Drug Shortage List', 'path' => '/drug-shortages/list'],
                ['text' => 'FDA Drug Shortage List', 'path' => '/drug-shortages/fda-list'],
                ['text' => 'ASHP vs FDA Drug Shortage List', 'path' => '/drug-shortages/ashp-vs-fda'],
                ['text' => 'Home', 'path' => '/'],
            ],
        );
    }
}
