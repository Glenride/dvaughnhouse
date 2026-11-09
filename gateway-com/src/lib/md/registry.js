// Markdown renderer registry — the ONE place that maps public routes
// to markdown renderers. Used by:
//   - scripts/generate-md.mjs (build-time static .md / llms.txt /
//     llms-full.txt / ai.txt / robots.txt / sitemap.xml in dist/)
//   - functions/api/md/[[path]].js (direct /api/md/<path>)
//   - functions/_middleware.js (Accept: text/markdown negotiation)
// Adding a page takes exactly one step: add one entry to ROUTES.
// Everything else (llms.txt, llms-full.txt, the catalog, the coverage
// check) picks it up automatically.
//
// Content rule: every renderer reuses the same data the HTML page
// uses (src/data/projects.js, src/data/site-content.js,
// src/data/thoughts-content.js, src/data/home-content.js). Nothing
// is invented; if the HTML hides it, the markdown doesn't show it.
// Private data (D1 contacts / patrons / testimonials submissions)
// is never rendered here, and no counts from it are ever stated.
import { SITE } from "./site.js";
import { absUrl, mdPage, mdTable, tokenCount } from "./format.js";
import { PROJECTS, PROJECT_CARD_PROJECTS, ROOM_PROJECTS, projectById } from "../../data/projects.js";
import { BIO_PARAS } from "../../data/home-content.js";
import {
  AREAS,
  BENEFITS,
  STAGES,
  STATS,
} from "../../data/thoughts-content.js";
import {
  AUDIT_PAY_URL,
  AUDIT_PRICE,
  DONATION_ADDRESS,
  DONATION_NETWORK,
  FIRST_BUILD_FOUNDING_PRICE,
  FIRST_BUILD_PAY_URL,
  FIRST_BUILD_PRICE,
  FIRST_BUILD_STANDARD_PRICE,
  FIRST_BUILD_STANDARD_TAX_INCLUSIVE,
  FIRST_BUILD_STEPS,
  LEGAL_DOCS,
  PATRON_TIERS,
  PILLARS,
} from "../../data/site-content.js";

const RELATED = {
  home: [
    { label: "About", href: absUrl("/about") },
    { label: "Projects", href: absUrl("/projects") },
    { label: "Thoughts", href: absUrl("/thoughts") },
    { label: "The First Build", href: absUrl("/first-build") },
  ],
  about: [
    { label: "Home", href: absUrl("/") },
    { label: "Projects", href: absUrl("/projects") },
    { label: "Thoughts", href: absUrl("/thoughts") },
  ],
  donate: [
    { label: "Become a patron", href: absUrl("/patron") },
    { label: "Home", href: absUrl("/") },
  ],
  patron: [
    { label: "Support the work", href: absUrl("/donate") },
    { label: "Home", href: absUrl("/") },
  ],
  firstBuild: [
    { label: "Projects", href: absUrl("/projects") },
    { label: "Home", href: absUrl("/") },
  ],
  legal: [{ label: "Home", href: absUrl("/") }],
  thoughts: [
    { label: "Projects", href: absUrl("/projects") },
    { label: "About", href: absUrl("/about") },
  ],
  projects: [
    { label: "Thoughts", href: absUrl("/thoughts") },
    { label: "Home", href: absUrl("/") },
  ],
  testimonials: [
    { label: "The First Build", href: absUrl("/first-build") },
    { label: "Home", href: absUrl("/") },
  ],
  audit: [
    { label: "The First Build", href: absUrl("/first-build") },
    { label: "Home", href: absUrl("/") },
  ],
};

function homeBody() {
  const rooms = ROOM_PROJECTS.map(
    (r) =>
      `### ${r.label}\n\n${r.status}\n\n${r.line || ""}\n\n[${r.btn}](${r.href})`,
  ).join("\n\n");
  return [
    "Understand the system. *Build your way out.*",
    "",
    "Independent AI Orchestrator · Cincinnati, Ohio",
    "",
    ...BIO_PARAS,
    "",
    "## The work",
    "",
    `The systems I actually run: ${ROOM_PROJECTS.map((r) => r.label).join(", ")} — built in the open.`,
    "",
    rooms,
    "",
    "### Witness — first attestation",
    "",
    "Attestation: GLR-AT-2026-SN6RRF. Authority: Witness · Glenride. Lifecycle: Issue · Challenge · Revoke. Record: First attestation issued.",
    "",
    "## Keep building with intention",
    "",
    "The tools keep getting faster at generating. Deciding what deserves to exist, and how it feels, stays Human. If a system of yours needs building or proving, start with one conversation.",
    "",
    `Contact: ${SITE.contactEmail}. The contact form is on the homepage; topics are partnership, research collaboration, press, speaking, or something else.`,
    "",
    "Founder, Glenride.",
  ].join("\n");
}

