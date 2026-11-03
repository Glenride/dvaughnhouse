import { useEffect, useRef, useState } from "react";
import { Parallax } from "./motion.jsx";
import heroLight from "./assets/hero-network-light.webp";
import heroDark from "./assets/hero-network-dark.webp";
import workThumb from "./assets/work-thumb.webp";
import houseMark from "./assets/house-mark.png";
import dquizzLockup from "./assets/dquizz-lockup.webp";
import film0 from "./assets/film-0.webp";
import film1 from "./assets/film-1.webp";
import film2 from "./assets/film-2.webp";
import film3 from "./assets/film-3.webp";
import film4 from "./assets/film-4.webp";
import film5 from "./assets/film-5.webp";
import film6 from "./assets/film-6.webp";
import film7 from "./assets/film-7.webp";

/*
 * Portfolio homepage port — the artifact prototype's composition, rebuilt
 * as React inside the gateway (NOT a static export: the gateway keeps its
 * routes, forms, auth, and functions).
 *
 * Flow: network-map hero (name bottom-left, Work card bottom-right) →
 * motto → pinned stationary bio (words illuminate in place) + fast
 * filmstrip → story link → five expansive work cards → close → footer.
 *
 * No-JS / reduced-motion fallback: the bio renders as three stacked,
 * fully legible paragraphs and the filmstrip sits still. The pin,
 * illumination, and custom cursor only engage from effects, never from
 * render, so server prerendering stays clean.
 */

const FILM = [
  { src: film0, pos: "72% 28%" },
  { src: film1, pos: "50% 50%" },
  { src: film2, pos: "50% 45%" },
  { src: film3, pos: "50% 50%" },
  { src: film4, pos: "50% 50%" },
  { src: film5, pos: "50% 50%" },
  { src: film6, pos: "50% 50%" },
  { src: film7, pos: "50% 40%" },
];

const BIO_PARAS = [
  "I spent nearly 15 years running regulated clinical research: data, protocols, proof. Now I build independently: systems, software, and stories, held to the same standard. The machine proposes. The Human decides.",
  "I\u2019m building Glenride into a company of one that ships real systems (SpinWave, Witness, Pearls) and the media that explains them, so the work outlives the pitch.",
  "Because good engineering too often feels sterile, and good media too often lacks rigor. I create where code, evidence, and story lock together.",
];

// Prototype bio timing, unit-for-unit: fade 1.2, gap 0.8, word 0.3,
// hold 0.55 per word, 15px of scroll per unit.
const FADE_U = 1.2;
const GAP_U = 0.8;
const WORD_U = 0.3;
const HOLD_PER_WORD = 0.55;
const PX_PER_UNIT = 15;

function bioBeats() {
  const beats = [];
  let cursor = 0;
  let units = 0;
  BIO_PARAS.forEach((text, i) => {
    const n = text.trim().split(/\s+/).length;
    const fadeInStart = cursor;
    const wordsStart = i === 0 ? 0 : fadeInStart + FADE_U;
    const wordsEnd = wordsStart + n * WORD_U;
    const holdEnd = wordsEnd + n * HOLD_PER_WORD;
    beats.push({ n, fadeInStart, wordsStart, wordsEnd, holdEnd });
    cursor = holdEnd + FADE_U + GAP_U;
    if (i === BIO_PARAS.length - 1) units = holdEnd;
  });
  return { beats, units };
}

const { beats: BIO_BEATS, units: BIO_UNITS } = bioBeats();
const smoothstep = (t) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    if (reducedMotion()) return undefined;
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return undefined;
    }
    document.documentElement.classList.add("has-cursor");
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 3.5}px, ${my - 3.5}px)`;
      }
    };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ringRef.current) {
        const half = ringRef.current.classList.contains("is-hot") ? 27 : 17;
        ringRef.current.style.transform = `translate(${rx - half}px, ${ry - half}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    const onOver = (e) => {
      if (e.target.closest && e.target.closest("a, button, .ph-word")) {
        ringRef.current?.classList.add("is-hot");
      }
    };
    const onOut = (e) => {
      if (e.target.closest && e.target.closest("a, button, .ph-word")) {
        ringRef.current?.classList.remove("is-hot");
      }
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    raf = requestAnimationFrame(loop);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="ph-cursor-dot" />
      <div ref={ringRef} aria-hidden="true" className="ph-cursor-ring" />
    </>
  );
}

export function PortfolioHero() {
  return (
    <header className="ph-hero" id="top">
      <Parallax className="ph-hero-media" speed={0.16}>
        <picture aria-hidden="true">
          <source media="(prefers-color-scheme: dark)" srcSet={heroDark} />
          <img id="heroImg" src={heroLight} alt="" fetchPriority="high" />
        </picture>
      </Parallax>
      <div className="ph-hero-shade" aria-hidden="true" />
      <div className="ph-hero-bottom">
        <h1 className="ph-hero-name hero-enter hero-enter-1">D&rsquo;Vaughn House</h1>
        <a className="ph-work-card hero-enter hero-enter-3" href="#work" aria-label="The Work — see the projects">
          <span className="ph-wc-thumb">
            <img src={workThumb} alt="" />
            <span className="ph-wc-new">NEW</span>
          </span>
          <span className="ph-wc-body">
            <span className="ph-wc-label">The Work</span>
            <span className="ph-wc-title">The systems I actually run</span>
            <span className="ph-wc-line">
              ThinkTank OS, Witness, SpinWave, InspireWrite, D&rsquo;Quizz — built in the open.
            </span>
          </span>
          <span className="ph-wc-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </a>
      </div>
    </header>
  );
}

