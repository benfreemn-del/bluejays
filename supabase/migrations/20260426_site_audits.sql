-- Site Audit lead-magnet system (added 2026-04-26).
--
-- Per Ben's spec 2026-04-26 (Hormozi salty-pretzel funnel):
--  - Public form at /audit collects URL + business category + email
--  - System creates a `prospects` row (or matches existing one) AND
--    a `site_audits` row in 'pending' status
--  - /api/audit/generate kicks off the AI audit in the background
--    (Claude for hero/positioning + GPT-mini for SEO/technical), takes
--    ~3-5 min, stores audit_content JSONB + rendered audit_html
--  - When ready, status flips to 'ready', email triggers via the funnel
--    pipeline (5-email Hormozi-style sequence under sequence range
--    400-405)
--  - Audit displays at /audit/[id] (public, URL-as-secret pattern)
--  - Self-improving loop: track converted (audit → call → paid) so
--    the prompt can be tuned weekly per Karpathy's auto-research
--    concept

CREATE TABLE IF NOT EXISTS public.site_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  -- The URL the prospect submitted for audit
  target_url TEXT NOT NULL,
  -- Business category — drives which BlueJays V2 template we benchmark against
  business_category TEXT NOT NULL,
  -- 'pending' = freshly submitted, audit not yet kicked off
  -- 'generating' = AI audit in progress (Claude + GPT calls running)
  -- 'ready' = audit generated and stored, email sent
  -- 'failed' = something errored — see failed_reason
  -- 'cancelled' = manual operator cancellation
  status TEXT NOT NULL DEFAULT 'pending',
  -- Structured audit content (sections, findings, scores). Renderable
  -- by the /audit/[id] page server component.
  audit_content JSONB,
  -- Pre-rendered HTML for legacy support / PDF export later. Optional.
  audit_html TEXT,
  -- Models actually used + cost for cost-tracking + the auto-improvement
  -- loop's per-audit cost optimization.
  models_used TEXT[],
  cost_usd DECIMAL(10, 4) DEFAULT 0,
  -- Tracking for the self-improvement loop
  generated_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  first_viewed_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  -- Conversion outcomes — populated by the email-tracking + Stripe webhook
  -- handlers when the prospect takes action
  call_booked_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  -- Failure context if anything goes wrong
  failed_reason TEXT,
  -- Free-form metadata (UTM tags, A/B test variant, prompt version, etc.)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One audit per prospect URL. If they submit the same URL twice, we
-- update the existing row rather than create a duplicate (keeps the
-- conversion tracking + email sequence sane).
CREATE UNIQUE INDEX IF NOT EXISTS site_audits_prospect_url_uniq
  ON public.site_audits (prospect_id, target_url);

CREATE INDEX IF NOT EXISTS site_audits_status_idx
  ON public.site_audits (status)
  WHERE status IN ('pending', 'generating');

CREATE INDEX IF NOT EXISTS site_audits_prospect_idx
  ON public.site_audits (prospect_id);

CREATE INDEX IF NOT EXISTS site_audits_created_at_idx
  ON public.site_audits (created_at DESC);

-- Updated-at trigger (mirror existing pattern)
CREATE OR REPLACE FUNCTION public.update_site_audit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_audits_updated_at ON public.site_audits;
CREATE TRIGGER site_audits_updated_at
  BEFORE UPDATE ON public.site_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_site_audit_timestamp();

-- Audit prompt versioning — for the self-improving loop. Each time we
-- tune the prompt, we increment the version and store the prompt text.
-- Lets us measure conversion lift per prompt version.
CREATE TABLE IF NOT EXISTS public.audit_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INT NOT NULL UNIQUE,
  prompt_name TEXT NOT NULL, -- 'claude_hero', 'gpt_seo', 'claude_synthesis'
  prompt_text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT, -- why we changed it
  audit_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_prompt_versions_active_idx
  ON public.audit_prompt_versions (prompt_name, active)
  WHERE active = true;
