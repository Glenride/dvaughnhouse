// Shared line-art icons for project cards, keyed by project id, plus the
// shared arrow glyph. Previously these icons (and the arrow) were
// duplicated verbatim between home.jsx and projects.jsx; they now live
// here once. Projects rendered with the lockup image (D'Quizz) or with
// no card icon (the Den, which renders nowhere as a card) have no entry.

export const ARROW = (
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

export const PROJECT_ICONS = {
  thinktank: lineIcon(<>
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
  witness: lineIcon(<>
    <circle className="ic-ink" cx="100" cy="100" r="64" />
    <circle className="ic-sienna" cx="100" cy="100" r="47" />
    <path className="ic-ink" d="M76 101l17 17 32-36" />
    <circle className="ic-fill" cx="100" cy="36" r="3.5" />
    <circle className="ic-fill" cx="100" cy="164" r="3.5" />
    <circle className="ic-fill" cx="36" cy="100" r="3.5" />
    <circle className="ic-fill" cx="164" cy="100" r="3.5" />
  </>),
  spinwave: lineIcon(<>
    <circle className="ic-ink" cx="100" cy="100" r="64" />
    <path className="ic-sienna" d="M38 100c10-26 20-26 30 0s20 26 30 0 20-26 30 0 20 26 34 0" />
    <circle className="ic-fill" cx="145" cy="55" r="4" />
  </>),
  inspirewrite: lineIcon(<>
    <path className="ic-sienna" d="M100 22l3.5 8.5L112 34l-8.5 3.5L100 46l-3.5-8.5L88 34l8.5-3.5z" />
    <path className="ic-ink" d="M100 70C85 56 60 51 40 57v86c20-6 45-1 60 13 15-14 40-19 60-13V57c-20-6-45-1-60 13z" />
    <path className="ic-ink" d="M100 70v86" />
    <path className="ic-sienna" d="M56 82c11-2 24 0 34 6M56 103c11-2 24 0 34 6M110 88c10-6 23-8 34-6M110 109c10-6 23-8 34-6" />
  </>),
  dispatch: lineIcon(<>
    <path className="ic-ink" d="M45 50h110M45 85h110M45 120h70" />
    <circle className="ic-sienna" cx="150" cy="120" r="12" />
    <path className="ic-sienna" d="M45 155h110" />
  </>),
  bothq: lineIcon(<>
    <circle className="ic-ink" cx="70" cy="70" r="18" />
    <circle className="ic-ink" cx="130" cy="70" r="18" />
    <circle className="ic-ink" cx="70" cy="130" r="18" />
    <circle className="ic-ink" cx="130" cy="130" r="18" />
    <path className="ic-sienna" d="M88 70h24M70 88v24M130 88v24M88 130h24" />
    <circle className="ic-fill" cx="100" cy="100" r="6" />
  </>),
  tress: lineIcon(<>
    <path className="ic-ink" d="M60 170V50M100 170V50M140 170V50" />
    <path className="ic-sienna" d="M45 170h110M45 40h110" />
    <circle className="ic-fill" cx="100" cy="110" r="6" />
  </>),
  homelab: lineIcon(<>
    <path className="ic-ink" d="M40 60h120M40 100h120M40 140h120" />
    <circle className="ic-sienna" cx="155" cy="60" r="5" />
    <circle className="ic-sienna" cx="155" cy="100" r="5" />
    <circle className="ic-sienna" cx="155" cy="140" r="5" />
  </>),
  freewill: lineIcon(<>
    <circle className="ic-ink" cx="100" cy="100" r="64" />
    <circle className="ic-sienna" cx="100" cy="100" r="30" />
    <path className="ic-ink" d="M100 36v14M100 150v14M36 100h14M150 100h14" />
  </>),
  catalog: lineIcon(<>
    <path className="ic-ink" d="M45 45h110v110H45z" />
    <path className="ic-sienna" d="M65 75h70M65 100h70M65 125h45" />
  </>),
};
