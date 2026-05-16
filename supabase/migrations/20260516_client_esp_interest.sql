-- Phase 1 demand capture for the multi-ESP integration feature.
-- The per-client portal Campaigns tab gets 5 provider cards
-- (Mailchimp / Klaviyo / ConvertKit / ActiveCampaign / HubSpot).
-- Each click upserts here so Ben can decide which provider's OAuth
-- flow to build first based on actual client signal.
--
-- One row per (client_slug, provider). request_count increments on
-- re-clicks so a hot demand signal is visible without dedup work.

create table if not exists public.client_esp_interest (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  provider text not null,
  requested_at timestamp with time zone not null default now(),
  request_count integer not null default 1,
  notes text,
  unique (client_slug, provider)
);

create index if not exists client_esp_interest_slug_idx
  on public.client_esp_interest (client_slug);

comment on table public.client_esp_interest is
  'Phase 1 demand capture for the multi-ESP integration feature (Mailchimp/Klaviyo/ConvertKit/ActiveCampaign/HubSpot). One row per (client_slug, provider). request_count increments on re-clicks. Used to decide which provider to build OAuth/list-sync for first.';
