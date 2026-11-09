import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

const DIGEST_BRIEF = '/briefs/f451f193-a6b6-574d-a42e-f3c7eb2e38cb';

export default function FdaList({ auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="FDA Drug Shortage List | Glenride">
                <meta
                    name="description"
                    content="The FDA drug shortage list, explained: what the FDA counts, how it differs from ASHP, and where to check the list itself. From Glenride."
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

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    What the FDA list says right now
                </h2>
                <div className="mt-6 space-y-4">
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
                            more, as of October 4, 2026. Source: FDA Drug
                            Shortages database.
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
                    What the FDA list is
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The FDA Drug Shortages database is the FDA&apos;s own
                    searchable list of drugs in shortage, built from reports
                    manufacturers are required to give the FDA, and updated
                    daily. You can search it by generic name and see each
                    listing&apos;s status, the date it was first posted, and
                    the date it was last updated.
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
                <p className="mt-4">
                    <a
                        href="https://accessdata.fda.gov/scripts/drugshortages/dsp_faq.cfm"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-sienna-deep underline underline-offset-4 dark:text-sienna"
                    >
                        FDA Drug Shortages FAQ →
                    </a>{' '}
                    — the FDA&apos;s own answers on where the list comes from
                    and how it works.
                </p>

                <h2 className="mt-12 font-display text-2xl font-bold text-ink dark:text-cream">
                    What it does not show
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The FDA list is narrower than ASHP&apos;s. Glenride&apos;s
                    digest baseline, counted October 2, 2026, found 149 FDA
                    entries against 229 ASHP entries — and the two lists
                    overlap on only 12 distinct products. A drug can be on
                    ASHP&apos;s list and not on the FDA&apos;s, and the other
                    way around. If you only watch the FDA list, you are
                    watching part of the shortage picture.
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
                    The FDA&apos;s own caution
                </h2>
                <p className="mt-4 leading-relaxed text-ink-soft dark:text-cream-soft">
                    The FDA&apos;s own guidance is not to rely on shortage
                    data to make decisions about medical care. This page
                    follows that: it is a research record, not medical
                    advice. Figures here are for research citation only, and
                    a shortage listing is not a pharmacy-stock check.
                </p>

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
                            <Link href={DIGEST_BRIEF} className="hover:text-sienna-deep dark:hover:text-sienna">
                                The Glenride Drug-Shortage Digest
                            </Link>
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-soft dark:text-cream-soft">
                            The weekly record of public U.S. drug shortages —
                            the latest edition, published every Monday.
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