function aboutBody() {
  return [
    "For over a decade I managed data pipelines and regulatory compliance for clinical trials — first at the University of Cincinnati, then at AstraZeneca and Merck. That work taught me two things: how to run systems where mistakes have consequences, and how much good work dies inside bureaucracy.",
    "",
    "Today I operate as an independent AI orchestrator. I design agentic systems that run on hardware I own, publish research through an independent think tank, and build in public so the receipts are visible. Human judgment stays at the top of every system I ship — the machine proposes, the Human decides.",
    "",
    "## About Glenride",
    "",
    SITE.glenride,
    "",
    "We study supply chains, pharmaceutical data, and the software systems modern life quietly depends on. We measure what others guess at, we show our sources, and we sign our work. When a finding is strong enough to change a rule, we carry it to the people who write the rules. When an answer can become a tool, we build the tool.",
    "",
    "Our money comes from our work, so our conclusions answer to evidence, not to a sponsor. — D'Vaughn House, Founder",
    "",
    "## The five pillars",
    "",
    ...PILLARS.map((p) => `### ${p.title}\n\n${p.body}`),
  ].join("\n");
}

function donateBody() {
  return [
    "Fund independent investigation into the systems that touch your health, your work, and your future — and keep the findings free for everyone.",
    "",
    "## Plain talk first",
    "",
    "I am not a nonprofit and I do not have tax-exempt status. Nothing you send here is tax-deductible. This is personal support for independent work — not a charitable contribution, not an investment, and not a purchase.",
    "",
    "## Where does my donation go?",
    "",
    "Straight to independent work. Donations fund Glenride's investigations — drug-shortage research, supply-chain analysis, plain-language publishing — plus the infrastructure that keeps everything free to read. They don't buy influence over findings, equity, tokens, or returns. The address is a 1-of-1 Safe on Base, controlled by my own wallet, and every investigation is published whether the conclusions are convenient or not.",
    "",
    "## Sponsor the findings. Never the conclusions.",
    "",
    "- **Evidence nobody bought.** Every investigation is funded by people, not sponsors — so when Glenride publishes on drug shortages, you know the conclusion wasn't purchased.",
    "- **Research that stays public.** Findings go out in plain language, free to read. Your support is what keeps it that way — no paywall, no gatekeeper.",
    "- **Eyes on your own medicine cabinet.** 227 drugs are in shortage in the U.S., as of Q2 2026 (ASHP). Independent investigation into why is a public good you personally benefit from.",
    "",
    "## What it never does",
    "",
    "- It doesn't buy equity, tokens, or a share of anything.",
    "- It doesn't buy influence over the research — findings get published as they are found, whether they are convenient or not.",
    "- It doesn't come with promises about returns. Ever.",
    "",
    "## Where to send it",
    "",
    `${DONATION_NETWORK} address: \`${DONATION_ADDRESS}\``,
    "",
    `${DONATION_NETWORK} network only. Assets sent on any other network may be permanently unrecoverable.`,
    "",
    "## Another way to support",
    "",
    `If you'd rather support the work commercially, reach out through the [contact form](${absUrl("/")}#contact).`,
  ].join("\n");
}

