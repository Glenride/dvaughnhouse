import { useEffect, useState } from "react";
import houseMark from "./assets/house-mark.png";

const AUTH_ERROR_TEXT = {
  workos_rejected: "The sign-in was declined. Try again.",
  invalid_state: "The sign-in expired before it finished. Try again.",
  not_owner: "That account isn't on the owner list. Sign in with dvaughnhouse@gmail.com.",
  workos_unreachable: "The sign-in service couldn't be reached. Try again.",
  not_configured: "Sign-in isn't configured right now. Try again in a bit.",
};

// Visible pill stays minimal: Home / Projects / Thoughts. Everything else
// lives in the collapsed menu — Donate stands out in sienna. Mobile
// carries everything. `base` is "" on the homepage (anchors stay local)
// and "/" on subpages (anchors become absolute, e.g. /#contact).
const VISIBLE = [
  { label: "Home", href: "HOME" },
  { label: "Projects", href: "/projects" },
  { label: "Thoughts", href: "/thoughts" },
];

const MENU = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
  { label: "Donate", href: "/donate", accent: true },
  { label: "Patron", href: "/patron" },
  { label: "First Build", href: "/first-build" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export function SiteNav({ base = "" }) {
  const [open, setOpen] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(null);
  const [authError, setAuthError] = useState(null);
  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.email) setSessionEmail(data.email);
      })
      .catch(() => {});
    const match = window.location.hash.match(/^#auth_error=([^&]+)/);
    if (match) {
      setAuthError(decodeURIComponent(match[1]));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);
  const homeHref = base === "/" ? "/" : "#top";
  // Absolute paths (e.g. /about) must not be prefixed with base, or "/" + "/about" becomes "//about" (a hostname, not a page).
  const navHref = (href) => {
    if (href === "HOME") return homeHref;
    return href.startsWith("/") ? href : `${base}${href}`;
  };
  const linkCls =
    "text-sm font-medium text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline dark:text-cream-soft dark:hover:text-cream";
  const donateCls =
    "rounded-full bg-sienna px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper";
  return (
    <header className="site-nav fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-line bg-paper/95 px-6 shadow-lg shadow-ink/10 backdrop-blur dark:border-line-dark dark:bg-night/95 lg:px-8">
        <a href={homeHref} className="leading-none" aria-label="D'Vaughn House — home">
          <img src={houseMark} alt="D'Vaughn House — home" className="h-[26px] w-[26px] rounded-full" />
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {VISIBLE.map((item) => (
            <a key={item.label} href={navHref(item.href)} className={linkCls}>
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle expanded menu"
            className={`${linkCls} inline-flex items-center gap-1`}
          >
            Menu
            <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </button>
          {sessionEmail ? (
            <a href="/auth/logout" className={linkCls}>
              Sign out
            </a>
          ) : (
            <a href="/auth/login" className={linkCls}>
              Sign in
            </a>
          )}
        </nav>
        <button
          className="rounded-full p-2 text-ink transition-colors hover:bg-paper-deep md:hidden dark:text-cream dark:hover:bg-night-card"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav
          className="mx-auto mt-2 max-w-6xl rounded-3xl border border-line bg-paper/95 px-6 py-4 shadow-lg shadow-ink/10 backdrop-blur dark:border-line-dark dark:bg-night/95"
          aria-label="Expanded"
        >
          <ul className="space-y-3">
            <li className="md:hidden">
              {VISIBLE.map((item) => (
                <a
                  key={item.label}
                  href={navHref(item.href)}
                  onClick={() => setOpen(false)}
                  className="mr-6 text-base font-medium text-ink dark:text-cream"
                >
                  {item.label}
                </a>
              ))}
            </li>
            {MENU.map((item) => (
              <li key={item.label}>
                <a
                  href={navHref(item.href)}
                  onClick={() => setOpen(false)}
                  className={item.accent ? `inline-block ${donateCls}` : "block text-base font-medium text-ink dark:text-cream"}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="md:hidden">
              {sessionEmail ? (
                <>
                  <span className="block text-base font-medium text-ink dark:text-cream">Signed in</span>
                  <a href="/auth/logout" onClick={() => setOpen(false)} className="mt-1 block text-base font-medium text-ink dark:text-cream">
                    Sign out
                  </a>
                </>
              ) : (
                <a href="/auth/login" onClick={() => setOpen(false)} className="block text-base font-medium text-ink dark:text-cream">
                  Sign in
                </a>
              )}
            </li>
          </ul>
        </nav>
      )}
      {authError && AUTH_ERROR_TEXT[authError] && (
        <div className="mx-auto mt-2 max-w-6xl rounded-full border border-line bg-paper/95 px-6 py-2 text-center text-sm text-ink-soft shadow-lg dark:border-line-dark dark:bg-night/95 dark:text-cream-soft">
          {AUTH_ERROR_TEXT[authError]}
        </div>
      )}
    </header>
  );
}
