-- Domain Warming state table
-- Single-row table (id=1) tracking the active warming schedule for the primary sending domain.
-- Referenced by src/lib/domain-warming.ts (getWarmingConfig / updateWarmingConfig).

create table if not exists public.domain_warming (
  id integer primary key,
  enabled boolean not null default false,
  start_date timestamptz not null default now(),
  current_daily_limit integer not null default 10,
  max_daily_limit integer not null default 100,
  sent_today integer not null default 0,
  last_reset_date date not null default current_date,
  domain text not null default 'bluejayportfolio.com',
  backup_domain text,
  use_backup boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Seed the singleton row so upsert({ id: 1, ... }) always has a target
insert into public.domain_warming (id)
values (1)
on conflict (id) do nothing;
