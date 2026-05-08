-- HeyGen video columns on site_audits.
--
-- One per-prospect personalized video that plays at the top of the
-- audit-results page when ready. Generated async via HeyGen API
-- (see src/lib/heygen.ts) — writeback flow:
--
--   1. /api/audit/generate finishes synthesis → fires off
--      HeyGen generate → stamps heygen_video_id on the row
--   2. /api/cron/heygen-poll runs every 5 min, polls each
--      video_id where heygen_video_url IS NULL, stamps the URL
--      when status=completed
--   3. Audit page renders the video at top when video_url is set,
--      otherwise fall back to the existing AuditCTAHub layout
--
-- Idempotent. Safe to run multiple times.

alter table public.site_audits
  add column if not exists heygen_video_id text;
alter table public.site_audits
  add column if not exists heygen_video_url text;
alter table public.site_audits
  add column if not exists heygen_requested_at timestamptz;
alter table public.site_audits
  add column if not exists heygen_completed_at timestamptz;

-- Index supports the polling cron's "find all videos still rendering"
-- query path — partial index keeps it tiny since most audits won't
-- have a video request at all.
create index if not exists site_audits_heygen_pending_idx
  on public.site_audits (heygen_video_id)
  where heygen_video_id is not null and heygen_video_url is null;
