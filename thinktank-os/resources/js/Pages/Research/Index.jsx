import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

export default function Index({ study, reports = [], auth }) {
    return (
        <div className="min-h-screen bg-paper text-ink dark:bg-night dark:text-cream font-serif selection:bg-sienna selection:text-ink">
            <Head title="Research - Glenride" />
            <InstitutionalHeader auth={auth} active="research" subtitle="Glenride Research" />

            <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-8">
                <h1 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-cream sm:text-5xl">
                    Research
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-ink-soft dark:text-cream-soft">
                    Original statistics from Glenride&apos;s own data. One page per
                    dataset, every number computed from the live record, with
                    methodology and a suggested citation. Nothing here is
                    estimated or rounded up.
                </p>

                <div className="mt-12 space-y-6">
                    {reports.map((report) => (
                        <article
                            key={report.path}
                            className="rounded-2xl border border-line bg-paper-deep p-6 dark:border-line-dark dark:bg-night-card"
                        >
                            <h2 className="font-display text-2xl font-bold text-ink dark:text-cream">
                                <Link href={report.path} className="hover:text-sienna-deep dark:hover:text-sienna">
                                    {report.title}
                                </Link>
                            </h2>
                            <p className="mt-3 leading-relaxed text-ink-soft dark:text-cream-soft">
                                {report.summary}
                            </p>
                            <p className="mt-4 font-mono text-xs text-ink-soft dark:text-cream-soft">
                                <a href={`${report.path}.md`} className="underline underline-offset-4">
                                    View as Markdown
                                </a>
                            </p>
                        </article>
                    ))}
                </div>

                <p className="mt-10 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
                    How these pages are built: every number comes from one tested
                    calculation over Glenride&apos;s own data. Findings are skipped
                    when their sample is under {study?.min_rows ?? 20} rows, small
                    gaps are reported as &ldquo;about the same&rdquo;, and every
                    finding has a stable link.
                </p>
            </main>

            <SiteFooter />
        </div>
    );
}
