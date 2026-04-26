-- Audit follow-up email tracking columns (added 2026-04-26).
--
-- Required for /api/audit/followup-cron to advance prospects through
-- the 5-email Hormozi sequence (Day 0/1/3/7/14). Without these
-- columns the cron is a silent no-op (which is the intentional safe
-- default — not breaking the deploy).

ALTER TABLE public.site_audits
  ADD COLUMN IF NOT EXISTS audit_email_step INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_audit_email_at TIMESTAMPTZ;

-- Once the Day-0 email fires (in /api/audit/generate after status flips
-- to 'ready'), set audit_email_step=1 too. Any prior audits where we
-- already sent the welcome email get backfilled here so the cron
-- doesn't try to re-send Email 1.
UPDATE public.site_audits
SET audit_email_step = 1
WHERE email_sent_at IS NOT NULL AND audit_email_step = 0;

-- Index to keep the cron's filter fast at scale
CREATE INDEX IF NOT EXISTS site_audits_email_step_idx
  ON public.site_audits (audit_email_step, last_audit_email_at)
  WHERE status = 'ready' AND audit_email_step < 5;