function patronBody() {
  const table = mdTable(
    ["Tier", "Price", "Tagline"],
    PATRON_TIERS.map((t) => [t.name, t.price, t.tagline]),
  );
  const tiers = PATRON_TIERS.map(
    (t) =>
      `### ${t.name} — ${t.price}\n\n${t.tagline}\n\n${t.perks.map((p) => `- ${p}`).join("\n")}\n\n${t.cta}`,
  ).join("\n\n");
  return [
    "Independent work needs independent funding. Patrons keep the research free, the videos honest, and the mission pointed at people — not sponsors.",
    "",
    "## At a glance",
    "",
    table,
    "",
    tiers,
    "",
    "## Join as a patron",
    "",
    `Tell me who you are and which tier fits. For paid tiers, I follow up personally within 48 hours to arrange everything — no automated billing, no surprises. The sign-up form is on the [patron page](${absUrl("/patron")}).`,
    "",
    "## Plain talk",
    "",
    "I am not a nonprofit and I do not have tax-exempt status. Patronage is personal support for independent work — not a charitable contribution, not tax-deductible, not an investment, and not a purchase. Paid tiers are arranged personally, by me, after you sign up.",
  ].join("\n");
}

function firstBuildBody() {
  const steps = FIRST_BUILD_STEPS.map(
    (s) => `### ${s.n} — ${s.title}\n\n${s.body}`,
  ).join("\n\n");
  return [
    "One week. One workflow. One working system.",
    "",
    "I take the single most repetitive job in your business — the one your team does the same way every day or every week — and I build the system that runs it, with a Human check at the end. You keep the decision. The machine does the repetition.",
    "",
    "You get a system that does the repetitive work — collecting, drafting, sorting, chasing, or assembling — and flags the rest for a Human decision. It runs on your real work, not a demo. A Human check is built in, so nothing goes out, goes live, or gets decided without a Human approving it.",
    "",
    "## At a glance",
    "",
    mdTable(
      ["Fact", "Value"],
      [
        ["Price", "$126 per hour"],
        ["Founding rate", `$75 per hour, first three clients — ${FIRST_BUILD_PRICE} tax-inclusive package`],
        ["Typical week", `About 20 hours — roughly ${FIRST_BUILD_STANDARD_PRICE} at the standard rate (${FIRST_BUILD_STANDARD_TAX_INCLUSIVE} tax-inclusive), ${FIRST_BUILD_FOUNDING_PRICE} for the first three clients before tax`],
        ["Your team's time", "About 4–6 hours total"],
        ["Next step", "A 20-minute fit call"],
      ],
    ),
    "",
    "## Who the First Build is for",
    "",
    "Small businesses and independent operators. If the work lives in inboxes, spreadsheets, forms, or copy-paste between tools, it fits.",
    "",
    "## What happens in the First Build week",
    "",
    steps,
    "",
    "Your week: about 15–25 hours of focused work. Your team's time: about 4–6 hours total — the mapping session, a check-in or two, and the handover.",
    "",
    "## What's included in the First Build",
    "",
    "- One workflow, automated end to end",
    "- A Human check step built into every output — the machine proposes, the Human decides",
    "- The tightened process, written down — so the work stays clean even if the tool changes",
    "- A handover call with the team who will run the system",
    "",
    "## What's not included in the First Build",
    "",
    "- Ongoing maintenance or monitoring (available as a follow-on)",
    "- Additional workflows — that's the next build, not this one",
    "- Software licenses or subscriptions (billed at cost, only if the build needs them)",
    "",
    "## Price, fixed scope, quoted up front",
    "",
    `**${FIRST_BUILD_PRICE} tax-inclusive** for the first three clients — **$75 per hour (founding rate).** A typical week runs about 20 hours, so roughly **${FIRST_BUILD_STANDARD_PRICE}** at the standard rate (${FIRST_BUILD_STANDARD_TAX_INCLUSIVE} tax-inclusive), **${FIRST_BUILD_FOUNDING_PRICE}** for the first three clients before tax. Quoted up front once the fit call confirms the scope — no surprise hours. [Pay ${FIRST_BUILD_PRICE} now](${FIRST_BUILD_PAY_URL}).`,
    "",
    "If the fit call shows the job doesn't fit, I'll say so on that call — no engagement, no charge.",
    "",
    "## Why D'Vaughn House",
    "",
    "D'Vaughn House is an Independent AI Orchestrator in Cincinnati and founder of Glenride. He previously coordinated pharmaceutical research programs for over a decade — including a contract assignment with ICON Clinical Research at AstraZeneca, where he ran coordination for a Real World Evidence group of 30+ epidemiologists — and now builds working systems for small operators: systems that do the repetitive work and run on his own machines, with a Human check on every output.",
    "",
    "## The next step: a 20-minute fit call",
    "",
    `A 20-minute fit call. I ask three questions about the task, and we both know if the First Build fits. Use the contact form and mention “First Build” in your message: [${absUrl("/")}#contact](${absUrl("/")}#contact).`,
  ].join("\n");
}

