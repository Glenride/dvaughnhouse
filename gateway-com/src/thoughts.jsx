import { useEffect } from "react";
import flashSaleAudit from "./assets/flash-sale-audit.webp";
import { projectById } from "./data/projects.js";
import { AUDIT_PAY_URL, AUDIT_PRICE } from "./data/site-content.js";
import { AREAS, BENEFITS, STAGES, STATS } from "./data/thoughts-content.js";

// Thoughts: the old homepage's expository copy, reorganized onto its own
// routed page. Every line below is verbatim from the predecessor homepage
// (commit 10acc7c) — reorganized or cut, never rewritten or invented.

// Elsewhere titles + links (and Dispatch / Bot HQ bodies, which are verbatim
// the card lines) come from the central project module; the Den body stays
// local because the Den has no card line. CTAs stay local.
const ELSEWHERE = [
  {
    title: projectById("dispatch").label,
    body: projectById("dispatch").line,
    link: projectById("dispatch").href,
    cta: "Read Dispatch",
  },
  {
    title: projectById("bothq").label,
    body: projectById("bothq").line,
    link: projectById("bothq").href,
    cta: "See the bots",
  },
  {
    title: projectById("den").label,
    body: "Everything for sale lives in one store — the Den. Field guides that get you outside and stronger, trail gear and apparel, plus the wider house's tools, digests, and briefings. One shelf, one checkout, nothing scattered.",
    link: projectById("den").href,
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

      {/* Flash sale, added November 5, 2026 — dated offer, not predecessor-homepage copy. */}
      <section aria-label="Flash sale" className="mt-20">
        <div className="overflow-hidden rounded-2xl border border-line bg-paper dark:border-line-dark dark:bg-night-card">
          <div className="grid gap-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <img
              src={flashSaleAudit}
              alt="AI Workflow Audit — $374.50, two slots, book by Friday"
              className="h-full w-full object-cover"
            />
            <div className="p-7 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
                The Founder&rsquo;s Override — book by Sunday night
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
                Two audit slots open — {AUDIT_PRICE} each, tax included.
              </h2>
              <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
                The full First Build week is $2,520 at the standard rate — this two-hour audit is the {AUDIT_PRICE} way in (tax included).
              </p>
              <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
                I spend two hours on your most repetitive task: I map how it
                runs today, and hand you the written map plus the first
                automation to build. You keep the decision; the machine does
                the repetition.
              </p>
              <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
                Pay by Sunday night to lock a slot, and we do the two hours
                next week at a time that works. First come, first served.
              </p>
              <p className="mt-6">
                <a
                  href="/audit"
                  className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
                >
                  Claim a slot →
                </a>
              </p>
              <p className="mt-4 text-sm">
                <a
                  href={AUDIT_PAY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-sienna-deep underline underline-offset-4 hover:text-ink dark:text-sienna dark:hover:text-cream"
                >
                  Or pay {AUDIT_PRICE} now to lock it →
                </a>
              </p>
              <p className="mt-6 text-xs text-ink-soft dark:text-cream-soft">
                All images on this page are illustrations generated for this article unless otherwise credited.
              </p>
            </div>
          </div>
        </div>
      </section>

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
