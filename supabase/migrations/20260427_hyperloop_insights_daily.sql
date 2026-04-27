-- Hyperloop Stage 2 Commit B: per-day insights breakdown table.
--
-- Per Q8C ("both daily for charts + aggregate for analysis"), we keep
-- a separate table of daily rows so the dashboard can plot trend lines
-- per variant. The variant's aggregate counters in hyperloop_variants
-- get updated as a SUM over the last 7 daily rows on every sync —
-- rolling 7-day window keeps Bayesian signal fresh.
--
-- UNIQUE (variant_id, platform, date) lets the sync UPSERT cleanly so
-- re-syncing the same window just refreshes the rows in place.

CREATE TABLE IF NOT EXISTS hyperloop_insights_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES hyperloop_variants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  date DATE NOT NULL,
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  lead_conversions INT NOT NULL DEFAULT 0,
  preview_conversions INT NOT NULL DEFAULT 0,
  spend_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (variant_id, platform, date)
);

-- Hot-path index: dashboard pulls "last 7 days for variant X" per row
CREATE INDEX IF NOT EXISTS hyperloop_insights_daily_variant_date_idx
  ON hyperloop_insights_daily (variant_id, date DESC);

-- Sync timing: track per-variant + per-platform when we last pulled
-- (different from variant.last_metrics_synced_at which is the latest
-- across all platforms — useful for spotting variants whose Meta data
-- is fresh but Google data is stale).
CREATE INDEX IF NOT EXISTS hyperloop_insights_daily_synced_at_idx
  ON hyperloop_insights_daily (synced_at DESC);