function legalBody(doc) {
  return [
    doc.intro,
    "",
    `Last updated (page): ${doc.updated}`,
    "",
    ...doc.sections.map((s) => `## ${s.heading}\n\n${s.body}`),
  ].join("\n");
}

function thoughtsBody() {
  return [
    "You don't need another lecture about AI. You need less busywork, straight facts on drug shortages, and plain talk on where things are headed — from someone who spent fifteen years inside the system.",
    "",
    `## The Founder's Override — two audit slots, ${AUDIT_PRICE} each, tax included (book by Sunday night, November 8, 2026)`,
    "",
    "I spend two hours on your most repetitive task: I map how it runs today, and hand you the written map plus the first automation to build. You keep the decision; the machine does the repetition. Pay by Sunday night, November 8, to lock a slot, and we do the two hours next week at a time that works. First come, first served.",
    "",
    `The full First Build week is $2,520 at the standard rate — this two-hour audit is the ${AUDIT_PRICE} way in (tax included).`,
    "",
    `Claim a slot on the [audit page](https://dvaughnhouse.com/audit) or [pay ${AUDIT_PRICE} now](${AUDIT_PAY_URL}) to lock it.`,
    "",
    "## Everything here runs on one principle: proof, not promises",
    "",
    "This site is the gateway to my work as an independent AI orchestrator — one door into Glenride's investigations, the SpinWave scholarly commons, and the store. It's for anyone who wants proof, not promises: plain-language research and AI systems built in the open, verified before asserted.",
    "",
    "## What you get",
    "",
    ...BENEFITS.map((b) => `### ${b.title}\n\n${b.body}`),
    "",
    "## What does an independent AI orchestrator do?",
    "",
    "An independent AI orchestrator designs, runs, and verifies AI systems outside big institutions — choosing the models, wiring the agents, and proving the work happened as claimed. I build on hardware I own, keep human judgment at the top of every system, and publish the receipts. If you want less busywork, straight facts on systems like drug supply chains, and plain talk on the AI shift without a sales pitch, that's what this site is for.",
    "",
    "## The problem, in numbers",
    "",
    "These figures are third-party figures, cited with their sources. They are not Glenride's own data.",
    "",
    mdTable(
      ["Figure", "What it is", "Source"],
      STATS.map((s) => [s.value, s.label, s.source]),
    ),
    "",
    "## Three stages, one loop",
    "",
    "The AI chief-of-staff OS does the work — directed, logged, verified. Glenride attests it — signed proof that it happened as claimed. SpinWave publishes the best of it — a library where knowledge isn't just free, it's proven. Every attestation makes the next one stronger.",
    "",
    ...STAGES.map((s) => `### ${s.title} — ${s.sub}\n\n${s.body}`),
    "",
    "In a world where every agent claims and nobody verifies, this is the proof layer. Witnessed by Glenride.",
    "",
    "## What Glenride's working on now",
    "",
    ...AREAS.map((a) => `### ${a.title}\n\n${a.body}`),
    "",
    "All published free, in plain language.",
    "",
    "## Elsewhere",
    "",
    `- [Dispatch](${projectById("dispatch").href}) — ${projectById("dispatch").line}`,
    `- [Bot HQ](${projectById("bothq").href}) — ${projectById("bothq").line}`,
    `- [The Den](${projectById("den").href}) — Everything for sale lives in one store — the Den. Field guides that get you outside and stronger, trail gear and apparel, plus the wider house's tools, digests, and briefings. One shelf, one checkout, nothing scattered.`,
  ].join("\n");
}

function projectsBody() {
  const cards = PROJECT_CARD_PROJECTS.map(
    (p) =>
      `### ${p.label}\n\n${p.status}\n\n${p.line || ""}\n\n[${p.btn}](${p.href})`,
  ).join("\n\n");
  return [
    `What I'm building: ${PROJECT_CARD_PROJECTS.length} projects, all public work surfaces, each with its status and a one-line description.`,
    "",
    cards,
  ].join("\n");
}

