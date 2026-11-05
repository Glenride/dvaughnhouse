/**
 * POST /api/contact — contact form backend for dvaughnhouse.com
 *
 * Stores submissions in the bound D1 database (binding name: DB).
 * If the D1 database isn't bound yet, responds 503 — the frontend
 * shows a "not yet online" state instead of silently dropping messages.
 *
 * Spam defenses: honeypot field, per-IP rate limiting, strict validation.
 *
 * CORS: the Links site (links.dvaughnhouse.com + its Pages preview) and the
 * Links artifact share URL post here from the browser. Only those origins
 * are allowlisted; anything else can still POST (e.g. curl) but a browser
 * from another origin cannot read the response. The endpoint itself stays
 * public, rate-limited, and honeypot-protected.
 */

const TOPICS = ["partnership", "research", "press", "speaking", "audit", "other"];
const RATE_LIMIT_MAX = 5; // submissions per IP per hour
const NOTIFY_TO = "dvaughnhouse@gmail.com";
const NOTIFY_FROM = "contact@dvaughnhouse.com";

const ALLOWED_ORIGINS = new Set([
  "https://links-d-vaughn-house.pages.dev",
  "https://links.dvaughnhouse.com",
  "https://muse.ai",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      Vary: "Origin",
    };
  }
  return {};
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function onRequestPost({ request, env }) {
  const cors = corsHeaders(request);

  // Storage not wired yet — fail loudly, never silently.
  if (!env.DB) {
    return json({ ok: false, error: "storage_not_configured" }, 503, cors);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, cors);
  }

  // Honeypot: bots fill it, humans don't. Pretend success either way.
  if (body.company && String(body.company).trim() !== "") {
    return json({ ok: true }, 200, cors);
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const topic = String(body.topic || "").trim();
  const message = String(body.message || "").trim();

  if (name.length < 1 || name.length > 100) {
    return json({ ok: false, error: "invalid_name" }, 400, cors);
  }
  if (!isValidEmail(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400, cors);
  }
  if (!TOPICS.includes(topic)) {
    return json({ ok: false, error: "invalid_topic" }, 400, cors);
  }
  if (message.length < 1 || message.length > 2000) {
    return json({ ok: false, error: "invalid_message" }, 400, cors);
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
    return json({ ok: false, error: "rate_limited" }, 429, cors);
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
    "INSERT INTO contacts (name, email, topic, message, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(name, email, topic, message, ip, ua).run();

  // Email ping: best-effort. The D1 record above is the source of truth;
  // a failed send never fails the submission.
  if (env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: NOTIFY_FROM,
          to: NOTIFY_TO,
          subject: `New contact: ${topic} — ${name}`,
          text:
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Topic: ${topic}\n` +
            `IP: ${ip}\n\n` +
            `${message}`,
        }),
      });
    } catch {
      // Swallowed on purpose — the submission is already stored.
    }
  }

  return json({ ok: true }, 200, cors);
}

// Anything other than POST: method not allowed.
// OPTIONS is the CORS preflight: answer it so allowed origins can POST.
export async function onRequest({ request }) {
  const cors = corsHeaders(request);
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...cors,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return json({ ok: false, error: "method_not_allowed" }, 405, cors);
}
