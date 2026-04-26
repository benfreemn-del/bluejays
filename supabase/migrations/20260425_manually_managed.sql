-- Rule 49 (added 2026-04-25): manually-added prospects (gifted sites,
-- custom builds, friends/family, hand-picked closes) MUST be tagged
-- so the daily auto-enroll cron NEVER pulls them into the cold-outreach
-- funnel.
--
-- Caught 2026-04-25: Lewis County Autism Coalition, Meyer Electric,
-- Hector Landscaping, OPS Security all sat in `status='approved'` —
-- which means the freshly-shipped Rule 47 auto-enroll would have swept
-- them into the warming pool on the next 16:00 UTC cron. Manual
-- prospects need a different relationship than cold-outreach prospects;
-- auto-enrolling them would have spammed warm relationships with the
-- generic pitch template. The fix: a per-prospect boolean that the
-- auto-enroll filter respects.
--
-- Default false so every existing scouted prospect retains current
-- behavior. Only the manual ones get flipped to true.

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS manually_managed BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS prospects_manually_managed_idx
  ON public.prospects (manually_managed)
  WHERE manually_managed = true;

-- One-shot tag for the 4 manual prospects identified 2026-04-25.
-- Safe to re-run — UPDATE is idempotent and matches by ILIKE.
UPDATE public.prospects
SET manually_managed = true
WHERE business_name ILIKE '%lewis county autism%'
   OR business_name ILIKE '%meyer electric%'
   OR business_name ILIKE '%hector%landscap%'
   OR business_name ILIKE '%ops%security%'
   OR business_name ILIKE '%olympic protective%';
