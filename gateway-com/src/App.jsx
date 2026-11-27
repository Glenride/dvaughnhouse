import { useEffect, useState } from "react";
import heroDonate from "./assets/hero-donate.webp";
import heroNetworkLight from "./assets/hero-network-light.webp";
import heroNetworkDark from "./assets/hero-network-dark.webp";
import glenrideLogo from "./assets/glenride-logo.webp";
import brandLogo from "./assets/dvaughn-house-logo.webp";
import { CursorTrail, Parallax, useRevealOnScroll } from "./motion.jsx";
import { SiteNav } from "./nav.jsx";
import { ThoughtsPage } from "./thoughts.jsx";
import { ProjectsPage } from "./projects.jsx";
import { TestimonialsPage } from "./testimonials.jsx";
import { AuditPage } from "./audit.jsx";
import {
  CloseSection,
  CustomCursor,
  FirstBuildBanner,
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
  FIRST_BUILD_CAP,
  FIRST_BUILD_RANGE,
  FIRST_BUILD_RATE,
  FIRST_BUILD_STANDARD_EXAMPLE,
  LEGAL_DOCS,
  PATRON_TIERS,
  PILLARS,
} from "./data/site-content.js";

function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found — D'Vaughn House";
    window.scrollTo(0, 0);
  }, []);

  // The real 404 page: same header/footer/nav as every other page, so a
  // visitor who lands on a dead link can get back to the work. Served with
  // HTTP 404 by functions/_middleware.js (prerendered to dist/404/) and
  // rendered client-side for any path that matches no known route.
  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Thoughts", href: "/thoughts" },
    { label: "The First Build", href: "/first-build" },
    { label: "Donate", href: "/donate" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-8">
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
        Page not found.
      </h1>
      <p className="mt-6 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        That page doesn&rsquo;t exist here — it may have moved, or the link
        may be wrong. The work is still here:
      </p>
      <nav aria-label="Page not found" className="mt-8">
        <ul className="space-y-3">
          {links.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="font-semibold text-sienna-deep underline underline-offset-4 transition-colors hover:text-ink dark:text-sienna dark:hover:text-cream"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-10 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Looking for something else?{" "}
        <a
          href="/#contact"
          className="font-semibold text-sienna-deep underline underline-offset-4 transition-colors hover:text-ink dark:text-sienna dark:hover:text-cream"
        >
          Send a message through the contact form
        </a>
        .
      </p>
    </div>
  );
}

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
          loading="lazy"
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

        <div id="join" className="mx-auto mt-16 max-w-2xl scroll-mt-24">
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
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
        The First Build
      </p>
      <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
        AI workflow automation services
      </h1>
      <p className="mt-6 max-w-3xl font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-cream">
        One week. One workflow. One working system.
      </p>
      <p className="mt-6 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Build the capacity before you need it. You&rsquo;re the one holding
        it together. In five days, one real job in your company stops
        depending on you, and you get a standard you can show a client.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="#contact"
          className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
        >
          Book a fit call
        </a>
      </div>
      <p className="mt-5 text-sm text-ink-soft dark:text-cream-soft">
        Free, 20 minutes. The build runs {FIRST_BUILD_RANGE}, fixed quote
        in writing before you pay anything.
      </p>
      <div className="mt-12 overflow-hidden rounded-2xl border border-line dark:border-line-dark">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcSet={heroNetworkDark} />
          <img
            src={heroNetworkLight}
            alt="A network map of connected systems"
            className="block w-full"
            loading="lazy"
          />
        </picture>
      </div>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        You might recognize this
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Every week, you&rsquo;re the glue between the inbox, the spreadsheet,
        and the schedule. It works, until the week it doesn&rsquo;t. Growing
        makes it worse, because every new client adds to what only you can
        hold.
      </p>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        An ounce of prevention is worth more than a pound of cure. (Dr. Kaul)
        You can build the capacity before the break.
      </p>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        What happens in your automation week
      </h2>
      <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-6 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        <li>
          <strong className="font-bold text-ink dark:text-cream">
            One job runs without you in the middle of it.
          </strong>{" "}
          The one that would cost you most if it slipped.
        </li>
        <li>
          <strong className="font-bold text-ink dark:text-cream">
            You can say yes to more.
          </strong>{" "}
          A new client or a new hire doesn&rsquo;t mean the job slips.
        </li>
        <li>
          <strong className="font-bold text-ink dark:text-cream">
            You can show how you work.
          </strong>{" "}
          A one page standard you can send a prospect before they ask.
        </li>
      </ul>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        What you do, and what you risk
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        You give about 45 minutes across the week and bring 5 to 10 examples
        of your best work. That&rsquo;s all.
      </p>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        If the job isn&rsquo;t a fit on Day 1, you get a full refund before
        any building starts. If the system doesn&rsquo;t run your real work
        by Day 5, you don&rsquo;t pay the balance.
      </p>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        Who AI workflow automation is for
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        You run a real company and act before things break. You want your
        work to hold up as you grow, and you want clients to see how you
        operate.
      </p>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        <strong className="font-bold text-ink dark:text-cream">Not yet if</strong>{" "}
        you have no examples of good work to build from. We&rsquo;d fix the
        process first, and I&rsquo;ll tell you that on the fit call.
      </p>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        What&rsquo;s included
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        One working system in your tools, your examples and rules written
        down and yours to keep, a one page standard you can send to clients,
        a plain English runbook written so someone on your team can follow
        it, and 14 days of tuning after handoff.
      </p>

      <div className="mt-16 rounded-2xl border border-line bg-paper-deep p-8 sm:p-10 dark:border-line-dark dark:bg-night-card">
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
          What it costs
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink dark:text-cream">
          <strong className="font-bold text-ink dark:text-cream">{FIRST_BUILD_RANGE}</strong>
          , at{" "}
          <strong className="font-bold text-ink dark:text-cream">{FIRST_BUILD_RATE} per hour</strong>
          . A typical build is about{" "}
          <strong className="font-bold text-ink dark:text-cream">{FIRST_BUILD_STANDARD_EXAMPLE}</strong>
          , with a{" "}
          <strong className="font-bold text-ink dark:text-cream">{FIRST_BUILD_CAP} hard cap</strong>
          , quoted in writing before you pay anything. Two payments:{" "}
          <strong className="font-bold text-ink dark:text-cream">$1,312.50 to start</strong>
          ,{" "}
          <strong className="font-bold text-ink dark:text-cream">$1,312.50 on Day 5</strong>.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
          >
            Book a fit call
          </a>
        </div>
      </div>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        Questions
      </h2>
      <div className="mt-6 max-w-3xl space-y-3">
        <details className="rounded-2xl border border-line bg-paper-deep px-6 py-4 dark:border-line-dark dark:bg-night-card">
          <summary className="cursor-pointer font-display text-lg font-bold text-ink dark:text-cream">
            How much does AI workflow automation cost?
          </summary>
          <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            The First Build is {FIRST_BUILD_RANGE} for a one week build, at{" "}
            {FIRST_BUILD_RATE} per hour. A typical build is about{" "}
            {FIRST_BUILD_STANDARD_EXAMPLE}, with a {FIRST_BUILD_CAP} hard
            cap. You get the fixed quote in writing before you pay anything.
          </p>
        </details>
        <details className="rounded-2xl border border-line bg-paper-deep px-6 py-4 dark:border-line-dark dark:bg-night-card">
          <summary className="cursor-pointer font-display text-lg font-bold text-ink dark:text-cream">
            How long does it take?
          </summary>
          <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            One week. Five days from fit call to one real job running clean
            in your tools, plus 14 days of tuning after handoff.
          </p>
        </details>
        <details className="rounded-2xl border border-line bg-paper-deep px-6 py-4 dark:border-line-dark dark:bg-night-card">
          <summary className="cursor-pointer font-display text-lg font-bold text-ink dark:text-cream">
            Who owns the system?
          </summary>
          <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            You do. It is built on your tools, and you keep the runbook, the
            standard, and your examples and rules written down.
          </p>
        </details>
        <details className="rounded-2xl border border-line bg-paper-deep px-6 py-4 dark:border-line-dark dark:bg-night-card">
          <summary className="cursor-pointer font-display text-lg font-bold text-ink dark:text-cream">
            What if the fit call says no?
          </summary>
          <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
            No engagement, no charge. The fit call is free. If the job is
            not a fit on Day 1, you get a full refund before any building
            starts.
          </p>
        </details>
      </div>
      <p className="mt-6 max-w-3xl text-sm text-ink-soft dark:text-cream-soft">
        Worked with me already?{" "}
        <a
          href="/testimonials"
          className="font-semibold text-ink underline-offset-4 transition-colors hover:text-sienna-deep hover:underline dark:text-cream dark:hover:text-sienna"
        >
          Share your experience
        </a>
        .
      </p>

      <h2 className="mt-16 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream">
        Who you&rsquo;d be working with
      </h2>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        D&rsquo;Vaughn House spent nearly 12 years in clinical research
        operations at the University of Cincinnati, AstraZeneca, and Merck,
        where work had to pass audit the first time. That&rsquo;s the
        standard your system is built to.
      </p>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Built in Cincinnati, Ohio. In person across the Tri-State, remote
        anywhere.
      </p>

      <CloseSection
        heading="Start with one question"
        intro="Which job would cost you the most if it slipped? Tell me, and I'll reply within a day."
        defaultTopic="first-build"
      />
      <p className="mt-12 text-sm text-ink-soft dark:text-cream-soft">
        D&rsquo;Vaughn House — Independent AI Orchestrator, Cincinnati, Ohio
      </p>
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
          Content updated: November 23, 2026.
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
  const isNotFound = path === "/404" || path === "/404/";
  if (isNotFound) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <NotFoundPage />
        </main>
        <Footer base="/" />
      </div>
    );
  }
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
  // Any path that matches no known route renders the 404 page, matching
  // the server-side behaviour in functions/_middleware.js (which answers
  // 404 before the SPA fallback). The homepage is only "/" itself.
  const isHome = path === "/" || path === "/index" || path === "/index.html";
  if (!isHome) {
    return (
      <div className="min-h-screen bg-paper font-serif text-ink antialiased dark:bg-night dark:text-cream">
        <CursorTrail />
        <SiteNav base="/" />
        <main className="pt-24">
          <NotFoundPage />
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
        <FirstBuildBanner />
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
