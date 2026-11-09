import { useEffect, useState } from "react";
import {
  AUDIT_PAY_URL,
  AUDIT_PRICE,
  FIRST_BUILD_PRICE,
} from "./data/site-content.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function AuditPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    business: "",
    task: "",
    day: "Monday",
    company: "",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    document.title = "Claim an audit slot — D'Vaughn House";
    window.scrollTo(0, 0);
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          topic: "audit",
          message: [
            `Business: ${form.business || "(not given)"}`,
            `Most repetitive task: ${form.task}`,
            `Preferred day next week: ${form.day}`,
          ].join("\n"),
          company: form.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus({
          state: "success",
          message: `Received. Your slot is locked once the ${AUDIT_PRICE} (tax included) is paid by Sunday night, November 8. Two slots only, first come, first served.`,
        });
        setForm({ name: "", email: "", business: "", task: "", day: "Monday", company: "" });
      } else if (data.error === "storage_not_configured") {
        setStatus({ state: "error", message: "Signup isn't online yet — check back soon." });
      } else if (data.error === "rate_limited") {
        setStatus({ state: "error", message: "Too many signups in a short time — try again in an hour." });
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
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl dark:text-cream">
        Claim an audit slot.
      </h1>
      <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        The Founder&rsquo;s Override — two slots open, {AUDIT_PRICE} each, tax
        included. Book by Sunday night, November 8. We pick your most
        repetitive task, map it end to end, and you leave with the map plus
        the first automation — and a clear yes or no on whether a full build
        is worth it.
      </p>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        I spend two hours on your most repetitive task: I map how it runs
        today, and hand you the written map plus the first automation to
        build. You keep the decision; the machine does the repetition.
      </p>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        Pay by Sunday night to lock a slot, and we do the two hours next week
        at a time that works. First come, first served. If it&rsquo;s not a
        fit, I&rsquo;ll tell you that on a quick call — no charge, no pitch.
      </p>
      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-[1.7] text-ink-soft dark:text-cream-soft">
        The full version of this is the First Build: one week, one workflow,
        {FIRST_BUILD_PRICE} tax-inclusive at the founding rate. This is the
        two-hour door into it.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="audit-name" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
              Name
            </label>
            <input
              id="audit-name" type="text" required maxLength={100}
              value={form.name} onChange={set("name")} className={inputCls}
              placeholder="Your name" autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="audit-email" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
              Email
            </label>
            <input
              id="audit-email" type="email" required maxLength={254}
              value={form.email} onChange={set("email")} className={inputCls}
              placeholder="you@example.com" autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label htmlFor="audit-business" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
            Business <span className="font-normal text-ink-soft dark:text-cream-soft">(optional)</span>
          </label>
          <input
            id="audit-business" type="text" maxLength={150}
            value={form.business} onChange={set("business")} className={inputCls}
            placeholder="Your business name"
          />
        </div>
        <div>
          <label htmlFor="audit-task" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
            Your most repetitive task
          </label>
          <textarea
            id="audit-task" required maxLength={2000} rows={4}
            value={form.task} onChange={set("task")} className={inputCls}
            placeholder="The job your team does the same way every day or every week"
          />
        </div>
        <div>
          <label htmlFor="audit-day" className="mb-2 block text-sm font-medium text-ink dark:text-cream">
            Preferred day next week
          </label>
          <select id="audit-day" value={form.day} onChange={set("day")} className={inputCls}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        {/* Honeypot: invisible to humans, irresistible to bots */}
        <input
          type="text" name="company" value={form.company} onChange={set("company")}
          tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
        />
        <div>
          <button
            type="submit"
            disabled={status.state === "sending"}
            className="inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper disabled:opacity-60"
          >
            {status.state === "sending" ? "Sending…" : `Claim my slot — ${AUDIT_PRICE}`}
          </button>
        </div>
        {status.state === "success" && (
          <div>
            <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {status.message}
            </p>
            <a
              href={AUDIT_PAY_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center rounded-full bg-sienna px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sienna-deep hover:text-paper"
            >
              Pay {AUDIT_PRICE} to lock my slot →
            </a>
          </div>
        )}
        {status.state === "error" && (
          <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
            {status.message}
          </p>
        )}
      </form>
      <p className="mt-12 text-sm text-ink-soft dark:text-cream-soft">
        D&rsquo;Vaughn House — Independent AI Orchestrator, Cincinnati, Ohio
      </p>
    </div>
  );
}
