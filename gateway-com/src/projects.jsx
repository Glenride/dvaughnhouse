import { useEffect } from "react";
import dquizzLockup from "./assets/dquizz-lockup.webp";
import { PROJECT_CARD_PROJECTS } from "./data/projects.js";
import { ARROW, PROJECT_ICONS } from "./data/projectIcons.jsx";

// Projects: the expanded card set — every current public work surface.
// Card language matches the homepage rooms: one line-art icon, one
// sentence, one button. Copy is the rooms' own lines where a room exists,
// the predecessor homepage's card lines where those existed, or a line
// grounded in the Links index / live site — never invented. The Witness
// registry panel stays on the homepage Witness card only; this page
// carries the plain card. Tress Column's line is a draft from verified
// facts (renamed from Pearls Nov 1; tc landing page live Nov 2;
// exchange still in build) and is flagged as such in the build report.

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
        {PROJECT_CARD_PROJECTS.map((room) => (
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
                  {room.lockup ? <img src={dquizzLockup} alt="" loading="lazy" /> : PROJECT_ICONS[room.id]}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
