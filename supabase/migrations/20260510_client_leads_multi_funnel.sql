-- ─────────────────────────────────────────────────────────────────────────────
-- 20260510_client_leads_multi_funnel
--
-- Per Ben spec 2026-05-10: when an owner clicks "Start funnel" on a lead,
-- they should see a list of available funnels and be able to enroll the
-- lead into MULTIPLE funnels at once (not just one). Universal — applies
-- to every client backend, now and forever.
--
-- Why an array column vs. a join table:
--   • The funnel set per client is small (Zenith=4, ITC=6, OIT=3) so the
--     array fits comfortably in a single row.
--   • The runner only needs to know "which funnels is THIS lead in" —
--     no per-(lead,funnel) state beyond the segment id (yet).
--   • Backward-compat: when the array is null/empty, the runner falls
--     back to the single audience_segment value, so existing data stays
--     valid without migration acrobatics.
--
-- The runner pass that picks segments WILL need to iterate this array
-- and run each funnel in turn (separate batch — this migration just
-- captures the data so the picker UI works today).
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.client_leads
  add column if not exists enrolled_funnels text[];

comment on column public.client_leads.enrolled_funnels is
  'Array of funnel segment IDs the lead is enrolled in concurrently. Empty/null = fall back to single-funnel behavior keyed off audience_segment. Set by the FunnelEnrollPicker modal in the leads-tab UI.';

-- GIN index for "which leads are in funnel X" lookups by the runner.
create index if not exists client_leads_enrolled_funnels_gin
  on public.client_leads using gin (enrolled_funnels);

-- Migrate existing enrolled leads: for any lead with funnel_status='enrolled'
-- and an audience_segment set, populate enrolled_funnels with [audience_segment]
-- so the runner has consistent data to read from going forward. Idempotent —
-- only fires when the array is currently null (skips re-runs).
update public.client_leads
   set enrolled_funnels = ARRAY[audience_segment]
 where funnel_status = 'enrolled'
   and audience_segment is not null
   and (enrolled_funnels is null or array_length(enrolled_funnels, 1) is null);
