-- 2026-05-29 — prospects.saved_at
--
-- Madie can mark a lead as "saved" so the 14-day auto-sweep
-- (/api/leads/sweep-following-up) leaves it alone. Saved is a
-- per-prospect flag, set by clicking the 📍Save row pill or drawer
-- toggle. Saved leads surface under the 📍 Saved chip in her Sales
-- Portal regardless of status.
--
-- Nullable TIMESTAMPTZ — NULL = not saved, non-NULL = saved at that
-- moment. We store the timestamp (vs a boolean) so we can show "saved
-- 3d ago" in the UI and reason about cohorts later.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS saved_at TIMESTAMPTZ;

-- Partial index for cheap "show saved leads" + "count saved" queries.
CREATE INDEX IF NOT EXISTS idx_prospects_saved_at
  ON prospects (saved_at)
  WHERE saved_at IS NOT NULL;
