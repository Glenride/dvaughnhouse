import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';
const DIGEST_EDITION = 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/';
const ASHP_URL = 'https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list';
const FDA_URL = 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm';

export default function AshpVsFda({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="ASHP vs FDA Drug Shortage List | Glenride">
                <meta
                    name="description"
                    content="ASHP vs FDA drug shortage list. Why the two lists disagree, what each one counts, and how Glenride reads them together in the weekly Digest."
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
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                    Figures last verified October 19, 2026 · The Digest publishes every Monday
                </p>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    ASHP vs FDA drug shortage list is the question that
                    follows any operator who compares the two counts. The
                    current FDA and ASHP totals in 2026 differ because ASHP
                    counts product bulletins and the FDA counts listing
                    entries, and the weekly Digest reports both side by side.
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Three different measures
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    There is no single count of U.S. drug shortages. There
                    are three measures, and they are not interchangeable.
                </p>
                <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">192</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            active ASHP shortage bulletins. Retrieved October
                            19, 2026. Down 1 net from 193 on October 12, 2026.
                            Source: ASHP current-shortages list.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">69 of 74</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            tab entries currently in shortage on the FDA
                            listing. Retrieved October 19, 2026 at about 8:37
                            a.m. Eastern. The third consecutive identical
                            reading. Source: FDA drug shortages listing.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">227</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            active shortages in the ASHP quarterly statistic
                            for Q2 2026. No newer quarterly figure was found
                            by the October 19, 2026 run. This is a quarterly
                            statistic, not a count of list entries. Source:
                            ASHP quarterly statistics.
                        </p>
                    </div>
                </div>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Entry counts are not distinct-drug counts. A bulletin is
                    a drug-product listing, not necessarily a unique active
                    ingredient. Report all three measures and never conflate
                    them. That is the rule Glenride works by.
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
                            ASHP publishes shortage bulletins with created and
                            revision dates. The FDA database is built mostly
                            from reports manufacturers give the FDA. Two
                            different pipelines see different shortages.
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            Different counting
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            ASHP counts bulletin entries on its live list. The
                            FDA counts database listings currently in
                            shortage. The quarterly statistic is a separate
                            quarterly measure. A drug can be an entry on one
                            list and absent from the other.
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            Different rhythms
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            The FDA database is updated daily. ASHP bulletins
                            move as bulletins are added, revised, and
                            resolved. The quarterly statistic arrives once a
                            quarter. A count without a date is not a count.
                            Every number on this page carries one.
                        </p>
                    </article>
                </div>

                <div className="mt-12 space-y-4">
                    <details className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <summary className="cursor-pointer font-display text-xl font-bold text-ink dark:text-cream">
                            The shape of the problem is the same on either list
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                Whichever list you watch, the concentration
                                picture is unchanged. Nearly half of new 2026
                                shortages involve products made by a single
                                manufacturer, at 48 percent sole-source per
                                the July 2026 AJMC aggregate. This is an
                                aggregate for the 2026 cohort, not a new
                                weekly reading.
                            </p>
                            <p>
                                Weekly inflow and outflow remain small
                                relative to the stock. Single-digit bulletin
                                changes sit against a 192-bulletin ASHP list,
                                retrieved October 19, 2026, consistent with a
                                slow-churning active backlog.
                            </p>
                        </div>
                    </details>

                    <details className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <summary className="cursor-pointer font-display text-xl font-bold text-ink dark:text-cream">
                            What Glenride does about it
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                Glenride publishes both counts every Monday in
                                the weekly U.S. drug shortage digest, and shows
                                where the FDA and ASHP shortage lists disagree
                                instead of picking the number that sounds
                                better. The full edition behind the counts on
                                this page covers the week of October 12 to 19,
                                2026.
                            </p>
                            <p>
                                <a
                                    href={DIGEST_EDITION}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                                >
                                    Weekly Drug-Shortage Digest, week of October 12 to 19, 2026 →
                                </a>
                            </p>
                            <p>
                                <Link
                                    href={DIGEST_BRIEF}
                                    className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                                >
                                    The Glenride Drug-Shortage Digest →
                                </Link>
                            </p>
                        </div>
                    </details>
                </div>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Check the lists yourself
                </h2>
                <ul className="mt-4 space-y-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                    <li>
                        <a
                            href={ASHP_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            ASHP Drug Shortages List →
                        </a>
                    </li>
                    <li>
                        <a
                            href={FDA_URL}
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
                            The latest verified weekly record, what changed
                            this week, and what is not yet verified.
                        </p>
                    </article>
                    <article className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <h3 className="font-display text-xl font-bold text-ink dark:text-cream">
                            <Link href="/drug-shortages/list" className="hover:text-sienna-deep dark:hover:text-sienna">
                                Drug Shortage List
                            </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            The U.S. drug shortage list, explained. The two
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