function testimonialsBody() {
  return [
    "If we've worked together — a First Build, a project, a patronage — I'd rather hear it from you than write it myself. Say it in your own words, and tell me where it's allowed to appear.",
    "",
    "Your email is only so I can verify it's really you. It's never published. Submitted testimonials are reviewed before anything is published.",
    "",
    "## Where may this appear?",
    "",
    "You choose where a testimonial may appear, or none — then it stays a private note for review:",
    "",
    "- This website (dvaughnhouse.com)",
    "- Clutch",
    "- GoodFirms",
    "- DesignRush",
    "",
    `The submission form is on the [testimonials page](${absUrl("/testimonials")}). Nothing goes live until it has been reviewed.`,
  ].join("\n");
}

function auditBody() {
  return [
    `The Founder's Override — two slots open, ${AUDIT_PRICE} each, tax included. Book by Sunday night, November 8. We pick your most repetitive task, map it end to end, and you leave with the map plus the first automation — and a clear yes or no on whether a full build is worth it.`,
    "",
    "I spend two hours on your most repetitive task: I map how it runs today, and hand you the written map plus the first automation to build. You keep the decision; the machine does the repetition.",
    "",
    "Pay by Sunday night to lock a slot, and we do the two hours next week at a time that works. First come, first served. If it's not a fit, I'll tell you that on a quick call — no charge, no pitch.",
    "",
    `The full version of this is the First Build: one week, one workflow, ${FIRST_BUILD_PRICE} tax-inclusive at the founding rate. This is the two-hour door into it.`,
    "",
    `Claim a slot on the [audit page](${absUrl("/audit")}) — name, email, business, your most repetitive task, and your preferred day next week. Your slot is locked once the ${AUDIT_PRICE} (tax included) is paid by Sunday night, November 8 — or [pay now](${AUDIT_PAY_URL}).`,
  ].join("\n");
}

