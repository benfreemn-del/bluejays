-- Wave 2 AI responder safety: pending_review status + intent column on queued_replies
--
-- Why:
--  1. AI_AUTO_REPLY_ENABLED=false kill-switch parks AI-drafted replies in
--     pending_review until Ben approves them via the dashboard. Until now the
--     status check enforced ('pending', 'sent', 'failed') only.
--  2. Speed-bypass logic (interested / ready_to_buy / schedule_call) needs the
--     classified intent saved alongside the queued reply so the dashboard can
--     surface high-intent items first and the analytics layer can prove the
--     bypass landed faster.
--
-- Safe to run repeatedly — uses IF NOT EXISTS / IF EXISTS guards.

-- 1. Drop the old CHECK constraint (named or anonymous) and replace with the
--    new wider set of allowed status values.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'queued_replies' AND column_name = 'status'
  ) THEN
    -- Find and drop the existing status check constraint by name
    EXECUTE (
      SELECT 'ALTER TABLE queued_replies DROP CONSTRAINT IF EXISTS ' || conname
      FROM pg_constraint
      WHERE conrelid = 'queued_replies'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%'
      LIMIT 1
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If the constraint doesn't exist or query returns nothing, just continue.
  NULL;
END $$;

ALTER TABLE queued_replies
  ADD CONSTRAINT queued_replies_status_check
  CHECK (status IN ('pending', 'pending_review', 'queued', 'sent', 'failed'));

-- 2. Add an intent column so we can prioritize high-intent replies
--    (interested / ready_to_buy / schedule_call) and analyze speed-bypass impact.
ALTER TABLE queued_replies
  ADD COLUMN IF NOT EXISTS intent TEXT;

-- 3. Add a reviewed_at column for the kill-switch flow — set when Ben
--    approves a pending_review reply via the dashboard.
ALTER TABLE queued_replies
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 3b. Add a rejection_reason column so Ben can record why a draft was
--     rejected. Optional — UI may submit empty string. Used later for
--     prompt tuning + responder-quality analytics.
ALTER TABLE queued_replies
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Helpful index for the dashboard's "needs review" tile.
CREATE INDEX IF NOT EXISTS queued_replies_pending_review_idx
  ON queued_replies (status, created_at DESC)
  WHERE status = 'pending_review';

-- 5. Allow 'rejected' status for the manual rejection flow. Combined check
--    constraint replaces the one written above.
ALTER TABLE queued_replies
  DROP CONSTRAINT IF EXISTS queued_replies_status_check;

ALTER TABLE queued_replies
  ADD CONSTRAINT queued_replies_status_check
  CHECK (status IN ('pending', 'pending_review', 'queued', 'sent', 'failed', 'rejected'));
