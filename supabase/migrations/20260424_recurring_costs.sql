-- Recurring infrastructure costs — fixed monthly subscriptions.
--
-- Complements the existing `system_costs` table (per-action variable
-- spend like Google Places lookups, SendGrid sends, Twilio SMS, etc.)
-- by tracking the FIXED monthly burn from infrastructure subscriptions:
-- Supabase Pro, Vercel Pro, SendGrid plans, etc.
--
-- This is the second leg of the cost-tracking system. Together with
-- system_costs, the spending dashboard can now compute:
--   Total monthly burn = recurring + variable
--   Per-site cost      = burn / paid customers
--   Margin             = ($100/yr renewal - per-site cost) on the deferred sub
--
-- Status semantics:
--   active=true            — currently being billed
--   active=false + ended_on — subscription cancelled / downgraded
--
-- Idempotent: ON CONFLICT DO NOTHING on the seed inserts so this
-- migration is safe to re-run.

CREATE TABLE IF NOT EXISTS recurring_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL UNIQUE, -- 'supabase' | 'vercel_pro' | 'sendgrid' | etc
  display_name TEXT NOT NULL,   -- 'Supabase Pro' | 'Vercel Pro' etc
  category TEXT NOT NULL,       -- 'database' | 'hosting' | 'email' | 'sms' | 'tools' | 'other'
  monthly_cost_usd DECIMAL(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  started_on DATE NOT NULL,     -- when the subscription began
  ended_on DATE,                -- null while active
  notes TEXT,
  metadata JSONB DEFAULT '{}',  -- e.g. { "plan": "Pro", "limit": "8GB DB", "next_tier": "Team @ $599" }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_costs_active ON recurring_costs(active) WHERE active = true;

CREATE OR REPLACE FUNCTION touch_recurring_costs_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_recurring_costs_updated_at ON recurring_costs;
CREATE TRIGGER trg_recurring_costs_updated_at BEFORE UPDATE ON recurring_costs
FOR EACH ROW EXECUTE FUNCTION touch_recurring_costs_updated_at();

-- Seed Ben's known recurring costs as of 2026-04-24
INSERT INTO recurring_costs (service, display_name, category, monthly_cost_usd, started_on, notes, metadata)
VALUES
  ('supabase', 'Supabase Pro', 'database', 25.00, '2026-04-24', 'Just upgraded from free tier', '{"plan": "Pro", "next_tier": "Team @ $599"}'),
  ('vercel_pro', 'Vercel Pro', 'hosting', 20.00, '2026-01-01', 'Hosts portfolio + all generated sites', '{"plan": "Pro", "domain_cap_per_project": 50, "next_tier": "Enterprise (custom)"}'),
  ('sendgrid', 'SendGrid Essentials 50K', 'email', 19.95, '2026-04-01', 'Email warming + outreach + transactional', '{"plan": "Essentials 50K", "monthly_email_cap": 50000}')
ON CONFLICT (service) DO NOTHING;

COMMENT ON TABLE recurring_costs IS
  'Fixed monthly infrastructure subscriptions (Supabase, Vercel, SendGrid, etc.). Complements per-action variable spend in system_costs. Source of truth for monthly burn projections at 100/500/1000/5000-site milestones.';
COMMENT ON COLUMN recurring_costs.service IS
  'Internal slug — unique key. Used as the patch/end target on the API. Keep lowercase, snake_case.';
COMMENT ON COLUMN recurring_costs.category IS
  'Buckets for the dashboard breakdown chart: database | hosting | email | sms | tools | other. Free-text, not constrained, but stick to that list for consistent visualization.';
COMMENT ON COLUMN recurring_costs.metadata IS
  'Plan tier, next-tier upgrade thresholds, current usage limits, etc. Keep this populated so the 5K-site projection calculator can warn when a tier upgrade is needed.';
