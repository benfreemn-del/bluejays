-- bj meta launch — track Meta Marketing API launch runs.
--
-- One row per wave (UNIQUE on wave name). Re-running `bj meta launch
-- wave-1` reads the existing row and skips already-created resources
-- rather than duplicating campaigns / ad sets. Phase progression:
--   skeleton  → campaign + 3 ad sets created (PAUSED)
--   ads       → 12 ads + creatives uploaded
--   complete  → human signed off; campaign moved to ACTIVE in UI

create table if not exists meta_launches (
  id uuid primary key default gen_random_uuid(),
  wave text not null,
  campaign_id text,
  campaign_name text,
  ad_set_ids jsonb default '[]'::jsonb,
  ad_ids jsonb default '[]'::jsonb,
  image_hashes jsonb default '{}'::jsonb,
  video_ids jsonb default '{}'::jsonb,
  phase text not null check (phase in ('skeleton', 'ads', 'complete')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'complete', 'failed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists meta_launches_wave_idx on meta_launches(wave);
create index if not exists meta_launches_status_idx on meta_launches(status, created_at desc);

comment on table meta_launches is
  'Tracks every bj meta launch run. One row per wave (unique constraint on wave name keeps idempotency — re-running bj meta launch wave-1 reads the existing row and resumes from where it left off rather than duplicating campaigns).';
