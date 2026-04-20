-- Custom pricing tier for bespoke-built sites.
--
-- A "custom" prospect is one we've built a full custom site for (not a
-- V2-template-generated preview). Think Lewis County Autism Coalition —
-- their site lives at lcautism.org, built by hand, and they're billed
-- $100/year as a straightforward annual subscription with no separate
-- setup fee and no trial period. First $100 hits at checkout.
--
-- Two new schema bits:
--   1. custom_site_url  — absolute URL pointing to their actual live site
--                         (e.g. https://lcautism.org). For custom-tier
--                         prospects, /p/[short_code] redirects here
--                         instead of rendering a template preview.
--   2. pricing_tier     — no schema change needed (it's already a free-
--                         form text column), just adding "custom" to the
--                         app-layer TypeScript union.

alter table public.prospects
  add column if not exists custom_site_url text;

-- Optional: store comment for future agents reading the schema.
comment on column public.prospects.custom_site_url is
  'For pricing_tier=custom prospects, the absolute URL of their real live site. /p/[code] redirects here instead of rendering the template preview.';
