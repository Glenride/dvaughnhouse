// Build-time generation of the AI-readable surfaces. Runs after
// prerendering (see package.json "build") and writes into dist/ — the
// directory Cloudflare Pages deploys. Nothing here is hand-written:
// llms.txt, llms-full.txt, ai.txt, robots.txt and sitemap.xml are all
// rendered from src/lib/md/registry.js, and every public route gets a
// static .md file (dist/index.md for /, dist/<route>.md otherwise),
// so the markdown versions exist even before any Function runs.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = join(root, "dist");

const {
  getMarkdown,
  listMarkdownRoutes,
  renderAiTxt,
  renderLlmsFull,
  renderLlmsTxt,
  renderRobotsTxt,
  renderSitemapXml,
} = await import(join(root, "src", "lib", "md", "registry.js"));

for (const route of listMarkdownRoutes()) {
  const md = getMarkdown(route.path);
  const file = route.path === "/" ? join(dist, "index.md") : join(dist, `${route.path.slice(1)}.md`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, md);
  console.log(`markdown ${route.mdPath} (${md.length} chars)`);
}

const generated = {
  "llms.txt": renderLlmsTxt(),
  "llms-full.txt": renderLlmsFull(),
  "ai.txt": renderAiTxt(),
  "robots.txt": renderRobotsTxt(),
  "sitemap.xml": renderSitemapXml(),
};
for (const [file, text] of Object.entries(generated)) {
  writeFileSync(join(dist, file), text);
  console.log(`generated ${file} (${text.length} chars)`);
}
