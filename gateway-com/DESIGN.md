# DESIGN.md — dvaughnhouse.com (INCUMBENT extraction, 2026-10-21)

Document step of the Impeccable workflow: what the live gateway actually is today,
extracted from source (src/App.jsx, 1,298 lines, single component file; Tailwind 3,
empty theme.extend — every token is a utility class at the call site).

## Incumbent system
- **Palette:** Tailwind slate (slate-50→950) + amber/red accents. Dual light/dark via `dark:` variants throughout.
- **Type:** system stack only (ui-sans-serif/system-ui). No webfont is loaded anywhere. Mono (ui-monospace) used for label pills.
- **Signature elements:**
  - Gradient CTAs: `bg-gradient-to-r from-amber-600 to-red-600`, white text (header line 48, hero line 163).
  - Hero: full-bleed photo, slate-950 gradient overlay, white text; H1 contains a gradient-text span (`from-amber-400 to-red-400 bg-clip-text`, line 128 — the detector's gradient-text finding).
  - Kicker pill directly above the H1: mono, uppercase, tracking-widest, bordered pill (line 122).
  - "By the numbers" section (line 228): big amber numerals — the hero-metric template pattern.
  - Work cards: `rounded-2xl bg-white/95 backdrop-blur` over the hero image — glass-as-decoration.
  - Radii: rounded-lg/xl/2xl mixed. Shadows: shadow-lg + colored shadow-orange-500/20.
- **Structure:** sticky header (logo text + About/Work/Contact + gradient Donate button, mobile menu) → hero (photo, kicker pill, H1, two paragraphs, 3 mini-cards, 2 CTAs) → "What an independent AI orchestrator does" → "By the numbers" → Work cards (Glenride / SpinWave / Store, work-*.webp) → About → Contact (Pages Function POST /api/contact) → footer.
- **Assets present:** glenride-logo.png (authoritative mark), hero-supply-network.webp, hero-collab.jpg, hero-donate.jpg, work-research/ai-systems/advisory/store .webp.
  - Note (2026-11-24 refactor): hero-supply-network.webp, hero-collab.jpg, hero.png, work-research/ai-systems/advisory/store .webp, flash-sale-audit.webp, react.svg, vite.svg, and media-generation-work-store-1791685184.json were unimported dead assets and were removed from src/assets. hero-donate.jpg, dvaughn-house-logo.png, glenride-logo.png, and house-mark.png were converted to WebP (same filenames, .webp) — see the Nov 24 refactor commit.
- **Build/deploy:** Vite + SSR prerender (`npm run build`), Cloudflare Pages project dvaughnhouse-gateway, wrangler.toml in repo, functions/ for the contact API.

## Detector findings on the live page (2026-10-21)
gradient-text ×1 · flat-type-hierarchy ×1 · em-dash-overuse ×1 (advisory).
Plus guide-level violations the file-mode detector can't see in an SPA shell:
eyebrow/kicker above heading (line 122), hero-metric structure, glass cards, gradient buttons with white text.

## Gap vs target (Glenride identity)
Warm paper / ink #221D18 / sienna #E97451 (fills only; #B84A2B as text) / display serif /
pill controls / proof-in-interface — none of it is present. This is a token-and-treatment
transplant onto the existing structure, not a content rewrite. See REDESIGN-PROGRAM-2026-10-21.md.
