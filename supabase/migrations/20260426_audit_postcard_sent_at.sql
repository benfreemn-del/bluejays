-- Track Lob-postcard sends to high-intent audit-no-action prospects
-- (Tier-2 build #2, Q8C). The cron at /api/audit/postcard-cron stamps
-- this column after a successful postcard ship so each prospect gets
-- AT MOST one audit-followup postcard regardless of how often the cron
-- runs.
--
-- Distinct from the existing `cohort_postcard_sent_at` column which
-- gates the Wave-1 test-cohort cron — different audience, different
-- trigger, different cap, so they're separate columns.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS audit_postcard_sent_at TIMESTAMPTZ;

-- Partial index: most rows will have this NULL forever (we only stamp
-- it for prospects who passed the audit-no-action gate). Indexing only
-- the NULL rows keeps the cron's "not yet sent" lookup cheap.
CREATE INDEX IF NOT EXISTS prospects_audit_postcard_pending_idx
  ON prospects (id)
  WHERE audit_postcard_sent_at IS NULL;
