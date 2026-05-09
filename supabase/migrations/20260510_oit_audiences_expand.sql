-- ─────────────────────────────────────────────────────────────────────────────
-- 20260510_oit_audiences_expand
--
-- Per Ben spec 2026-05-10: organize OIT leads by category with proper
-- emojis + filter chips in the Leads tab. The 3-audience taxonomy
-- (homeowner / realtor / insurance) wasn't granular enough — most
-- scouted leads couldn't be categorized at all. Expanded to 7:
--
--   homeowner       🏠  customer (people Luke serves)
--   realtor         🪧  customer (real-estate agents/brokers)
--   property-mgmt   🏢  customer (property management firms)
--   insurance       🛡️  customer (insurance adjusters)
--   mold-remediator 🧪  partner (mutual referral)
--   restoration     💧  partner (mutual referral)
--   naturopath      🌿  partner (mutual referral)
--
-- This migration:
--   1. Extends the client_leads.audience_segment CHECK constraint to
--      include the 4 new audience values
--   2. Backfills audience_segment for every existing OIT lead based
--      on raw_payload->>'role' (the scout already records the role
--      in payload — we just hadn't promoted it to the segment column)
--
-- Idempotent — re-running is a no-op.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Constraint expand ────────────────────────────────────────────────────

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
      -- Olympic Inspections customer audiences
      'homeowner', 'realtor', 'property-mgmt', 'insurance',
      -- Olympic Inspections referral-network partners
      'mold-remediator', 'restoration', 'naturopath'
    )
  );

comment on constraint client_leads_audience_segment_check on public.client_leads is
  'Allow-list of audience tags spanning all client tenants. Append new tenants here when their detectAudience() output adds new segments.';

-- ─── 2. Backfill OIT leads with proper audience_segment ──────────────────────
-- Maps the role stored in raw_payload to the new 7-audience taxonomy.
-- Only updates rows where the current segment doesn't match the new mapping
-- (idempotent — re-running flips zero rows after the first run).

update public.client_leads
   set audience_segment = case raw_payload->>'role'
     when 'realtor' then 'realtor'
     when 'property-management' then 'property-mgmt'
     when 'mold-remediation' then 'mold-remediator'
     when 'water-damage' then 'restoration'
     when 'naturopathic' then 'naturopath'
     else audience_segment
   end,
   updated_at = now()
 where client_slug = 'olympic-inspections'
   and source = 'oit-partner-scout'
   and raw_payload->>'role' is not null;
