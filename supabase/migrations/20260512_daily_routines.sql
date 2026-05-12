-- Three tables backing the daily auto-routine crons:
--   blog_posts        — Claude-generated SEO posts (drafts → published)
--   hormozi_yt_scans  — dedupe + log of YouTube videos the finder saw
--   daily_metrics     — one row per UTC date, fast dashboard snapshot

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_md text not null,
  hero_image_url text,
  topic text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  word_count int,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_status_idx on blog_posts(status, published_at desc);

create table if not exists hormozi_yt_scans (
  id uuid primary key default gen_random_uuid(),
  video_id text not null unique,
  channel_id text,
  channel_title text,
  title text not null,
  description text,
  published_at timestamptz,
  thumbnail_url text,
  ingested_as_kb boolean not null default false,
  kb_chunk_id uuid references hormozi_kb_chunks(id) on delete set null,
  transcript_status text not null default 'metadata_only'
    check (transcript_status in ('metadata_only','pending','fetched','failed','skipped')),
  scanned_at timestamptz not null default now()
);
create index if not exists hormozi_yt_scans_published_idx on hormozi_yt_scans(published_at desc);

create table if not exists daily_metrics (
  metric_date date primary key,
  prospects_total int not null default 0,
  prospects_new_24h int not null default 0,
  pipeline_active int not null default 0,
  pipeline_stage_1 int not null default 0,
  pipeline_stage_2 int not null default 0,
  pipeline_stage_3_plus int not null default 0,
  audits_completed int not null default 0,
  leads_total int not null default 0,
  costs_24h_usd numeric(10,2) not null default 0,
  diagnostics_run int not null default 0,
  computed_at timestamptz not null default now()
);

create or replace function touch_blog_posts_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_blog_posts_updated_at on blog_posts;
create trigger trg_blog_posts_updated_at
  before update on blog_posts
  for each row execute function touch_blog_posts_updated_at();
