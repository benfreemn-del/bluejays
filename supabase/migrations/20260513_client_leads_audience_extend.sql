-- ─────────────────────────────────────────────────────────────────────────────
-- 20260513 — Extend client_leads.audience_segment to cover ITC's 6 segments.
--
-- The original CHECK constraint only allowed soccer audiences (parent / coach
-- / player / club / unknown). When the county-scout map mirrors a scouted
-- business into client_leads with an ITC audience tag (dealer / tym /
-- forester / hunter / hobbyist / community), the insert is rejected by the
-- constraint and silently swallowed by the scout's try/catch — so scouted
-- leads never showed up in the ITC owner portal Leads tab.
--
-- Drop + recreate the constraint with both audience sets covered.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.client_leads
  drop constraint if exists client_leads_audience_segment_check;

alter table public.client_leads
  add constraint client_leads_audience_segment_check
  check (
    audience_segment is null
    or audience_segment in (
      -- Zenith Sports / TEKKY soccer audiences
      'parent', 'coach', 'player', 'club', 'unknown',
      -- ITC Quick Attach tractor-accessory audiences
      'hobbyist', 'forester', 'tym', 'hunter', 'dealer', 'community'
    )
  );

comment on constraint client_leads_audience_segment_check on public.client_leads is
  'Allow-list of audience tags spanning all client tenants. Append new tenants here when their detectAudience() output adds new segments.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: any business that's already in itc_scrape_leads or
-- tekky_scrape_leads but never made it to client_leads (because the old
-- check constraint silently rejected the insert) should now appear in
-- the owner portal Leads tab.
--
-- Match-by-google_place_id avoids duplicates if a row was somehow already
-- mirrored.
-- ─────────────────────────────────────────────────────────────────────────────

-- ITC backfill
insert into public.client_leads (
  client_slug,
  audience_segment,
  name,
  phone,
  intent,
  source,
  raw_payload
)
select
  'itc-quick-attach',
  s.audience,
  s.business_name,
  s.phone,
  'Scouted via Google Places · ' || s.city || ', ' || s.state,
  'scout-' || s.audience,
  jsonb_build_object(
    'scout_origin',         'map',
    'google_place_id',      s.google_place_id,
    'website',              s.website,
    'address',              s.address,
    'google_rating',        s.google_rating,
    'google_review_count',  s.google_review_count,
    'source_query',         s.source_query,
    'backfilled_at',        now()
  )
from public.itc_scrape_leads s
where not exists (
  select 1
  from public.client_leads l
  where l.client_slug = 'itc-quick-attach'
    and l.raw_payload->>'google_place_id' = s.google_place_id
);

-- Zenith Sports backfill (TEKKY scout table)
insert into public.client_leads (
  client_slug,
  audience_segment,
  name,
  phone,
  intent,
  source,
  raw_payload
)
select
  'zenith-sports',
  s.audience,
  s.business_name,
  s.phone,
  'Scouted via Google Places · ' || s.city || ', ' || s.state,
  'scout-' || s.audience,
  jsonb_build_object(
    'scout_origin',         'map',
    'google_place_id',      s.google_place_id,
    'website',              s.website,
    'address',              s.address,
    'google_rating',        s.google_rating,
    'google_review_count',  s.google_review_count,
    'source_query',         s.source_query,
    'backfilled_at',        now()
  )
from public.tekky_scrape_leads s
where not exists (
  select 1
  from public.client_leads l
  where l.client_slug = 'zenith-sports'
    and l.raw_payload->>'google_place_id' = s.google_place_id
);
