-- ─────────────────────────────────────────────────────────────────────────────
-- 20260509 — calendar-availability skill schema
--
-- Three pieces:
--   1. client_calendar_accounts  — per-(slug, provider) OAuth state for
--      Google Calendar / Calendly / Cal.com connections
--   2. client_calendar_working_hours — owner's weekly availability template
--      (used to derive bookable slots when an OAuth provider is connected)
--   3. RPC pair calendar_account_upsert_token / calendar_account_get_token
--      for pgp_sym-encrypted refresh tokens — same pattern as ad_oauth.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_calendar_accounts (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  provider text not null check (provider in ('google_calendar', 'calendly', 'cal_com')),
  external_account_id text not null,
  external_account_email text,
  refresh_token_encrypted bytea,
  scopes jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'expired', 'revoked', 'failed')),
  last_synced_at timestamptz,
  last_refreshed_at timestamptz,
  consecutive_failures integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_slug, provider)
);

create index if not exists client_calendar_accounts_status_idx
  on public.client_calendar_accounts (status, client_slug)
  where status = 'active';

create or replace function public.client_calendar_accounts_touch()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists client_calendar_accounts_touch on public.client_calendar_accounts;
create trigger client_calendar_accounts_touch
  before update on public.client_calendar_accounts
  for each row execute function public.client_calendar_accounts_touch();

create table if not exists public.client_calendar_working_hours (
  client_slug text primary key,
  timezone text not null default 'America/Los_Angeles',
  weekly jsonb not null default '{}'::jsonb,
  buffer_minutes integer not null default 15,
  slot_duration_minutes integer not null default 90,
  blackouts jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.client_calendar_working_hours_touch()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists client_calendar_working_hours_touch on public.client_calendar_working_hours;
create trigger client_calendar_working_hours_touch
  before update on public.client_calendar_working_hours
  for each row execute function public.client_calendar_working_hours_touch();

create or replace function public.calendar_account_upsert_token(
  p_client_slug text,
  p_provider text,
  p_refresh_token text,
  p_external_account_id text,
  p_external_account_email text,
  p_scopes jsonb,
  p_encryption_key text
) returns void language plpgsql security definer as $$
begin
  insert into public.client_calendar_accounts (
    client_slug, provider, refresh_token_encrypted,
    external_account_id, external_account_email, scopes, status, last_refreshed_at
  ) values (
    p_client_slug, p_provider,
    pgp_sym_encrypt(p_refresh_token, p_encryption_key),
    p_external_account_id, p_external_account_email, p_scopes,
    'active', now()
  )
  on conflict (client_slug, provider) do update set
    refresh_token_encrypted = excluded.refresh_token_encrypted,
    external_account_id = excluded.external_account_id,
    external_account_email = excluded.external_account_email,
    scopes = excluded.scopes,
    status = 'active',
    last_refreshed_at = now(),
    consecutive_failures = 0,
    last_error = null;
end;
$$;

create or replace function public.calendar_account_get_token(
  p_client_slug text, p_provider text, p_encryption_key text
) returns text language plpgsql security definer as $$
declare v_token text;
begin
  select pgp_sym_decrypt(refresh_token_encrypted, p_encryption_key)
    into v_token
    from public.client_calendar_accounts
    where client_slug = p_client_slug and provider = p_provider and status = 'active'
    limit 1;
  return v_token;
end;
$$;

revoke all on function public.calendar_account_upsert_token(text, text, text, text, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.calendar_account_get_token(text, text, text) from public, anon, authenticated;
grant execute on function public.calendar_account_upsert_token(text, text, text, text, text, jsonb, text) to service_role;
grant execute on function public.calendar_account_get_token(text, text, text) to service_role;
