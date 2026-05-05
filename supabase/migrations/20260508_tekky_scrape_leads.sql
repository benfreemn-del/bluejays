-- ─────────────────────────────────────────────────────────────────────────────
-- tekky_scrape_leads — audience-scoped scrape results for Tekky targeting.
--
-- Distinct from public.prospects (which drives the BlueJays template
-- funnel + per-category outreach) and public.client_leads (which holds
-- consumer-facing inbound leads per client). This table is purely for
-- Tekky's outbound: "find youth soccer clubs in MLS host cities and
-- pitch them on a TEKKY ball partnership."
--
-- Each scrape run for a (city, state, audience) tuple may insert N rows.
-- Google place_id is unique → re-running the same scrape is idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.tekky_scrape_leads (
  id uuid primary key default gen_random_uuid(),

  -- The discovered business / org / contact target.
  business_name text not null,
  phone text,
  website text,
  address text,
  google_rating numeric,
  google_review_count int,
  google_place_id text unique,

  -- Targeting metadata.
  audience text not null check (audience in ('parent', 'coach', 'player')),
  city text not null,
  state text not null,

  -- The exact Google Places query that surfaced this lead (so we can
  -- evaluate query quality + dedupe re-runs).
  source_query text not null,

  -- Outreach lifecycle. 'new' rows are eligible for first-touch.
  status text not null default 'new'
    check (status in ('new', 'contacted', 'responded', 'converted', 'dismissed')),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lookup index for the map UI: "show me all leads for Frisco TX, audience=coach"
create index if not exists tekky_scrape_leads_market_idx
  on public.tekky_scrape_leads (city, state, audience);

create index if not exists tekky_scrape_leads_status_idx
  on public.tekky_scrape_leads (status, created_at desc);

create or replace function public.tekky_scrape_leads_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists tekky_scrape_leads_touch on public.tekky_scrape_leads;
create trigger tekky_scrape_leads_touch
  before update on public.tekky_scrape_leads
  for each row execute function public.tekky_scrape_leads_touch();

comment on table public.tekky_scrape_leads is
  'Audience-scoped Google Places scrape results for Tekky outbound (parents / coaches / players in soccer-rich US cities). Surfaced on the Tekky lead-scrape map.';
