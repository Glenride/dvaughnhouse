// Dev check: every public route in the app must have a markdown
// renderer, or be on the explicit SKIP list with a reason. Fails the
// build otherwise. Reads the route list from src/entry-server.jsx
// (the same list the prerenderer uses) and compares it with the
// markdown registry — no JSX is imported here.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const entry = readFileSync(join(root, "src", "entry-server.jsx"), "utf8");
const match = entry.match(/export const routes = \[([^\]]+)\]/);
if (!match) throw new Error("check-md-coverage: could not parse routes from src/entry-server.jsx");
const appRoutes = [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

// Explicit skips: public routes with no markdown renderer, and why.
// Empty today — every public route is covered. Add entries here (never
// silently) if a future public route must stay out of markdown.
const SKIP = {};

const { listMarkdownRoutes } = await import(join(root, "src", "lib", "md", "registry.js"));
const mdRoutes = new Set(listMarkdownRoutes().map((r) => r.path));

const failures = [];
for (const route of appRoutes) {
  if (!mdRoutes.has(route) && !SKIP[route]) {
    failures.push(`${route}: public route with no markdown renderer (add one to src/lib/md/registry.js or list it in SKIP with a reason)`);
  }
}
for (const route of mdRoutes) {
  if (!appRoutes.includes(route)) {
    failures.push(`${route}: markdown renderer exists but the route is not in src/entry-server.jsx`);
  }
}
if (failures.length) {
  console.error("check-md-coverage: FAILED");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`check-md-coverage: OK — ${appRoutes.length} public routes, all with markdown renderers`);
