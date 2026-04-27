-- Hyperloop Stage 1 — extend the skeleton tables for the AI brain.
-- Per Ben's 10 answers (2026-04-26): full self-looping with
-- kill-switch (10B), $50/wk cost cap (6B), auto-rollout (3A),
-- auto-pause losers (4A), Bayesian-graded winners.
--
-- Stage 1 ships everything that doesn't need Meta/Google API
-- credentials. Stage 2 layers the platform integration on top.

-- ─────────────────────────────────────────────────────────────────
-- Variant lineage + platform tracking columns
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE hyperloop_variants
  ADD COLUMN IF NOT EXISTS parent_variant_id UUID REFERENCES hyperloop_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS platform_ad_id TEXT,                   -- Stage 2: Meta Ad ID or Google Ad ID
  ADD COLUMN IF NOT EXISTS last_metrics_synced_at TIMESTAMPTZ,    -- when impressions/conversions last refreshed
  ADD COLUMN IF NOT EXISTS bayesian_p_better NUMERIC(4,3),        -- 0.000-1.000 — prob this beats cohort baseline
  ADD COLUMN IF NOT EXISTS retired_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retired_reason TEXT;

CREATE INDEX IF NOT EXISTS hyperloop_variants_parent_idx
  ON hyperloop_variants (parent_variant_id) WHERE parent_variant_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────
-- Run-level cost tracking + telemetry
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE hyperloop_runs
  ADD COLUMN IF NOT EXISTS week_to_date_cost_usd NUMERIC(10,4),  -- sum of AI cost for past 7 days at run time
  ADD COLUMN IF NOT EXISTS cost_cap_hit BOOLEAN NOT NULL DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────────
-- Hyperloop config — single-row table the dashboard can flip without
-- a redeploy. Backed by a CHECK on id=1 so we never accidentally
-- get multiple rows.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hyperloop_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  paused BOOLEAN NOT NULL DEFAULT FALSE,           -- 10B kill-switch
  weekly_cost_cap_usd NUMERIC(10,2) NOT NULL DEFAULT 50,  -- 6B
  min_audits_to_wake INT NOT NULL DEFAULT 100,     -- dormancy gate
  min_paid_to_wake INT NOT NULL DEFAULT 5,         -- dormancy gate
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT                                  -- 'ben' / 'cron' / etc
);

-- Seed the single row idempotently
INSERT INTO hyperloop_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
