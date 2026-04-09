-- Migration: Add `source` column to prospects table
-- Purpose: Distinguish inbound (self-submitted) leads from scouted (automated pipeline) leads
-- Date: 2026-04-08
--
-- This column allows the dashboard to visually prioritize inbound leads
-- and enables filtering/analytics by lead source.
--
-- Values:
--   "scouted"  — default, for prospects found via automated scouting pipeline
--   "inbound"  — for businesses that submitted themselves via /get-started form

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'scouted';

-- Optional: Add a comment for documentation
COMMENT ON COLUMN prospects.source IS 'Lead source: "inbound" for self-submitted via /get-started, "scouted" for automated pipeline';
