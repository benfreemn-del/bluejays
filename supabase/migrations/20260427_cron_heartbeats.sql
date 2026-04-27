-- Cron heartbeats — Rule 66 systemic gap fix (Adversarial Review A — Critical #1).
--
-- Before this migration, only 3 of 17 crons in vercel.json had heartbeat
-- monitoring (hyperloop, audit_submissions, email_retry_queue). The other 14
-- could silently fail for weeks without alert. This is a Rule 66 violation
-- across most of the production cron surface.
--
-- The fix: generic heartbeat table that every cron inserts a row into
-- AFTER its work completes successfully. The watchdog cron then scans
-- this table by `cron_name` to detect silence past each cron's threshold.
--
-- Why a generic table vs. per-cron tables: 14 separate tables = 14
-- migrations + 14 schemas to maintain. One table with a name column scales
-- to N crons with zero per-cron schema work. Indexed on (cron_name, ran_at)
-- so the watchdog's "newest row per cron" query is cheap.
--
-- Mock-mode safe: the logHeartbeat() helper in src/lib/cron-heartbeat.ts
-- is no-op when Supabase isn't configured, so dev/CI paths keep working.

CREATE TABLE IF NOT EXISTS cron_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_name TEXT NOT NULL,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'skipped')),
  duration_ms INT,
  metadata JSONB DEFAULT '{}',
  notes TEXT
);

-- Hot path: watchdog scans newest row per cron_name. Composite index
-- means "WHERE cron_name = X ORDER BY ran_at DESC LIMIT 1" is O(log n).
CREATE INDEX IF NOT EXISTS cron_heartbeats_name_ran_idx
  ON cron_heartbeats (cron_name, ran_at DESC);

-- Useful for "all crons in last X hours" dashboard queries.
CREATE INDEX IF NOT EXISTS cron_heartbeats_ran_at_idx
  ON cron_heartbeats (ran_at DESC);
