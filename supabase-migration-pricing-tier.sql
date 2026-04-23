-- Migration: Add `pricing_tier` column to prospects table
-- Purpose: Support a "free" pricing tier for friends/family prospects alongside the standard $997 tier
-- Date: 2026-04-08
--
-- This column allows Ben to tag specific prospects as "free" tier,
-- which changes their checkout price from $997 to $30 (covers basic domain registration and hosting setup costs).
-- Both tiers still get the deferred $100/year maintenance subscription after 1 year,
-- covering domain renewal, hosting, ongoing maintenance, and support.
--
-- Values:
--   "standard"  — default, $997 one-time fee for custom website design, domain registration, and hosting setup
--   "free"      — friends/family, $30 one-time setup fee (covers basic domain registration and hosting setup costs)

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS pricing_tier TEXT DEFAULT 'standard';

-- Optional: Add a comment for documentation
COMMENT ON COLUMN prospects.pricing_tier IS 'Pricing tier: "standard" for the $997 one-time website package, "free" for friends/family $30 setup. Both tiers continue to the $100/year maintenance plan after year one.';
