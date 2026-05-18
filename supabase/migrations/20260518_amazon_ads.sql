-- Amazon Ads (AMS) integration tables for indie author clients.
--
-- Sized to match the Tekky/ITC self-learning ad pattern but applied to
-- Sponsored Products + Sponsored Brands on Amazon. The audit estimates
-- 1 month total to ship: 2 weeks of Amazon Ads API onboarding (LWA +
-- sandbox + advertising-API access), then 1 week of optimizer logic.
--
-- This migration ships the storage + the optimizer can be incrementally
-- wired against it as the API access lands. Until then, the connection
-- row stays empty and the dashboard tile renders "pending API access".
--
-- Pattern: see CLAUDE.md "Amazon Ads Optimizer".

-- Per-client Amazon Ads API credentials. ONE row per slug.
CREATE TABLE IF NOT EXISTS client_amazon_ads_connections (
  client_slug TEXT PRIMARY KEY,
  -- The Amazon Advertising profile ID once OAuth completes.
  profile_id TEXT,
  marketplace TEXT NOT NULL DEFAULT 'ATVPDKIKX0DER', -- US default
  -- Stored encrypted via crypto-creds.ts.
  access_token_enc TEXT,
  refresh_token_enc TEXT,
  scope TEXT,
  -- Track when the connection was last refreshed.
  last_refresh_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_sync_error TEXT,
  -- Per-client target ACoS (advertising cost of sale). Used by the
  -- optimizer to decide pause/bid-up thresholds.
  target_acos_pct NUMERIC(5, 2) DEFAULT 30.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per Amazon Ads campaign we're tracking for a client. The
-- optimizer reads + writes here daily. Includes both Sponsored Products
-- and Sponsored Brands.
CREATE TABLE IF NOT EXISTS amazon_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,             -- 'sponsored_products' | 'sponsored_brands'
  state TEXT NOT NULL DEFAULT 'enabled',   -- 'enabled' | 'paused' | 'archived'
  daily_budget_cents INTEGER,
  total_spend_cents INTEGER NOT NULL DEFAULT 0,
  total_sales_cents INTEGER NOT NULL DEFAULT 0,
  -- Last 7 days rolling.
  spend_7d_cents INTEGER NOT NULL DEFAULT 0,
  sales_7d_cents INTEGER NOT NULL DEFAULT 0,
  orders_7d INTEGER NOT NULL DEFAULT 0,
  acos_7d_pct NUMERIC(6, 2),
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_slug, campaign_id)
);

CREATE INDEX IF NOT EXISTS amazon_ads_campaigns_slug_idx
  ON amazon_ads_campaigns (client_slug, last_synced_at DESC);

-- Per-keyword performance — the heart of the optimizer. The optimizer
-- pauses keywords with ACoS > 2× target after sufficient clicks, and
-- bids up keywords with ACoS < 0.5× target with consistent orders.
CREATE TABLE IF NOT EXISTS amazon_ads_keyword_perf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  ad_group_id TEXT NOT NULL,
  keyword_id TEXT NOT NULL,
  keyword_text TEXT NOT NULL,
  match_type TEXT NOT NULL,                -- 'exact' | 'phrase' | 'broad' | 'auto'
  state TEXT NOT NULL DEFAULT 'enabled',
  current_bid_cents INTEGER,
  -- Last 30 days rolling.
  clicks_30d INTEGER NOT NULL DEFAULT 0,
  impressions_30d INTEGER NOT NULL DEFAULT 0,
  spend_30d_cents INTEGER NOT NULL DEFAULT 0,
  sales_30d_cents INTEGER NOT NULL DEFAULT 0,
  orders_30d INTEGER NOT NULL DEFAULT 0,
  acos_30d_pct NUMERIC(6, 2),
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_slug, keyword_id)
);

CREATE INDEX IF NOT EXISTS amazon_ads_keyword_perf_slug_acos_idx
  ON amazon_ads_keyword_perf (client_slug, acos_30d_pct);

-- Optimizer decision log. Every time the cron pauses/bids/expands, it
-- writes one row here. Surfaces in the weekly work-log digest under
-- the "automation_built" category.
CREATE TABLE IF NOT EXISTS amazon_ads_optimizer_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  -- 'paused_keyword' | 'bid_up_keyword' | 'bid_down_keyword' |
  -- 'added_negative' | 'expanded_match' | 'budget_adjusted'
  action TEXT NOT NULL,
  keyword_id TEXT,
  campaign_id TEXT,
  before_value NUMERIC,
  after_value NUMERIC,
  rationale TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS amazon_ads_optimizer_log_slug_idx
  ON amazon_ads_optimizer_log (client_slug, decided_at DESC);
