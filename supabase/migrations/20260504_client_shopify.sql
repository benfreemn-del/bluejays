-- ─────────────────────────────────────────────────────────────────────────────
-- client_shopify — Shopify store connection per client.
--
-- One row per (client_slug, store_url). For now this table just tracks
-- the connection STATE — the actual API calls live in src/lib/client-shopify.ts
-- and gracefully no-op until a row exists with verified credentials.
--
-- Connection flow (when client is ready to flip on Shopify):
--   1. Owner clicks "Connect Shopify" in portal Account tab
--   2. We OAuth into their Shopify Admin via the Shopify App URL
--   3. Persist the access_token (encrypted at the application layer)
--   4. /api/client-portal/shopify/* routes start returning real data
--
-- Until step 4, the portal Insights tab shows "Connect Shopify to see
-- revenue" placeholders instead of dummy zeros.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_shopify (
  id uuid primary key default gen_random_uuid(),

  client_slug text not null,
  store_url text not null,                    -- e.g. "zenithsports.myshopify.com"

  -- Encrypted via APP_LEVEL_ENCRYPTION (TODO: implement). Plaintext
  -- for prototype phase, NEVER ship to prod with raw tokens.
  access_token_encrypted text,

  -- OAuth scopes granted (CSV, e.g. "read_orders,read_products,read_customers")
  scopes text,

  -- Sync state.
  status text not null default 'pending'
    check (status in ('pending', 'connected', 'reauth_required', 'disconnected', 'error')),
  last_sync_at timestamptz,
  last_sync_error text,

  -- Cached aggregates so the Insights tab doesn't need a live Shopify
  -- call on every page load. Synced periodically by the cron in
  -- src/lib/client-shopify.ts.
  cached_metrics jsonb default '{}'::jsonb,
  cached_at timestamptz,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists client_shopify_slug_unique
  on public.client_shopify (client_slug);

create or replace function public.client_shopify_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_shopify_touch on public.client_shopify;
create trigger client_shopify_touch
  before update on public.client_shopify
  for each row execute function public.client_shopify_touch();
