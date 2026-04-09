-- Migration: Add `pricing_tier` column to prospects table
-- Purpose: Support a "free" pricing tier for friends/family prospects alongside the standard $997 tier
-- Date: 2026-04-08
--
-- This column allows Ben to tag specific prospects as "free" tier,
-- which changes their checkout price from $997 to $30 (covers domain + server costs).
-- Both tiers still get the deferred $100/year management subscription after 1 year.
--
-- Values:
--   "standard"  — default, $997 one-time setup fee
--   "free"      — friends/family, $30 one-time setup fee (covers domain + server costs)

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS pricing_tier TEXT DEFAULT 'standard';

-- Optional: Add a comment for documentation
COMMENT ON COLUMN prospects.pricing_tier IS 'Pricing tier: "standard" for $997 setup, "free" for friends/family $30 setup. Default is always standard.';
