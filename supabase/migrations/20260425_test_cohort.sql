-- Wave 1 test-cohort tracking (added 2026-04-25).
--
-- Per CLAUDE.md "Test Group Wave 1" spec: a cohort of 50 prospects in
-- the Pacific NW across 6 categories (dental, electrician, salon,
-- landscaping, veterinary, roofing) gets the full-stack outreach
-- treatment (email + voicemail + Lob postcard + manual Loom for top 10).
--
-- The test_cohort_id column is a freeform TEXT slug (e.g.
-- 'wave1-2026-04-25') so we can have multiple cohorts simultaneously
-- and re-attribute results per cohort. Nullable + indexed-where-set so
-- the index stays small at 5K-prospect scale.
--
-- The cohort_postcard_sent_at column dedupes the Day-7 postcard cron
-- so a prospect never gets two cards. Set when sendPostcard returns a
-- non-skipped success.
--
-- The loom_video_url column holds a manually-recorded Loom URL Ben
-- captures for the top-10 prospects in each cohort. Email templates
-- inject this as a {loomUrl} token when present.

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS test_cohort_id TEXT,
  ADD COLUMN IF NOT EXISTS cohort_postcard_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS loom_video_url TEXT;

CREATE INDEX IF NOT EXISTS prospects_test_cohort_id_idx
  ON public.prospects (test_cohort_id)
  WHERE test_cohort_id IS NOT NULL;
