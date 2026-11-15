import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';
const DIGEST_EDITION = 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/';
const TRACKER = 'https://drugs.dvaughnhouse.com/';
const ASHP_URL = 'https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list';
const FDA_URL = 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm';

export default function Current({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="Current Drug Shortages | Glenride">
                <meta
                    name="description"
                    content="Current drug shortages in the United States, from the latest verified weekly record. FDA and ASHP counts retrieved October 19, 2026, in the Glenride weekly Digest."
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
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                    Figures last verified October 19, 2026 · The Digest publishes every Monday
                </p>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    Current drug shortages in the United States, measured the
                    same way every week. The latest verified record below
                    comes from the FDA and ASHP lists retrieved October 19,
                    2026, and the Glenride weekly Digest is the record that
                    carries each new retrieval through 2026.
                </p>

                <div className="mt-8 rounded-2xl border border-sienna bg-paper-deep p-6 dark:bg-night-card">
                    <h2 className="font-display text-xl font-bold text-ink dark:text-cream">
                        A weekly record, not a live feed
                    </h2>
                    <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                        The counts on this page are the latest verified weekly
                        retrieval, dated October 19, 2026. They do not update
                        between Digest editions. For the daily record, see the
                        daily drug-shortage tracker.
                    </p>
                    <p className="mt-4">
                        <a
                            href={TRACKER}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            Daily drug-shortage tracker →
                        </a>
                    </p>
                </div>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    The latest verified counts
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
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">48%</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            of new 2026 shortages involve a product made by a
                            single manufacturer. July 2026 AJMC aggregate for
                            the 2026 cohort. This is a standing aggregate, not
                            a new weekly reading. Source: AJMC, July 2026.
                        </p>
                    </div>
                </div>

                <div className="mt-12 space-y-4">
                    <details className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <summary className="cursor-pointer font-display text-xl font-bold text-ink dark:text-cream">
                            What changed in the week of October 12 to 19, 2026
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                New: adalimumab-adbm subcutaneous injection.
                                Bulletin created October 15, 2026, and
                                verified new since the October 12 retrieval.
                                Adalimumab-adbm is Cyltezo, a biosimilar
                                biologic presentation. The identity was
                                verified against an FDA announcement consulted
                                October 22, 2026.
                            </p>
                            <p>
                                Boundary case: irinotecan hydrochloride
                                injection. Bulletin created October 12, 2026.
                                It may post-date the prior week retrieval, so
                                it is carried as a boundary case and not
                                counted as verified new.
                            </p>
                            <p>
                                Resolved: bumetanide injection. One
                                corroborated resolution, supported by a
                                resolved-list entry dated September 30, 2026,
                                and confirmed absent from the October 19 ASHP
                                live page. It cannot be proven to be one of
                                the 2 to 3 departures behind the weekly net
                                change, because departures are not
                                individually identifiable.
                            </p>
                            <p>
                                With 1 to 2 additions and a net change of
                                minus 1, 2 to 3 bulletins left the ASHP live
                                list during the week.
                            </p>
                        </div>
                    </details>

                    <details className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <summary className="cursor-pointer font-display text-xl font-bold text-ink dark:text-cream">
                            Why the two counts differ
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                ASHP counts product-level bulletins. The FDA
                                counts listing entries. The two lists measure
                                different units under different definitions, so
                                Glenride reports them side by side and never
                                merges them into one number.
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
                            What is not yet verified
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                The digest run for the week of October 26,
                                2026 had not executed when the October 12 to
                                19 edition was written. No figures for October
                                19 to 26 exist in that edition.
                            </p>
                            <p>
                                No ASHP quarterly figure newer than Q2 2026
                                was found by the October 19, 2026 run.
                            </p>
                            <p>
                                ASHP departures are not individually
                                identifiable, so the weekly net cannot be
                                broken into named resolutions beyond the one
                                corroborated case above.
                            </p>
                        </div>
                    </details>
                </div>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    Where the numbers come from
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
                        </a>{' '}
                        The live list of shortage bulletins Glenride counts
                        each week.
                    </li>
                    <li>
                        <a
                            href={FDA_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            FDA Drug Shortages database →
                        </a>{' '}
                        The federal listing, read by live browser check.
                    </li>
                    <li>
                        <a
                            href={DIGEST_EDITION}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            Weekly Drug-Shortage Digest, week of October 12 to 19, 2026 →
                        </a>{' '}
                        The full edition behind every figure on this page.
                    </li>
                    <li>
                        <Link
                            href={DIGEST_BRIEF}
                            className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                        >
                            The Glenride Drug-Shortage Digest →
                        </Link>{' '}
                        The weekly record. Published every Monday.
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
