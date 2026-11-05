// Response builder for markdown surfaces, shared by the Pages
// Functions (middleware + /api/md/*). Build-time generation writes
// files instead and does not use this module.
import { tokenCount } from "./format.js";

export function markdownHeaders(body, canonical, updated, { vary = false } = {}) {
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(tokenCount(body)),
    "X-Robots-Tag": "noindex, follow",
    "Content-Location": canonical,
    Link: `<${canonical}>; rel="canonical"`,
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    "Access-Control-Allow-Origin": "*",
  };
  if (vary) headers.Vary = "Accept";
  if (updated) headers["Last-Modified"] = new Date(`${updated}T00:00:00Z`).toUTCString();
  return headers;
}

export function markdownResponse(body, canonical, updated, status = 200, opts = {}) {
  return new Response(body, { status, headers: markdownHeaders(body, canonical, updated, opts) });
}

export function markdownHeadResponse(body, canonical, updated, status = 200, opts = {}) {
  return new Response(null, { status, headers: markdownHeaders(body, canonical, updated, opts) });
}

export function corsPreflightResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
