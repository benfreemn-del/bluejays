-- CTA experiment events for showcase pages.
--
-- Tracks impressions + clicks per variant per visitor so the dashboard
-- can run Wilson-CI on showcase CTA copy. Each row is one event;
-- session_id ties impressions to clicks within a single browser session.

create table if not exists public.client_cta_events (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  experiment_id text not null,         -- e.g. "hero-cta"
  variant_id text not null,            -- e.g. "build-your-player" / "talk-to-philip"
  event text not null,                 -- "impression" | "click"
  session_id text not null,            -- random UUID minted client-side
  url text,                            -- the page where it fired
  created_at timestamptz not null default now()
);

create index if not exists client_cta_events_slug_exp_idx
  on public.client_cta_events (client_slug, experiment_id, variant_id, event);
