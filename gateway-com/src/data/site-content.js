// Pure data shared by the HTML pages (src/App.jsx) and the markdown
// registry (src/lib/md/registry.js). No JSX, no imports, no side
// effects — so the build-time generator and the Pages Functions can
// import it without pulling in React or assets. One edit here updates
// both the HTML page and its markdown version.

export const DONATION_ADDRESS = "0xa6eab535043EB98De32e5791b0E83ab47f88C430";
export const DONATION_NETWORK = "Base";

// Flash-sale audit checkout (Stripe payment link, tax-inclusive price).
export const AUDIT_PRICE = "$374.50";
export const AUDIT_PAY_URL = "https://buy.stripe.com/eVq4gB9eAeDdauYejnbfO04";

// The First Build checkout (Stripe payment link, tax-inclusive package).
// Founding package: $1,500 + tax = $1,605. Standard week: $2,520 + tax = $2,696.40.
export const FIRST_BUILD_PRICE = "$1,605";
export const FIRST_BUILD_PAY_URL = "https://buy.stripe.com/fZu6oJaiE1Qrbz2fnrbfO03";
export const FIRST_BUILD_FOUNDING_PRICE = "$1,500";
export const FIRST_BUILD_STANDARD_PRICE = "$2,520";
export const FIRST_BUILD_STANDARD_TAX_INCLUSIVE = "$2,696.40";

export const PILLARS = [
  {
    title: "The Independent Architect",
    body: "The craft of building — systems design, runbooks, near-zero-cost infrastructure. No theory without a working artifact.",
  },
  {
    title: "The Power–Wisdom Gap",
    body: "This is not another dot-com. Plain-language work on what “if you don’t move, you lose” means in practice.",
  },
  {
    title: "Cognitive Stewardship",
    body: "Human primacy. Free will and the machine. Words as load-bearing spells. The thinking that keeps the building honest.",
  },
  {
    title: "Glenride Investigations",
    body: "Supply-chain vulnerabilities, pharmaceutical data, the systems that seek to harm — investigated in plain language. Verified before asserted.",
  },
  {
    title: "The Independent Economy",
    body: "The work, built in public. Real numbers, real lessons, never a profit promise.",
  },
];

export const PATRON_TIERS = [
  {
    id: "insider",
    name: "Insider",
    price: "Free",
    tagline: "Follow the work.",
    perks: [
      "The Dispatch — the weekly newsletter, every issue",
      "Early access to every video before it goes public",
      "First to hear about the AI chief-of-staff class",
    ],
    cta: "You're in the room. Watch what's being built, week by week.",
  },
  {
    id: "patron",
    name: "Patron",
    price: "$10/mo",
    tagline: "Fund the work.",
    perks: [
      "Everything in Insider",
      "Behind-the-scenes build notes — the stuff that doesn't make the videos",
      "Monthly live Q&A — ask anything, get a straight answer",
      "Your name in the credits of every video",
    ],
    cta: "Ten dollars a month keeps the cameras on and the research free.",
  },
  {
    id: "founding",
    name: "Founding Patron",
    price: "$500+",
    tagline: "Steer the work.",
    perks: [
      "Everything in Patron, for life",
      "Your name on the founding wall — permanent",
      "A direct line: help decide what gets built and researched next",
      "First invitation to every live event and gathering",
    ],
    cta: "Founders don't just fund the mission. They shape it.",
  },
];

export const FIRST_BUILD_STEPS = [
  {
    n: "Days 1–2",
    title: "Map it",
    body: "I sit with whoever does the work today and map the workflow as it actually runs, messiness included. We pick the one job and agree on what “done” looks like.",
  },
  {
    n: "Days 3–4",
    title: "Build it",
    body: "I tighten the process first, then build the automation. Every output comes back with a checklist, so a Human verifies the checklist — not the whole output.",
  },
  {
    n: "Day 5",
    title: "Hand the system over",
    body: "Working system, walkthrough with your team, and a one-page handover doc. Your team runs it from there.",
  },
];

export const LEGAL_DOCS = {
  terms: {
    title: "Terms of Service",
    updated: "October 11, 2026",
    intro:
      "These terms are a working placeholder while formal terms are prepared with counsel. By using this site, you agree to these plain-language terms.",
    sections: [
      {
        heading: "Use of the site",
        body: "You may read, share, and link to the public content here. You may not scrape the site at abusive volume, misrepresent the content as your own, or use the site to break the law.",
      },
      {
        heading: "Intellectual property",
        body: "Essays, research, artwork, and brand marks on this site belong to D'Vaughn House unless credited otherwise. You may quote brief passages with attribution; any other reproduction needs written permission.",
      },
      {
        heading: "Purchases",
        body: "Products sold through the store are covered by the terms shown at checkout: what you get, the license scope, and the refund terms are stated before any payment is accepted. No product takes payment before its price and terms are published.",
      },
      {
        heading: "No professional advice",
        body: "Nothing on this site is financial, legal, investment, or medical advice. Token and market content is educational. You are responsible for your own decisions.",
      },
      {
        heading: "Limitation of liability",
        body: "The site is provided as-is. To the extent the law allows, D'Vaughn House is not liable for damages arising from your use of the site.",
      },
      {
        heading: "Changes",
        body: "These terms may be updated as the work grows. The current version always lives at this address, with its last-updated date shown above.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "October 11, 2026",
    intro:
      "This policy is a working placeholder while a formal policy is prepared. In plain language, here is how your information is handled.",
    sections: [
      {
        heading: "What is collected",
        body: "If you use the contact form: your name, email address, and message. The site does not run third-party advertising trackers. Standard server logs (used for security and reliability) may record visits in anonymized or aggregate form.",
      },
      {
        heading: "How it is used",
        body: "Contact details are used only to reply to you. They are never sold, rented, or shared with marketers.",
      },
      {
        heading: "Cookies",
        body: "The site does not set advertising cookies. Basic functional storage in your browser may be used for preferences like display theme.",
      },
      {
        heading: "Data retention",
        body: "Messages sent through the contact form are kept as long as needed to respond and for legitimate record-keeping, then removed on request.",
      },
      {
        heading: "Your rights",
        body: "You may ask what information is held about you, ask for a correction, or ask for deletion, through the contact page. Requests are answered personally.",
      },
      {
        heading: "Changes",
        body: "This policy may be updated as the work grows. The current version always lives at this address, with its last-updated date shown above.",
      },
    ],
  },
};
