/**
 * POST /api/testimonials — testimonial submission backend for dvaughnhouse.com/testimonials
 *
 * Stores submissions in the bound D1 database (binding name: DB), table `testimonials`.
 * If D1 isn't bound yet, responds 503 — the frontend shows a "not yet online"
 * state instead of silently dropping submissions.
 *
 * Nothing publishes automatically: every row is stored with status 'pending'
 * and is only shown anywhere after D'Vaughn reviews and approves it.
 * Every submission emails D'Vaughn so he can review it.
 *
 * Spam defenses: honeypot field, per-IP rate limiting, strict validation.
 * Mirrors functions/api/patron.js.
 */

const RATE_LIMIT_MAX = 5; // submissions per IP per hour
const NOTIFY_TO = "dvaughnhouse@gmail.com";
const NOTIFY_FROM = "contact@dvaughnhouse.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function onRequestPost({ request, env }) {
  // Storage not wired yet — fail loudly, never silently.
  if (!env.DB) {
    return json({ ok: false, error: "storage_not_configured" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot: bots fill it, humans don't. Pretend success either way.
  if (body.homepage && String(body.homepage).trim() !== "") {
    return json({ ok: true });
  }

  const name = String(body.name || "").trim();
  const companyRole = String(body.company_role || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const testimonial = String(body.testimonial || "").trim();
  const permWebsite = body.perm_website === true ? 1 : 0;
  const permClutch = body.perm_clutch === true ? 1 : 0;
  const permGoodfirms = body.perm_goodfirms === true ? 1 : 0;
  const permDesignrush = body.perm_designrush === true ? 1 : 0;

  if (name.length < 1 || name.length > 100) {
    return json({ ok: false, error: "invalid_name" }, 400);
  }
  if (companyRole.length > 150) {
    return json({ ok: false, error: "invalid_company_role" }, 400);
  }
  if (!isValidEmail(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }
  if (testimonial.length < 1 || testimonial.length > 2000) {
    return json({ ok: false, error: "invalid_testimonial" }, 400);
  }

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";

  // Rate limit: 5 submissions per IP per rolling hour.
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const rl = await env.DB.prepare(
    "SELECT count, window_start FROM rate_limits WHERE ip = ?"
  ).bind(ip).first();

  if (rl && rl.window_start > windowStart && rl.count >= RATE_LIMIT_MAX) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }
  if (rl && rl.window_start > windowStart) {
    await env.DB.prepare(
      "UPDATE rate_limits SET count = count + 1 WHERE ip = ?"
    ).bind(ip).run();
  } else {
    await env.DB.prepare(
      "INSERT OR REPLACE INTO rate_limits (ip, count, window_start) VALUES (?, 1, ?)"
    ).bind(ip, now.toISOString()).run();
  }

  const ua = (request.headers.get("User-Agent") || "").slice(0, 300);
  await env.DB.prepare(
    "INSERT INTO testimonials (name, company_role, email, testimonial, perm_website, perm_clutch, perm_goodfirms, perm_designrush, status, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)"
  ).bind(name, companyRole, email, testimonial, permWebsite, permClutch, permGoodfirms, permDesignrush, ip, ua).run();

  // Email ping: best-effort. The D1 record above is the source of truth;
  // a failed send never fails the submission.
  if (env.RESEND_API_KEY) {
    try {
      const perms = [
        permWebsite ? "Website" : null,
        permClutch ? "Clutch" : null,
        permGoodfirms ? "GoodFirms" : null,
        permDesignrush ? "DesignRush" : null,
      ].filter(Boolean);
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: NOTIFY_FROM,
          to: NOTIFY_TO,
          subject: `New testimonial — ${name}`,
          text:
            `Name: ${name}\n` +
            (companyRole ? `Company / role: ${companyRole}\n` : "") +
            `Email: ${email}\n` +
            `May appear on: ${perms.length ? perms.join(", ") : "nowhere yet — review only"}\n` +
            `IP: ${ip}\n\n` +
            `${testimonial}\n\n` +
            `Status: pending review — nothing publishes automatically.`,
        }),
      });
    } catch {
      // Swallowed on purpose — the submission is already stored.
    }
  }

  return json({ ok: true });
}

// Anything other than POST: method not allowed.
export async function onRequest({ request }) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
