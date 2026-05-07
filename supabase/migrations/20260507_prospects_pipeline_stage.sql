-- Pipeline-stage tracking on prospects · /dashboard/pipeline kanban
--
-- Two-track sales pipeline view at /dashboard/pipeline:
--
--   Website track ($997)            $10K AI System track (fullsystem)
--   ─────────────────────           ──────────────────────────────────
--   1. preview site created          1. needs mockup
--   2. meeting scheduled             2. mockup done
--   3. bought + paid                 3. meeting completed
--   4. product delivered             4. purchased — needs delivery
--                                    5. delivered, hands off
--                                    6. delivered + still managing $500/mo
--
-- Track is determined by `pricing_tier`:
--   pricing_tier = 'fullsystem'  →  $10K column (stages 1-6)
--   anything else / NULL         →  Website column (stages 1-4)
--
-- pipeline_stage is NULL until Ben actively places the lead on the
-- board. NULL = lead exists but isn't in the pipeline yet (still in
-- inbound triage). The /dashboard/pipeline UI only renders rows
-- where pipeline_stage IS NOT NULL.
--
-- Idempotent — safe to re-run.

alter table public.prospects
  add column if not exists pipeline_stage smallint;

alter table public.prospects
  add column if not exists pipeline_stage_updated_at timestamptz;

-- Range guard: 1-6 covers both tracks. UI enforces the per-track
-- ceiling (4 for website, 6 for fullsystem).
alter table public.prospects
  drop constraint if exists prospects_pipeline_stage_range;
alter table public.prospects
  add constraint prospects_pipeline_stage_range
  check (pipeline_stage is null or (pipeline_stage between 1 and 6));

-- Common query: "show me everything currently on the board" — sorted
-- by track + stage. Index covers both filters.
create index if not exists prospects_pipeline_stage_idx
  on public.prospects (pricing_tier, pipeline_stage)
  where pipeline_stage is not null;
