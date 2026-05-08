-- Lead-source attribution on prospects.
--
-- Without this, a closed $9,700 deal can't tell us if it came from:
--   madie-cold-call · audit-inbound · agency-replacement-ad ·
--   partner:hector · website-direct · scout-mfg-icp · etc.
--
-- Surfaces on /dashboard/sales-pipeline cards + future per-source
-- conversion-rate report.
--
-- Free-text on purpose — the set of channels grows as we open new
-- top-of-funnel surfaces. Document the canonical values in CLAUDE.md
-- "Lead Source Attribution" rule (added with this migration).
--
-- Idempotent — safe to re-run.

alter table public.prospects
  add column if not exists source_channel text;

alter table public.prospects
  add column if not exists source_channel_set_at timestamptz;

-- Common queries:
--   "what's our best source by close-rate" → group by source_channel
--   "show pipeline filtered to madie-cold-call" → where source_channel = ...
create index if not exists prospects_source_channel_idx
  on public.prospects (source_channel)
  where source_channel is not null;
