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

const NOT_FOUND_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="robots" content="noindex">' +
  "<title>Page not found</title></head><body><main><h1>Page not found</h1>" +
  '<p><a href="/">Return home</a></p></main></body></html>';

// Direct request for a prerendered file: /index.html, or
// /<route>/index.html for a registry route. Strip the suffix and
// check the registry; anything else ending in index.html is unrouted.
function isPrerenderedIndexHtml(path) {
  if (!path.endsWith("index.html")) return false;
  return findRoute(path.slice(0, -"index.html".length)) !== null;
}

function htmlNotFoundResponse(request) {
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Robots-Tag": "noindex",
    "Cache-Control": "no-cache",
    Vary: "Accept",
  };
  if (request.method === "HEAD") return new Response(null, { status: 404, headers });
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
      return htmlNotFoundResponse(request);
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
