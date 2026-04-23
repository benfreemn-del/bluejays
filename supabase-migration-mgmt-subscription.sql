-- Migration: Add mgmt_subscription_id column to prospects table
-- This stores the Stripe subscription ID for the deferred $100/year maintenance fee.
-- The annual plan covers domain renewal, hosting, ongoing maintenance, and support.
-- Run this against your Supabase database before deploying the webhook update.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS mgmt_subscription_id TEXT DEFAULT NULL;

COMMENT ON COLUMN prospects.mgmt_subscription_id IS 'Stripe subscription ID for the $100/year maintenance fee (created with a 1-year trial at checkout and covering domain renewal, hosting, ongoing maintenance, and support)';