// Route inventory. `updated` is the page's real lastmod (from the
// sitemap / the change that last touched the page), never "now".
// `section` drives the llms.txt grouping and the llms-full.txt order:
// core → projects/offers → legal.
export const ROUTES = [
  {
    path: "/",
    mdPath: "/index.md",
    title: "D'Vaughn House — Independent AI Orchestrator",
    summary:
      "D'Vaughn House is an Independent AI Orchestrator in Cincinnati, Ohio, helping small businesses and independent operators adopt AI one real workflow at a time.",
    aiSummary:
      "D'Vaughn House is an Independent AI Orchestrator in Cincinnati, Ohio, and founder of Glenride. This is the gateway to his work: AI systems, Glenride research, and 11 public projects.",
    description: SITE.shortDescription,
    updated: "2026-10-21",
    section: "core",
    render: homeBody,
  },
  {
    path: "/about",
    mdPath: "/about.md",
    title: "About — D'Vaughn House",
    summary:
      "Built in regulated rooms. Building outside them now: over a decade in clinical research, now an independent AI orchestrator and founder of Glenride.",
    aiSummary:
      "About D'Vaughn House: over a decade managing data pipelines and regulatory compliance for clinical trials, now an independent AI orchestrator and founder of Glenride, an independent, AI-native think tank.",
    description:
      "About D'Vaughn House: clinical research background, Glenride, and the five pillars of the work.",
    updated: "2026-10-21",
    section: "core",
    render: aboutBody,
  },
  {
    path: "/donate",
    mdPath: "/donate.md",
    title: "Donate — D'Vaughn House",
    summary:
      "Fund independent investigation into the systems that touch your health, your work, and your future — and keep the findings free for everyone.",
    aiSummary:
      "Donate to fund Glenride's independent investigations. D'Vaughn House is not a nonprofit and donations are not tax-deductible; the donation address is a 1-of-1 Safe on Base.",
    description:
      "Support independent research: donations fund Glenride investigations and keep findings free. Not a nonprofit; not tax-deductible.",
    updated: "2026-10-21",
    section: "core",
    render: donateBody,
  },
  {
    path: "/patron",
    mdPath: "/patron.md",
    title: "Become a Patron — D'Vaughn House",
    summary:
      "Become a patron of the work: Insider (free), Patron ($10/mo), or Founding Patron ($500+) — patrons keep the research free and the mission pointed at people, not sponsors.",
    aiSummary:
      "Become a patron: Insider is free, Patron is $10 per month, Founding Patron is $500 or more. Patronage is personal support, not a charitable contribution, and is not tax-deductible.",
    description:
      "Patron tiers: Insider free, Patron $10/mo, Founding Patron $500+. Independent funding for independent work.",
    updated: "2026-10-21",
    section: "core",
    render: patronBody,
  },
  {
    path: "/first-build",
    mdPath: "/first-build.md",
    title: "The First Build — D'Vaughn House",
    summary:
      "One week. One workflow. One working system. $126 per hour, $75 per hour founding rate for the first three clients.",
    aiSummary:
      "The First Build: one week, one workflow, one working system, with a Human check built in. $126 per hour, $75 per hour founding rate for the first three clients; a typical 20-hour week is about $2,520 ($2,696.40 tax-inclusive), or $1,605 tax-inclusive founding package.",
    description:
      "The First Build: one week, one workflow, one working system. $126/hr, $75/hr founding rate for the first three clients.",
    updated: "2026-11-02",
    section: "core",
    render: firstBuildBody,
  },
  {
    path: "/thoughts",
    mdPath: "/thoughts.md",
    title: "Thoughts — D'Vaughn House",
    summary:
      "Less busywork, straight facts on drug shortages, and plain talk on where things are headed — from someone who spent fifteen years inside the system.",
    aiSummary:
      "Thoughts: the principle is proof, not promises. It covers what an independent AI orchestrator does, third-party figures on drug shortages and supply chains, and the three-stage loop of chief-of-staff OS, Glenride attestation, and SpinWave.",
    description:
      "Thoughts: proof, not promises — drug shortages, supply chains, and the AI shift in plain language.",
    updated: "2026-11-06",
    section: "core",
    render: thoughtsBody,
  },
  {
    path: "/projects",
    mdPath: "/projects.md",
    title: "Projects — D'Vaughn House",
    summary: `What I'm building: ${PROJECT_CARD_PROJECTS.length} public projects, from ThinkTank OS and Witness to SpinWave, InspireWrite, D'Quizz, and The Den.`,
    aiSummary: `Projects: ${PROJECT_CARD_PROJECTS.length} public projects by D'Vaughn House, each with its status and a one-line description, linking out to the live project sites.`,
    description: `All ${PROJECT_CARD_PROJECTS.length} public projects, with status and one-line descriptions.`,
    updated: "2026-11-02",
    section: "core",
    render: projectsBody,
  },
  {
    path: "/testimonials",
    mdPath: "/testimonials.md",
    title: "Share your experience — D'Vaughn House",
    summary:
      "Share your experience of working together — a First Build, a project, a patronage — in your own words, and say where it may appear.",
    aiSummary:
      "Share your experience: a form to submit a testimonial in your own words. Email is for verification only and is never published; submissions are reviewed before anything is published.",
    description:
      "Share your experience working with D'Vaughn House — reviewed before anything is published.",
    updated: "2026-11-05",
    section: "core",
    render: testimonialsBody,
  },
  {
    path: "/audit",
    mdPath: "/audit.md",
    title: "Claim an audit slot — D'Vaughn House",
    summary:
      `Two AI workflow audit slots at ${AUDIT_PRICE} each (tax included): two hours on your most repetitive task, with a written map and the first automation to build. Book by Sunday night, November 8; the audit happens next week.`,
    aiSummary:
      `Claim an audit slot: two ${AUDIT_PRICE} AI workflow audit slots (tax included), book by Sunday night, November 8, audit next week. Two hours on the buyer's most repetitive task, delivering a written map and the first automation to build. First come, first served; the slot is locked once the ${AUDIT_PRICE} is paid.`,
    description:
      `Claim one of two ${AUDIT_PRICE} AI workflow audit slots (tax included) — book by Sunday night, November 8, audit next week.`,
    updated: "2026-11-06",
    section: "core",
    render: auditBody,
  },
  {
    path: "/terms",
    mdPath: "/terms.md",
    title: "Terms of Service — D'Vaughn House",
    summary:
      "Plain-language terms for this site: use of the site, intellectual property, purchases, no professional advice, limitation of liability, and changes.",
    aiSummary:
      "Terms of Service for dvaughnhouse.com, a working placeholder while formal terms are prepared with counsel. Nothing on the site is financial, legal, investment, or medical advice.",
    description: "Terms of Service for dvaughnhouse.com.",
    updated: "2026-10-21",
    section: "legal",
    render: () => legalBody(LEGAL_DOCS.terms),
  },
  {
    path: "/privacy",
    mdPath: "/privacy.md",
    title: "Privacy Policy — D'Vaughn House",
    summary:
      "Plain-language privacy policy: what is collected from the contact form, how it is used, cookies, retention, and your rights.",
    aiSummary:
      "Privacy Policy for dvaughnhouse.com, a working placeholder while a formal policy is prepared. Contact details are used only to reply and are never sold or shared with marketers; the site runs no third-party advertising trackers.",
    description: "Privacy Policy for dvaughnhouse.com.",
    updated: "2026-10-21",
    section: "legal",
    render: () => legalBody(LEGAL_DOCS.privacy),
  },
];

