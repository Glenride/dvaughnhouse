import { useEffect } from "react";

// Thoughts: the old homepage's expository copy, reorganized onto its own
// routed page. Every line below is verbatim from the predecessor homepage
// (commit 10acc7c) — reorganized or cut, never rewritten or invented.

const BENEFITS = [
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

const STATS = [
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

const STAGES = [
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

const AREAS = [
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

const ELSEWHERE = [
  {
    title: "Dispatch",
    body: "The blog. Plain-language investigations — drug shortages, supply chains, the systems that seek to harm you. Published free, verified before asserted.",
    link: "https://blog.dvaughnhouse.com",
    cta: "Read Dispatch",
  },
  {
    title: "Bot HQ",
    body: "The bot team, live. A public status board for the bots that run the work — what they're doing, what they've done, and the receipts.",
    link: "https://bots.dvaughnhouse.com/public",
    cta: "See the bots",
  },
  {
    title: "Store — The Den",
    body: "Everything for sale lives in one store — the Den. Field guides that get you outside and stronger, trail gear and apparel, plus the wider house's tools, digests, and briefings. One shelf, one checkout, nothing scattered.",
    link: "https://den.dvaughnhouse.com",
    cta: "Visit the store",
  },
];

export function ThoughtsPage() {
  useEffect(() => {
    document.title = "Thoughts — D'Vaughn House";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
        Thoughts
      </p>
      <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
        Thoughts.
      </h1>
      <p className="mt-6 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        You don&rsquo;t need another lecture about AI. You need less
        busywork, straight facts on drug shortages, and plain talk on where
        things are headed — from someone who spent fifteen years inside
        the system.
      </p>

      <section aria-label="The principle" className="mt-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl dark:text-cream">
          Everything here runs on one principle: proof, not promises.
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-[1.75] text-ink-soft dark:text-cream-soft">
          This site is the gateway to my work as an independent AI orchestrator — one door into Glenride&rsquo;s investigations, the SpinWave scholarly commons, and the store. It&rsquo;s for anyone who wants proof, not promises: plain-language research and AI systems built in the open, verified before asserted.
        </p>
      </section>

      <section aria-label="What you get" className="mt-20">
        <div className="reveal grid grid-cols-1 gap-5 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.n}
              className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card"
            >
              <h3 className="font-display text-lg font-bold tracking-tight text-ink dark:text-cream">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="What an independent AI orchestrator does" className="mt-20">
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
          What does an independent AI orchestrator do?
        </h2>
        <p className="mt-6 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          An independent AI orchestrator designs, runs, and verifies AI systems outside big institutions — choosing the models, wiring the agents, and proving the work happened as claimed. I build on hardware I own, keep human judgment at the top of every system, and publish the receipts. If you want less busywork, straight facts on systems like drug supply chains, and plain talk on the AI shift without a sales pitch, that&rsquo;s what this site is for.
        </p>
      </section>

      <section aria-label="By the numbers" className="mt-20">
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
          The problem, in numbers
        </h2>
        <div className="mt-12 border-b border-line dark:border-line-dark">
          {STATS.map((s) => (
            <div
              key={s.value + s.label}
              className="grid gap-2 border-t border-line py-7 sm:grid-cols-[12rem_1fr] sm:gap-8 dark:border-line-dark"
            >
              <p className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
                {s.value}
              </p>
              <div>
                <p className="text-[1.0625rem] leading-[1.7] text-ink dark:text-cream">
                  {s.label}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft dark:text-cream-soft">
                  Source: {s.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="The system" className="mt-20">
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
          Three stages, one loop.
        </h2>
        <p className="mt-6 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          The AI chief-of-staff OS does the work &mdash; directed, logged, verified. Glenride attests it &mdash; signed proof that it happened as claimed. SpinWave publishes the best of it &mdash; a library where knowledge isn&rsquo;t just free, it&rsquo;s proven. Every attestation makes the next one stronger.
        </p>
        <div className="reveal mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STAGES.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-paper p-7 dark:border-line-dark dark:bg-night-card">
              <p className="font-mono text-xs font-bold tracking-widest text-sienna-deep dark:text-sienna">{s.n}</p>
              <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-ink dark:text-cream">{s.title}</h3>
              <p className="mt-1 text-sm font-semibold text-sienna-deep dark:text-sienna">{s.sub}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          In a world where every agent claims and nobody verifies, this is the proof layer. Witnessed by Glenride.
        </p>
      </section>

      <section aria-label="Research areas" className="mt-20">
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
          What Glenride&rsquo;s working on now.
        </h2>
        <div className="reveal mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {AREAS.map((a) => (
            <div key={a.title} className="rounded-2xl border border-line bg-paper p-7 dark:border-line-dark dark:bg-night-card">
              <h3 className="font-display text-lg font-bold tracking-tight text-ink dark:text-cream">{a.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">{a.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          All published free, in plain language.
        </p>
      </section>

      <section aria-label="Elsewhere" className="mt-20">
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
          Elsewhere
        </h2>
        <div className="reveal mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {ELSEWHERE.map((card) => (
            <a
              key={card.title}
              href={card.link}
              className="group block rounded-2xl border border-line bg-paper p-7 transition-colors hover:border-sienna-deep dark:border-line-dark dark:bg-night-card dark:hover:border-sienna"
            >
              <h3 className="font-display text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-sienna-deep dark:text-cream dark:group-hover:text-sienna">
                {card.title}
              </h3>
              <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
                {card.body}
              </p>
              <span className="mt-8 inline-flex items-center text-sm font-semibold tracking-wide text-ink transition-colors group-hover:text-sienna-deep dark:text-cream dark:group-hover:text-sienna">
                {card.cta} <span className="ml-2">→</span>
              </span>
            </a>
          ))}
        </div>
        <p className="mt-10">
          <a
            href="/#contact"
            className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
          >
            Start a conversation
          </a>
        </p>
      </section>
    </div>
  );
}
