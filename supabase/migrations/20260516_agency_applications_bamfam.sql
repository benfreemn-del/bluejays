-- BAM-FAM outcome tracking for agency_applications.
--
-- Closes the "qualified-but-ghosted" gap flagged in the 2026-05-14
-- Hormozi backend review item A3. Before this migration, the apply
-- form fired a Calendly link via the qualified-decision branch but
-- the dashboard had no way to track whether the link was sent, whether
-- the prospect actually booked, whether they showed up, or how the
-- call resolved.
--
-- New columns:
--   calendly_sent_at        — Ben (or the auto-flow) marks when the
--                             calendar link went out
--   meeting_booked_at       — when the prospect picked a time on the
--                             Calendly widget (manual flip for now;
--                             can be wired to Calendly webhooks later)
--   meeting_completed_at    — when the call actually happened
--   meeting_outcome         — no_show | declined | interested | closed
--                             (Kanban columns map to these states)
--   bamfam_notes            — call notes / save reason / next step
--
-- All nullable — existing rows unaffected. New rows default to nulls.

alter table public.agency_applications
  add column if not exists calendly_sent_at timestamptz,
  add column if not exists meeting_booked_at timestamptz,
  add column if not exists meeting_completed_at timestamptz,
  add column if not exists meeting_outcome text,
  add column if not exists bamfam_notes text;

-- Validation: meeting_outcome stays in a known set when set.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'agency_applications_meeting_outcome_chk'
  ) then
    alter table public.agency_applications
      add constraint agency_applications_meeting_outcome_chk
      check (
        meeting_outcome is null
        or meeting_outcome in ('no_show', 'declined', 'interested', 'closed')
      );
  end if;
end $$;

-- Index for the Kanban view: "Calendly sent but not booked yet" /
-- "Booked but not yet completed" — both queries hit these timestamps.
create index if not exists agency_applications_bamfam_idx
  on public.agency_applications (calendly_sent_at, meeting_booked_at, meeting_completed_at)
  where status in ('qualified', 'called');
