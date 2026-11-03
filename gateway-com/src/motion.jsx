import { useEffect, useRef, useState } from "react";

// Full-motion layer for the portfolio refresh (his Nov 2 decision: full
// prototype motion, never a restrained subset). Everything here is
// effect-only so server prerendering stays clean, and everything respects
// prefers-reduced-motion.

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Global reveal observer: any element with class "reveal" fades in when it
// scrolls into view. The hiding CSS only applies once JS adds the
// js-motion class, so no-JS renders stay fully visible.
// Elements marked "reveal-replay" (the motto) re-play on EVERY entry:
// the class is removed when they leave view, so the entrance beat is
// observable whenever the section scrolls into view — not just the first
// time. A plain reveal fires once and then stays static forever, which is
// why a fast phone fling (or a restored scroll position) could leave the
// motto looking motionless on every later look.
export function useRevealOnScroll() {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.documentElement.classList.add("js-motion");
    if (reducedMotion()) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("reveal-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            if (!entry.target.classList.contains("reveal-replay")) {
              observer.unobserve(entry.target);
            }
          } else if (entry.target.classList.contains("reveal-replay")) {
            entry.target.classList.remove("reveal-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// Staged reveal: wraps a block and fades/slides it in when it scrolls into
// view. Render output is identical to a plain div on the server.
export function Reveal({ className = "", children, as: Tag = "div", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (reducedMotion() || !ref.current) {
      setVisible(true);
      return undefined;
    }
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`${className} reveal${visible ? " reveal-visible" : ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

// Parallax wrapper: shifts its child slowly against the scroll. The Ken
// Burns zoom lives on the inner image so the two transforms never fight.
export function Parallax({ className = "", speed = 0.18, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reducedMotion() || !ref.current) return undefined;
    const el = ref.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const offset = Math.max(-1, Math.min(1, rect.top / window.innerHeight));
      el.style.transform = `translateY(${offset * speed * 100}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);
  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

// Cursor trail: a short fading trail of sienna dots behind the pointer.
// Desktop pointers only; never on touch, never under reduced motion.
export function CursorTrail() {
  const [dots, setDots] = useState([]);
  useEffect(() => {
    if (reducedMotion()) return undefined;
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return undefined;
    }
    let id = 0;
    let last = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < 28) return;
      last = now;
      const dot = { id: id++, x: e.clientX, y: e.clientY };
      setDots((prev) => [...prev.slice(-13), dot]);
      window.setTimeout(() => {
        setDots((prev) => prev.filter((d) => d.id !== dot.id));
      }, 650);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  if (dots.length === 0) return null;
  return (
    <div aria-hidden="true" className="cursor-trail">
      {dots.map((d, i) => (
        <span
          key={d.id}
          className="cursor-trail-dot"
          style={{
            left: d.x,
            top: d.y,
            opacity: 0.55 * ((i + 1) / dots.length),
            transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * ((i + 1) / dots.length)})`,
          }}
        />
      ))}
    </div>
  );
}
