import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';

export default function Current({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="Current Drug Shortages | Glenride">
                <meta
                    name="description"
                    content="Current drug shortages in the U.S., measured weekly by Glenride from FDA and ASHP data — what is in shortage, what resolved, and why."
                />
            </Head>
            <InstitutionalHeader auth={auth} active="research" subtitle="Drug Shortage Signal" />

            <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-8">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-sienna-deep dark:text-sienna">
                    Glenride · Drug Shortage Signal
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream sm:text-5xl">
                    Current Drug Shortages
                </h1>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    The numbers right now
                </h2>
                <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">225</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            active U.S. drug shortages in Q3 2026 — the ASHP
                            quarterly national statistic, down from 227 in Q2
                            2026. Source: ASHP quarterly statistics.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">87</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            new shortages in 2026 so far, against 89 in all of
                            2025 — almost a full year&apos;s worth of new
                            shortages in nine months. Source: ASHP.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">69</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            drugs currently in shortage on the FDA list, as of
                            October 4, 2026. Source: FDA Drug Shortages
                            database.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">28 of 69</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            FDA-listed drugs in shortage for five years or
                            more, as of October 4, 2026. Shortages are not
                            mostly short. Source: FDA Drug Shortages database.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">More than 5 years</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            the average duration of a drug shortage now.
                            Source: USP, June 2026.
                        </p>
                    </div>
                </div>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Why shortages drag on
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The story underneath the counts is concentration. Of the new
                    shortages in 2026, 48% involve a single manufacturer (ASHP
                    aggregate, Q3 2026). About 78% of U.S. active pharmaceutical
                    ingredients are supplied from abroad (FDA). And 44% of the
                    drugs in shortage at the end of 2025 had a key starting
                    material made exclusively in a single country (USP). When
                    one maker or one country is the only source, there is no
                    second supplier to call.
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    What changed this week
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Every Monday, Glenride publishes the weekly U.S. drug
                    shortage digest — what is in shortage, what resolved, and
                    why — from FDA and ASHP data. Read the latest digest for
                    this week&apos;s changes:
                </p>
                <p className="mt-4">
                    <Link
                        href={DIGEST_BRIEF}
                        className="font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                    >
                        The Glenride Drug-Shortage Digest — latest weekly edition →
                    </Link>
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Where the numbers come from
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Two public lists, counted differently — which is why the
                    numbers on this page do not all match each other. ASHP
                    publishes a live list of shortage bulletins; the FDA
                    publishes a database of listings reported by manufacturers.
                    Glenride reads both, every week, and shows where they
                    disagree instead of picking the number that sounds better.
                </p>
                <ul className="mt-4 space-y-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                    <li>
                        <a
                            href="https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list"
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            ASHP Drug Shortages List →
                        </a>{' '}
                        — ASHP, with the University of Utah Drug Information
                        Service as the source of the bulletins.
                    </li>
                    <li>
                        <a
                            href="https://accessdata.fda.gov/scripts/drugshortages/default.cfm"
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            FDA Drug Shortages database →
                        </a>{' '}
                        — the FDA&apos;s searchable list, updated daily.
                    </li>
                    <li>
                        <Link
                            href="/drug-shortages/ashp-vs-fda"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            ASHP vs FDA drug shortage list →
                        </Link>{' '}
                        — why the two lists disagree, and what each one counts.
                    </li>
                </ul>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Keep reading
                </h2>
                <div className="mt-6 space-y-4">
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            <Link href="/drug-shortages/list" className="hover:text-sienna-deep dark:hover:text-sienna">
                                Drug Shortage List
                            </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            The U.S. drug shortage list, explained — the two
                            lists, the counts, and how often they change.
                        </p>
                    </article>
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
