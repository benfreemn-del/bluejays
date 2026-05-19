-- 20260519_client_leads_sms_consent.sql
--
-- TCPA gate for client_leads (Zenith + future AI System clients).
--
-- Mirrors the prospects.sms_consent column added in 20260506 but for
-- per-client lead capture (not BlueJays' own cold-outreach scouts).
--
-- The Zenith SMS funnel in src/lib/client-funnels/zenith-sports.ts
-- sends touches via the client-funnels/runner.ts. Before this column,
-- the runner gated SMS sends only on (a) phone present and (b) Twilio
-- number provisioned — NOT on whether the lead actually consented
-- to SMS. That's a TCPA gap.
--
-- After this migration:
--   1. Every new client_leads row defaults to sms_consent=false. SMS
--      sends from the funnel runner are skipped (markSkipped reason:
--      "no SMS consent").
--   2. When a form captures consent via an explicit checkbox, the API
--      route sets sms_consent=true + sms_consent_at=now() +
--      sms_consent_source='form_checkbox'.
--   3. The runner's SMS branch in src/lib/client-funnels/runner.ts
--      adds: if (!lead.sms_consent) skip with reason "no SMS consent".
--
-- Backfill policy: every existing row stays sms_consent=false. Safe
-- default — no surprise SMS to old leads who didn't tick a box.

ALTER TABLE public.client_leads
  ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.client_leads
  ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMPTZ;

ALTER TABLE public.client_leads
  ADD COLUMN IF NOT EXISTS sms_consent_source TEXT
    CHECK (sms_consent_source IN ('form_checkbox', 'opt_in_page', 'manual', 'inferred'));

-- Partial index — funnel-runner queries WHERE sms_consent = true filter
-- to skip SMS-blocked rows fast. Same pattern as the prospects index.
CREATE INDEX IF NOT EXISTS idx_client_leads_sms_consent_true
  ON public.client_leads (client_slug, audience_segment)
  WHERE sms_consent = true;

COMMENT ON COLUMN public.client_leads.sms_consent IS
  'TCPA gate: only true when the lead explicitly ticked an OPTIONAL SMS-consent checkbox at form submit. Funnel runner skips SMS touches when false.';
COMMENT ON COLUMN public.client_leads.sms_consent_at IS
  'Timestamp the lead ticked the consent box. Used for audit trail per TCPA 47 CFR 64.1200(a)(7)(i).';
COMMENT ON COLUMN public.client_leads.sms_consent_source IS
  'Where consent was captured: form_checkbox | opt_in_page | manual | inferred.';
