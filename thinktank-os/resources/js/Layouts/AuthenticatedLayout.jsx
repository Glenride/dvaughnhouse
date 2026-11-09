import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const canManageCredits = ['orchestrator', 'admin'].includes(user?.role);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-paper font-serif text-ink">
            <nav className="border-b border-line bg-paper">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link
                                    href="/"
                                    className="group flex items-center space-x-3"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-base font-bold text-paper shadow-sm transition group-hover:bg-sienna group-hover:text-ink">
                                        G
                                    </span>
                                    <span className="hidden font-display text-lg font-bold tracking-tight text-ink transition group-hover:text-sienna-deep sm:block">
                                        Glenride
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard') || route().current('matrix.*')}
                                >
                                    Portfolio Matrix
                                </NavLink>
                                <NavLink
                                    href={route('manuscripts.create')}
                                    active={route().current('manuscripts.create')}
                                >
                                    Manuscript Intake
                                </NavLink>
                                <NavLink
                                    href={route('manuscripts.index')}
                                    active={route().current('manuscripts.index')}
                                >
                                    My Manuscripts
                                </NavLink>
                                <NavLink
                                    href={route('sops.index')}
                                    active={route().current('sops.*')}
                                >
                                    SOPs
                                </NavLink>
                                {canManageCredits && (
                                    <NavLink
                                        href={route('credits.index')}
                                        active={route().current('credits.*')}
                                    >
                                        Credits
                                    </NavLink>
                                )}
                                <a
                                    href="https://mission.dvaughnhouse.com"
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-ink-soft transition duration-150 ease-in-out hover:border-sienna hover:text-ink focus:border-sienna focus:text-ink focus:outline-none"
                                >
                                    Mission Control
                                </a>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-paper px-3 py-2 text-sm font-medium leading-4 text-ink-soft transition duration-150 ease-in-out hover:text-ink focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-ink-soft transition duration-150 ease-in-out hover:bg-paper-deep hover:text-ink focus:bg-paper-deep focus:text-ink focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard') || route().current('matrix.*')}
                        >
                            Portfolio Matrix
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('manuscripts.create')}
                            active={route().current('manuscripts.create')}
                        >
                            Manuscript Intake
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('manuscripts.index')}
                            active={route().current('manuscripts.index')}
                        >
                            My Manuscripts
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('sops.index')}
                            active={route().current('sops.*')}
                        >
                            SOPs
                        </ResponsiveNavLink>
                        {canManageCredits && (
                            <ResponsiveNavLink
                                href={route('credits.index')}
                                active={route().current('credits.*')}
                            >
                                Credits
                            </ResponsiveNavLink>
                        )}
                        <ResponsiveNavLink href="https://mission.dvaughnhouse.com">
                            Mission Control
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-line pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-ink">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-ink-soft">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-line bg-paper">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
