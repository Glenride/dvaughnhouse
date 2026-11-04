import HeroCarousel from '@/Components/HeroCarousel';
import ImageBandCarousel from '@/Components/ImageBandCarousel';
import InstitutionalHeader from '@/Components/InstitutionalHeader';
import SiteFooter from '@/Components/SiteFooter';
import { Head, Link } from '@inertiajs/react';

// Gateway hero slides — full-bleed images, each with its own overlay copy.
const HERO_SLIDES = [
    {
        image: '/images/heroes/hero-port-sunset.jpg',
        headline: 'Supply chains, seen clearly.',
        line: 'For operators and decision-makers: Glenride tracks how critical supply chains fail, where they bend, and what keeps them running — before the break reaches you.',
        ctaLabel: 'Enter the Vanguard Library',
        ctaHref: route('library.index'),
    },
    {
        image: '/images/heroes/hero-global-network.jpg',
        headline: 'Research that signs its work.',
        line: 'Every brief carries its evidence, its verifier, and its date — attested, and open to challenge.',
        ctaLabel: 'View the attestations',
        ctaHref: route('attestations.index'),
    },
    {
        image: '/images/heroes/hero-ship-risk.jpg',
        headline: 'Shortages, measured — not guessed.',
        line: 'U.S. drug shortages, tracked and published in the open from FDA and ASHP data.',
        ctaLabel: 'Read the thesis',
        ctaHref: route('thesis.index'),
    },
    {
        image: '/images/heroes/hero-port-lanes.jpg',
        headline: 'Built to be checked.',
        line: 'Briefs, standards, and a store where everything has a price and nothing is promised.',
        ctaLabel: 'Visit the store',
        ctaHref: route('store.index'),
    },
    {
        image: '/images/heroes/hero-trucks.jpg',
        headline: 'Every mile, accounted for.',
        line: 'Ports, rails, roads, and runways are one chain. Glenride reads it whole — and publishes what it finds.',
        ctaLabel: 'Enter the Library',
        ctaHref: route('library.index'),
    },
    {
        image: '/images/heroes/hero-air-sea.jpg',
        headline: "Modes change. The record doesn't.",
        line: 'Air to sea to road, critical cargo keeps its evidence — every handoff timed, signed, and open to challenge.',
        ctaLabel: 'See the attestations',
        ctaHref: route('attestations.index'),
    },
    {
        image: '/images/heroes/hero-cold-chain.jpg',
        headline: 'The cold chain, held to the degree.',
        line: 'Temperature, humidity, shock — the conditions a medicine travels in are part of its record, not a footnote.',
        ctaLabel: 'Read the Thesis',
        ctaHref: route('thesis.index'),
    },
    {
        image: '/images/heroes/hero-control-room.jpg',
        headline: 'Watched, end to end.',
        line: 'A chain you can see is a chain you can fix. Exceptions surface early — and so do the people answering for them.',
        ctaLabel: 'Read the Essays',
        ctaHref: route('essays.index'),
    },
];

// Body band carousel — the chain at work, below the opening sections.
const BODY_BAND_IMAGES = [
    '/images/heroes/hero-jit.jpg',
    '/images/heroes/hero-retail.jpg',
    '/images/heroes/hero-last-mile.jpg',
    '/images/heroes/hero-resilience.jpg',
];

const RESEARCH_AREAS = [
    {
        name: 'Supply-Chain Resilience',
        line: 'How critical supply chains fail, where they bend, and what keeps them running.',
    },
    {
        name: 'Pharmaceutical Data Evaluation',
        line: 'Clinical and regulatory data, evaluated for what it actually shows.',
    },
    {
        name: 'Applied AI & Enterprise Software Systems',
        line: 'Autonomous systems under non-negotiable human primacy — AI prepares, humans decide.',
    },
];

