import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';

export default function AshpVsFda({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="ASHP vs FDA Drug Shortage List | Glenride">
                <meta
                    name="description"
                    content="ASHP vs FDA drug shortage list: why the two lists disagree, what each counts, and how Glenride reads them together."
                />
            </Head>
            <InstitutionalHeader auth={auth} active="research" subtitle="Drug Shortage Signal" />

            <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-8">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-sienna-deep dark:text-sienna">
                    Glenride · Drug Shortage Signal
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream sm:text-5xl">
                    ASHP vs FDA Drug Shortage List
                </h1>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Three different measures
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    There is no single count of U.S. drug shortages. There
                    are three measures, and they are not interchangeable:
                </p>
                <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">229 vs 149</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            ASHP entries against FDA entries, October 2, 2026
                            — the Glenride digest baseline, counted the same
                            week from both lists. The two lists overlap on
                            only 12 distinct products.
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
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">225</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            active U.S. drug shortages in Q3 2026 — the ASHP
                            quarterly national statistic, down from 227 in Q2
                            2026. This is an estimate of the national total,
                            not a count of list entries. Source: ASHP
                            quarterly statistics.
                        </p>
                    </div>
                </div>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Entry counts are not distinct-drug counts. A bulletin is
                    a drug-product listing, not necessarily a unique active
                    ingredient. Report all three measures, never conflate
                    them — that is the rule Glenride works by.
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Why they disagree
                </h2>
                <div className="mt-6 space-y-4">
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            Different sources
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            ASHP&apos;s list is built from shortage bulletins
                            produced by the University of Utah Drug
                            Information Service, with ASHP as its exclusive
                            authorized distributor. The FDA&apos;s list is
                            built from reports manufacturers give the FDA.
                            Two different pipelines see different shortages.
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            Different counting
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            ASHP counts bulletin entries on its live list. The
                            FDA counts database listings currently in
                            shortage. The quarterly statistic estimates the
                            national active total. A drug can be an entry on
                            one list and absent from the other — only 12
                            distinct products were on both, October 2, 2026.
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            Different rhythms
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            The FDA database is updated daily. ASHP bulletins
                            carry created and revision dates, so its list
                            moves as bulletins are added, revised, and
                            resolved. The quarterly statistic arrives once a
                            quarter. A count without a date is not a count —
                            every number on this page carries one.
                        </p>
                    </article>
                </div>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    What Glenride does about it
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Glenride publishes both counts every Monday in the weekly
                    U.S. drug shortage digest, and shows where the FDA and
                    ASHP shortage lists disagree instead of picking the
                    number that sounds better. AI prepares. Humans decide —
                    every brief is reviewed, verified, and signed off by a
                    human before it publishes.
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
                    The disagreement is about counting, not about the problem
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Whichever list you watch, the shape of the problem is the
                    same. The all-time high was 323 active shortages in Q1
                    2024 (ASHP), and 87 new shortages appeared in 2026
                    against 89 in all of 2025 (ASHP). The average shortage
                    now lasts more than five years (USP, June 2026). And the
                    supply behind it is concentrated: 48% of new 2026
                    shortages involve a single manufacturer (ASHP aggregate,
                    Q3 2026), about 78% of U.S. active pharmaceutical
                    ingredients are supplied from abroad (FDA), and 44% of
                    the drugs in shortage at the end of 2025 had a key
                    starting material made exclusively in a single country
                    (USP).
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Check the lists yourself
                </h2>
                <ul className="mt-4 space-y-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                    <li>
                        <a
                            href="https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list"
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            ASHP Drug Shortages List →
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://accessdata.fda.gov/scripts/drugshortages/default.cfm"
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            FDA Drug Shortages database →
                        </a>
                    </li>
                </ul>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Keep reading
                </h2>
                <div className="mt-6 space-y-4">
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            <Link href="/drug-shortages/current" className="hover:text-sienna-deep dark:hover:text-sienna">
                                Current Drug Shortages
                            </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            What is in shortage right now, what changed this
                            week, and why — with the source and the date on
                            every number.
                        </p>
                    </article>
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
