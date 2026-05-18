-- Lead Interaction System — Phase 1 foundation
--
-- Two tables:
--   1. prospect_touches — every recorded interaction (call/text/email/etc.)
--   2. prospect_lead_score — Joel's lead-scoring at opt-in (composite fit
--      score + sub-scores + recommended tier + recommended owner)
--
-- See: bluejays/docs/playbooks/lead-interaction-system-master-plan.md
-- Pattern: Hormozi reception funnel + Annie 60-sec rule + Joel scoring.

-- ── 1. prospect_touches ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prospect_touches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,

  -- WHAT KIND of touch
  kind TEXT NOT NULL
    CHECK (kind IN ('call','voicemail','text','email','dm','in_person','note')),

  -- WHICH WAY: we reached out, or they reached us
  direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('outbound','inbound')),

  -- OUTCOME — structured for analytics. NULL = unspecified.
  outcome TEXT
    CHECK (outcome IN (
      'connected','no_answer','left_voicemail','declined',
      'replied','no_reply','sent','received',
      'meeting_booked','meeting_held','meeting_no_show'
    )),

  -- Hormozi CLOSER framework stage (C-L-O-S-E-R). NULL when not applicable
  -- (e.g. a 'note' or an auto-fired touch).
  closer_stage TEXT
    CHECK (closer_stage IN ('clarify','label','overview','sell','explain','reinforce','none')),

  -- Joel damaging-admission fired on this touch? (qualification technique)
  damaging_admission_fired BOOLEAN NOT NULL DEFAULT false,

  -- BAM-FAM — what's the next planned touch, when, and what to say?
  next_touch_kind TEXT
    CHECK (next_touch_kind IN ('call','text','email','meeting','followup_note')),
  next_touch_at TIMESTAMPTZ,
  next_touch_note TEXT,

  -- Free-form notes (max ~2KB enforced at API layer)
  notes TEXT,

  -- Who did it. 'ben' / 'madie' / 'auto-funnel' / 'auto-ai' / 'auto-import'
  by_user TEXT NOT NULL DEFAULT 'ben',

  -- For auto-logged touches: Twilio CallSid, SendGrid Message-ID,
  -- Vonage message-uuid, etc. NULL for manual.
  external_id TEXT,

  -- Duration in seconds (for calls / meetings). NULL for text/email/note.
  duration_seconds INTEGER,

  -- When the touch ACTUALLY happened (may differ from row creation for
  -- backfilled entries or after-the-fact logging).
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-prospect timeline lookups (most common query)
CREATE INDEX IF NOT EXISTS prospect_touches_prospect_idx
  ON prospect_touches (prospect_id, occurred_at DESC);

-- "What's overdue" — fast lookup of touches with a scheduled next_touch
-- that has passed
CREATE INDEX IF NOT EXISTS prospect_touches_next_touch_idx
  ON prospect_touches (next_touch_at)
  WHERE next_touch_at IS NOT NULL;

-- Per-operator "what I did today" lookup
CREATE INDEX IF NOT EXISTS prospect_touches_by_user_idx
  ON prospect_touches (by_user, occurred_at DESC);

-- Per-kind analytics — "how many calls this week"
CREATE INDEX IF NOT EXISTS prospect_touches_kind_idx
  ON prospect_touches (kind, occurred_at DESC);

-- ── 2. prospect_lead_score ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prospect_lead_score (
  prospect_id UUID PRIMARY KEY REFERENCES prospects(id) ON DELETE CASCADE,

  -- Composite 0-100 fit score, computed at intake + on status changes
  fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),

  -- Component sub-scores (so we can audit the composite)
  audit_score INTEGER CHECK (audit_score BETWEEN 0 AND 100),
  bant_score INTEGER CHECK (bant_score BETWEEN 0 AND 100),
  icp_score INTEGER CHECK (icp_score BETWEEN 0 AND 100),
  contact_certainty INTEGER CHECK (contact_certainty BETWEEN 0 AND 100),

  -- Tier recommendation
  recommended_tier TEXT
    CHECK (recommended_tier IN ('fullsystem','standard','custom','free','disqualify')),

  -- Workflow routing recommendation
  recommended_owner TEXT
    CHECK (recommended_owner IN ('madie','ben','ai-only','disqualify')),

  -- Cached AI rationale so operator sees "why is this rated 87"
  rationale TEXT,

  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sorted-by-score queue lookup
CREATE INDEX IF NOT EXISTS prospect_lead_score_score_idx
  ON prospect_lead_score (fit_score DESC, scored_at DESC);

CREATE INDEX IF NOT EXISTS prospect_lead_score_owner_idx
  ON prospect_lead_score (recommended_owner, fit_score DESC);

COMMENT ON TABLE prospect_touches IS
  'Every recorded lead interaction. Replaces prospects.admin_notes text-blob append. Per CLAUDE.md Lead Interaction System (Phase 1).';
COMMENT ON TABLE prospect_lead_score IS
  'Joel-framework lead scoring at opt-in. Powers /dashboard/queue priority ordering + workflow auto-routing in Phase 2.';