const CURATED_FALLBACK = {
    id: 'featured-monograph-1',
    title: 'Autonomous Agentic Governance in High-Assurance Sectors',
    abstract:
        'A strategic framework addressing the latency gap between rapid algorithmic decision-making and human moral verification across clinical trial data pipelines and defense infrastructure.',
    published_at: '2026-09-15',
    attestation_public_id: null,
    record_version: null,
};

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function Landing({
    featuredBriefs = [],
    publishedCount = 0,
    attestationCount = 0,
    essayCount = 0,
    auth,
}) {
    const briefs = featuredBriefs.length > 0 ? featuredBriefs : [CURATED_FALLBACK];

    return (
        <div className="min-h-screen bg-paper font-serif text-ink selection:bg-sienna selection:text-ink dark:bg-night dark:text-cream">
            <Head title="Glenride Gateway — Independent, AI-Native Think Tank" />

            <InstitutionalHeader
                auth={auth}
                active="home"
                subtitle="Independent, AI-Native Think Tank"
            />

            {/* Gateway — this landing page is the site's Routing Hub.
                Hero: full-bleed rotating image carousel with a flat ink
                scrim; the Glenride wordmark stays the persistent H1 and
                each slide carries its own headline, line, and CTA. */}
            <HeroCarousel slides={HERO_SLIDES}>
                {!auth?.user && (
                    <p className="mt-10 font-mono text-xs uppercase tracking-widest text-paper/60 dark:text-cream-soft">
                        Fellows and scholars —{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-paper underline decoration-sienna decoration-2 underline-offset-4 transition hover:text-sienna dark:text-cream"
                        >
                            Scholar sign in
                        </Link>
                    </p>
                )}
            </HeroCarousel>

            {/* What Glenride is */}
            <section className="border-b border-line dark:border-line-dark">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="max-w-3xl">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream sm:text-4xl">
                            Built to close the power-wisdom gap
                        </h2>
                        <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft dark:text-cream-soft">
                            <p>
                                Glenride is an independent, AI-native think tank. We
                                find where critical systems break before the break
                                becomes harm — and we publish a record anyone can
                                check.
                            </p>
                            <p>
                                We study supply chains, pharmaceutical data, and the
                                software systems modern life quietly depends on. We
                                measure what others guess at, we show our sources,
                                and we sign our work. When a finding is strong
                                enough to change a rule, we carry it to the people
                                who write the rules. When an answer can become a
                                tool, we build the tool. Our money comes from our
                                work, so our conclusions answer to evidence, not to
                                a sponsor.
                            </p>
                            <p>— D'Vaughn House, Founder</p>
                        </div>
                    </div>

                    <dl className="mt-14 border-t border-line dark:border-line-dark">
                        {RESEARCH_AREAS.map((area) => (
                            <div
                                key={area.name}
                                className="grid gap-2 border-b border-line py-7 dark:border-line-dark sm:grid-cols-3 sm:gap-8"
                            >
                                <dt className="font-display text-xl font-bold text-ink dark:text-cream">
                                    {area.name}
                                </dt>
                                <dd className="text-base leading-relaxed text-ink-soft dark:text-cream-soft sm:col-span-2">
                                    {area.line}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* The chain, end to end — rotating body band */}
            <ImageBandCarousel
                images={BODY_BAND_IMAGES}
                overlayLine="The chain, end to end."
                label="The supply chain, end to end"
            />

            {/* The proof layer */}
            <section className="border-b border-line bg-paper-deep dark:border-line-dark dark:bg-night-card">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="max-w-3xl">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream sm:text-4xl">
                            Proof, not promises.
                        </h2>
                        <p className="mt-6 text-lg leading-relaxed text-ink-soft dark:text-cream-soft">
                            Every attested work carries a signed Glenride record: the
                            claim, the evidence behind it, the verifier who checked
                            it, and the timestamp. The record is public, and anyone
                            can verify it — or challenge it.
                        </p>
                        <p className="mt-5 text-lg leading-relaxed text-ink-soft dark:text-cream-soft">
                            The registry currently holds{' '}
                            <span className="font-semibold text-ink dark:text-cream">
                                {attestationCount}{' '}
                                {attestationCount === 1 ? 'attestation' : 'attestations'}
                            </span>{' '}
                            across{' '}
                            <span className="font-semibold text-ink dark:text-cream">
                                {publishedCount}{' '}
                                {publishedCount === 1
                                    ? 'published brief'
                                    : 'published briefs'}
                            </span>{' '}
                            in the Vanguard Library.
                        </p>
                        <Link
                            href={route('attestations.index')}
                            className="mt-8 inline-flex items-center font-mono text-sm font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                        >
                            Browse the public registry →
                        </Link>
                    </div>
                </div>
            </section>

            {/* From the Vanguard Library */}
            <section className="border-b border-line dark:border-line-dark">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream sm:text-4xl">
                            From the Vanguard Library
                        </h2>
                        <Link
                            href={route('library.index')}
                            className="font-mono text-sm font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                        >
                            All monographs →
                        </Link>
                    </div>

                    <div className="mt-10 border-t border-line dark:border-line-dark">
                        {briefs.map((brief) => (
                            <article
                                key={brief.id}
                                className="group border-b border-line py-8 dark:border-line-dark"
                            >
                                <div className="flex flex-wrap items-baseline justify-between gap-3">
                                    <h3 className="max-w-3xl font-display text-2xl font-bold leading-snug text-ink transition group-hover:text-sienna-deep dark:text-cream dark:group-hover:text-sienna">
                                        <Link href={route('briefs.show', brief.id)}>
                                            {brief.title}
                                        </Link>
                                    </h3>
                                    {formatDate(brief.published_at) && (
                                        <span className="font-mono text-xs text-ink-soft dark:text-cream-soft">
                                            {formatDate(brief.published_at)}
                                        </span>
                                    )}
                                </div>
                                {brief.abstract && (
                                    <p className="mt-3 max-w-3xl leading-relaxed text-ink-soft dark:text-cream-soft">
                                        {brief.abstract}
                                    </p>
                                )}
                                {(brief.attestation_public_id || brief.record_version) && (
                                    <p className="mt-4 font-mono text-xs font-semibold text-sienna-deep dark:text-sienna">
                                        {brief.attestation_public_id && (
                                            <>Witnessed by Glenride · {brief.attestation_public_id}</>
                                        )}
                                        {brief.attestation_public_id && brief.record_version && ' · '}
                                        {brief.record_version && (
                                            <>SpinWave record v{brief.record_version}</>
                                        )}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doors */}
            <section>
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-cream sm:text-4xl">
                        Go deeper
                    </h2>
                    <div className="mt-10 border-t border-line dark:border-line-dark">
                        <Link
                            href={route('essays.index')}
                            className="group flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-6 transition dark:border-line-dark"
                        >
                            <span className="font-display text-xl font-bold text-ink transition group-hover:text-sienna-deep dark:text-cream dark:group-hover:text-sienna">
                                Essays
                            </span>
                            <span className="text-sm text-ink-soft dark:text-cream-soft">
                                Long-form foundational writing
                                {essayCount > 0
                                    ? ` — ${essayCount} published`
                                    : ''}{' '}
                                →
                            </span>
                        </Link>
                        <Link
                            href={route('standards.show')}
                            className="group flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-6 transition dark:border-line-dark"
                        >
                            <span className="font-display text-xl font-bold text-ink transition group-hover:text-sienna-deep dark:text-cream dark:group-hover:text-sienna">
                                Standards
                            </span>
                            <span className="text-sm text-ink-soft dark:text-cream-soft">
                                The standards Glenride works to →
                            </span>
                        </Link>
                        <Link
                            href={route('store.index')}
                            className="group flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-6 transition dark:border-line-dark"
                        >
                            <span className="font-display text-xl font-bold text-ink transition group-hover:text-sienna-deep dark:text-cream dark:group-hover:text-sienna">
                                Store
                            </span>
                            <span className="text-sm text-ink-soft dark:text-cream-soft">
                                Commercial work and executive salons →
                            </span>
                        </Link>
                        <div className="border-b border-line py-6 dark:border-line-dark">
                            <p className="font-display text-xl font-bold text-ink dark:text-cream">
                                The record, before you reach out
                            </p>
                            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">
                                <li>
                                    Published daily — The Dispatch, triple-checked
                                    before it posts.
                                </li>
                                <li>
                                    Every Monday — a public U.S. drug-shortage
                                    digest.
                                </li>
                                <li>
                                    Attested — every record in the public registry
                                    carries its evidence, verifier, and timestamp.{' '}
                                    <Link
                                        href={route('attestations.index')}
                                        className="font-semibold text-sienna-deep transition hover:text-ink dark:text-sienna dark:hover:text-cream"
                                    >
                                        Browse the registry →
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <a
                            href="https://dvaughnhouse.com/#contact"
                            className="group flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-6 transition dark:border-line-dark"
                        >
                            <span className="font-display text-xl font-bold text-ink transition group-hover:text-sienna-deep dark:text-cream dark:group-hover:text-sienna">
                                Contact
                            </span>
                            <span className="text-sm text-ink-soft dark:text-cream-soft">
                                Reach Glenride through the routing hub →
                            </span>
                        </a>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
