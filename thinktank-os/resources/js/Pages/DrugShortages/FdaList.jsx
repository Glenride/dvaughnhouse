import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';
const DIGEST_EDITION = 'https://blog.dvaughnhouse.com/weekly-drug-shortage-digest-u-s-shortage-activity-week-of-october-12-19-2026/';
const FDA_URL = 'https://accessdata.fda.gov/scripts/drugshortages/default.cfm';
const FDA_FAQ_URL = 'https://accessdata.fda.gov/scripts/drugshortages/dsp_faq.cfm';

export default function FdaList({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="FDA Drug Shortage List | Glenride">
                <meta
                    name="description"
                    content="The FDA drug shortage list, explained. What the FDA counts, how it differs from ASHP, and the latest verified reading, retrieved October 19, 2026."
                />
            </Head>
            <InstitutionalHeader auth={auth} active="research" subtitle="Drug Shortage Signal" />

            <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-8">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-sienna-deep dark:text-sienna">
                    Glenride · Drug Shortage Signal
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink dark:text-cream sm:text-5xl">
                    FDA Drug Shortage List
                </h1>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-soft dark:text-cream-soft">
                    Figures last verified October 19, 2026 · The Digest publishes every Monday
                </p>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The FDA drug shortage list is the federal record of
                    current drug shortages in the United States. In 2026 it
                    counts fewer entries than the ASHP list, because the two
                    lists count different things, and Glenride reads the FDA
                    listing every week for the weekly Digest.
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    What the FDA list says right now
                </h2>
                <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <p className="font-display text-3xl font-bold text-ink dark:text-cream">69 of 74</p>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            tab entries currently in shortage on the FDA
                            listing. Retrieved October 19, 2026 at about 8:37
                            a.m. Eastern. The third consecutive identical
                            reading, after October 5 and October 12, 2026.
                            Source: FDA drug shortages listing.
                        </p>
                    </div>
                </div>
                <p className="mt-6 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The Current/Resolved Shortages tab showed 69 entries
                    currently in shortage, filtered from 74 total entries.
                    The digest records the reading. It does not interpret
                    whether the repeated reading reflects genuine stability
                    or a listing that updates on its own schedule.
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    What the FDA list is
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The FDA Drug Shortages database is the FDA&apos;s own
                    searchable list of drugs in shortage. Most of the
                    information comes from manufacturers, and the FDA updates
                    the database daily. You can search it by generic name and
                    see each listing&apos;s status and dates. The statuses are
                    Currently in Shortage, Resolved, and Discontinuation.
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
                <p className="mt-4">
                    <a
                        href={FDA_FAQ_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                    >
                        FDA Drug Shortages FAQ →
                    </a>{' '}
                    The FDA&apos;s own answers on where the list comes from
                    and how it works.
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    What it does not show
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The FDA list is narrower than the ASHP list. The
                    FDA&apos;s program focuses on shortages of medically
                    necessary products. Shortages expected to resolve
                    quickly, shortages involving only one strength or package
                    size, and shortages where a substitute strength or package
                    size is available are not usually the focus of the FDA
                    program. A drug can be on the ASHP list and not on the
                    FDA list, and the other way around. If you only watch the
                    FDA list, you are watching part of the shortage picture.
                </p>
                <p className="mt-4">
                    <Link
                        href="/drug-shortages/ashp-vs-fda"
                        className="font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                    >
                        ASHP vs FDA drug shortage list →
                    </Link>
                </p>

                <div className="mt-12 space-y-4">
                    <details className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card">
                        <summary className="cursor-pointer font-display text-xl font-bold text-ink dark:text-cream">
                            How Glenride reads the FDA listing
                        </summary>
                        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                The October 19, 2026 reading comes from a
                                live-browser check of the Current/Resolved
                                Shortages tab. A plain text fetch of the same
                                page returns a 404. That is a fetch-method
                                artifact, not evidence the page is down, and
                                it has appeared on prior runs as well.
                            </p>
                            <p>
                                The full edition behind this reading is the
                                weekly Digest for the week of October 12 to
                                19, 2026.
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
