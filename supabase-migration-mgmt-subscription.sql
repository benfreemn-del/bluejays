-- Migration: Add mgmt_subscription_id column to prospects table
-- This stores the Stripe subscription ID for the deferred $100/year management fee.
-- Run this against your Supabase database before deploying the webhook update.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS mgmt_subscription_id TEXT DEFAULT NULL;

COMMENT ON COLUMN prospects.mgmt_subscription_id IS 'Stripe subscription ID for the $100/year management fee (created with 1-year trial at checkout)';
