-- Add 'reader' to the client_leads.audience_segment allow-list so
-- indie-author reader-capture writes can use a dedicated tag instead
-- of falling back to NULL. Until this lands, /api/clients/[slug]/
-- reader-capture writes audience_segment=NULL and relies on
-- source='reader:*' + intent=<source> for downstream segmentation.
--
-- Drop + recreate (Postgres CHECK constraints can't be ALTERed in
-- place; the standard pattern across prior audience migrations).

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
      'hobbyist', 'forester', 'tym', 'hunter', 'dealer', 'community',
      -- Olympic Inspections / inspection-services + naturopath + realtor
      -- audiences. These were already in production before this migration
      -- ran — listed explicitly here so a fresh-DB bootstrap doesn't
      -- choke on existing rows. (Discovered during 2026-05-18 apply.)
      'naturopath', 'realtor', 'well-services', 'property-mgmt',
      'mold-remediator', 'septic-services', 'restoration',
      'radon-mitigation', 'homeowner',
      -- Indie-author client audience — reader captures from the
      -- bespoke showcase (faction quiz / world map / parchment / etc).
      'reader'
    )
  );

comment on constraint client_leads_audience_segment_check on public.client_leads is
  'Allow-list of audience tags spanning all client tenants. Append new tenants here when their detectAudience() output adds new segments.';
