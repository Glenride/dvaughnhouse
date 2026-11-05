// Single source of truth for site identity — used by the markdown
// registry (llms.txt, llms-full.txt, ai.txt, robots.txt, sitemap.xml),
// the prerendered head signals, and the Pages Functions.
// Never hardcode name / URL / description / contact in several places;
// edit here and every generated surface picks it up.
export const SITE = {
  name: "D'Vaughn House",
  url: "https://dvaughnhouse.com",
  description:
    "D'Vaughn House is an Independent AI Orchestrator and AI consultant based in Cincinnati, Ohio. He helps small businesses, independent operators, and small teams adopt AI in practical, measurable ways — starting with one real workflow and a result you can measure, not a platform overhaul.",
  shortDescription:
    "D'Vaughn House — Independent AI Orchestrator. Less bureaucracy. More breakthroughs.",
  person: "D'Vaughn House",
  jobTitle: "Independent AI Orchestrator",
  location: "Cincinnati, Ohio",
  contactEmail: "dvaughn@dvaughnhouse.com",
  // Public contact form lives on the homepage (/#contact).
  glenride:
    "Glenride is an independent, AI-native think tank. We find where critical systems break before the break becomes harm — and we publish a record anyone can check.",
  // No social-profile links are published in the site's own copy, so
  // sameAs is intentionally empty — never invent one.
  sameAs: [],
  // Last content update shown in the site footer.
  contentUpdated: "2026-10-25",
};
