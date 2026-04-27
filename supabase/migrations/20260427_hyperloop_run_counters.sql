-- Hyperloop Stage 2 Commit E — first-class run counters for the
-- dashboard "Recent runs" panel. Currently rollout + pause stats live
-- only in metadata.rollouts / metadata.pauses jsonb arrays, which
-- means rendering the per-run summary requires parsing JSONB on every
-- page load. Promoting the counts to dedicated INT columns lets the
-- dashboard read them with a flat SELECT and keeps the metadata
-- arrays for full audit trail / debugging.

ALTER TABLE hyperloop_runs
  ADD COLUMN IF NOT EXISTS rolled_out_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rollout_failed_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paused_on_platform_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pause_failed_count INT NOT NULL DEFAULT 0;