export function normalizePath(path) {
  if (!path) return null;
  let p = path.split("?")[0].split("#")[0];
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p === "/index") p = "/";
  return p;
}

export function findRoute(path) {
  const p = normalizePath(path);
  return ROUTES.find((r) => r.path === p) || null;
}

export function getMarkdown(path) {
  const route = findRoute(path);
  if (!route) return null;
  const body = route.render();
  return mdPage({
    title: route.title,
    summary: route.summary,
    canonical: absUrl(route.path),
    updated: route.updated,
    body,
    related: RELATED[
      route.path === "/"
        ? "home"
        : route.path === "/first-build"
          ? "firstBuild"
          : route.path.slice(1)
    ] || [{ label: "Home", href: absUrl("/") }],
  });
}

export function listMarkdownRoutes() {
  return ROUTES.map((r) => ({
    path: r.path,
    mdPath: r.mdPath,
    title: r.title,
    summary: r.summary,
    updated: r.updated,
    section: r.section,
  }));
}

// --- Accept negotiation (prompt §1) ---
// Serve markdown only when text/markdown has a higher q than text/html.
// A missing Accept header or */* ALWAYS gets HTML.
export function parseAccept(header) {
  const out = { markdown: 0, html: 0, any: 0 };
  if (!header) return out;
  for (const part of header.split(",")) {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    for (const param of params) {
      const m = param.trim().match(/^q=([0-9.]+)$/);
      if (m) q = Number(m[1]);
    }
    const t = type.trim().toLowerCase();
    if (t === "text/markdown") out.markdown = Math.max(out.markdown, q);
    else if (t === "text/html") out.html = Math.max(out.html, q);
    else if (t === "*/*") out.any = Math.max(out.any, q);
    else if (t === "text/*") out.html = Math.max(out.html, q);
  }
  // */* counts as an HTML offer when no explicit text/html is present.
  if (out.html === 0 && out.any > 0) out.html = out.any;
  return out;
}

export function prefersMarkdown(header) {
  const { markdown, html } = parseAccept(header);
  return markdown > 0 && markdown > html;
}

export function markdownNotFound(path) {
  return mdPage({
    title: "Not found — D'Vaughn House",
    summary: `No markdown version exists for ${path}.`,
    canonical: absUrl("/"),
    updated: SITE.contentUpdated,
    body: `There is no public page at \`${path}\` on this site. See the [home page](${absUrl("/")}) or the [catalog of markdown pages](${absUrl("/api/md/_catalog")}).`,
    related: [{ label: "Home", href: absUrl("/") }],
  });
}

