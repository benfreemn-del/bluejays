-- Per-client camps catalog. Powers the Camp Finder quiz results page
-- and any other "list our camps" surface. Mirrors the shape of the old
-- src/app/clients/zenith-sports/camps/camps-data.ts file but moves the
-- source of truth to the DB so Philip can add real camps via the
-- dashboard without a code edit + redeploy.

create table if not exists public.client_camps (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  name text not null,
  org text,                           -- "Zenith Sports", partner club name, etc.
  city text,
  state text,                         -- 2-letter postal code
  region text,                        -- Pacific NW / West / Mountain / Midwest / South / Northeast
  -- Optional coordinates for the future map view. Stored as plain
  -- floats — at <50 rows we don't need PostGIS.
  lat numeric(9, 6),
  lng numeric(9, 6),
  -- ISO dates. start_date null = rolling enrollment. end_date null = single-day.
  start_date date,
  end_date date,
  age_range text,                     -- "U10–U14"
  format text,                        -- "Day camp" | "Residential" | "Clinic" | "Demo"
  ball_included boolean default false,
  url text,
  blurb text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_camps_slug_active_idx
  on public.client_camps (client_slug, is_active, start_date)
  where is_active = true;

-- updated_at touch trigger
create or replace function public.touch_client_camps_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_camps_updated_at on public.client_camps;
create trigger client_camps_updated_at
  before update on public.client_camps
  for each row execute function public.touch_client_camps_updated_at();
