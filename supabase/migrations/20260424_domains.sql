-- Domain registration system — backend foundation.
--
-- Tracks every customer-facing domain BlueJays registers on behalf of a
-- paying prospect. One row per domain. The system is designed to scale
-- to ~5,000 sites and feeds the existing $100/yr deferred Stripe sub
-- (see CLAUDE.md "Stripe Payment Rules") without modifying the
-- billing pipeline.
--
-- Status lifecycle:
--   pending     — row inserted, registrar API call not yet made / in-flight
--   registered  — registrar confirmed the domain is owned + expires_at known
--   failed      — registrar call returned an error; see last_error column
--   expired     — domain past expires_at and we did not renew (rare)
--   cancelled   — Ben manually released the domain
--
-- The `prospects.assigned_domain` column (added in 20260423_domain_hosting.sql)
-- still holds the customer-facing domain string for fast dashboard reads.
-- This `domains` table is the registrar-of-record source of truth: the
-- order id, expiry, cost, renewal date, and Vercel hosting linkage.
--
-- NOTE on prospect_id type: prospects.id is UUID (see supabase-schema.sql),
-- so this column matches that type to make the FK valid. The task spec
-- said TEXT but the FK requires matching types — UUID is the working form.

CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | registered | failed | expired | cancelled
  registrar TEXT NOT NULL DEFAULT 'namecheap',
  registrar_order_id TEXT, -- the registrar's internal order/domain ID for renewal calls
  registered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  next_renewal_at TIMESTAMPTZ, -- usually = expires_at - 30 days
  cost_initial_usd DECIMAL(10, 2),
  cost_per_year_usd DECIMAL(10, 2) DEFAULT 11.00,
  vercel_project_id TEXT, -- for hosting linkage (set later by separate Vercel task)
  vercel_domain_added_at TIMESTAMPTZ,
  dns_configured_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB DEFAULT '{}', -- registrar response, dns records, etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domains_prospect ON domains(prospect_id);
CREATE INDEX IF NOT EXISTS idx_domains_expires ON domains(expires_at);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_renewal ON domains(next_renewal_at) WHERE status = 'registered';

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION touch_domain_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_domains_updated_at ON domains;
CREATE TRIGGER trg_domains_updated_at BEFORE UPDATE ON domains
FOR EACH ROW EXECUTE FUNCTION touch_domain_updated_at();

COMMENT ON TABLE domains IS
  'Domain registrations purchased on behalf of paying prospects. One row per domain. Source of truth for registrar order id, expiry, renewal date, hosting linkage, and per-domain cost. Feeds the renewal cron (separate task) and the dashboard domain card (separate task).';
COMMENT ON COLUMN domains.prospect_id IS
  'FK to prospects.id. Cascade-deletes if a prospect is deleted (rare — usually we mark dismissed instead).';
COMMENT ON COLUMN domains.registrar_order_id IS
  'Whatever opaque ID the registrar uses to identify this domain on their side. For Namecheap this is the DomainID returned by domains.create or domains.getInfo. Required for renewal API calls.';
COMMENT ON COLUMN domains.next_renewal_at IS
  'Internal target date for the renewal cron — typically expires_at minus 30 days. NOT the actual Stripe billing date; that is on the management subscription.';
COMMENT ON COLUMN domains.cost_per_year_usd IS
  'Per-year cost we pay the registrar. Subtracted from the $100/yr management sub for net-profit reporting.';
