// Pure data shared by the Thoughts page (src/thoughts.jsx) and the
// markdown registry (src/lib/md/registry.js). No JSX, no React —
// every line is verbatim from the predecessor homepage, reorganized
// or cut, never rewritten or invented.
//
// STATS are third-party figures, cited with their sources on the page
// and in the markdown version. They are NOT Glenride's own dataset and
// must never be presented as one.

export const BENEFITS = [
  {
    n: "01",
    title: "Cut the busywork",
    body: "AI tools that handle the tedious work for you — built right, no shortcuts.",
  },
  {
    n: "02",
    title: "Get the evidence",
    body: "What's really behind drug shortages, in plain English. Free to read.",
  },
  {
    n: "03",
    title: "Don't get left behind",
    body: "Plain talk on the AI shift — and what you can actually do about it.",
  },
];

export const STATS = [
  {
    value: "227",
    label: "U.S. drugs in shortage, as of Q2 2026 — rising for the third straight quarter",
    source: "ASHP, Q2 2026",
  },
  {
    value: "78%",
    label: "of drug-ingredient factories are outside the U.S., as of the FDA's latest published data",
    source: "FDA",
  },
  {
    value: "~90%",
    label: "of the world's most advanced chips are made in Taiwan, as of 2026",
    source: "Industry analyses, 2026",
  },
  {
    value: "85%",
    label: "of rare-earth refining happens in China, as of 2025",
    source: "IEA, 2025",
  },
  {
    value: "$2.6B",
    label: "average cost to develop one new drug, per the latest Tufts CSDD estimate",
    source: "Tufts CSDD",
  },
  {
    value: "~12%",
    label: "of drugs that enter trials ever get approved, per the latest Tufts CSDD estimate",
    source: "Tufts CSDD",
  },
];

export const STAGES = [
  {
    n: "Stage 01",
    title: "The Factory",
    sub: "AI chief-of-staff OS",
    body: "The way I run AI: persistent memory, an audit log of every action, standing protocols. The work gets done here — and the trail it leaves is the evidence.",
  },
  {
    n: "Stage 02",
    title: "The Issuer",
    sub: "Glenride",
    body: "The think tank doesn't just publish research — it stamps it. Claim, evidence, verifier, timestamp. Other institutions sell reputation. Glenride sells receipts.",
  },
  {
    n: "Stage 03",
    title: "The Proven Library",
    sub: "SpinWave",
    body: "Scholars earn for verified manuscripts and datasets; readers license knowledge they can trust. Set knowledge free — then prove it.",
  },
];

export const AREAS = [
  {
    title: "Supply-chain resilience",
    body: "Where the systems that move medicine and goods break — and who gets hurt when they do.",
  },
  {
    title: "Pharmaceutical data",
    body: "Drug shortages in plain English: what's really behind them, and what you can do about it.",
  },
  {
    title: "Applied AI",
    body: "How AI actually gets directed and verified in real operations — the proof layer, built in the open.",
  },
];
