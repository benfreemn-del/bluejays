-- hyperloop_decisions — append-only log of every winner/loser/dethrone
-- decision made by the hyperloop runner OR by an operator override.
-- Companion to /dashboard/hyperloop/history.

create table if not exists hyperloop_decisions (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  decision_kind text not null check (decision_kind in ('promote_winner','pause_loser','dethrone','seed_variant','allocate_budget')),
  variant_id text,
  variant_name text,
  cohort_kind text,
  before_state jsonb,
  after_state jsonb,
  reason text not null,
  triggered_by text not null default 'cron' check (triggered_by in ('cron','manual','operator')),
  created_at timestamptz not null default now()
);

create index if not exists hyperloop_decisions_client_idx on hyperloop_decisions(client_slug, created_at desc);
create index if not exists hyperloop_decisions_kind_idx on hyperloop_decisions(decision_kind);
