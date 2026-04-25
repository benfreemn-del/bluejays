-- Wave-5b — NPS Day-14 + auto-trigger referral on promoters.
--
-- Deep retention review #2 identified zero NPS gating as the highest-
-- leverage fix in the post-purchase funnel: every $997 customer was
-- getting the same generic Day-30 referral email regardless of whether
-- they were thrilled, neutral, or quietly fuming. Promoters got a
-- forgettable nudge; detractors got a tone-deaf ask that actively
-- hurt the relationship.
--
-- This migration adds the NPS response store + the `nps_sent_at` flag
-- on `prospects` so the new daily Day-14 cron can reliably dedupe.
--
-- The /r/[code]/[score] handler writes one row per click (so we capture
-- every score even if a customer somehow taps the email twice — the
-- first row is the canonical response, subsequent rows are kept for
-- audit). The `referral_email_sent` and `feedback_sent_to_ben` flags
-- are flipped only on the first row's downstream actions to keep
-- promoter referral asks and detractor SMS alerts idempotent.

CREATE TABLE IF NOT EXISTS nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 10),
  feedback TEXT,
  category TEXT NOT NULL, -- 'promoter' (9-10), 'passive' (7-8), 'detractor' (0-6)
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referral_email_sent BOOLEAN NOT NULL DEFAULT false,
  feedback_sent_to_ben BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_nps_prospect ON nps_responses(prospect_id);
CREATE INDEX IF NOT EXISTS idx_nps_category ON nps_responses(category);

-- Track when NPS was sent so we don't double-fire
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS nps_sent_at TIMESTAMPTZ;
