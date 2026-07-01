-- Managed Domains — the "Command" center source of truth.
--
-- Purpose-built, NOT prospect-bound (the existing `domains` table is keyed by
-- prospect_id for the cold-outreach funnel; this table is for domains Ben
-- actually OPERATES — his own businesses AND every client site BlueJays
-- manages). One row per domain. Feeds /dashboard/command + the weekly
-- expiry-reminder cron (/api/cron/domain-expiry-reminder).
--
-- `auto_managed` = true means the domain lives in OUR Namecheap account and we
-- control renewal. The Namecheap sync flips this true for any domain it finds.
-- Client-owned / Wix / other-registrar domains stay auto_managed=false and get
-- their expiry filled by the RDAP lookup or manual entry.

create table if not exists managed_domains (
  id                 uuid primary key default gen_random_uuid(),
  owner_label        text not null,                       -- "LinePlay Football", "Mt View Landscaping", "BlueJays"
  client_slug        text,                                -- nullable; set for BlueJays-managed clients
  kind               text not null default 'client',      -- 'business' (Ben's own) | 'client' (BlueJays-managed)
  domain             text not null unique,
  registrar          text,                                -- 'namecheap' | 'wix' | 'godaddy' | ... | null=unknown
  auto_managed       boolean not null default false,      -- true = in our Namecheap acct, we control renewal
  status             text not null default 'active',      -- active | expired | parked | transferred
  registered_at      timestamptz,
  expires_at         timestamptz,
  hosting            text,                                -- 'Vercel' | 'Wix' | 'Squarespace' | ...
  mailboxes          text[] not null default '{}',
  expiry_source      text,                                -- 'namecheap' | 'rdap' | 'manual' | null
  expiry_checked_at  timestamptz,
  notes              text,
  metadata           jsonb not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_managed_domains_expires on managed_domains(expires_at);
create index if not exists idx_managed_domains_owner   on managed_domains(owner_label);
create index if not exists idx_managed_domains_slug    on managed_domains(client_slug);

-- Admin-only table: accessed exclusively via the service-role key from server
-- routes (which bypasses RLS). Enable RLS with NO policies so anon/authenticated
-- keys get nothing — matches every other table's posture in this project.
alter table managed_domains enable row level security;

-- keep updated_at honest on every UPDATE
create or replace function set_managed_domains_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_managed_domains_updated_at on managed_domains;
create trigger trg_managed_domains_updated_at
  before update on managed_domains
  for each row execute function set_managed_domains_updated_at();

-- ── Seed: Ben's businesses + known BlueJays-managed client domains ──
-- expires_at left NULL where unknown — the Namecheap sync + RDAP lookup fill
-- it in. auto_managed defaults false; the sync flips it true for domains found
-- in our Namecheap account. ON CONFLICT keeps this idempotent + re-runnable.

insert into managed_domains (owner_label, client_slug, kind, domain, registrar, hosting, mailboxes, notes) values
  ('BlueJays',              null,                  'business', 'bluejayportfolio.com', 'namecheap', 'Vercel', array['bluejaycontactme@gmail.com','alerts@bluejayportfolio.com','ben@bluejayportfolio.com'], 'Primary BlueJays site + sender domain (SendGrid authenticated).'),
  ('BlueJays',              null,                  'business', 'bluejaywebs.com',      'namecheap', 'Vercel', array['ben@bluejaywebs.com'], 'Backup sender domain for parallel email warmup.'),
  ('LinePlay Football',     null,                  'business', 'lineplayfootball.com', null,        null,     array[]::text[], 'Ben business — LinePlay Football apparel + community brand. Confirm registrar/hosting.'),
  ('Joe Moore Award',       null,                  'business', 'joemooreaward.com',    null,        null,     array[]::text[], 'Ben business — Joe Moore Award. Confirm registrar/hosting/mailboxes.'),
  ('Hector Landscaping',    'hector-landscaping',  'client',   'hectorlandscaping.com',null,        'Vercel', array['hectorlandscapingonline@gmail.com'], 'BlueJays-managed. Domain rewrite → /clients/hector-landscaping.'),
  ('Meyer Electric',        'meyer-electric',      'client',   'sequimelectrician.com',null,        'Vercel', array[]::text[], 'Client-owned domain. Email on Zoho Mail Lite. Rewrite → /clients/meyer-electric.'),
  ('Meyer Electric',        'meyer-electric',      'client',   'sequimelectric.com',   null,        'Vercel', array[]::text[], 'Client-owned short variant. Rewrite → /clients/meyer-electric.'),
  ('Zenith Sports (TEKKY)', 'zenith-sports',       'client',   'tekky.org',            null,        'Vercel', array['info@zenithsports.org'], 'BlueJays-managed. Rewrite → /clients/zenith-sports.'),
  ('Mt View Landscaping',   'mt-view-landscaping', 'client',   'mountainviewlandscape.com', null,   null,     array['mtviewlandscapeonline@gmail.com','info@mountainviewlandscape.com'], 'Client-owned domain. Confirm registrar.'),
  ('Lewis County Autism',   'lewis-county-autism', 'client',   'lcautism.org',         null,        'Wix',    array[]::text[], 'Nonprofit. DNS on Wix as of 2026-05-18. Client-owned — visibility only.')
on conflict (domain) do nothing;
