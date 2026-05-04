-- ─────────────────────────────────────────────────────────────────────────────
-- client_owners — per-client portal credentials.
--
-- Each row = one human (Philip Lund, Paul Hanson, etc.) who can log into
-- THEIR client's portal at /clients/[slug]/portal. Multiple owners per
-- client supported — Zenith has 2 founders, Wholme has 1, etc.
--
-- Auth model:
--   Cookie name: `client-portal-session`
--   Cookie value: `{owner_id}.{sha256(owner_id + password_hash + portal_salt)}`
--   The owner-specific signature means changing a password instantly
--   invalidates all of THAT owner's cookies (other owners unaffected).
--
-- Password hashing: sha256(plain || PORTAL_PASSWORD_SALT). Same one-way
-- hash family as the existing admin auth — minimal new dependency footprint.
-- For a real production rollout we'd swap to bcrypt or argon2; sha256 is
-- fine for the single-owner-per-business + low-traffic reality of these
-- portals.
--
-- Scope: portal users see ONLY data for their own client_slug (enforced in
-- the route handlers). They get read-only access to ads/affiliates/reports,
-- and read+write on their leads (notes, status flips).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_owners (
  id uuid primary key default gen_random_uuid(),

  -- Which client this owner belongs to (foreign-keyed by slug, not by
  -- prospects.id, because client_slug is the canonical handle for these
  -- bespoke showcase clients).
  client_slug text not null,

  -- Identity.
  email text not null,
  name text,

  -- Hashed password. NEVER store plaintext. See sha256Password() in
  -- src/lib/client-auth.ts.
  password_hash text not null,

  -- Role differentiation. "owner" sees + edits everything; "manager"
  -- and "viewer" tiers reserved for future scope (e.g. "view leads but
  -- not change status"). Not enforced yet — all roles get the same
  -- access today.
  role text not null default 'owner'
    check (role in ('owner', 'manager', 'viewer')),

  -- Activity stamps for the dashboard "last seen" view + security audit.
  last_login_at timestamptz,
  last_login_ip text,
  failed_attempts int not null default 0,
  locked_until timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Email is the login handle — must be globally unique even though
-- multiple clients can have the same business name. (Philip can't have
-- accounts on two different client portals with the same email — he'd
-- use a different email per portal.)
create unique index if not exists client_owners_email_unique
  on public.client_owners (lower(email));

create index if not exists client_owners_client_slug_idx
  on public.client_owners (client_slug);

create or replace function public.client_owners_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_owners_touch on public.client_owners;
create trigger client_owners_touch
  before update on public.client_owners
  for each row execute function public.client_owners_touch();

comment on table public.client_owners is
  'Per-client portal credentials. One row per human who can log into a /clients/[slug]/portal.';
