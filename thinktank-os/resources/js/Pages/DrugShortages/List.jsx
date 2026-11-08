import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';

export default function List({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="Drug Shortage List | Glenride">
                <meta
                    name="description"
                    content="The U.S. drug shortage list, published weekly by Glenride from FDA and ASHP data — current shortages, what resolved, and what changed."
                />
            </Head>
            <InstitutionalHeader auth={auth} active="research" subtitle="Drug Shortage Signal" />

            <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-8">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-sienna-deep dark:text-sienna">
                    Glenride · Drug Shortage Signal
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream sm:text-5xl">
                    Drug Shortage List
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-ink-soft dark:text-cream-soft">
                    I wish there was one drug shortage list I could check.
                    There are two — the FDA&apos;s and ASHP&apos;s — and they
                    disagree. This page explains both lists, gives you the
                    counts with their dates, and links you to the lists
                    themselves.
                </p>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                    Last updated November 7, 2026 · Updated every Monday
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    The two lists
                </h2>
                <div className="mt-6 space-y-4">
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            ASHP Drug Shortages List
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            The broader list. ASHP publishes shortage bulletins
                            with created and revision dates, so the list shows
                            what is new, what changed, and what resolved. The
                            bulletins themselves are the work of the University
                            of Utah Drug Information Service, with ASHP as its
                            exclusive authorized distributor — Glenride links
                            to the list and cites its counts; it does not
                            republish bulletin text.
                        </p>
                        <p className="mt-4">
                            <a
                                href="https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                            >
                                ASHP Drug Shortages List →
                            </a>
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            FDA Drug Shortages database
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            The official list. The FDA publishes a searchable
                            database of drugs in shortage, built from what
                            manufacturers report, and updates it daily. It
                            counts fewer drugs than ASHP&apos;s list — that is
                            a difference in what each list counts, not a
                            mistake in either one.
                        </p>
                        <p className="mt-4">
                            <a
                                href="https://accessdata.fda.gov/scripts/drugshortages/default.cfm"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                            >
                                FDA Drug Shortages database →
                            </a>
                        </p>
                    </article>
                </div>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    The counts, October 2, 2026
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Glenride&apos;s digest baseline, counted the same week from
                    both lists:
                </p>
                <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">229 vs 149</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            ASHP entries against FDA entries, October 2, 2026.
                            The two lists overlap on only 12 distinct
                            products. Source: Glenride Drug-Shortage Digest
                            baseline.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">225</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            active U.S. drug shortages in Q3 2026 — the ASHP
                            quarterly national statistic, down from 227 in Q2
                            2026. Source: ASHP quarterly statistics.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">323</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            the all-time high for active U.S. drug shortages,
                            reached in Q1 2024. Source: ASHP.
                        </p>
                    </div>
                </div>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Entry counts are not distinct-drug counts. A bulletin is
                    a drug-product listing, not necessarily a unique active
                    ingredient — and the two lists count different things, so
                    their totals were never going to match. Read the full
                    explanation on the comparison page:
                </p>
                <p className="mt-4">
                    <Link
                        href="/drug-shortages/ashp-vs-fda"
                        className="font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                    >
                        ASHP vs FDA drug shortage list →
                    </Link>
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    How often the list changes
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Weekly. Every Monday, Glenride publishes the weekly U.S.
                    drug shortage digest — what is in shortage, what resolved,
                    and why — from FDA and ASHP data. The digest is the
                    record; this page is the map to it.
                </p>
                <p className="mt-4">
                    <Link
                        href={DIGEST_BRIEF}
                        className="font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                    >
                        The Glenride Drug-Shortage Digest — latest weekly edition →
                    </Link>
                </p>
                <p className="mt-4">
                    <Link
                        href="/drug-shortages/current"
                        className="font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                    >
                        Current drug shortages →
                    </Link>
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Keep reading
                </h2>
                <div className="mt-6 space-y-4">
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            <Link href="/drug-shortages/fda-list" className="hover:text-sienna-deep dark:hover:text-sienna">
                                FDA Drug Shortage List
                            </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            What the FDA list says, what it counts, and what it
                            does not show.
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            <Link href="/drug-shortages/ashp-vs-fda" className="hover:text-sienna-deep dark:hover:text-sienna">
                                ASHP vs FDA Drug Shortage List
                            </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            Why the two lists disagree, what each one counts,
                            and how Glenride reads them together.
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            <Link href="/research" className="hover:text-sienna-deep dark:hover:text-sienna">
                                Glenride Research
                            </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            Original statistics from Glenride&apos;s own data —
                            every number computed from the live record.
                        </p>
                    </article>
                </div>

                <p className="mt-12 border-t border-line pt-6 text-sm leading-relaxed text-ink-soft dark:border-line-dark dark:text-cream-soft">
                    Figures on this page are for research citation only. A
                    shortage listing is not a pharmacy-stock check, and
                    nothing here is clinical guidance. If a drug you need is
                    in shortage, talk to your pharmacist or clinician.
                    Glenride is an independent, AI-native think tank. AI
                    prepares. Humans decide.
                </p>

                <div className="mt-10 flex justify-between border-t border-line pt-6 dark:border-line-dark">
                    <Link
                        href="/"
                        className="text-sm font-medium text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                    >
                        ← Back to Glenride
                    </Link>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                        Every claim has a trail
                    </span>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
