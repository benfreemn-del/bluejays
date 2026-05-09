-- ─────────────────────────────────────────────────────────────────────────────
-- 20260509 — client_ad_accounts — OAuth + token storage for tenant
-- ad-platform connections (Google Ads, Meta Ads, Lob).
--
-- Each row = one tenant's connection to one platform. Refresh tokens
-- encrypted at rest via pgcrypto with the AD_OAUTH_KEY env-var secret.
-- Access tokens live in memory only (re-derived on demand).
--
-- Status lifecycle:
--   pending → active (after OAuth callback writes refresh_token)
--   active → expired (after 3+ consecutive 401s — prompts owner reconnect)
--   active → revoked (owner manually disconnects)
--   active → failed (other API errors during refresh)
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

create table if not exists public.client_ad_accounts (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  platform text not null check (platform in ('google_ads', 'meta_ads', 'lob')),
  external_account_id text not null,
  external_account_name text,
  refresh_token_encrypted bytea,
  scopes jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'expired', 'revoked', 'failed')),
  last_used_at timestamptz,
  last_refreshed_at timestamptz,
  consecutive_failures integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_slug, platform)
);

create index if not exists client_ad_accounts_status_idx
  on public.client_ad_accounts (status, client_slug)
  where status = 'active';

create or replace function public.client_ad_accounts_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists client_ad_accounts_touch on public.client_ad_accounts;
create trigger client_ad_accounts_touch
  before update on public.client_ad_accounts
  for each row execute function public.client_ad_accounts_touch();
