-- ─────────────────────────────────────────────────────────────────────────────
-- client_owner_preferences — per-owner notification + display settings.
--
-- One row per client_owners.id. The portal Account tab UI manages these.
-- The inquire route reads them when a new lead lands to decide whether
-- to email the owner immediately ("instant" mode) or batch up for the
-- daily digest ("digest" mode).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_owner_preferences (
  owner_id uuid primary key references public.client_owners(id) on delete cascade,

  -- New-lead notifications:
  --   instant  — email the moment a new lead lands
  --   digest   — single daily email at 9am local with the day's leads
  --   off      — never auto-email; owner checks portal manually
  new_lead_email text not null default 'instant'
    check (new_lead_email in ('instant', 'digest', 'off')),

  -- SMS notifications (only fires when phone is set on the owner row).
  -- Cheaper to ship as off-by-default since most owners haven't given us
  -- a number yet.
  new_lead_sms text not null default 'off'
    check (new_lead_sms in ('instant', 'digest', 'off')),

  -- For "instant" mode — only fire if the lead matches one of these
  -- audiences. Empty array = all audiences. Lets a client say "only
  -- text me on coach leads, drip the parents into the digest."
  instant_audience_filter text[] default '{}',

  -- Digest delivery hour in local timezone (24h, 0-23). 9 = 9am.
  digest_hour int not null default 9 check (digest_hour >= 0 and digest_hour <= 23),
  digest_timezone text not null default 'America/Los_Angeles',

  -- Digest sent timestamps for cron de-dup.
  last_digest_sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.client_owner_preferences_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_owner_preferences_touch on public.client_owner_preferences;
create trigger client_owner_preferences_touch
  before update on public.client_owner_preferences
  for each row execute function public.client_owner_preferences_touch();
