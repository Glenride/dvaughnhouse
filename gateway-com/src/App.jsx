import { useEffect, useState } from "react";
import heroDonate from "./assets/hero-donate.jpg";
import glenrideLogo from "./assets/glenride-logo.png";
import brandLogo from "./assets/dvaughn-house-logo.png";
import { CursorTrail, Parallax, useRevealOnScroll } from "./motion.jsx";
import { SiteNav } from "./nav.jsx";
import { ThoughtsPage } from "./thoughts.jsx";
import { ProjectsPage } from "./projects.jsx";
import { TestimonialsPage } from "./testimonials.jsx";
import { AuditPage } from "./audit.jsx";
import {
  CloseSection,
  CustomCursor,
  FlashSaleBanner,
  Motto,
  PinnedBio,
  PortfolioFooter,
  PortfolioHero,
  WorkRooms,
} from "./home.jsx";
import { projectById } from "./data/projects.js";
import {
  DONATION_ADDRESS,
  DONATION_NETWORK,
  FIRST_BUILD_STEPS,
  LEGAL_DOCS,
  PATRON_TIERS,
  PILLARS,
} from "./data/site-content.js";

function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
        Built in regulated rooms. Building outside them now.
      </h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <p className="text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          For over a decade I managed data pipelines and regulatory compliance
          for clinical trials &mdash; first at the University of Cincinnati, then at
          AstraZeneca and Merck. That work taught me two things: how to run
          systems where mistakes have consequences, and how much good work
          dies inside bureaucracy.
        </p>
        <p className="text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          Today I operate as an independent AI orchestrator. I design
          agentic systems that run on hardware I own, publish research
          through an independent think tank, and build in public so the
          receipts are visible. Human judgment stays at the top of every
          system I ship &mdash; the machine proposes, the Human decides.
        </p>
      </div>

      <div className="reveal mt-14 flex flex-col gap-8 rounded-2xl border border-line bg-paper p-8 sm:p-10 sm:flex-row sm:items-center dark:border-line-dark dark:bg-night-card">
        <img
          src={glenrideLogo}
          alt="Glenride think tank logo"
          className="h-28 w-28 shrink-0 rounded-2xl"
        />
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
            About Glenride
          </p>
          <p className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-cream">
            Glenride is an independent, AI-native think tank. We find where critical systems break before the break becomes harm &mdash; and we publish a record anyone can check.
          </p>
          <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            We study supply chains, pharmaceutical data, and the software systems modern life quietly depends on. We measure what others guess at, we show our sources, and we sign our work. When a finding is strong enough to change a rule, we carry it to the people who write the rules. When an answer can become a tool, we build the tool.
          </p>
          <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            Our money comes from our work, so our conclusions answer to evidence, not to a sponsor. &mdash; D&rsquo;Vaughn House, Founder
          </p>
        </div>
      </div>

      <h2 className="mt-14 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        The five pillars
      </h2>
      <div className="reveal mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-line bg-paper p-7 dark:border-line-dark dark:bg-night-card"
          >
            <h3 className="font-display text-lg font-bold tracking-tight text-ink dark:text-cream">
              {p.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonatePage() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Donate — D'Vaughn House";
    window.scrollTo(0, 0);
  }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(DONATION_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <section aria-label="Support the mission" className="relative isolate overflow-hidden bg-night text-cream">
        <Parallax className="absolute inset-0" speed={0.18}>
          <img
            src={heroDonate}
            alt="A speaker on stage before a packed grand hall — carrying the mission to the people"
            className="h-full w-full object-cover animate-kenburns"
            loading="eager"
          />
        </Parallax>
        <div aria-hidden="true" className="absolute inset-0 bg-ink/60" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-center px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-cream sm:text-6xl">
              Fuel the mission.
            </h1>
            <p className="mt-6 text-[1.0625rem] leading-[1.7] text-cream/85">
              Fund independent investigation into the systems that touch your health,
              your work, and your future — and keep the findings free for everyone.
            </p>
            <div className="mt-8">
              <a
                href="#send"
                className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
              >
                Get the address
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16 lg:px-8">
      <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
        <p className="text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          <strong className="font-bold text-ink dark:text-cream">Plain talk first:</strong> I am not a
          nonprofit and I do not have tax-exempt status. Nothing you send here
          is tax-deductible. This is personal support for independent work —
          not a charitable contribution, not an investment, and not a purchase.
        </p>
      </div>

      <div className="reveal mt-10 space-y-12 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
            Where does my donation go?
          </h2>
          <p className="mt-4 max-w-3xl">
            Straight to independent work. Donations fund Glenride&rsquo;s investigations — drug-shortage research, supply-chain analysis, plain-language publishing — plus the infrastructure that keeps everything free to read. They don&rsquo;t buy influence over findings, equity, tokens, or returns. The address is a 1-of-1 Safe on Base, controlled by my own wallet, and every investigation is published whether the conclusions are convenient or not.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
            Sponsor the findings. Never the conclusions.
          </h2>
          <div className="mt-8">
            <ul className="space-y-6">
              <li>
                <strong className="font-semibold text-ink dark:text-cream">Evidence nobody bought.</strong>{" "}
                Every investigation is funded by people, not sponsors — so when
                Glenride publishes on drug shortages, you know the conclusion
                wasn&rsquo;t purchased.
              </li>
              <li>
                <strong className="font-semibold text-ink dark:text-cream">Research that stays public.</strong>{" "}
                Findings go out in plain language, free to read. Your support is
                what keeps it that way — no paywall, no gatekeeper.
              </li>
              <li>
                <strong className="font-semibold text-ink dark:text-cream">Eyes on your own medicine cabinet.</strong>{" "}
                227 drugs are in shortage in the U.S., as of Q2 2026 (ASHP). Independent
                investigation into why is a public good you personally benefit from.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
            What it never does
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>It doesn&rsquo;t buy equity, tokens, or a share of anything.</li>
            <li>It doesn&rsquo;t buy influence over the research — findings get published as they&rsquo;re found, whether they&rsquo;re convenient or not.</li>
            <li>It doesn&rsquo;t come with promises about returns. Ever.</li>
          </ul>
        </section>

        <section id="send" className="scroll-mt-24">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
            Where to send it
          </h2>
          {DONATION_ADDRESS ? (
            <>
            <div className="mt-4 rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-soft dark:text-cream-soft">
                {DONATION_NETWORK} address
              </p>
              <p className="mt-3 break-all font-mono text-sm text-ink dark:text-cream">
                {DONATION_ADDRESS}
              </p>
              <button
                type="button"
                onClick={copyAddress}
                className="mt-4 inline-flex items-center rounded-full bg-sienna px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
              >
                {copied ? "Copied ✓" : "Copy address"}
              </button>
            </div>
              <div
                role="alert"
                className="mt-6 flex gap-3 rounded-2xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-700 dark:bg-red-950/50"
              >
                <svg
                  className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="text-base font-semibold leading-relaxed text-red-800 dark:text-red-200">
                  {DONATION_NETWORK} network only. Assets sent on any other
                  network may be permanently unrecoverable.
                </p>
              </div>
            </>
          ) : (
            <p className="mt-3">
              The donation address is being set up — check back soon. Nothing
              here will ever ask you to send funds to an address posted
              anywhere else.
            </p>
          )}
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
            Another way to support
          </h2>
          <p className="mt-3">
            If you&rsquo;d rather support the work commercially, reach out
            through the{" "}
            <a href="/#contact" className="font-semibold text-sienna-deep underline underline-offset-4 transition-colors hover:text-ink dark:text-sienna dark:hover:text-cream">
              contact form
            </a>
            .
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}

