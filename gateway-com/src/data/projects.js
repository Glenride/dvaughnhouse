// Single source of truth for project copy on the gateway.
//
// One edit here propagates to every render site: the homepage rooms,
// the /projects cards, the bio parenthetical, the /thoughts Elsewhere
// entries, and the footer "The Den" link. A rename, URL change,
// or status flip is a one-field edit in this file — never a site-wide hunt.
//
// Fields: id, label (exact display name), href (exact URL), status
// (exact display string), state ("live" | "in-build" | "pre-launch" |
// "suspended"), line (exact one-line description; omitted where the
// project has no card line, e.g. the Den), and placement flags:
// room (homepage room), projects (/projects card), bioSystems (named
// in the bio parenthetical), elsewhere (/thoughts Elsewhere entry),
// registry (Witness attestation panel, homepage only), lockup
// (D'Quizz lockup image instead of a line-art icon).
//
// btn is derived, never stored: every current button text is exactly
// the href minus "https://", so a URL change is a one-field edit.
//
// History note: Tress Column is the fair-launch platform renamed from
// Pearls (Nov 1, 2026); its landing page went live Nov 2, 2026 at
// tc.dvaughnhouse.com, and pearls.dvaughnhouse.com 301-redirects to it.
// The "renamed from Pearls" wording in the Tress Column line is accurate
// history, not a stale reference.

const RAW_PROJECTS = [
  {
    id: "thinktank",
    label: "ThinkTank OS",
    href: "https://dvaughnhouse.org",
    status: "Live / In build",
    state: "in-build",
    line: "The working surface and the database behind it: manuscripts and data, stored with attestation.",
    room: true,
    projects: true,
  },
  {
    id: "witness",
    label: "Witness",
    href: "https://dvaughnhouse.org/attestations",
    status: "Live — V1 shipped",
    state: "live",
    line: "Signed proof that work happened as claimed — its first attestation, GLR-AT-2026-SN6RRF, is issued and open to challenge.",
    room: true,
    projects: true,
    registry: true,
  },
  {
    id: "spinwave",
    label: "SpinWave",
    href: "https://spinwave.tech",
    status: "In build — live status not yet claimed",
    state: "in-build",
    line: "A manuscript and data repository built on one idea: the Humans who create new knowledge get paid proportionately for it.",
    room: true,
    projects: true,
    bioSystems: true,
  },
  {
    id: "inspirewrite",
    label: "InspireWrite",
    href: "https://inspirewrite.online",
    status: "Live",
    state: "live",
    line: "InspireWrite by Glenride: scripture reading and private journaling, distraction-free by design.",
    room: true,
    projects: true,
  },
  {
    id: "dquizz",
    label: "D’Quizz",
    href: "https://app.dvaughnhouse.com",
    status: "Live — since October 22, 2026",
    state: "live",
    line: "My most shipped product: a quiz-funnel tool with sign-in and Stripe subscriptions fully wired — plans run Starter $29/mo, Pro $99/mo, Agency $399/mo.",
    room: true,
    projects: true,
    lockup: true,
  },
  {
    id: "dispatch",
    label: "Dispatch",
    href: "https://blog.dvaughnhouse.com",
    status: "Live",
    state: "live",
    line: "The blog. Plain-language investigations — drug shortages, supply chains, the systems that seek to harm you. Published free, verified before asserted.",
    projects: true,
    elsewhere: true,
  },
  {
    id: "bothq",
    label: "Bot HQ",
    href: "https://bots.dvaughnhouse.com/public",
    status: "Live — public status board",
    state: "live",
    line: "The bot team, live. A public status board for the bots that run the work — what they're doing, what they've done, and the receipts.",
    projects: true,
    elsewhere: true,
  },
  {
    id: "tress",
    label: "Tress Column",
    href: "https://tc.dvaughnhouse.com",
    status: "In build — landing page live",
    state: "in-build",
    line: "The fair-launch platform, renamed from Pearls — the landing page is live while the exchange itself is still in build.",
    projects: true,
    bioSystems: true,
  },
  {
    id: "homelab",
    label: "Homelab",
    href: "https://homelab.dvaughnhouse.com",
    status: "Live",
    state: "live",
    line: "Public journal of home-lab builds.",
    projects: true,
  },
  {
    id: "freewill",
    label: "The Free-Will Machine",
    href: "https://freewill.dvaughnhouse.com",
    status: "Live",
    state: "live",
    line: "Interactive architecture study — AI machinery that can never override humans.",
    projects: true,
  },
  {
    id: "catalog",
    label: "Glenride Catalog",
    href: "https://glenride-catalog.pages.dev",
    status: "Live",
    state: "live",
    line: "Public directory of everything Glenride has shipped — 59 entries, search + filters.",
    projects: true,
  },
  {
    id: "den",
    label: "The Den",
    href: "https://den.dvaughnhouse.com",
    status: "Pre-launch",
    state: "pre-launch",
    elsewhere: true,
  },
];

export const PROJECTS = RAW_PROJECTS.map((p) => ({
  ...p,
  btn: p.href.replace(/^https:\/\//, ""),
}));

// Homepage rooms, in array order.
export const ROOM_PROJECTS = PROJECTS.filter((p) => p.room);

// /projects cards, in array order.
export const PROJECT_CARD_PROJECTS = PROJECTS.filter((p) => p.projects);

// Bio parenthetical order. NOT array order: the bio reads SpinWave,
// Witness, Tress Column, while array order would give Witness first.
export const BIO_SYSTEM_IDS = ["spinwave", "witness", "tress"];

export function projectById(id) {
  return PROJECTS.find((p) => p.id === id);
}

// Resolves BIO_SYSTEM_IDS to display labels, in bio order.
export function bioSystemLabels() {
  return BIO_SYSTEM_IDS.map((id) => projectById(id).label);
}
