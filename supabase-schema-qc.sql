-- ============================================================
-- QC Gate Migration
-- Adds quality_score, quality_notes, qc_reviewed_at to prospects
-- Also adds ready_to_review and qc_failed to the status check
-- Run this against your Supabase project SQL editor
-- ============================================================

-- 1. Add QC columns to prospects table
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS quality_score    INTEGER,
  ADD COLUMN IF NOT EXISTS quality_notes    TEXT,
  ADD COLUMN IF NOT EXISTS qc_reviewed_at   TIMESTAMPTZ;

-- 2. Index for fast QC status filtering on the dashboard
CREATE INDEX IF NOT EXISTS idx_prospects_quality_score
  ON prospects (quality_score)
  WHERE quality_score IS NOT NULL;

-- 3. Comment the new columns for documentation
COMMENT ON COLUMN prospects.quality_score IS
  'QC gate score 0-100. Populated by /api/qc/review/[id] and generator.ts. Score >= 70 with no critical issues = ready_to_review.';

COMMENT ON COLUMN prospects.quality_notes IS
  'Human-readable QC report text. Lists all critical/warning issues found during automated review.';

COMMENT ON COLUMN prospects.qc_reviewed_at IS
  'Timestamp of the most recent QC gate run for this prospect.';
