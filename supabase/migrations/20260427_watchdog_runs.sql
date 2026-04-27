-- Watchdog cron self-canary table (Rule 66).
-- One row per watchdog tick. Lets us monitor the watchdog itself
-- (canary problem) and gives a debug history of which alerts fired
-- when, in case Ben's SMS gets lost.

CREATE TABLE IF NOT EXISTS watchdog_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  watched_count INT NOT NULL DEFAULT 0,
  alerts_fired INT NOT NULL DEFAULT 0,
  stuck_audits_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  notes TEXT
);

CREATE INDEX IF NOT EXISTS watchdog_runs_ran_at_idx ON watchdog_runs (ran_at DESC);
