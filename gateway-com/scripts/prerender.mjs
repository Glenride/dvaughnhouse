// Build-time prerendering: renders every route to static HTML with
// react-dom/server so crawlers and AI agents see real content in raw HTML
// instead of an empty <div id="root"> shell. Runs after both the client
// and SSR builds (see package.json "build"). No headless browser needed.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = join(root, "dist");

const { render, routes } = await import(join(root, "dist-ssr", "entry-server.js"));
const { findRoute } = await import(join(root, "src", "lib", "md", "registry.js"));

const titles = {
  "/": "D'Vaughn House: Independent AI Orchestrator in Cincinnati",
  "/donate": "Donate — D'Vaughn House",
  "/patron": "Become a Patron — D'Vaughn House",
  "/about": "About — D'Vaughn House",
  "/first-build": "AI Workflow Automation Services | D'Vaughn House",
  "/terms": "Terms of Service — D'Vaughn House",
  "/privacy": "Privacy Policy — D'Vaughn House",
  "/testimonials": "Share your experience — D'Vaughn House",
  "/audit": "Claim an audit slot — D'Vaughn House",
  "/thoughts": "Thoughts — D'Vaughn House",
  "/projects": "Projects — D'Vaughn House",
  "/404": "Page not found — D'Vaughn House",
};

// og:type per route. Every route is "website": /thoughts is an index of
// essays, not a single article, so og:type=article would be inaccurate
// there. The map exists so a future single-article route can opt in
// honestly without touching the loop below.
const ogTypes = {
  "/": "website",
  "/donate": "website",
  "/patron": "website",
  "/about": "website",
  "/first-build": "website",
  "/terms": "website",
  "/privacy": "website",
  "/testimonials": "website",
  "/audit": "website",
  "/thoughts": "website",
  "/projects": "website",
  "/404": "website",
};

// Page-specific JSON-LD, injected per route. The site-wide graph
// (Person / Organization / WebSite) lives in index.html; routes
// listed here get one additional schema block in their head.
const jsonLd = {
  "/first-build": {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI Workflow Automation Services | The First Build",
    serviceType: "AI workflow automation",
    provider: {
      "@type": "Person",
      name: "D'Vaughn House",
      url: "https://dvaughnhouse.com",
    },
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "City", name: "Cincinnati", addressRegion: "OH", addressCountry: "US" },
    ],
    description:
      "AI workflow automation services: one workflow automated end to end in one week, with a human check on every output. Fixed quote in writing before work starts.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: 2500,
      highPrice: 3500,
      description:
        "One week delivery. $175 per hour, $3,500 hard cap. Fit call free.",
    },
  },
};

const template = readFileSync(join(dist, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) {
  throw new Error("prerender: root placeholder not found in dist/index.html");
}

for (const route of routes) {
  const body = render(route);
  if (!body || body.length < 1000) {
    throw new Error(`prerender: suspiciously small render for ${route} (${body?.length ?? 0} bytes)`);
  }
  let html = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const title = titles[route];
  if (title) {
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    // Social cards: keep og/twitter title + url in step with the page title.
    const escTitle = title.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    html = html.replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      () => `<meta property="og:title" content="${escTitle}" />`,
    );
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      () => `<meta name="twitter:title" content="${escTitle}" />`,
    );
    const pageUrl = route === "/" ? "https://dvaughnhouse.com" : `https://dvaughnhouse.com${route}`;
    html = html.replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      () => `<meta property="og:url" content="${pageUrl}" />`,
    );
    // Canonical: one per route, never the homepage's. og:type follows the
    // per-route map above (website everywhere today).
    html = html.replace(
      "</head>",
      `<link rel="canonical" href="${pageUrl}" />\n  </head>`,
    );
    html = html.replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      () => `<meta property="og:type" content="${ogTypes[route] || "website"}" />`,
    );
  }
  // The 404 page has no registry entry, so it gets its own description
  // and a noindex here instead of in the mdRoute block below.
  if (route === "/404") {
    html = html.replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="Page not found — D'Vaughn House." />`,
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="Page not found — D'Vaughn House." />`,
    );
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="Page not found — D'Vaughn House." />`,
    );
    html = html.replace(
      "</head>",
      `<meta name="robots" content="noindex" />\n  </head>`,
    );
  }
  // Head signals for AI agents (invisible in the rendered page):
  // a factual per-page meta description, an ai-summary, and the
  // alternate markdown version. All copy comes from the registry.
  const mdRoute = findRoute(route);
  if (mdRoute) {
    const esc = (v) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    html = html.replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${esc(mdRoute.description)}" />`,
    );
    // Social cards: description follows the same per-page copy.
    html = html.replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      () => `<meta property="og:description" content="${esc(mdRoute.description)}" />`,
    );
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      () => `<meta name="twitter:description" content="${esc(mdRoute.description)}" />`,
    );
    html = html.replace(
      "</head>",
      `<meta name="ai-summary" content="${esc(mdRoute.aiSummary)}" />
    <link rel="alternate" type="text/markdown" href="${mdRoute.mdPath}" />
  </head>`,
    );
  }
  if (jsonLd[route]) {
    html = html.replace(
      "</head>",
      `<script type="application/ld+json">\n${JSON.stringify(jsonLd[route], null, 2)}\n    </script>\n  </head>`,
    );
  }
  const outDir = route === "/" ? dist : join(dist, route.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`prerendered ${route} -> ${join(outDir, "index.html")} (${html.length} bytes)`);
}
