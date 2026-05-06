-- Per-client team-member roster.
--
-- Lets clients (Tekky's Philip + Paul, future clients with their own
-- co-founders) self-add new tasks AND pick who's responsible — Ben
-- (us), or any of their own teammates.
--
-- Each row is one assignable person. is_primary=true marks the main
-- contact for the client; sort_order controls the dropdown order.

create table if not exists public.client_team_members (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  name text not null,
  email text not null,
  -- Used in the client_tasks "assigned to Ben" notification path so
  -- we can detect when a task assignment should email us instead of
  -- the client themselves. true for Ben/our-side rows.
  is_bluejays_team boolean not null default false,
  is_primary boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_team_members_slug_idx
  on public.client_team_members (client_slug, sort_order);

create or replace function public.touch_client_team_members_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_team_members_updated_at on public.client_team_members;
create trigger client_team_members_updated_at
  before update on public.client_team_members
  for each row execute function public.touch_client_team_members_updated_at();

-- Add assignment columns to client_tasks. Free-text rather than FK so
-- a deleted team member doesn't orphan historical assignments — we
-- want the "this was assigned to Philip in March" record to survive.
alter table public.client_tasks
  add column if not exists assigned_to_name text,
  add column if not exists assigned_to_email text;

-- Seed Tekky team. Idempotent — gated on each row's email so re-runs
-- don't duplicate.
do $$
begin
  if not exists (
    select 1 from public.client_team_members
    where client_slug = 'zenith-sports'
      and email = 'ben@bluejayportfolio.com'
  ) then
    insert into public.client_team_members
      (client_slug, name, email, is_bluejays_team, is_primary, sort_order)
    values
      -- Ben — BlueJays. is_bluejays_team=true so the email-on-assign
      -- path knows to ping us when a task lands on him.
      ('zenith-sports', 'Ben (BlueJays)', 'ben@bluejayportfolio.com', true, false, 10),
      ('zenith-sports', 'Philip Lund', 'philip@zenithsports.org', false, true, 20),
      ('zenith-sports', 'Paul Hanson', 'paul@zenithsports.org', false, false, 30);
  end if;
end $$;
