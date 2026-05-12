-- bluejays_users — BlueJays-internal sales/owner staff.
--
-- Before this migration, login was env-password only (ADMIN_PASSWORD +
-- ADMIN_PASSWORD_MADIE). That hits a ceiling at ~3 people. This table
-- lets Ben add new sales reps without touching env vars.
--
-- Login flow (see /api/auth/login):
--   1. Try email + password against this table (sha256 + portal salt).
--   2. Fall back to legacy ADMIN_PASSWORD_BEN / _MADIE for backwards
--      compatibility — Ben + Madie's existing logins keep working until
--      they update their password from /dashboard/team.
--
-- Role values match the existing useRole() enum: 'owner' | 'sales'.
--
-- Why no client_owners reuse: those are *client-side* portal logins.
-- This table is for the BlueJays operating team (owner + salespeople).
-- Mixing them would couple two unrelated authz models.

create table if not exists bluejays_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null default 'sales'
    check (role in ('owner', 'sales')),
  password_hash text,  -- sha256(plain || PORTAL_PASSWORD_SALT). Null = not yet set.
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bluejays_users_email_idx on bluejays_users(lower(email));
create index if not exists bluejays_users_active_idx on bluejays_users(active);

create or replace function touch_bluejays_users_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bluejays_users_updated_at on bluejays_users;
create trigger trg_bluejays_users_updated_at
  before update on bluejays_users
  for each row execute function touch_bluejays_users_updated_at();

-- Seed the current team. Password hashes are placeholders — Ben should
-- rotate via /dashboard/team. The default plaintext passwords are
-- "<name>-temp-2026" so handoff to Raidas + Tyler is straightforward.
--
-- Computed offline:
--   sha256("ben-temp-2026" || "bluejays-portal-salt-v1")    = 7ccf4...
--   sha256("madie-temp-2026" || "bluejays-portal-salt-v1")  = a4cf1...
--   sha256("raidas-temp-2026" || "bluejays-portal-salt-v1") = computed at runtime
--   sha256("tyler-temp-2026" || "bluejays-portal-salt-v1")  = computed at runtime
--
-- Rather than embedding hashes here (PORTAL_SALT depends on env), the
-- /dashboard/team page exposes a "Reset password" action that recomputes
-- the hash with the live salt. Initial password_hash is NULL — the user
-- must use the legacy env-password flow OR Ben sets a password from
-- /dashboard/team before they can use email-based login.

insert into bluejays_users (email, name, role, active, password_hash)
values
  ('benfreemn@gmail.com', 'Ben Freeman', 'owner', true, null),
  ('madie@bluejays.work', 'Madie',         'sales', true, null),
  ('raidas232@gmail.com', 'Raidas',        'sales', true, null),
  ('tyler.fritz@bluejays.local', 'Tyler Fritz (email TBD)', 'sales', true, null)
on conflict (email) do nothing;

-- Per-prospect assignment so each salesperson can see "their" pipeline.
-- Null = unassigned (visible to everyone). Filtering lives in the API
-- route handlers: role='sales' sees only assigned-to-me + unassigned.
alter table prospects
  add column if not exists assigned_to_user_id uuid references bluejays_users(id) on delete set null;

create index if not exists prospects_assigned_to_idx on prospects(assigned_to_user_id);
