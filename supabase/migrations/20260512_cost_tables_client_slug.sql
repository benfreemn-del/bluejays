-- ─────────────────────────────────────────────────────────────────────────────
-- Tenant-aware spending: add client_slug to the cost tables.
--
-- Until now system_costs + recurring_costs were global — every API
-- call from every client landed in one bucket. Slicing per-client
-- ROI / per-client burn was impossible.
--
-- This migration adds an OPTIONAL client_slug column to both tables.
-- Existing rows stay null (truly global infra costs like the Vercel
-- Pro plan or Claude Max stay client_slug=null and roll up across
-- all tenants). New cost rows that originate from a specific
-- client's pipeline (their AI inbound responder, their lead-scrape,
-- their inbound SMS alert) get the slug attached at logCost() time.
-- ─────────────────────────────────────────────────────────────────────────────

-- system_costs (per-API-call cost rows)
alter table public.system_costs
  add column if not exists client_slug text;

create index if not exists system_costs_client_slug_idx
  on public.system_costs (client_slug, created_at desc)
  where client_slug is not null;

comment on column public.system_costs.client_slug is
  'Optional. When set, this cost row is attributed to a specific BlueJays client (e.g. zenith-sports, itc-quick-attach). NULL = shared / cross-client infra (Vercel, Claude Max, dev-tooling).';

-- recurring_costs (subscription line items)
alter table public.recurring_costs
  add column if not exists client_slug text;

create index if not exists recurring_costs_client_slug_idx
  on public.recurring_costs (client_slug)
  where client_slug is not null;

comment on column public.recurring_costs.client_slug is
  'Optional. When set, this subscription is dedicated to one BlueJays client (their own Twilio number, their dedicated SendGrid sub-account). NULL = shared infra (Vercel Pro, Claude Max, etc.).';
