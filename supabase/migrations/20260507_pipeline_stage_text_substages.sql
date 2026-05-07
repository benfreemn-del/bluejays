-- Promote prospects.pipeline_stage from smallint → text so it can hold
-- sub-letter states like '4a' / '4b' / '5c'.
--
-- Per Ben 2026-05-07: the kanban needs sub-categories within a single
-- stage (e.g. stage 4 = purchased, 4a = awaiting first deliverable,
-- 4b = awaiting client photos, 4c = blocked on client decision).
-- Letters are lowercase a-z and are optional — bare digits like '4'
-- still work.
--
-- pipeline_stage is the SINGLE CANONICAL lead-stage field. Every funnel,
-- every dashboard view, every report reads from prospects.pipeline_stage.
-- Don't add a parallel stage column on client_leads, partner_referrals,
-- or anywhere else — keep the truth in one place.
--
-- Idempotent. Safe to run AFTER 20260507_prospects_pipeline_stage.sql.
-- (Also safe to run if that earlier migration hasn't been applied yet —
--  the alter table add column line below won't double-add.)

-- Make sure the column exists (in case this runs first).
alter table public.prospects
  add column if not exists pipeline_stage text;
alter table public.prospects
  add column if not exists pipeline_stage_updated_at timestamptz;

-- Drop the old smallint range CHECK if it exists. We'll re-add a
-- format-based CHECK below that allows '4', '4a', '5b' etc.
alter table public.prospects
  drop constraint if exists prospects_pipeline_stage_range;

-- If the column is currently smallint, cast existing values to text.
-- The DO block reads pg_attribute to figure out the current type and
-- skips the alter if it's already text. Idempotent across reruns.
do $$
declare
  current_type text;
begin
  select format_type(atttypid, atttypmod) into current_type
    from pg_attribute
   where attrelid = 'public.prospects'::regclass
     and attname = 'pipeline_stage';
  if current_type <> 'text' then
    -- Convert smallint (or any other prior type) to text using a cast.
    execute 'alter table public.prospects
               alter column pipeline_stage type text
               using pipeline_stage::text';
  end if;
end $$;

-- New format CHECK: NULL allowed (= not on the board), or single digit
-- 1-6 optionally followed by ONE lowercase letter a-z. Examples that
-- pass: '1', '4', '4a', '4b', '6', '6c'. Examples that fail: '7',
-- '4A' (uppercase), '4ab' (two letters), '0', 'a4'.
alter table public.prospects
  drop constraint if exists prospects_pipeline_stage_format;
alter table public.prospects
  add constraint prospects_pipeline_stage_format
  check (pipeline_stage is null or pipeline_stage ~ '^[1-6][a-z]?$');

-- Re-create the active-board index on the new text column. Same
-- predicate (only index rows that are actively on the board).
drop index if exists prospects_pipeline_stage_idx;
create index if not exists prospects_pipeline_stage_idx
  on public.prospects (pricing_tier, pipeline_stage)
  where pipeline_stage is not null;
