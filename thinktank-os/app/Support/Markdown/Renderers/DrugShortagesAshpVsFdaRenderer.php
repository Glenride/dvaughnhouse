<?php

namespace App\Support\Markdown\Renderers;

use App\Support\Markdown\Markdown;
use App\Support\Markdown\MarkdownDocument;

/**
 * Source of truth is resources/js/Pages/DrugShortages/AshpVsFda.jsx.
 * Every figure below mirrors that page exactly.
 */
class DrugShortagesAshpVsFdaRenderer implements MarkdownRenderer
{
    public static function render(array $params): ?MarkdownDocument
    {
        return new MarkdownDocument(
            title: 'ASHP vs FDA Drug Shortage List | Glenride',
            summary: 'ASHP vs FDA drug shortage list. Why the two lists disagree, what each one counts, and how Glenride reads them together in the weekly Digest.',
            path: '/drug-shortages/ashp-vs-fda',
            updatedAt: '2026-10-19',
            sections: [
                ['body' => "Figures last verified October 19, 2026. The Digest publishes every Monday.\n\nASHP vs FDA drug shortage list is the question that follows any operator who compares the two counts. The current FDA and ASHP totals in 2026 differ because ASHP counts product bulletins and the FDA counts listing entries, and the weekly Digest reports both side by side."],
                ['heading' => 'Three different measures', 'body' => "There is no single count of U.S. drug shortages. There are three measures, and they are not interchangeable.\n\n- **192** active ASHP shortage bulletins. Retrieved October 19, 2026. Down 1 net from 193 on October 12, 2026. Source: ASHP current-shortages list.\n- **69 of 74** tab entries currently in shortage on the FDA listing. Retrieved October 19, 2026 at about 8:37 a.m. Eastern. The third consecutive identical reading. Source: FDA drug shortages listing.\n- **227** active shortages in the ASHP quarterly statistic for Q2 2026. No newer quarterly figure was found by the October 19, 2026 run. This is a quarterly statistic, not a count of list entries. Source: ASHP quarterly statistics.\n\nEntry counts are not distinct-drug counts. A bulletin is a drug-product listing, not necessarily a unique active ingredient. Report all three measures and never conflate them. That is the rule Glenride works by."],
                ['heading' => 'Why they disagree', 'body' => "**Different sources**\n\nASHP publishes shortage bulletins with created and revision dates. The FDA database is built mostly from reports manufacturers give the FDA. Two different pipelines see different shortages.\n\n**Different counting**\n\nASHP counts bulletin entries on its live list. The FDA counts database listings currently in shortage. The quarterly statistic is a separate quarterly measure. A drug can be an entry on one list and absent from the other.\n\n**Different rhythms**\n\nThe FDA database is updated daily. ASHP bulletins move as bulletins are added, revised, and resolved. The quarterly statistic arrives once a quarter. A count without a date is not a count. Every number on this page carries one."],
                ['heading' => 'The shape of the problem is the same on either list', 'body' => "Whichever list you watch, the concentration picture is unchanged. Nearly half of new 2026 shortages involve products made by a single manufacturer, at 48 percent sole-source per the July 2026 AJMC aggregate. This is an aggregate for the 2026 cohort, not a new weekly reading.\n\nWeekly inflow and outflow remain small relative to the stock. Single-digit bulletin changes sit against a 192-bulletin ASHP list, retrieved October 19, 2026, consistent with a slow-churning active backlog."],
                ['heading' => 'What Glenride does about it', 'body' => "Glenride publishes both counts every Monday in the weekly U.S. drug shortage digest, and shows where the FDA and ASHP shortage lists disagree instead of picking the number that sounds better. The full edition behind the counts on this page covers the week of October 12 to 19, 2026.\n\n".Markdown::link('Weekly Drug-Shortage Digest, week of October 12 to 19, 2026', 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/')."\n\n".Markdown::link('The Glenride Drug-Shortage Digest', '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb')],
                ['heading' => 'Check the lists yourself', 'body' => '- '.Markdown::link('ASHP Drug Shortages List', 'https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list')."\n- ".Markdown::link('FDA Drug Shortages database', 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm')],
                ['heading' => 'Keep reading', 'body' => '- '.Markdown::link('Current Drug Shortages', '/drug-shortages/current')." The latest verified weekly record, what changed this week, and what is not yet verified.\n- ".Markdown::link('Drug Shortage List', '/drug-shortages/list')." The U.S. drug shortage list, explained. The two lists, the counts, and how often they change.\n- ".Markdown::link('FDA Drug Shortage List', '/drug-shortages/fda-list').' What the FDA list says, what it counts, and what it does not show.'],
                ['heading' => 'About these figures', 'body' => 'Figures on this page are for research citation only. A shortage listing is not a pharmacy-stock check, and nothing here is clinical guidance. If a drug you need is in shortage, talk to your pharmacist or clinician. Glenride is an independent, AI-native think tank. AI prepares. Humans decide.'],
            ],
            related: [
                ['text' => 'Current Drug Shortages', 'path' => '/drug-shortages/current'],
                ['text' => 'Drug Shortage List', 'path' => '/drug-shortages/list'],
                ['text' => 'FDA Drug Shortage List', 'path' => '/drug-shortages/fda-list'],
                ['text' => 'Home', 'path' => '/'],
            ],
        );
    }
}
