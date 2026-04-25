-- Wave-5c: Win/loss feedback loop.
--
-- Captures the WHY behind every "not_interested" farewell. The AI appends
-- a soft probe sentence ("was it the price, the timing, or the design?")
-- to its goodbye and any reply that comes back is classified into one of
-- five categories and persisted here. Builds an objection database in 30
-- days that informs every future template/pitch change.
--
-- See:
--   • src/lib/ai-responder.ts  — getLossProbeSentence() + processIncomingMessage probe-response branch
--   • src/components/dashboard/LossReasonsPanel.tsx — operator-facing tile
--   • src/app/api/loss-reasons/stats/route.ts — dashboard stats GET
--   • CLAUDE.md Rule 45 — every "not_interested" farewell must include the probe
--
-- Safe to run repeatedly — uses IF NOT EXISTS guards everywhere.

CREATE TABLE IF NOT EXISTS loss_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'price' | 'timing' | 'design' | 'have_one' | 'no_response' | 'other'
  raw_response TEXT NOT NULL, -- their actual reply
  ai_classification TEXT, -- gpt-4.1-mini classification of the response
  confidence DECIMAL(3,2), -- 0.00-1.00
  surfaced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acted_on_at TIMESTAMPTZ, -- when Ben reviewed it
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_loss_reasons_prospect ON loss_reasons(prospect_id);
CREATE INDEX IF NOT EXISTS idx_loss_reasons_category ON loss_reasons(category);
CREATE INDEX IF NOT EXISTS idx_loss_reasons_surfaced ON loss_reasons(surfaced_at DESC);

-- Track when the loss-probe farewell was sent so the inbound classifier
-- can detect "this is a probe response" within the 30-day window.
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS loss_probe_sent_at TIMESTAMPTZ;
