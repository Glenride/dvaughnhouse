// GET /api/md/<path> — direct markdown endpoint (debugging) and
// GET /api/md/_catalog — the catalog of every addressable markdown
// route. One handler, fed by the same registry as the build-time
// generator, so the API can never drift from the static .md files.
import {
  findRoute,
  getMarkdown,
  listMarkdownRoutes,
  markdownNotFound,
  normalizePath,
} from "../../../src/lib/md/registry.js";
import {
  corsPreflightResponse,
  markdownHeadResponse,
  markdownResponse,
} from "../../../src/lib/md/http.js";
import { SITE } from "../../../src/lib/md/site.js";
import { absUrl } from "../../../src/lib/md/format.js";

export async function onRequest({ request, params }) {
  if (request.method === "OPTIONS") return corsPreflightResponse();
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }
  const isHead = request.method === "HEAD";

  const raw = params.path;
  const segments = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const path = `/${segments.join("/")}`;

  if (path === "/_catalog" || path === "/") {
    const body = JSON.stringify(
      {
        site: SITE.name,
        url: SITE.url,
        routes: listMarkdownRoutes().map((r) => ({
          ...r,
          url: absUrl(r.path),
          mdUrl: absUrl(r.mdPath),
        })),
      },
      null,
      2,
    );
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    };
    return isHead
      ? new Response(null, { status: 200, headers })
      : new Response(body, { status: 200, headers });
  }

  const route = findRoute(normalizePath(path));
  if (!route) {
    const body = markdownNotFound(path);
    return isHead
      ? markdownHeadResponse(body, absUrl("/"), null, 404)
      : markdownResponse(body, absUrl("/"), null, 404);
  }
  const body = getMarkdown(route.path);
  return isHead
    ? markdownHeadResponse(body, absUrl(route.path), route.updated)
    : markdownResponse(body, absUrl(route.path), route.updated);
}
