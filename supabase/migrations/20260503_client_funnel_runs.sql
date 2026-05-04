-- ─────────────────────────────────────────────────────────────────────────────
-- client_funnel_runs — observability log for the per-client funnel cron.
--
-- Every run of /api/client-funnels/run writes one row per client_slug
-- processed. Lets Ben see in the dashboard "did the cron actually fire,
-- what did it do, did anything error" without ssh'ing into Vercel logs.
--
-- Auto-prunes after 90 days via a partial index + manual cleanup; at
-- ~24 runs/day × 1 client this stays under 2k rows so trim isn't urgent.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_funnel_runs (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  enrolled int not null default 0,
  steps_sent int not null default 0,
  steps_skipped int not null default 0,
  errors_count int not null default 0,
  errors jsonb default '[]'::jsonb,           -- full error list as JSON
  triggered_by text default 'cron'
    check (triggered_by in ('cron', 'manual', 'api')),
  duration_ms int,
  ran_at timestamptz not null default now()
);

create index if not exists client_funnel_runs_client_idx
  on public.client_funnel_runs (client_slug, ran_at desc);

comment on table public.client_funnel_runs is
  'One row per client processed by /api/client-funnels/run. Cron observability.';