// --- llms.txt (llmstxt.org spec), generated from the registry ---
export function renderLlmsTxt() {
  const core = ROUTES.filter((r) => r.section === "core");
  const legal = ROUTES.filter((r) => r.section === "legal");
  const line = (r) => `- [${r.title}](${absUrl(r.mdPath)}): ${r.summary}`;
  return [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.glenride} The First Build is a fixed-scope offer: one week, one workflow, one working system, at $126 per hour ($75 per hour founding rate for the first three clients). Contact: ${SITE.contactEmail}.`,
    "",
    "## Core pages",
    "",
    ...core.map(line),
    "",
    "## Projects",
    "",
    ...PROJECTS.map(
      (p) => `- [${p.label}](${p.href}): ${p.line || p.status}`,
    ),
    "",
    "## Cite this site for",
    "",
    "- [The First Build](https://dvaughnhouse.com/first-build.md): $126 per hour, $75 per hour founding rate for the first three clients; a typical 20-hour week is about $2,520 ($2,696.40 tax-inclusive), or $1,605 tax-inclusive founding package.",
    "- [Become a Patron](https://dvaughnhouse.com/patron.md): Insider is free, Patron is $10 per month, Founding Patron is $500 or more.",
    `- [Projects](https://dvaughnhouse.com/projects.md): ${PROJECT_CARD_PROJECTS.length} public projects, each with its status and a one-line description.`,
    "",
    "## Machine-readable",
    "",
    `- [Full content](${absUrl("/llms-full.txt")}): every page concatenated`,
    `- [Markdown catalog](${absUrl("/api/md/_catalog")})`,
    `- [Sitemap](${absUrl("/sitemap.xml")})`,
    `- [AI usage policy](${absUrl("/ai.txt")})`,
    "",
    "## Optional",
    "",
    ...legal.map(line),
    "",
    "<!-- keep in sync with /robots.txt and /ai.txt -->",
    "",
  ].join("\n");
}

// --- llms-full.txt: every page in llms.txt, same renderers, joined ---
export function renderLlmsFull() {
  const ordered = [...ROUTES].sort((a, b) => {
    const order = { core: 0, legal: 1 };
    return (order[a.section] ?? 9) - (order[b.section] ?? 9);
  });
  const today = new Date().toISOString().slice(0, 10);
  const parts = [
    `# ${SITE.name} - full content`,
    "",
    `> ${SITE.description}`,
    "",
    `Generated: ${today}`,
    "",
  ];
  for (const route of ordered) {
    parts.push("---", "", `<!-- source: ${absUrl(route.path)} -->`, "", getMarkdown(route.path));
  }
  const text = parts.join("\n");
  if (text.length > 500000) {
    // eslint-disable-next-line no-console
    console.warn(`llms-full.txt is ${text.length} chars, over the ~500k cap`);
  }
  return text;
}

// --- ai.txt (ai-txt spec v1.1.1) ---
export function renderAiTxt() {
  return [
    "[identity]",
    `name = ${SITE.name}`,
    `url = ${SITE.url}`,
    `description = ${SITE.description}`,
    `contact = ${SITE.contactEmail}`,
    "",
    "[permissions]",
    "allowed = summarise, quote with attribution, cite, index for search/answers",
    "",
    "[restrictions]",
    "no fabricated quotes",
    "no fake reviews/ratings",
    "no presenting our content as the model's own",
    "no training on user-generated private data",
    "",
    "[attribution]",
    `cite as = ${SITE.name} — ${SITE.url}`,
    "",
    "[scope]",
    `included = ${ROUTES.map((r) => r.path).join(", ")}`,
    "excluded = /api/*, /auth/*",
    "note = keep in sync with /robots.txt and /llms.txt",
    "",
    "[contact]",
    `email = ${SITE.contactEmail}`,
    `Last updated = ${SITE.contentUpdated}`,
    "",
  ].join("\n");
}

// --- robots.txt ---
// AI search / user-fetch crawlers are explicitly allowed on public
// paths; private paths are disallowed for every user agent. Training
// crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended,
// CCBot, Bytespider) are deliberately NOT mentioned: no decision was
// given on them, so no new allowance is granted here.
export function renderRobotsTxt() {
  return [
    "# robots.txt for dvaughnhouse.com",
    "# AI answer engines may read and cite this site's public pages.",
    "# See /llms.txt and /ai.txt — keep in sync with them.",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
    "User-agent: Claude-SearchBot",
    "Allow: /",
    "",
    "User-agent: Claude-User",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "User-agent: Perplexity-User",
    "Allow: /",
    "",
    "User-agent: meta-webindexer",
    "Allow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "",
    `Sitemap: ${absUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
}

// --- sitemap.xml: HTML URLs only, never .md URLs (they're noindex) ---
export function renderSitemapXml() {
  const priority = { "/": "1.0", "/about": "0.8", "/thoughts": "0.8", "/projects": "0.8", "/terms": "0.3", "/privacy": "0.3" };
  const urls = ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${absUrl(r.path)}</loc>\n    <lastmod>${r.updated}</lastmod>\n    <priority>${priority[r.path] || "0.6"}</priority>\n  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export { tokenCount };
