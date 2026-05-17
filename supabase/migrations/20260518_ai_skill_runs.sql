-- AI Skills layer — Day 1 of the bj ai agentic CLI build (2026-05-17).
--
-- Persistence for every skill invocation (cron, manual, or signal-
-- triggered) so Ben can see what fired, what it cost, how long it
-- took, and what came out. Plus a per-skill daily cap so a runaway
-- prompt or a bad context-gatherer can never burn through more than
-- $5/day across all skills (configurable).
--
-- Skill folders live at bluejays/.claude/skills/ai-*/. The runner at
-- src/lib/ai-skills/runner.ts loads them, gathers context, calls
-- Claude, validates output against the skill's JSON Schema, persists
-- a row here, and emits an agent_signal if the skill's manifest
-- configures one.
--
-- Pro-fork note (per AIOS principle 25): this migration is Bucket A
-- (universal). When BlueJays Pro clients get their own skill packs,
-- the same tables back their runs — just scoped by client_slug via a
-- future RLS policy.

create table if not exists ai_skill_runs (
  id uuid primary key default gen_random_uuid(),
  skill text not null,
  triggered_by text not null check (triggered_by in ('cron', 'manual', 'signal')),
  args jsonb default '{}',
  -- sha256(JSON.stringify(contextPayload)) — lets the runner dedupe
  -- "same context within 1h = use cached output" if we ever want it.
  input_hash text,
  output jsonb,
  -- Plain-text 1-3 lines for stdout / SMS / dashboard. Always present
  -- even on failure (carries the error message).
  summary text not null,
  cost_usd numeric(10,4) not null default 0,
  latency_ms integer not null default 0,
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  ok boolean not null default true,
  -- 'no_work' is a distinct success case — the context-gatherer
  -- determined no Claude call was needed. Cost stays 0. We persist
  -- the row anyway so Ben can see "cron fired, nothing to do."
  no_work boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists ai_skill_runs_skill_created_idx
  on ai_skill_runs(skill, created_at desc);
create index if not exists ai_skill_runs_no_work_idx
  on ai_skill_runs(no_work, created_at desc);

-- Per-skill daily cap. Runner checks spent_today_usd < daily_cap_usd
-- BEFORE making any Claude call. Resets at UTC midnight via the
-- runner (lazy reset — no cron needed).
create table if not exists ai_skill_caps (
  skill text primary key,
  daily_cap_usd numeric(10,2) not null default 5.00,
  spent_today_usd numeric(10,4) not null default 0,
  cap_reset_at date not null default current_date,
  -- For visibility into how many cap-hits happened today (debug aid).
  cap_hits_today integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Global default cap for skills that don't have a row yet (UPSERT on
-- first run inserts with these defaults).
comment on column ai_skill_caps.daily_cap_usd is
  'Default $5/day per skill. Override per-skill via UPDATE. Global ' ||
  'kill switch via env AI_SKILLS_DISABLED=1 (handled in runner).';
