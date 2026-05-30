-- 2026-05-29 — prospects.saved_by_user_id
--
-- The 📍Save flag (added earlier today) shipped global per-prospect.
-- That was based on a stale memory note ("Madie is the only sales
-- rep"). Reality: there are 3 sales reps (Raidas + Tyler + Madie),
-- so global saves bleed across users — Madie's chip would show
-- Tyler's saved leads too. Add a per-user owner column so each rep's
-- saved set is their own.
--
-- saved_at stays as a timestamp (when saved). saved_by_user_id is who.
-- ON DELETE SET NULL so deleting a sales rep doesn't cascade-delete
-- their saves — the lead stays saved (visible to owner), just
-- detached from a specific operator.
--
-- Backfill: every existing saved_at row (test data from earlier today)
-- gets attributed to Ben's owner UUID. New saves populate from the
-- bj_user_id cookie via /api/prospects/[id]/save.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS saved_by_user_id UUID
  REFERENCES bluejays_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_prospects_saved_by_user_id
  ON prospects (saved_by_user_id)
  WHERE saved_by_user_id IS NOT NULL;

UPDATE prospects
SET saved_by_user_id = (SELECT id FROM bluejays_users WHERE role='owner' LIMIT 1)
WHERE saved_at IS NOT NULL AND saved_by_user_id IS NULL;
