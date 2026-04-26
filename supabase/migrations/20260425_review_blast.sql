-- Review Blast SKU fulfillment workflow (added 2026-04-25).
--
-- Per CLAUDE.md "Review Blast Wave 1" spec: paid customers who buy
-- the $99 Review Blast SKU get a magic link to /review-blast/[upsellId]
-- where they paste up to 50 of their past customers' phone numbers.
-- A cron then dispatches the SMS batch (gated on A2P 10DLC approval —
-- pre-A2P, submissions queue with status='pending_a2p' and dispatch
-- automatically the moment SMS_FUNNEL_DISABLED flips off).
--
-- Each SMS includes a link to /review/[prospectId] which is the
-- 5-star-filter funnel already built — 5★ → Google review CTA, <5★
-- → private feedback to the BUSINESS's owner email.
--
-- Replies route to the BUSINESS's contact email (NOT Ben's) so the
-- business handles their own customer relationship — Twilio inbound
-- webhook looks up the prospect's `email` field and forwards.

-- One row per submission. The customer can submit ONCE per Review
-- Blast purchase (status='pending_a2p' or 'pending_dispatch'); after
-- it dispatches the row stays for tracking but is not editable.
CREATE TABLE IF NOT EXISTS public.review_blast_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upsell_id UUID NOT NULL REFERENCES public.upsells(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  -- 'pending_a2p' (waiting on TCR carrier approval before dispatch)
  -- 'pending_dispatch' (A2P approved, queued for next cron tick)
  -- 'dispatching' (cron in progress)
  -- 'sent' (all SMS dispatched successfully)
  -- 'failed' (cron tried but errored — see error_message + retry)
  -- 'cancelled' (operator cancelled — refund path)
  status TEXT NOT NULL DEFAULT 'pending_a2p',
  phone_numbers JSONB NOT NULL DEFAULT '[]',
  template_key TEXT NOT NULL,
  sms_count_target INT NOT NULL DEFAULT 0,
  sms_count_sent INT NOT NULL DEFAULT 0,
  sms_count_failed INT NOT NULL DEFAULT 0,
  error_message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dispatched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS review_blast_submissions_upsell_id_idx
  ON public.review_blast_submissions (upsell_id);

CREATE INDEX IF NOT EXISTS review_blast_submissions_prospect_id_idx
  ON public.review_blast_submissions (prospect_id);

CREATE INDEX IF NOT EXISTS review_blast_submissions_status_idx
  ON public.review_blast_submissions (status)
  WHERE status IN ('pending_a2p', 'pending_dispatch');

-- Per-SMS log so we can debug delivery failures and track reply
-- routing. Insert one row per SMS at dispatch time. Even though the
-- operator dashboard surface is minimal (#10A — just an upsell row),
-- this table is the audit trail when a customer asks "did my 50 SMS
-- actually go out?".
CREATE TABLE IF NOT EXISTS public.review_blast_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.review_blast_submissions(id) ON DELETE CASCADE,
  to_phone TEXT NOT NULL,
  body TEXT NOT NULL,
  twilio_sid TEXT,
  delivery_status TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  reply_body TEXT,
  reply_received_at TIMESTAMPTZ,
  reply_forwarded_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS review_blast_messages_submission_id_idx
  ON public.review_blast_messages (submission_id);

CREATE INDEX IF NOT EXISTS review_blast_messages_twilio_sid_idx
  ON public.review_blast_messages (twilio_sid)
  WHERE twilio_sid IS NOT NULL;

-- Updated-at auto-trigger on submissions (mirror the pattern from
-- other tables in this schema).
CREATE OR REPLACE FUNCTION public.update_review_blast_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS review_blast_submissions_updated_at ON public.review_blast_submissions;
CREATE TRIGGER review_blast_submissions_updated_at
  BEFORE UPDATE ON public.review_blast_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_blast_submission_timestamp();
