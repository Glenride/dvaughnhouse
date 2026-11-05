-- D1 migration: testimonial submission storage for dvaughnhouse.com/testimonials
-- Apply once: wrangler d1 execute dvaughnhouse-contacts --file migrations/0003_testimonials.sql
-- (or paste into the D1 console in the Cloudflare dashboard)
-- Note: reuses the rate_limits table from 0001_contacts.sql.
-- Nothing publishes automatically: every row starts as status 'pending'
-- and is only shown anywhere after D'Vaughn reviews and approves it.

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  company_role TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  perm_website INTEGER NOT NULL DEFAULT 0,
  perm_clutch INTEGER NOT NULL DEFAULT 0,
  perm_goodfirms INTEGER NOT NULL DEFAULT 0,
  perm_designrush INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected')),
  ip TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