export function Motto() {
  return (
    <section className="ph-motto" aria-label="Introduction">
      <div className="ph-wrap">
        <h2 className="ph-motto-text reveal">
          Understand the system. <em>Build your way out.</em>
        </h2>
        <p className="ph-motto-role reveal reveal-delay">Independent AI Orchestrator &middot; Cincinnati, Ohio</p>
      </div>
    </section>
  );
}

function BioParagraph({ text, beat, u, active }) {
  const words = text.trim().split(/\s+/);
  let litN = 0;
  if (u >= beat.wordsEnd) litN = words.length;
  else if (u > beat.wordsStart) litN = Math.floor((u - beat.wordsStart) / WORD_U);
  let op = 1;
  if (active) {
    const bi = BIO_BEATS.indexOf(beat);
    if (bi > 0) op = Math.min(op, smoothstep((u - beat.fadeInStart) / FADE_U));
    if (bi < BIO_BEATS.length - 1) op = Math.min(op, 1 - smoothstep((u - beat.holdEnd) / FADE_U));
  }
  return (
    <div
      className="ph-mani-block"
      style={active ? { opacity: op, visibility: op <= 0.003 ? "hidden" : "visible" } : undefined}
    >
      <p className="ph-mani-text" aria-label={text.trim()}>
        {words.map((w, i) => (
          <span key={i} aria-hidden="true">
            <span
              className={`ph-word${/^(machine|Human|decides\.)$/.test(w) ? " ph-key" : ""}${active && i < litN ? " ph-lit" : ""}`}
            >
              {w}
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

export function PinnedBio() {
  const pinRef = useRef(null);
  const [active, setActive] = useState(false);
  const [pinH, setPinH] = useState(null);
  const [u, setU] = useState(0);

  useEffect(() => {
    if (reducedMotion() || !pinRef.current) return undefined;
    setActive(true);
    const measure = () => {
      const vh = window.innerHeight;
      const dwellIn = Math.round(vh * 0.18);
      const dwellOut = Math.round(vh * 0.25);
      const revealSpan = Math.max(1, Math.round(BIO_UNITS * PX_PER_UNIT));
      setPinH(vh + dwellIn + revealSpan + dwellOut);
    };
    measure();
    let ticking = false;
    const update = () => {
      ticking = false;
      const pin = pinRef.current;
      if (!pin) return;
      const vh = window.innerHeight;
      const total = pin.offsetHeight - vh;
      if (total <= 0) {
        setU(0);
        return;
      }
      const scrolled = -pin.getBoundingClientRect().top;
      const dwellIn = Math.round(vh * 0.18);
      const revealSpan = Math.max(1, Math.round(BIO_UNITS * PX_PER_UNIT));
      const r = Math.min(1, Math.max(0, (scrolled - dwellIn) / revealSpan));
      setU(r * BIO_UNITS);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, []);

  return (
    <section className={`ph-bio${active ? " ph-bio-on" : ""}`} id="bio" aria-label="About">
      <div
        className="ph-bio-pin"
        ref={pinRef}
        style={pinH ? { height: `${pinH}px` } : undefined}
      >
        <div className="ph-bio-sticky">
          <div className="ph-bio-stack">
            {BIO_PARAS.map((text, i) => (
              <BioParagraph key={i} text={text} beat={BIO_BEATS[i]} u={u} active={active} />
            ))}
          </div>
          <div className="ph-film" aria-hidden="true">
            <div className="ph-film-track">
              {[0, 1].map((group) => (
                <div className="ph-film-group" key={group} aria-hidden={group === 1}>
                  {FILM.map((f, i) => (
                    <span className="ph-frame" key={i}>
                      <img src={f.src} alt="" style={{ objectPosition: f.pos }} loading="lazy" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="ph-wrap ph-story-link">
        <a className="ph-story-link-a" href="/about">
          Read the full story <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </section>
  );
}

const ARROW = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

const ROOMS = [
  {
    id: "thinktank",
    label: "ThinkTank OS",
    status: "Live / In build",
    line: "The working surface and the database behind it: manuscripts and data, stored with attestation.",
    href: "https://dvaughnhouse.org",
    btn: "dvaughnhouse.org",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      </svg>
    ),
  },
  {
    id: "witness",
    label: "Witness",
    status: "Live — V1 shipped",
    line: "Signed proof that work happened as claimed — its first attestation, GLR-AT-2026-SN6RRF, is issued and open to challenge.",
    href: "https://dvaughnhouse.org/attestations",
    btn: "dvaughnhouse.org/attestations",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle className="ic-ink" cx="100" cy="100" r="64" />
        <circle className="ic-sienna" cx="100" cy="100" r="47" />
        <path className="ic-ink" d="M76 101l17 17 32-36" />
        <circle className="ic-fill" cx="100" cy="36" r="3.5" />
        <circle className="ic-fill" cx="100" cy="164" r="3.5" />
        <circle className="ic-fill" cx="36" cy="100" r="3.5" />
        <circle className="ic-fill" cx="164" cy="100" r="3.5" />
      </svg>
    ),
    registry: true,
  },
  {
    id: "spinwave",
    label: "SpinWave",
    status: "In build — live status not yet claimed",
    line: "A manuscript and data repository built on one idea: the Humans who create new knowledge get paid proportionately for it.",
    href: "https://spinwave.tech",
    btn: "spinwave.tech",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle className="ic-ink" cx="100" cy="100" r="64" />
        <path className="ic-sienna" d="M38 100c10-26 20-26 30 0s20 26 30 0 20-26 30 0 20 26 34 0" />
        <circle className="ic-fill" cx="145" cy="55" r="4" />
      </svg>
    ),
  },
  {
    id: "inspirewrite",
    label: "InspireWrite",
    status: "Live",
    line: "InspireWrite by Glenride: scripture reading and private journaling, distraction-free by design.",
    href: "https://inspirewrite.online",
    btn: "inspirewrite.online",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path className="ic-sienna" d="M100 22l3.5 8.5L112 34l-8.5 3.5L100 46l-3.5-8.5L88 34l8.5-3.5z" />
        <path className="ic-ink" d="M100 70C85 56 60 51 40 57v86c20-6 45-1 60 13 15-14 40-19 60-13V57c-20-6-45-1-60 13z" />
        <path className="ic-ink" d="M100 70v86" />
        <path className="ic-sienna" d="M56 82c11-2 24 0 34 6M56 103c11-2 24 0 34 6M110 88c10-6 23-8 34-6M110 109c10-6 23-8 34-6" />
      </svg>
    ),
  },
  {
    id: "dquizz",
    label: "D\u2019Quizz",
    status: "Live — since October 22, 2026",
    line: "My most shipped product: a quiz-funnel tool with sign-in and Stripe subscriptions fully wired — plans run Starter $29/mo, Pro $99/mo, Agency $399/mo.",
    href: "https://app.dvaughnhouse.com",
    btn: "app.dvaughnhouse.com",
    lockup: true,
  },
];

export function WorkRooms() {
  return (
    <div className="ph-work-gap" id="work">
      {ROOMS.map((room, i) => (
        <section className="ph-room" key={room.id} id={room.id} aria-label={room.label}>
          <div
            className="ph-room-card reveal"
            style={{
              maxWidth: `${900 + i * 80}px`,
              "--ph-title": `${56 + i * 7}px`,
            }}
          >
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
            {room.registry && (
              <div className="ph-registry" role="table" aria-label="Attestation registry, first entry">
                <div className="ph-stamp" aria-hidden="true">
                  Witness
                  <br />
                  Attested
                </div>
                <div className="ph-row" role="row">
                  <span className="ph-rk" role="cell">Attestation</span>
                  <span className="ph-rv" role="cell">GLR-AT-2026-SN6RRF</span>
                </div>
                <div className="ph-row" role="row">
                  <span className="ph-rk" role="cell">Authority</span>
                  <span className="ph-rv" role="cell">Witness · Glenride</span>
                </div>
                <div className="ph-row" role="row">
                  <span className="ph-rk" role="cell">Lifecycle</span>
                  <span className="ph-rv" role="cell">Issue · Challenge · Revoke</span>
                </div>
                <div className="ph-row" role="row">
                  <span className="ph-rk" role="cell">Record</span>
                  <span className="ph-rv" role="cell">First attestation issued</span>
                </div>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CloseSection() {
  return (
    <section className="ph-close" id="contact" aria-label="Closing">
      <div className="ph-wrap-narrow reveal">
        <h2>Keep building with intention.</h2>
        <p>
          The tools keep getting faster at generating. Deciding what deserves to exist, and how it
          feels, stays Human. If a system of yours needs building or proving, start with one
          conversation.
        </p>
        <a className="ph-email-pill" href="mailto:dvaughn@dvaughnhouse.com">
          dvaughn@dvaughnhouse.com
        </a>
      </div>
    </section>
  );
}

export function PortfolioFooter() {
  return (
    <footer className="ph-foot">
      <div className="ph-wrap">
        <div className="ph-foot-lockup">
          <img src={houseMark} alt="The D'Vaughn House mark — a network sphere with a burnt-sienna core" loading="lazy" />
          <span>
            <span className="ph-fl-name">D&rsquo;Vaughn House</span>
            <span className="ph-fl-tag">Build your way out.</span>
          </span>
        </div>
      </div>
      <div className="ph-wrap ph-foot-row">
        <span>Founder, Glenride</span>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
    </footer>
  );
}
