-- ─────────────────────────────────────────────────────────────────────────────
-- client_affiliates — per-client affiliate-prospect pipeline
--
-- Sprint 4 of the AI-package buildout. For Zenith specifically: a queue of
-- ECNL coach lists / youth clubs / soccer influencers we can pitch as
-- TEKKY affiliates. Tracking who's been contacted, who replied, who
-- onboarded.
--
-- Why this is separate from client_leads: client_leads = prospect
-- customers (parent buying a ball, coach demoing for their team).
-- client_affiliates = potential RESELLERS who'd send buyers our way for
-- a referral fee. Different funnel, different tone, different metrics.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_affiliates (
  id uuid primary key default gen_random_uuid(),

  client_slug text not null,

  -- Identity
  contact_name text,
  org_name text not null,                          -- "Crossfire Premier ECNL"
  role text,                                       -- "Director of Coaching"
  email text,
  phone text,
  website text,

  -- Geographic + categorical context — used for prioritization.
  city text,
  state text,
  region text,                                     -- Pacific NW / West / etc.
  channel text                                     -- "club" | "coach" | "influencer" | "podcast" | "media"
    check (channel is null or channel in ('club', 'coach', 'influencer',
                                          'podcast', 'media', 'parent-group')),

  -- Score 0-100 from the discovery scorer (see scoring.ts). Higher =
  -- better fit for a TEKKY pitch.
  fit_score int default 50 check (fit_score >= 0 and fit_score <= 100),

  -- Pipeline lifecycle.
  status text not null default 'cold'
    check (status in ('cold', 'queued', 'contacted', 'replied', 'onboarded',
                      'declined', 'do-not-contact')),

  -- Touchpoints
  last_contacted_at timestamptz,
  contact_count int not null default 0,
  responded_at timestamptz,
  onboarded_at timestamptz,

  -- Free-form fields.
  notes text,
  source text,                                     -- "ECNL coach roster scrape" | "Twitter follow" | "manual"
  raw_payload jsonb default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_affiliates_client_status_idx
  on public.client_affiliates (client_slug, status, fit_score desc);
create index if not exists client_affiliates_email_idx
  on public.client_affiliates (lower(email))
  where email is not null;

create or replace function public.client_affiliates_touch()
returns trigger as $$
begin
  new.updated_at := now();
  if new.status = 'contacted' and old.status <> 'contacted' then
    new.last_contacted_at := coalesce(new.last_contacted_at, now());
    new.contact_count := old.contact_count + 1;
  end if;
  if new.status = 'replied' and old.status <> 'replied' then
    new.responded_at := coalesce(new.responded_at, now());
  end if;
  if new.status = 'onboarded' and old.status <> 'onboarded' then
    new.onboarded_at := coalesce(new.onboarded_at, now());
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_affiliates_touch on public.client_affiliates;
create trigger client_affiliates_touch
  before update on public.client_affiliates
  for each row execute function public.client_affiliates_touch();
