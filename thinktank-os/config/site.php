<?php

/*
|--------------------------------------------------------------------------
| Glenride site identity — single source of truth
|--------------------------------------------------------------------------
|
| Site name, canonical URL, description and contact come from here and
| nowhere else. llms.txt, llms-full.txt, ai.txt, robots.txt, the sitemap,
| the markdown renderers and the Organization / WebSite JSON-LD all read
| this config, so a rename or a URL change is one edit, not a hunt.
|
| Canonical URL: the Glenride institutional front door is
| https://dvaughnhouse.org (see HomeController). APP_URL stays the
| deployment default for the framework; the public canonical URL is
| this value unless SITE_URL is set explicitly.
|
*/

return [
    'name' => 'Glenride',
    'full_name' => 'Glenride — Independent, AI-Native Think Tank',
    'url' => env('SITE_URL', 'https://dvaughnhouse.org'),
    'description' => 'Glenride is an independent, AI-native think tank. We find where critical systems break before the break becomes harm — and we publish a record anyone can check. We study supply chains, pharmaceutical data, and the software systems modern life quietly depends on.',
    'tagline' => 'Find where critical systems break before the break becomes harm, publish a checkable record, and carry strong findings to the people who write the rules.',
    'founder' => "D'Vaughn House",
    'founder_title' => 'Independent AI Orchestrator',
    // Contact lives on the routing hub; there is no public Glenride inbox.
    'contact_url' => 'https://dvaughnhouse.com/#contact',
    'contact_email' => 'dvaughn@dvaughnhouse.com',
    // No logo file ships in this repo, so none is claimed here. Add the
    // path when a logo asset lands in public/images.
    'logo' => null,
    'founded' => '2026',
    'audience' => 'Operators and decision-makers: corporate executives, manufacturing leaders, and institutional policymakers, plus scholars and fellows working on supply-chain resilience, pharmaceutical data, and enterprise software systems.',
    'same_as' => [
        'https://dvaughnhouse.com',
    ],
];
