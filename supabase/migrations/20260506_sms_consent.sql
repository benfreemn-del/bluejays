-- 20260506_sms_consent.sql
-- Adds the SMS consent audit trail to prospects so the Rule 35
-- belt+suspenders gate (source==='inbound' AND sms_consent===true) can
-- function. Backfills existing inbound prospects to sms_consent=false
-- (Q6=B per the May 2026 TCR-rejection fix) — they consented under the
-- old required-checkbox flow which was a TCPA violation, so we re-ask
-- everyone via the post-submit /opt-in-sms/[id] page or a manual flip.
--
-- See CLAUDE.md "SMS A2P 10DLC Compliance Rules — Rule 35" for the full
-- contract.

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMPTZ;

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS sms_consent_source TEXT
    CHECK (sms_consent_source IN ('get_started_form', 'opt_in_page', 'manual'));

-- Index on sms_consent for the funnel-manager gate's hot path. The full
-- gate uses BOTH source AND sms_consent, but Postgres can use a partial
-- index on sms_consent=true to narrow the candidate set fast.
CREATE INDEX IF NOT EXISTS prospects_sms_consent_idx
  ON public.prospects (sms_consent)
  WHERE sms_consent = TRUE;

-- Conservative backfill: every existing prospect (including inbound ones
-- who ticked the OLD required checkbox) starts at sms_consent=false. The
-- old flow was a TCPA violation so the audit trail is poisoned — we
-- re-collect express consent via /opt-in-sms/[id] going forward.
-- (DEFAULT FALSE on the ALTER above already handles this for all rows;
-- this UPDATE is defensive in case the column existed before with a
-- different default.)
UPDATE public.prospects
SET sms_consent = FALSE
WHERE sms_consent IS NULL;
