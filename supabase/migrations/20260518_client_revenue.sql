-- Client revenue attribution — closes the loop on "leads" → "$ closed".
--
-- Portal shows leads, ad spend, funnel reach. Until this table existed,
-- there was no way to surface "of the 47 leads we sent you, X became
-- customers at $Y average." Without that, the ROI pitch is hand-wavy.
--
-- One row per closed deal tied to a lead. Two sources:
--   1. Manual — Ben (or the client) marks a lead won at $X via the
--      admin dashboard or owner portal.
--   2. Automatic — future: a cron pulls Stripe payment_intents from a
--      Connect-linked client account, matches customer.email to
--      client_leads.email, inserts a row.
--
-- Pattern: see CLAUDE.md "Client Revenue Attribution".

CREATE TABLE IF NOT EXISTS client_revenue_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  -- Optional link to the originating lead. NULL when revenue is recorded
  -- without a matching lead (walk-in, referral, external channel).
  lead_id UUID REFERENCES client_leads(id) ON DELETE SET NULL,
  customer_email TEXT,
  customer_name TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  -- 'manual' | 'stripe' | 'square' | 'quickbooks' | 'shopify' | 'other'
  source TEXT NOT NULL DEFAULT 'manual',
  -- Source-specific reference (Stripe payment_intent id, Square txn id, etc.)
  external_id TEXT,
  product_name TEXT,
  notes TEXT,
  -- When the revenue actually happened (NOT when it was logged).
  closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Idempotency: same external_id from the same source can't double-insert.
  UNIQUE (source, external_id) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS client_revenue_slug_closed_idx
  ON client_revenue_attributions (client_slug, closed_at DESC);

CREATE INDEX IF NOT EXISTS client_revenue_lead_idx
  ON client_revenue_attributions (lead_id);

-- Stripe Connect tokens — populated when a client OAuth-connects their
-- Stripe account. NULL/empty rows are fine; the table just exists so
-- the cron-side automation has somewhere to look. Manual revenue
-- attribution doesn't need this table populated.
CREATE TABLE IF NOT EXISTS client_stripe_connections (
  client_slug TEXT PRIMARY KEY,
  stripe_account_id TEXT NOT NULL,
  -- Stored encrypted via crypto-creds.ts when populated.
  access_token_enc TEXT,
  refresh_token_enc TEXT,
  scope TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  last_sync_error TEXT
);
