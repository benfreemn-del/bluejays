-- H6 (Hormozi "No Data Daddy" fix) Tier 1 — closer attribution.
--
-- Adds closer_name to prospects so the dashboard can split close-rate
-- and pipeline by closer (Ben vs Madie). Without this column the
-- Pipeline 1 close-rate-by-closer metric (per
-- aios/memory/project_bluejays_six_horsemen_applications.md H6.1) is
-- impossible to compute — and the Day-19 FB ad spend would land
-- without a visible "which closer is moving faster" signal.
--
-- Design notes:
--   - text (not enum) — keeps the schema forward-compatible for future
--     hires; application layer normalizes case + trims.
--   - nullable — existing rows leave closer_name NULL. Ben backfills
--     paid prospects May 1+ via the dashboard. NULL = unknown closer
--     (typical for inbound auto-closes before Madie joined).
--   - partial index on (closer_name, paid_at) where closer_name is
--     not null — small, fast lookups for the CloserBreakdownCard query
--     without bloating the index on unattributed rows.

alter table public.prospects
  add column if not exists closer_name text;

create index if not exists prospects_closer_paid_idx
  on public.prospects (closer_name, paid_at)
  where closer_name is not null;

comment on column public.prospects.closer_name is
  'Who closed the deal (Ben | Madie | future hires). NULL for unknown / pre-tracking. Used by /dashboard CloserBreakdownCard for the Pipeline 1 close-rate-by-closer split (H6 fix, May 2026).';
