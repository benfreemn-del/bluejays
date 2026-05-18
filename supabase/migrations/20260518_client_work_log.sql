-- Client work-log — surface every action BlueJays takes on behalf of a
-- $10k AI System client so they can see what they're paying for.
--
-- Backs the Friday "what got built this week" digest email + the
-- "What we built" tab in /clients/[slug]/portal.
--
-- Why this exists: the #1 cause of agency-client churn at month 4 is
-- "we can't see what you're doing." Reports show stats; clients want
-- to see Ben's work. One row per discrete action.
--
-- Pattern: see CLAUDE.md "Weekly Work-Log Pattern".

CREATE TABLE IF NOT EXISTS client_work_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  -- One of: ad_launched, copy_revised, audience_added, integration_wired,
  -- funnel_step_updated, bug_fixed, feature_shipped, meeting, automation_built,
  -- content_published, report_delivered, other
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  -- Array of { label: string, url: string } — PR links, dashboard links,
  -- ad library URLs, etc. Surfaces in the email + portal view.
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Optional hours tracking (for Ben's internal capacity planning).
  hours_spent NUMERIC(5, 2),
  -- Who logged it: "ben" / "madie" / "ai-operator" / etc.
  created_by TEXT NOT NULL DEFAULT 'ben',
  -- Show in client-facing weekly digest? Set false for internal-only
  -- notes (e.g. "had to wait on Stripe support" — no client value).
  visible_to_client BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_work_log_slug_at_idx
  ON client_work_log (client_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS client_work_log_visible_idx
  ON client_work_log (client_slug, visible_to_client, created_at DESC);

-- Weekly digest delivery log — one row per (client, week-ending-date)
-- so the cron is idempotent. If the cron retries on Saturday after a
-- Friday failure, it skips clients who already received the email.
CREATE TABLE IF NOT EXISTS client_work_log_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  -- Friday of the week being digested (ISO date).
  week_ending DATE NOT NULL,
  entry_count INTEGER NOT NULL DEFAULT 0,
  recipient_email TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_slug, week_ending)
);

CREATE INDEX IF NOT EXISTS client_work_log_digests_slug_idx
  ON client_work_log_digests (client_slug, week_ending DESC);
