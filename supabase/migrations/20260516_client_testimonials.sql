-- Per-client testimonials store.
--
-- Used by the showcase pages (/clients/[slug]) to render a carousel of
-- real customer quotes. Brand-voice guide flagged 11+ testimonials as
-- a +68% conversion lift on landing pages — this is the infra so the
-- moment Philip sends 3 quotes they go live without a code change.
--
-- Shape: name + location for context, role-tag (parent/coach/etc) so
-- we can filter by audience later, quote (required), optional photo
-- and video URLs (Loom / Vimeo / direct .mp4 fine), sort_order +
-- is_active so the dashboard can promote/demote without deleting.

create table if not exists public.client_testimonials (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  name text not null,
  -- "Sammamish, WA" / "U13 ECNL coach, Forward SC" / etc.
  location text,
  -- Aligns to ClientLeadAudience values where applicable so the carousel
  -- can filter to "show me coach testimonials only" later.
  role text,
  quote text not null,
  photo_url text,
  video_url text,
  -- Stable client-controlled ordering. Lower numbers render first.
  sort_order integer not null default 100,
  is_active boolean not null default true,
  -- Optional published_at — lets us schedule a quote to go live later.
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_testimonials_slug_active_idx
  on public.client_testimonials (client_slug, is_active, sort_order)
  where is_active = true;

-- updated_at touch trigger. Mirror of the pattern used on client_leads.
create or replace function public.touch_client_testimonials_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_testimonials_updated_at on public.client_testimonials;
create trigger client_testimonials_updated_at
  before update on public.client_testimonials
  for each row execute function public.touch_client_testimonials_updated_at();
