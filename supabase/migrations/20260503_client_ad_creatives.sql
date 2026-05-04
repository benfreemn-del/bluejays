-- ─────────────────────────────────────────────────────────────────────────────
-- client_ad_creatives — per-client ad creative library
--
-- Sprint 4 of the AI-package buildout. Stores every ad variant we produce
-- for each client across the audiences and ad platforms they run on.
-- The dashboard renders these as ready-to-export cards Ben can copy
-- straight into Meta Ads Manager / Google Ads Editor.
--
-- Design notes:
--   - One row per (client, audience, platform, variant). The brand voice
--     guide rec'd 3 ad sets × 3 creatives = 9 variants per audience to
--     give the learning phase a real chance, so a typical client lands
--     around 27-36 active rows.
--   - status lifecycle tracks where each creative sits in the workflow:
--       draft → ready → live → paused | archived | killed
--   - performance fields are filled by the weekly report job once we
--     wire Meta/Google ad-stat APIs (Sprint 4.5+); empty until then.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_ad_creatives (
  id uuid primary key default gen_random_uuid(),

  client_slug text not null,
  audience text not null
    check (audience in ('parent', 'coach', 'player', 'club', 'all')),
  platform text not null
    check (platform in ('meta-feed', 'meta-reels', 'meta-stories',
                        'google-search', 'google-pmax', 'google-yt')),

  -- Bucket for grouping variants in the same ad set (Hook A vs Hook B).
  ad_set text,
  variant_label text,             -- e.g. "Hook A · Outcome-led"

  -- The actual creative content.
  headline text not null,
  body text not null,
  cta text,                        -- "Shop Now" | "Learn More" | "Book Demo" | etc.

  -- Brief for the visual asset (Ben/Philip designs from this).
  image_brief text,                -- "Player on TEKKY in driveway, golden-hour lighting"
  video_brief text,                -- "6-sec BAE loop: TEKKY → standard ball cut"
  asset_url text,                  -- once the asset is produced

  -- URL parameters auto-appended for attribution (utm_source, utm_medium,
  -- utm_campaign, utm_content). Stored so the same variant always tracks
  -- the same way.
  utm jsonb not null default '{}'::jsonb,

  -- Workflow.
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'live', 'paused', 'archived', 'killed')),

  -- External platform IDs (fill these in once the ad is created).
  external_id text,                -- Meta ad id or Google ad id
  external_account_id text,        -- Ad account context

  -- Performance snapshots — updated by the weekly report job.
  impressions int,
  clicks int,
  conversions int,
  spend_cents int,
  last_synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_ad_creatives_client_status_idx
  on public.client_ad_creatives (client_slug, status);
create index if not exists client_ad_creatives_audience_idx
  on public.client_ad_creatives (client_slug, audience, platform);

create or replace function public.client_ad_creatives_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_ad_creatives_touch on public.client_ad_creatives;
create trigger client_ad_creatives_touch
  before update on public.client_ad_creatives
  for each row execute function public.client_ad_creatives_touch();
