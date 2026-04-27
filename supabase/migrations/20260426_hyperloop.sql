-- Hyperloop / auto-research loop tables (Karpathy pattern).
-- Skeleton-only — built dormant per Q10A. Wakes up at ≥100 audits +
-- ≥5 paid customers (gate enforced inside /api/hyperloop/run).
--
-- Two tables:
--
--   hyperloop_variants — every active variant we're testing across
--   any surface (ad copy, audit prompt, email subject, CTA text).
--   The cron pulls active variants, scores them on conversion + cost,
--   marks winners/losers, asks Claude for new candidates.
--
--   hyperloop_runs — one row per cron tick. Heartbeat / audit trail.
--   Includes whether the run was dormant (gate not met) so we have
--   continuous evidence the cron is firing on schedule.

CREATE TABLE IF NOT EXISTS hyperloop_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- What surface this variant lives on
  kind TEXT NOT NULL CHECK (kind IN (
    'ad_copy_meta',
    'ad_copy_google',
    'audit_prompt',
    'email_subject_pitch',
    'email_subject_followup',
    'cta_text_audit_buy',
    'cta_text_audit_preview',
    'sms_body_pitch'
  )),
  -- Human-friendly name (e.g. "v6_3rd_grade", "audit_pitch_april")
  variant_name TEXT NOT NULL,
  -- The actual content under test (text, prompt, JSON config — varies by kind)
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',     -- currently serving impressions
    'paused',     -- manually paused by Ben
    'winner',     -- promoted (significantly outperformed siblings)
    'loser',      -- retired (significantly underperformed)
    'archived'    -- old variant, kept for analytics
  )),
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Free-form metadata: parent_variant_id (for lineage), source,
  -- ai_model_used, etc.
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS hyperloop_variants_kind_status_idx
  ON hyperloop_variants (kind, status);
CREATE INDEX IF NOT EXISTS hyperloop_variants_status_idx
  ON hyperloop_variants (status) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS hyperloop_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Was the dormancy gate met? false = run skipped early with
  -- gate_reason filled in.
  active BOOLEAN NOT NULL DEFAULT FALSE,
  gate_reason TEXT,
  variants_analyzed INT NOT NULL DEFAULT 0,
  winners_found INT NOT NULL DEFAULT 0,
  losers_found INT NOT NULL DEFAULT 0,
  new_variants_created INT NOT NULL DEFAULT 0,
  ai_cost_usd NUMERIC(10,4) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
    'completed', 'failed', 'dormant'
  )),
  notes TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS hyperloop_runs_ran_at_idx
  ON hyperloop_runs (ran_at DESC);