function PatronPage() {
  const [form, setForm] = useState({ name: "", email: "", tier: "insider", message: "", company: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    document.title = "Become a Patron — D'Vaughn House";
    window.scrollTo(0, 0);
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const res = await fetch("/api/patron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus({
          state: "success",
          message:
            form.tier === "insider"
              ? "You're in. Watch your inbox — the next Dispatch is on its way."
              : "Received. I'll personally follow up within 48 hours to arrange your patronage — thank you.",
        });
        setForm({ name: "", email: "", tier: "insider", message: "", company: "" });
      } else if (data.error === "storage_not_configured") {
        setStatus({ state: "error", message: "Signup isn't online yet — check back soon." });
      } else if (data.error === "rate_limited") {
        setStatus({ state: "error", message: "Too many signups in a short time — try again in an hour." });
      } else {
        setStatus({ state: "error", message: "Something didn't validate — check the fields and try again." });
      }
    } catch {
      setStatus({ state: "error", message: "Couldn't send — check your connection and try again." });
    }
  }

  const inputCls =
    "w-full rounded-xl border border-ink/20 bg-paper-deep px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-sienna-deep dark:border-cream/20 dark:bg-night-card dark:text-cream dark:placeholder:text-cream-soft/70 dark:focus:border-sienna";

  return (
    <div>
      <section aria-label="Become a patron" className="border-b border-line bg-paper-deep dark:border-line-dark dark:bg-night-deep">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-20 lg:px-8">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
            Become a patron of the work.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            Independent work needs independent funding. Patrons keep the
            research free, the videos honest, and the mission pointed at people —
            not sponsors.
          </p>
          <div className="mt-8">
            <a
              href="#join"
              className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
            >
              Choose your tier
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16 lg:px-8">
        <div className="reveal grid gap-6 md:grid-cols-3">
          {PATRON_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="flex flex-col rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card"
            >
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-cream">
                {tier.name}
              </h2>
              <p className="mt-2 text-base italic text-ink-soft dark:text-cream-soft">
                {tier.tagline}
              </p>
              <p className="mt-1 text-lg font-semibold text-ink dark:text-cream">{tier.price}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span aria-hidden="true" className="text-sienna-deep dark:text-sienna">✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm italic text-ink-soft dark:text-cream-soft">{tier.cta}</p>
            </div>
          ))}
        </div>

        <div id="join" className="mx-auto mt-16 max-w-2xl scroll-mt-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl dark:text-cream">
            Join as a patron
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            Tell me who you are and which tier fits. For paid tiers, I follow up
            personally within 48 hours to arrange everything — no automated
            billing, no surprises.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="patron-name" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
                  Name
                </label>
                <input
                  id="patron-name" type="text" required maxLength={100}
                  value={form.name} onChange={set("name")} className={inputCls}
                  placeholder="Your name" autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="patron-email" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
                  Email
                </label>
                <input
                  id="patron-email" type="email" required maxLength={254}
                  value={form.email} onChange={set("email")} className={inputCls}
                  placeholder="you@example.com" autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="patron-tier" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
                Tier
              </label>
              <select id="patron-tier" value={form.tier} onChange={set("tier")} className={inputCls}>
                {PATRON_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} — {tier.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="patron-message" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
                Anything you want me to know? <span className="font-normal text-ink-soft dark:text-cream-soft">(optional)</span>
              </label>
              <textarea
                id="patron-message" maxLength={2000} rows={3}
                value={form.message} onChange={set("message")} className={inputCls}
                placeholder="Why this work matters to you, what you'd like to see built…"
              />
            </div>
            {/* Honeypot: invisible to humans, irresistible to bots */}
            <input
              type="text" name="company" value={form.company} onChange={set("company")}
              tabIndex={-1} autoComplete="off" aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
            />
            <div>
              <button
                type="submit"
                disabled={status.state === "sending"}
                className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper disabled:opacity-60"
              >
                {status.state === "sending" ? "Sending…" : "Become a patron"}
              </button>
            </div>
            {status.state === "success" && (
              <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {status.message}
              </p>
            )}
            {status.state === "error" && (
              <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
                {status.message}
              </p>
            )}
          </form>

          <div className="mt-10 rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
            <p className="text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
              <strong className="font-bold text-ink dark:text-cream">Plain talk:</strong> I am not a
              nonprofit and I do not have tax-exempt status. Patronage is
              personal support for independent work — not a charitable
              contribution, not tax-deductible, not an investment, and not a
              purchase. Paid tiers are arranged personally, by me, after you
              sign up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalPage({ doc }) {
  useEffect(() => {
    document.title = `${doc.title} — D'Vaughn House`;
    window.scrollTo(0, 0);
  }, [doc.title]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl dark:text-cream">
        {doc.title}
      </h1>
      <p className="mt-3 text-sm text-ink-soft dark:text-cream-soft">
        Last updated: {doc.updated}
      </p>
      <p className="mt-6 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">{doc.intro}</p>
      <div className="reveal mt-10 space-y-8">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl font-bold text-ink dark:text-cream">
              {s.heading}
            </h2>
            <p className="mt-2 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

function FirstBuildPage() {
  const steps = FIRST_BUILD_STEPS;
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
        D&rsquo;Vaughn House — Independent AI Orchestrator, Cincinnati, Ohio
      </p>
      <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
        The First Build
      </h1>
      <p className="mt-6 max-w-3xl font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-cream">
        One week. One workflow. One working system.
      </p>
      <p className="mt-6 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        I take the single most repetitive job in your business — the one your
        team does the same way every day or every week — and I build the system
        that runs it, with a Human check at the end. You keep the decision. The
        machine does the repetition.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="/#contact"
          className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
        >
          Start with a fit call
        </a>
      </div>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        Who it&rsquo;s for
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Small businesses and independent operators. If the work lives in
        inboxes, spreadsheets, forms, or copy-paste between tools, it fits.
      </p>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        What happens in the week
      </h2>
      <div className="reveal mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-line bg-paper p-7 dark:border-line-dark dark:bg-night-card">
            <p className="font-mono text-xs font-bold tracking-widest text-sienna-deep dark:text-sienna">{s.n}</p>
            <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-ink dark:text-cream">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Your week: about 15–25 hours of focused work. Your team&rsquo;s time:
        about 4–6 hours total — the mapping session, a check-in or two, and the
        handover.
      </p>

      <div className="mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
            What&rsquo;s included
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            <li>One workflow, automated end to end</li>
            <li>A Human check step built into every output — the machine proposes, the Human decides</li>
            <li>The tightened process, written down — so the work stays clean even if the tool changes</li>
            <li>A handover call with the team who will run it</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
            What&rsquo;s not included
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            <li>Ongoing maintenance or monitoring (available as a follow-on)</li>
            <li>Additional workflows — that&rsquo;s the next build, not this one</li>
            <li>Software licenses or subscriptions (billed at cost, only if the build needs them)</li>
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-line bg-paper-deep p-8 sm:p-10 dark:border-line-dark dark:bg-night-card">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream">
          Price, fixed scope, quoted up front
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          <strong className="font-bold text-ink dark:text-cream">$126 per hour.</strong>{" "}
          First three clients:{" "}
          <strong className="font-bold text-ink dark:text-cream">$75 per hour (founding rate).</strong>{" "}
          A typical week runs about 20 hours, so roughly{" "}
          <strong className="font-bold text-ink dark:text-cream">$2,520</strong> at the
          standard rate,{" "}
          <strong className="font-bold text-ink dark:text-cream">$1,500</strong> for
          the first three clients. Quoted up front once the fit call confirms
          the scope — no surprise hours.
        </p>
        <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
          If the fit call shows the job doesn&rsquo;t fit, I&rsquo;ll say so on
          that call — no engagement, no charge.
        </p>
      </div>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        Why me
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        D&rsquo;Vaughn House is an Independent AI Orchestrator in Cincinnati
        and founder of Glenride. He previously coordinated pharmaceutical
        research programs for over a decade — including a contract assignment
        with ICON Clinical Research at AstraZeneca, where he ran coordination
        for a Real World Evidence group of 30+ epidemiologists — and now builds
        AI systems for small operators: agents, automations, and transcription
        pipelines that run on his own machines.
      </p>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        Next step
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        A 20-minute fit call. I ask three questions about the task, and we
        both know if the First Build fits. Use the contact form and mention
        “First Build” in your message.
      </p>
      <div className="mt-8">
        <a
          href="/#contact"
          className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
        >
          Start a conversation
        </a>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-paper dark:border-line-dark dark:bg-night">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <img src={brandLogo} alt="D'Vaughn House — Build your way out." className="h-8 w-auto self-start" />
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: "Thoughts", href: "/thoughts" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/#contact" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline dark:text-cream-soft dark:hover:text-cream"
              >
                {item.label}
              </a>
            ))}
            <a
              href={projectById("den").href}
              className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline dark:text-cream-soft dark:hover:text-cream"
            >
              The Den
            </a>
            <a
              href="/donate"
              className="text-sm font-semibold text-ink underline-offset-4 transition-colors hover:text-sienna-deep hover:underline dark:text-cream dark:hover:text-sienna"
            >
              Donate
            </a>
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 dark:border-line-dark sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal">
            <a
              href="/terms"
              className="text-xs text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline dark:text-cream-soft dark:hover:text-cream"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-xs text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline dark:text-cream-soft dark:hover:text-cream"
            >
              Privacy Policy
            </a>
          </nav>
          <p className="text-xs text-ink-soft dark:text-cream-soft">
            © 2026 D&rsquo;Vaughn House. All rights reserved.
          </p>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-ink-soft dark:text-cream-soft">
          Nothing on this site is financial, legal, investment, or medical advice.
          Token and market content is educational only.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-soft dark:text-cream-soft">
          Content updated: October 25, 2026.
        </p>
      </div>
    </footer>
  );
}

