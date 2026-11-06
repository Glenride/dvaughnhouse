import { useEffect, useRef, useState } from "react";
import { Parallax } from "./motion.jsx";
import { ROOM_PROJECTS } from "./data/projects.js";
import { AUDIT_PRICE } from "./data/site-content.js";
import { BIO_PARAS } from "./data/home-content.js";
import { ARROW, PROJECT_ICONS } from "./data/projectIcons.jsx";
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

export function FlashSaleBanner() {
  return (
    <div className="bg-sienna-deep pt-24 text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 py-3 text-center sm:justify-between sm:text-left lg:px-8">
        <p className="text-sm font-semibold">
          The Founder&rsquo;s Override — two AI workflow audit slots,{" "}
          {AUDIT_PRICE} each (tax included). Book by Sunday night.
        </p>
        <a href="/audit" className="text-sm font-bold underline underline-offset-4 hover:text-cream">
          Claim a slot →
        </a>
      </div>
    </div>
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
              {`${ROOM_PROJECTS.map((r) => r.label).join(", ")} — built in the open.`}
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
        <h2 className="ph-motto-text reveal reveal-replay">
          Understand the system. <em>Build your way out.</em>
        </h2>
        <p className="ph-motto-role reveal reveal-delay reveal-replay">Independent AI Orchestrator &middot; Cincinnati, Ohio</p>
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

  // While the bio is pinned, retract the fixed pill above the viewport so
  // no bio line ever sits behind it — the centered bio text is taller than
  // the pill clearance on phone viewports, and shorter viewports make it
  // worse. The pill returns the moment the pin releases (at release the
  // visible paragraph sits well below the pill). No-JS / reduced-motion
  // never pins, so the class never applies there.
  useEffect(() => {
    if (!active || !pinRef.current) return undefined;
    const update = () => {
      const pin = pinRef.current;
      if (!pin) return;
      const r = pin.getBoundingClientRect();
      const pinned = r.top <= 160 && r.bottom > window.innerHeight;
      document.documentElement.classList.toggle("ph-bio-pinned", pinned);
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          update();
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      document.documentElement.classList.remove("ph-bio-pinned");
    };
  }, [active]);

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

export function WorkRooms() {
  return (
    <div className="ph-work-gap" id="work">
      {ROOM_PROJECTS.map((room, i) => (
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
                {room.lockup ? <img src={dquizzLockup} alt="" loading="lazy" /> : PROJECT_ICONS[room.id]}
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
  const [form, setForm] = useState({ name: "", email: "", topic: "partnership", message: "", company: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus({ state: "success", message: "Received. I'll read it personally — thank you." });
        setForm({ name: "", email: "", topic: "partnership", message: "", company: "" });
      } else if (data.error === "storage_not_configured") {
        setStatus({ state: "error", message: "The contact form isn't online yet — check back soon." });
      } else if (data.error === "rate_limited") {
        setStatus({ state: "error", message: "Too many messages in a short time — try again in an hour." });
      } else {
        setStatus({ state: "error", message: "Something didn't validate — check the fields and try again." });
      }
    } catch {
      setStatus({ state: "error", message: "Couldn't send — check your connection and try again." });
    }
  }

  return (
    <section className="ph-close" id="contact" aria-label="Closing">
      <div className="ph-wrap-narrow reveal">
        <h2>Keep building with intention.</h2>
        <p>
          The tools keep getting faster at generating. Deciding what deserves to exist, and how it
          feels, stays Human. If a system of yours needs building or proving, start with one
          conversation.
        </p>
        <span className="ph-email-pill">dvaughn@dvaughnhouse.com</span>
        <form className="ph-contact-form" onSubmit={submit}>
          <div className="ph-form-row">
            <div className="ph-form-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name" type="text" required maxLength={100}
                value={form.name} onChange={set("name")}
                placeholder="Your name" autoComplete="name"
              />
            </div>
            <div className="ph-form-field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email" type="email" required maxLength={254}
                value={form.email} onChange={set("email")}
                placeholder="you@example.com" autoComplete="email"
              />
            </div>
          </div>
          <div className="ph-form-field">
            <label htmlFor="contact-topic">Topic</label>
            <select id="contact-topic" value={form.topic} onChange={set("topic")}>
              <option value="partnership">Partnership</option>
              <option value="research">Research collaboration</option>
              <option value="press">Press</option>
              <option value="speaking">Speaking</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div className="ph-form-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message" required maxLength={2000} rows={5}
              value={form.message} onChange={set("message")}
              placeholder="What's on your mind?"
            />
          </div>
          {/* Honeypot: invisible to humans, irresistible to bots */}
          <input
            className="ph-honeypot" type="text" name="company"
            value={form.company} onChange={set("company")}
            tabIndex={-1} autoComplete="off" aria-hidden="true"
          />
          <div>
            <button
              className="ph-form-submit" type="submit"
              disabled={status.state === "sending"}
            >
              {status.state === "sending" ? "Sending…" : "Send message"}
            </button>
          </div>
          {status.state === "success" && (
            <p className="ph-form-status ph-form-status-success" role="status">
              {status.message}
            </p>
          )}
          {status.state === "error" && (
            <p className="ph-form-status ph-form-status-error" role="alert">
              {status.message}
            </p>
          )}
        </form>
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
