-- ─────────────────────────────────────────────────────────────────────────────
-- itc_scrape_leads — audience-scoped Google Places scrape results for
-- ITC Quick Attach.
--
-- Mirrors tekky_scrape_leads (Zenith) but with ITC-specific audience
-- enum (dealer / tym / forester / hunter / hobbyist). Keeping it in a
-- separate table makes it easy to attach per-client outreach status
-- + reporting without polluting the cross-tenant tekky table.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.itc_scrape_leads (
  id uuid primary key default gen_random_uuid(),

  business_name text not null,
  phone text,
  website text,
  address text,
  google_rating numeric,
  google_review_count int,
  google_place_id text unique,

  -- Five ITC audiences, mapping to distinct Google Places query sets.
  audience text not null check (audience in (
    'dealer', 'tym', 'forester', 'hunter', 'hobbyist'
  )),
  city text not null,
  state text not null,

  source_query text not null,

  status text not null default 'new'
    check (status in ('new', 'contacted', 'responded', 'converted', 'dismissed')),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists itc_scrape_leads_market_idx
  on public.itc_scrape_leads (city, state, audience);

create index if not exists itc_scrape_leads_status_idx
  on public.itc_scrape_leads (status, created_at desc);

create or replace function public.itc_scrape_leads_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists itc_scrape_leads_touch on public.itc_scrape_leads;
create trigger itc_scrape_leads_touch
  before update on public.itc_scrape_leads
  for each row execute function public.itc_scrape_leads_touch();

comment on table public.itc_scrape_leads is
  'Audience-scoped Google Places scrape results for ITC Quick Attach outbound. Five audiences: dealer / tym / forester / hunter / hobbyist. Surfaced on the ITC market map.';
