/**
 * SiteFooter — shared legal footer for the public ThinkTank OS surfaces
 * (Vanguard Library, Store). Legal documents live centrally on
 * dvaughnhouse.com; this footer links there.
 */
export default function SiteFooter() {
    const legal = [
        { label: 'Mission Control', href: 'https://mission.dvaughnhouse.com' },
        { label: 'About', href: 'https://dvaughnhouse.com/#about' },
        { label: 'Contact', href: 'https://dvaughnhouse.com/#contact' },
        { label: 'Terms of Service', href: 'https://dvaughnhouse.com/terms' },
        { label: 'Privacy Policy', href: 'https://dvaughnhouse.com/privacy' },
    ];

    return (
        <footer className="border-t border-line-dark bg-night text-cream-soft">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-display text-sm font-bold tracking-tight text-cream">
                        D&rsquo;Vaughn House
                    </p>
                    <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
                        {legal.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-sm text-cream-soft transition-colors hover:text-cream"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>
                <div className="mt-6 flex flex-col gap-4 border-t border-line-dark pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-cream-soft">
                        © 2026 D&rsquo;Vaughn House. All rights reserved.
                    </p>
                    <p className="text-xs text-cream-soft">
                        A Glenride project. Built independent.
                    </p>
                </div>
                <p className="mt-4 text-[11px] leading-relaxed text-cream-soft">
                    Nothing on this site is financial, legal, investment, or medical
                    advice. Token and market content is educational only. Products are
                    sold as described at checkout — nothing here promises profit,
                    income, or any particular result.
                </p>
            </div>
        </footer>
    );
}
