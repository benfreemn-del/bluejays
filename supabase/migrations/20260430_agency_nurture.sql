-- Adds nurture-tracking columns to agency_applications.
--
-- Why: declined applicants are still mid-funnel buyers — most have
-- $1K+ AVG, working business, just hit a hard threshold (no budget,
-- AVG <$500, or revenue <$3K/mo). The /audit redirect on decline is
-- a 1-shot — if they don't claim the audit immediately, they
-- evaporate. This 4-touch sequence keeps them warm.
--
-- Sequence (Day 1, 3, 14, 30 after decline):
--   1. Day 1  — Free-audit nudge with a personalized hook
--   2. Day 3  — Case study (lead-volume win) + soft re-apply CTA
--   3. Day 14 — "$5K/mo yet?" check-in, still soft
--   4. Day 30 — Direct re-apply CTA + final email of sequence
--
-- All emails are skipped if the applicant later transitions to a
-- non-dnq status (e.g. Ben manually qualifies them or they re-apply).

alter table if exists agency_applications
  add column if not exists nurture_step int default 0,
  add column if not exists nurture_next_send_at timestamptz,
  add column if not exists nurture_completed_at timestamptz,
  add column if not exists nurture_unsubscribed_at timestamptz;

-- Index for the cron's "find next batch" query.
create index if not exists agency_applications_nurture_idx
  on agency_applications(nurture_next_send_at)
  where nurture_next_send_at is not null and nurture_completed_at is null and nurture_unsubscribed_at is null;

notify pgrst, 'reload schema';
