import { useEffect } from "react";
import dquizzLockup from "./assets/dquizz-lockup.webp";

// Projects: the expanded card set — every current public work surface.
// Card language matches the homepage rooms: one line-art icon, one
// sentence, one button. Copy is the rooms' own lines where a room exists,
// the predecessor homepage's card lines where those existed, or a line
// grounded in the Links index / live site — never invented. The Witness
// registry panel stays on the homepage Witness card only; this page
// carries the plain card. Tress Column's line is a draft from verified
// facts (renamed from Pearls Nov 1; tc landing page live Nov 2;
// exchange still in build) and is flagged as such in the build report.

const ARROW = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

function lineIcon(paths) {
  return (
    <svg viewBox="0 0 200 200" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths}
    </svg>
  );
}

const PROJECTS = [
  {
    id: "thinktank",
    label: "ThinkTank OS",
    status: "Live / In build",
    line: "The working surface and the database behind it: manuscripts and data, stored with attestation.",
    href: "https://dvaughnhouse.org",
    btn: "dvaughnhouse.org",
    icon: lineIcon(<>
      <path className="ic-ink" d="M52 64L96 42l46 28-24 34" />
      <path className="ic-ink" d="M52 64l18 44 22 42 58-10-32-36" />
      <path className="ic-sienna" d="M96 42l22 62M70 108h48M48 138l22-30 48-4 32 36M48 138l44 12" />
      <circle className="ic-ink" cx="52" cy="64" r="5" />
      <circle className="ic-sienna" cx="96" cy="42" r="5" />
      <circle className="ic-ink" cx="142" cy="70" r="5" />
      <circle className="ic-sienna" cx="70" cy="108" r="5" />
      <circle className="ic-fill" cx="118" cy="104" r="5.5" />
      <circle className="ic-ink" cx="150" cy="140" r="5" />
      <circle className="ic-sienna" cx="92" cy="150" r="5" />
      <circle className="ic-ink" cx="48" cy="138" r="5" />
    </>),
  },
  {
    id: "witness",
    label: "Witness",
    status: "Live — V1 shipped",
    line: "Signed proof that work happened as claimed — its first attestation, GLR-AT-2026-SN6RRF, is issued and open to challenge.",
    href: "https://dvaughnhouse.org/attestations",
    btn: "dvaughnhouse.org/attestations",
    icon: lineIcon(<>
      <circle className="ic-ink" cx="100" cy="100" r="64" />
      <circle className="ic-sienna" cx="100" cy="100" r="47" />
      <path className="ic-ink" d="M76 101l17 17 32-36" />
      <circle className="ic-fill" cx="100" cy="36" r="3.5" />
      <circle className="ic-fill" cx="100" cy="164" r="3.5" />
      <circle className="ic-fill" cx="36" cy="100" r="3.5" />
      <circle className="ic-fill" cx="164" cy="100" r="3.5" />
    </>),
  },
  {
    id: "spinwave",
    label: "SpinWave",
    status: "In build — live status not yet claimed",
    line: "A manuscript and data repository built on one idea: the Humans who create new knowledge get paid proportionately for it.",
    href: "https://spinwave.tech",
    btn: "spinwave.tech",
    icon: lineIcon(<>
      <circle className="ic-ink" cx="100" cy="100" r="64" />
      <path className="ic-sienna" d="M38 100c10-26 20-26 30 0s20 26 30 0 20-26 30 0 20 26 34 0" />
      <circle className="ic-fill" cx="145" cy="55" r="4" />
    </>),
  },
  {
    id: "inspirewrite",
    label: "InspireWrite",
    status: "Live",
    line: "InspireWrite by Glenride: scripture reading and private journaling, distraction-free by design.",
    href: "https://inspirewrite.online",
    btn: "inspirewrite.online",
    icon: lineIcon(<>
      <path className="ic-sienna" d="M100 22l3.5 8.5L112 34l-8.5 3.5L100 46l-3.5-8.5L88 34l8.5-3.5z" />
      <path className="ic-ink" d="M100 70C85 56 60 51 40 57v86c20-6 45-1 60 13 15-14 40-19 60-13V57c-20-6-45-1-60 13z" />
      <path className="ic-ink" d="M100 70v86" />
      <path className="ic-sienna" d="M56 82c11-2 24 0 34 6M56 103c11-2 24 0 34 6M110 88c10-6 23-8 34-6M110 109c10-6 23-8 34-6" />
    </>),
  },
  {
    id: "dquizz",
    label: "D’Quizz",
    status: "Live — since October 22, 2026",
    line: "My most shipped product: a quiz-funnel tool with sign-in and Stripe subscriptions fully wired — plans run Starter $29/mo, Pro $99/mo, Agency $399/mo.",
    href: "https://app.dvaughnhouse.com",
    btn: "app.dvaughnhouse.com",
    lockup: true,
  },
  {
    id: "dispatch",
    label: "Dispatch",
    status: "Live",
    line: "The blog. Plain-language investigations — drug shortages, supply chains, the systems that seek to harm you. Published free, verified before asserted.",
    href: "https://blog.dvaughnhouse.com",
    btn: "blog.dvaughnhouse.com",
    icon: lineIcon(<>
      <path className="ic-ink" d="M45 50h110M45 85h110M45 120h70" />
      <circle className="ic-sienna" cx="150" cy="120" r="12" />
      <path className="ic-sienna" d="M45 155h110" />
    </>),
  },
  {
    id: "bothq",
    label: "Bot HQ",
    status: "Live — public status board",
    line: "The bot team, live. A public status board for the bots that run the work — what they're doing, what they've done, and the receipts.",
    href: "https://bots.dvaughnhouse.com/public",
    btn: "bots.dvaughnhouse.com/public",
    icon: lineIcon(<>
      <circle className="ic-ink" cx="70" cy="70" r="18" />
      <circle className="ic-ink" cx="130" cy="70" r="18" />
      <circle className="ic-ink" cx="70" cy="130" r="18" />
      <circle className="ic-ink" cx="130" cy="130" r="18" />
      <path className="ic-sienna" d="M88 70h24M70 88v24M130 88v24M88 130h24" />
      <circle className="ic-fill" cx="100" cy="100" r="6" />
    </>),
  },
  {
    id: "tress",
    label: "Tress Column",
    status: "In build — landing page live",
    line: "The fair-launch platform, renamed from Pearls — the landing page is live while the exchange itself is still in build.",
    href: "https://tc.dvaughnhouse.com",
    btn: "tc.dvaughnhouse.com",
    icon: lineIcon(<>
      <path className="ic-ink" d="M60 170V50M100 170V50M140 170V50" />
      <path className="ic-sienna" d="M45 170h110M45 40h110" />
      <circle className="ic-fill" cx="100" cy="110" r="6" />
    </>),
  },
  {
    id: "homelab",
    label: "Homelab",
    status: "Live",
    line: "Public journal of home-lab builds.",
    href: "https://homelab.dvaughnhouse.com",
    btn: "homelab.dvaughnhouse.com",
    icon: lineIcon(<>
      <path className="ic-ink" d="M40 60h120M40 100h120M40 140h120" />
      <circle className="ic-sienna" cx="155" cy="60" r="5" />
      <circle className="ic-sienna" cx="155" cy="100" r="5" />
      <circle className="ic-sienna" cx="155" cy="140" r="5" />
    </>),
  },
  {
    id: "freewill",
    label: "The Free-Will Machine",
    status: "Live",
    line: "Interactive architecture study — AI machinery that can never override humans.",
    href: "https://freewill.dvaughnhouse.com",
    btn: "freewill.dvaughnhouse.com",
    icon: lineIcon(<>
      <circle className="ic-ink" cx="100" cy="100" r="64" />
      <circle className="ic-sienna" cx="100" cy="100" r="30" />
      <path className="ic-ink" d="M100 36v14M100 150v14M36 100h14M150 100h14" />
    </>),
  },
  {
    id: "catalog",
    label: "Glenride Catalog",
    status: "Live",
    line: "Public directory of everything Glenride has shipped — 59 entries, search + filters.",
    href: "https://glenride-catalog.pages.dev",
    btn: "glenride-catalog.pages.dev",
    icon: lineIcon(<>
      <path className="ic-ink" d="M45 45h110v110H45z" />
      <path className="ic-sienna" d="M65 75h70M65 100h70M65 125h45" />
    </>),
  },
];

export function ProjectsPage() {
  useEffect(() => {
    document.title = "Projects — D'Vaughn House";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 pt-16 sm:pt-20 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
          Projects
        </p>
        <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
          What I&rsquo;m building.
        </h1>
      </div>
      <div className="ph-work-gap">
        {PROJECTS.map((room) => (
          <section className="ph-room" key={room.id} id={room.id} aria-label={room.label}>
            <div className="ph-room-card reveal" style={{ maxWidth: "1080px" }}>
              <div className="ph-room-top">
                <div className="ph-room-copy">
                  <span className="ph-status">{room.status}</span>
                  <h2>{room.label}</h2>
                  <p className="ph-one-line">{room.line}</p>
                  <div className="ph-room-actions">
                    <a className="ph-room-btn" href={room.href} target="_blank" rel="noopener">
                      {room.btn} {ARROW}
                    </a>
                  </div>
                </div>
                <div className={`ph-room-icon${room.lockup ? " ph-room-lockup" : ""}`} aria-hidden="true">
                  {room.lockup ? <img src={dquizzLockup} alt="" loading="lazy" /> : room.icon}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
