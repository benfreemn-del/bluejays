-- ─────────────────────────────────────────────────────────────────────────────
-- 20260510 — Extend client_leads.audience_segment to cover OIT's 3 segments.
--
-- The constraint currently allows Zenith (parent/coach/player/club/unknown) +
-- ITC (hobbyist/forester/tym/hunter/dealer/community). When the OIT scout
-- mirrors a scouted realtor into client_leads with audience_segment='realtor',
-- the insert is rejected by the check constraint:
--
--   ERROR: 23514 — new row violates check constraint
--   "client_leads_audience_segment_check"
--
-- Same fix as 20260513 was for ITC: drop + re-add with the OIT audiences
-- included. Idempotent — re-running is a no-op.
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
      'hobbyist', 'forester', 'tym', 'hunter', 'dealer', 'community',
      -- Olympic Inspections & Testing audiences
      'homeowner', 'realtor', 'insurance'
    )
  );

comment on constraint client_leads_audience_segment_check on public.client_leads is
  'Allow-list of audience tags spanning all client tenants. Append new tenants here when their detectAudience() output adds new segments.';
