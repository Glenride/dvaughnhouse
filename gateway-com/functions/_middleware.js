// Pages Functions middleware — the content-negotiation layer.
//
// - GET /<route>.md → markdown for that route (with the prompt's
//   headers), or a markdown 404. Static .md files also exist in dist/
//   from the build, but the Function answers first so the headers
//   (Content-Type, X-Robots-Tag, Content-Location, …) are correct.
// - GET /<route> with Accept: text/markdown preferred over text/html
//   (q-values parsed; */* or a missing Accept header ALWAYS gets
//   HTML) → markdown, Vary: Accept.
// - Unrouted page paths (no registry route, e.g. /guide) → a real
//   404 here, before context.next() can fall through to the
//   `/* /index.html 200` SPA fallback in _redirects, which served
//   the homepage shell with 200 and read as duplicate content.
//   Direct requests for a prerendered file (/index.html,
//   /<route>/index.html) still fall through to static serving.
// - Everything else passes through; HTML responses get a Link header
//   advertising /llms.txt, /llms-full.txt and /ai.txt (rel=describedby).
// - Never applied to /api/*, /auth/*, /llms.txt, /llms-full.txt,
//   /ai.txt, /robots.txt, /sitemap.xml, static assets, or any real
//   route that already ends in .md outside the registry.
import {
  findRoute,
  getMarkdown,
  markdownNotFound,
  normalizePath,
  prefersMarkdown,
} from "../src/lib/md/registry.js";
import {
  corsPreflightResponse,
  markdownHeadResponse,
  markdownResponse,
} from "../src/lib/md/http.js";
import { absUrl } from "../src/lib/md/format.js";

// Fallback 404 body, used only if the prerendered /404 page cannot be
// read from the static asset store (e.g. the ASSETS binding is
// unavailable). Same links as the React NotFoundPage in src/App.jsx —
// keep the two in sync. Standalone: no external CSS/JS, so it renders
// even if the asset pipeline is down.
const NOT_FOUND_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '<meta name="robots" content="noindex">' +
  "<title>Page not found — D'Vaughn House</title>" +
  "<style>body{margin:0;background:#FAF5EC;color:#221D18;font-family:Georgia,serif}" +
  "main{max-width:48rem;margin:0 auto;padding:4rem 1.5rem}" +
  "h1{font-size:2.5rem;line-height:1.1;margin:0 0 1.5rem}" +
  "p{font-size:1.0625rem;line-height:1.7;color:#57504A}" +
  "a{color:#B84A2B;font-weight:600}" +
  "ul{margin:2rem 0;padding:0;list-style:none}" +
  "li{margin:.75rem 0}</style></head><body><main><h1>Page not found.</h1>" +
  "<p>That page doesn&rsquo;t exist here &mdash; it may have moved, or the link may be wrong. The work is still here:</p>" +
  "<ul>" +
  '<li><a href="/">Home</a></li>' +
  '<li><a href="/about">About</a></li>' +
  '<li><a href="/projects">Projects</a></li>' +
  '<li><a href="/thoughts">Thoughts</a></li>' +
  '<li><a href="/first-build">The First Build</a></li>' +
  '<li><a href="/donate">Donate</a></li>' +
  "</ul>" +
  '<p>Looking for something else? <a href="/#contact">Send a message through the contact form</a>.</p>' +
  "</main></body></html>";

// Direct request for a prerendered file: /index.html, or
// /<route>/index.html for a registry route, or /404/index.html.
// Strip the suffix and check the registry; anything else ending in
// index.html is unrouted.
function isPrerenderedIndexHtml(path) {
  if (!path.endsWith("index.html")) return false;
  if (path === "/404/index.html") return true;
  return findRoute(path.slice(0, -"index.html".length)) !== null;
}

async function htmlNotFoundResponse(context) {
  const { request } = context;
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Robots-Tag": "noindex",
    "Cache-Control": "no-cache",
    Vary: "Accept",
  };
  if (request.method === "HEAD") return new Response(null, { status: 404, headers });
  // Serve the real prerendered 404 page (dist/404/index.html) with a 404
  // status, so the error page carries the site header/footer/nav.
  const assets = context.env && context.env.ASSETS;
  if (assets) {
    try {
      const res = await assets.fetch(new Request(new URL("/404/", request.url)));
      if (res.ok) {
        return new Response(await res.text(), { status: 404, headers });
      }
    } catch {
      // Fall through to the inline page below.
    }
  }
  return new Response(NOT_FOUND_HTML, { status: 404, headers });
}

const DESCRIBEDBY =
  `</llms.txt>; rel="describedby", </llms-full.txt>; rel="describedby", </ai.txt>; rel="describedby"`;

const PASSTHROUGH = [
  "/llms.txt",
  "/llms-full.txt",
  "/ai.txt",
  "/robots.txt",
  "/sitemap.xml",
];

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const isAsset =
    path.startsWith("/api/") ||
    path.startsWith("/auth/") ||
    path.startsWith("/assets/") ||
    PASSTHROUGH.includes(path) ||
    /\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|map|json)$/i.test(path);

  if (!isAsset) {
    // The prerendered 404 page itself: fall through to static serving
    // (dist/404/index.html) instead of answering 404 here.
    if (path === "/404" || path === "/404/") return context.next();

    // .md suffix: /pricing.md style, /index.md for the homepage.
    if (path.endsWith(".md")) {
      const htmlPath = path === "/index.md" ? "/" : normalizePath(path.slice(0, -3));
      const route = findRoute(htmlPath);
      if (request.method === "OPTIONS") return corsPreflightResponse();
      if (request.method === "HEAD") {
        if (!route) {
          const body = markdownNotFound(htmlPath);
          return markdownHeadResponse(body, absUrl("/"), null, 404);
        }
        return markdownHeadResponse(getMarkdown(route.path), absUrl(route.path), route.updated);
      }
      if (request.method === "GET") {
        if (!route) {
          const body = markdownNotFound(htmlPath);
          return markdownResponse(body, absUrl("/"), null, 404);
        }
        return markdownResponse(getMarkdown(route.path), absUrl(route.path), route.updated);
      }
      return context.next();
    }

    // Unrouted page path: answer 404 here instead of falling through
    // to the SPA fallback (which would serve the homepage shell
    // with 200). Prerendered index.html files for real routes still
    // fall through to static serving below. Markdown-preferring
    // clients get the same markdown 404 the .md branch returns.
    const route = findRoute(path);
    if (!route && !isPrerenderedIndexHtml(path)) {
      if (prefersMarkdown(request.headers.get("Accept"))) {
        const body = markdownNotFound(normalizePath(path));
        if (request.method === "HEAD") {
          return markdownHeadResponse(body, absUrl("/"), null, 404);
        }
        return markdownResponse(body, absUrl("/"), null, 404);
      }
      return htmlNotFoundResponse(context);
    }

    // Content negotiation on the HTML route itself.
    if (route && request.method !== "OPTIONS") {
      if (request.method === "HEAD" && prefersMarkdown(request.headers.get("Accept"))) {
        return markdownHeadResponse(getMarkdown(route.path), absUrl(route.path), route.updated, 200, {
          vary: true,
        });
      }
      if (request.method === "GET" && prefersMarkdown(request.headers.get("Accept"))) {
        return markdownResponse(getMarkdown(route.path), absUrl(route.path), route.updated, 200, {
          vary: true,
        });
      }
    }
  }

  const response = await context.next();
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("text/html")) {
    const headers = new Headers(response.headers);
    headers.set("Link", DESCRIBEDBY);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
}
