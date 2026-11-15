import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';
const DIGEST_EDITION = 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/';
const ASHP_URL = 'https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list';
const FDA_URL = 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm';

export default function List({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="Drug Shortage List | Glenride">
                <meta
                    name="description"
                    content="The drug shortage list in the United States, explained. FDA and ASHP counts side by side from the latest verified weekly record, retrieved October 19, 2026."
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
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                    Figures last verified October 19, 2026 · The Digest publishes every Monday
                </p>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The drug shortage list in the United States is two lists.
                    The FDA and ASHP lists count current shortages
                    differently, so Glenride reports both side by side in the
                    weekly Digest through 2026 and never merges them into one
                    number.
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
                            what is new and what changed. Glenride links to
                            the list and cites its counts. It does not
                            republish bulletin text.
                        </p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            Latest verified count: 192 active bulletins,
                            retrieved October 19, 2026.
                        </p>
                        <p className="mt-4">
                            <a
                                href={ASHP_URL}
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
                            database of drugs in shortage, built mostly from
                            what manufacturers report, and updates it daily.
                            It counts fewer entries than the ASHP list. That
                            is a difference in what each list counts, not a
                            mistake in either one.
                        </p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            Latest verified reading: 69 of 74 tab entries
                            currently in shortage, retrieved October 19, 2026.
                        </p>
                        <p className="mt-4">
                            <a
                                href={FDA_URL}
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
                    The counts, retrieved October 19, 2026
                </h2>
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
                            by the October 19, 2026 run. Source: ASHP
                            quarterly statistics.
                        </p>
                    </div>
                </div>

                <div className="mt-12 space-y-4">
                    <details className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <summary className="cursor-pointer font-display text-xl font-bold text-ink dark:text-cream">
                            Entry counts are not distinct-drug counts
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                A bulletin is a drug-product listing, not
                                necessarily a unique active ingredient. The
                                ASHP list counts product-level bulletins and
                                the FDA listing counts tab entries, so their
                                totals were never going to match. Read the
                                full explanation on the comparison page.
                            </p>
                            <p>
                                <Link
                                    href="/drug-shortages/ashp-vs-fda"
                                    className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                                >
                                    ASHP vs FDA drug shortage list →
                                </Link>
                            </p>
                        </div>
                    </details>

                    <details className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <summary className="cursor-pointer font-display text-xl font-bold text-ink dark:text-cream">
                            How often the list changes
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                Weekly, in the Digest. Every Monday, Glenride
                                publishes the weekly U.S. drug shortage
                                digest, built from FDA and ASHP data. The
                                digest is the record. This page is the map to
                                it.
                            </p>
                            <p>
                                The FDA database itself is updated daily, and
                                ASHP bulletins carry created and revision
                                dates, so both lists move between Digest
                                editions. The counts on this page are the
                                latest verified weekly retrieval, not a live
                                feed.
                            </p>
                            <p>
                                <Link
                                    href={DIGEST_BRIEF}
                                    className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                                >
                                    The Glenride Drug-Shortage Digest →
                                </Link>
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
                        </div>
                    </details>
                </div>

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
