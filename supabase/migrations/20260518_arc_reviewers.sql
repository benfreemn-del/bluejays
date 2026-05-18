-- ARC Reader / Street Team CRM — for indie author clients.
--
-- The first two weeks post-launch is the algorithmic moment that makes
-- or breaks an indie's career on Amazon. Getting 50–100 ARC reviews
-- in that window is the single highest-leverage thing an author can do.
-- Most run it out of a 50-row Google Sheet. This replaces the sheet.
--
-- One row per reviewer. Status flow:
--   applied → approved → copy_sent → posted_review (terminal good)
--           ↘ skipped (terminal bad)
--
-- Migration: see CLAUDE.md "ARC Reader CRM" pattern.

CREATE TABLE IF NOT EXISTS arc_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  -- Per-book grouping. Optional — authors with one active title leave NULL.
  book_title TEXT,
  -- Applicant identity.
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  -- Where they promise to leave the review (selected at application time).
  -- Multiple platforms allowed; stored as JSONB array.
  platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Optional: their main social/blog follower count (self-reported, for
  -- triage of "this is a real influencer" vs "random reader").
  reach_estimate INTEGER,
  -- Optional: their existing Amazon reviewer rank (self-reported).
  amazon_reviewer_rank INTEGER,
  -- Status — finite state machine.
  status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'approved', 'copy_sent', 'posted_review', 'skipped')),
  -- Timestamps mirror status transitions. NULL until the transition fires.
  approved_at TIMESTAMPTZ,
  copy_sent_at TIMESTAMPTZ,
  posted_review_at TIMESTAMPTZ,
  -- Where their posted review lives. Author drops this URL after Day 14.
  review_url TEXT,
  -- Self-reported rating. Cap at 5; the author should NEVER nudge a
  -- low-rating reviewer (career-killer), so this lives for transparency.
  rating_self_reported INTEGER CHECK (rating_self_reported BETWEEN 1 AND 5),
  -- Free-form notes. Author writes "Caroline runs a 50k IG account" etc.
  notes TEXT,
  -- Application metadata.
  motivation TEXT,                 -- "Why do you want to read this?"
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Auto-nudge tracking (Day 7 reminder).
  last_nudge_at TIMESTAMPTZ,
  nudge_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS arc_reviewers_slug_status_idx
  ON arc_reviewers (client_slug, status, applied_at DESC);

CREATE INDEX IF NOT EXISTS arc_reviewers_slug_book_idx
  ON arc_reviewers (client_slug, book_title, applied_at DESC);

-- Unique email per book per client to prevent dupe applications.
CREATE UNIQUE INDEX IF NOT EXISTS arc_reviewers_unique_email
  ON arc_reviewers (client_slug, COALESCE(book_title, ''), LOWER(email));
