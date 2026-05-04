-- ─────────────────────────────────────────────────────────────────────────────
-- client_leads — per-client lead capture (Zenith inquiries, Wholme bookings,
-- Mt View estimates, etc.)
--
-- Right now /api/clients/inquire only fires owner alerts (SMS + email to Ben)
-- and disappears. Sprint 1 of the AI-package buildout needs leads to PERSIST
-- somewhere queryable so:
--   • Per-client lead dashboards can list them
--   • Funnel engine has a queue to enroll leads into
--   • Reply detection has a row to flip to "responded"
--   • Performance reports can count conversions
--
-- One row per lead. Cross-references the client by slug (matches the
-- /clients/[slug] route + SLUG_CONFIG in api/clients/inquire/route.ts).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_leads (
  id uuid primary key default gen_random_uuid(),

  -- Which client owns this lead (zenith-sports, wholme-naturopathy, etc.).
  client_slug text not null,

  -- Which of the client's audience segments this lead falls into. Null
  -- means we couldn't auto-detect — surfaces in the dashboard for manual
  -- tagging. For Zenith specifically: parent | coach | player.
  audience_segment text
    check (audience_segment is null or audience_segment in (
      'parent', 'coach', 'player', 'club', 'unknown'
    )),

  -- Identity (all optional — different forms collect different fields).
  name text,
  email text,
  phone text,

  -- What brought them in. Free-form so we can use whatever the source
  -- form labels its intent radios with ("Player Challenge", "Training
  -- Guide PDF", "Camp finder", "Club demo request", etc.).
  intent text,

  -- Where this lead came from on the site. Examples:
  --   "main-inquiry-form"    — the big form on /clients/zenith-sports
  --   "email-capture"        — small inline EmailCapture component
  --   "missed-call-text"     — from a missed-call → text-back webhook
  --   "shop-cart-abandon"    — future: Shopify cart abandonment hook
  --   "qr-card"              — future: QR-card scan from a camp/demo
  source text,

  -- Full original payload from the form so we can re-derive anything
  -- later without losing data. JSONB lets us query into it if needed.
  raw_payload jsonb not null default '{}'::jsonb,

  -- Funnel position. "not_enrolled" = lead exists but funnel hasn't
  -- picked it up yet (e.g. cron hasn't run). "enrolled" = currently
  -- being touched. "paused" = client manually paused (e.g. waiting on
  -- info). "responded" = lead replied; funnel stops automatically.
  -- "converted" = booked / paid / shopped. "completed" = funnel exhausted
  -- without conversion.
  funnel_status text not null default 'not_enrolled'
    check (funnel_status in (
      'not_enrolled', 'enrolled', 'paused', 'responded', 'converted', 'completed'
    )),

  -- Which funnel step we're currently on (0-indexed). NULL until enrolled.
  funnel_step int,

  -- Stamps for funnel logic + reporting.
  enrolled_at timestamptz,
  responded_at timestamptz,
  last_contact_at timestamptz,
  converted_at timestamptz,

  -- Owner notes (Ben can scribble per-lead context, e.g. "called Mom,
  -- son tried out in WA Premier last week"). Keeps lightweight context
  -- without needing a separate threading table.
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Most-common queries.
create index if not exists client_leads_client_status_idx
  on public.client_leads (client_slug, funnel_status);
create index if not exists client_leads_client_audience_idx
  on public.client_leads (client_slug, audience_segment);
-- For inbound reply detection — match on email/phone fast.
create index if not exists client_leads_email_idx
  on public.client_leads (lower(email))
  where email is not null;
create index if not exists client_leads_phone_idx
  on public.client_leads (phone)
  where phone is not null;

-- Auto-touch updated_at and stamp transitions.
create or replace function public.client_leads_touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  if new.funnel_status = 'responded' and old.funnel_status <> 'responded' then
    new.responded_at := coalesce(new.responded_at, now());
  end if;
  if new.funnel_status = 'converted' and old.funnel_status <> 'converted' then
    new.converted_at := coalesce(new.converted_at, now());
  end if;
  if new.funnel_status = 'enrolled' and old.funnel_status <> 'enrolled' then
    new.enrolled_at := coalesce(new.enrolled_at, now());
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_leads_touch_updated_at on public.client_leads;
create trigger client_leads_touch_updated_at
  before update on public.client_leads
  for each row execute function public.client_leads_touch_updated_at();

comment on table public.client_leads is
  'Per-client lead persistence. Sourced from /api/clients/inquire form posts. Feeds the per-audience funnel engine and per-client lead dashboards.';
