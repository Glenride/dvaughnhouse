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
  "/": "D'Vaughn House — Independent AI Orchestrator",
  "/donate": "Donate — D'Vaughn House",
  "/patron": "Become a Patron — D'Vaughn House",
  "/about": "About — D'Vaughn House",
  "/first-build": "The First Build — D'Vaughn House",
  "/terms": "Terms of Service — D'Vaughn House",
  "/privacy": "Privacy Policy — D'Vaughn House",
  "/testimonials": "Share your experience — D'Vaughn House",
  "/audit": "Claim an audit slot — D'Vaughn House",
  "/thoughts": "Thoughts — D'Vaughn House",
  "/projects": "Projects — D'Vaughn House",
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
  const outDir = route === "/" ? dist : join(dist, route.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`prerendered ${route} -> ${join(outDir, "index.html")} (${html.length} bytes)`);
}
