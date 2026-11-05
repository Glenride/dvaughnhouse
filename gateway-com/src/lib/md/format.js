// Shared markdown formatting helpers. Pure functions, no JSX, no I/O —
// used by the registry at build time and by the Pages Functions at
// request time, so both surfaces render identical markdown.
import { SITE } from "./site.js";

export function absUrl(path) {
  if (!path || path === "/") return `${SITE.url}/`;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function mdTable(headers, rows) {
  const head = `| ${headers.map(escapeCell).join(" | ")} |`;
  const rule = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.map(escapeCell).join(" | ")} |`).join("\n");
  return [head, rule, body].join("\n");
}

// The standard page shell: title, one-sentence summary, canonical URL,
// last-updated date, main content in reading order, then Related links.
// Nav, footer, cookie banners, modals, tracking and repeated sign-up
// CTAs are never included — only the page's main content.
export function mdPage({ title, summary, canonical, updated, body, related = [] }) {
  const parts = [
    `# ${title}`,
    "",
    `> ${summary}`,
    "",
    `Canonical: ${canonical}`,
    `Last updated: ${updated}`,
    "",
    body.trim(),
  ];
  if (related.length) {
    parts.push(
      "",
      "## Related",
      "",
      ...related.map((r) => `- [${r.label}](${r.href})`),
    );
  }
  return `${parts.join("\n")}\n`;
}

export function tokenCount(text) {
  return Math.ceil(text.length / 4);
}