export default function App({ path: propPath } = {}) {
  const path =
    propPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  useRevealOnScroll();
  const isDonate = path.startsWith("/donate");
  const isPatron = path.startsWith("/patron");
  const isAbout = path.startsWith("/about");
  const isFirstBuild = path.startsWith("/first-build");
  const isTerms = path.startsWith("/terms");
  const isPrivacy = path.startsWith("/privacy");
  const isThoughts = path.startsWith("/thoughts");
  const isProjects = path.startsWith("/projects");
  const isTestimonials = path.startsWith("/testimonials");
  const isAudit = path.startsWith("/audit");
  if (isDonate) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main>
          <DonatePage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isPatron) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <PatronPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isAbout) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <AboutPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isFirstBuild) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <FirstBuildPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isThoughts) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <ThoughtsPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isProjects) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <ProjectsPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isTestimonials) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <TestimonialsPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isAudit) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <AuditPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  if (isTerms || isPrivacy) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <LegalPage doc={isTerms ? LEGAL_DOCS.terms : LEGAL_DOCS.privacy} />
        </main>
        <Footer base="/" />
      </div>
    );
  }
  return (
    <div id="top" className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
      <CustomCursor />
      <SiteNav />
      <main>
        <FlashSaleBanner />
        <PortfolioHero />
        <Motto />
        <PinnedBio />
        <WorkRooms />
        <CloseSection />
      </main>
      <PortfolioFooter />
    </div>
  );
}
