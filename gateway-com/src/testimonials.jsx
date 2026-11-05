import { useEffect, useState } from "react";

const PERMISSIONS = [
  { id: "perm_website", label: "This website (dvaughnhouse.com)" },
  { id: "perm_clutch", label: "Clutch" },
  { id: "perm_goodfirms", label: "GoodFirms" },
  { id: "perm_designrush", label: "DesignRush" },
];

export function TestimonialsPage() {
  const [form, setForm] = useState({
    name: "",
    company_role: "",
    email: "",
    testimonial: "",
    perm_website: false,
    perm_clutch: false,
    perm_goodfirms: false,
    perm_designrush: false,
    homepage: "",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    document.title = "Share your experience — D'Vaughn House";
    window.scrollTo(0, 0);
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setChecked = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }));

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus({
          state: "success",
          message:
            "Received — thank you. I read every one personally, and nothing goes live until I've reviewed it.",
        });
        setForm({
          name: "",
          company_role: "",
          email: "",
          testimonial: "",
          perm_website: false,
          perm_clutch: false,
          perm_goodfirms: false,
          perm_designrush: false,
          homepage: "",
        });
      } else if (data.error === "storage_not_configured") {
        setStatus({ state: "error", message: "The form isn't online yet — check back soon." });
      } else if (data.error === "rate_limited") {
        setStatus({ state: "error", message: "Too many submissions in a short time — try again in an hour." });
      } else {
        setStatus({ state: "error", message: "Something didn't validate — check the fields and try again." });
      }
    } catch {
      setStatus({ state: "error", message: "Couldn't send — check your connection and try again." });
    }
  }

  const inputCls =
    "w-full rounded-xl border border-ink/20 bg-paper-deep px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-sienna-deep dark:border-cream/20 dark:bg-night-card dark:text-cream dark:placeholder:text-cream-soft/70 dark:focus:border-sienna";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-sienna-deep dark:text-sienna">
        D&rsquo;Vaughn House — Independent AI Orchestrator, Cincinnati, Ohio
      </p>
      <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
        Share your experience.
      </h1>
      <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        If we&rsquo;ve worked together — a First Build, a project, a patronage —
        I&rsquo;d rather hear it from you than write it myself. Say it in your
        own words, and tell me where it&rsquo;s allowed to appear.
      </p>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Your email is only so I can verify it&rsquo;s really you. It&rsquo;s never
        published. Submitted testimonials are reviewed before anything is published.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="testimonial-name" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
              Name
            </label>
            <input
              id="testimonial-name" type="text" required maxLength={100}
              value={form.name} onChange={set("name")} className={inputCls}
              placeholder="Your name" autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="testimonial-email" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
              Email <span className="font-normal text-ink-soft dark:text-cream-soft">(verification only — never published)</span>
            </label>
            <input
              id="testimonial-email" type="email" required maxLength={254}
              value={form.email} onChange={set("email")} className={inputCls}
              placeholder="you@example.com" autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label htmlFor="testimonial-company-role" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
            Company / role <span className="font-normal text-ink-soft dark:text-cream-soft">(optional)</span>
          </label>
          <input
            id="testimonial-company-role" type="text" maxLength={150}
            value={form.company_role} onChange={set("company_role")} className={inputCls}
            placeholder="Company, role, or how we worked together"
          />
        </div>
        <div>
          <label htmlFor="testimonial-text" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
            Your testimonial
          </label>
          <textarea
            id="testimonial-text" required maxLength={2000} rows={6}
            value={form.testimonial} onChange={set("testimonial")} className={inputCls}
            placeholder="What did we build, and what changed because of it?"
          />
        </div>
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-ink dark:text-cream">
            Where may this appear? <span className="font-normal text-ink-soft dark:text-cream-soft">(tick any — or none, and it stays a private note for review)</span>
          </legend>
          <div className="space-y-3 rounded-2xl border border-line bg-paper-deep p-5 dark:border-line-dark dark:bg-night-card">
            {PERMISSIONS.map((p) => (
              <label key={p.id} className="flex items-start gap-3 text-sm leading-relaxed text-ink dark:text-cream">
                <input
                  type="checkbox"
                  checked={form[p.id]}
                  onChange={setChecked(p.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#B84A2B]"
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {/* Honeypot: invisible to humans, irresistible to bots */}
        <input
          type="text" name="homepage" value={form.homepage} onChange={set("homepage")}
          tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
        />
        <div>
          <button
            type="submit"
            disabled={status.state === "sending"}
            className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper disabled:opacity-60"
          >
            {status.state === "sending" ? "Sending…" : "Submit testimonial"}
          </button>
        </div>
        {status.state === "success" && (
          <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {status.message}
          </p>
        )}
        {status.state === "error" && (
          <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
