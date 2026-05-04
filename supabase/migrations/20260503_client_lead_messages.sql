-- ─────────────────────────────────────────────────────────────────────────────
-- client_lead_messages — every outbound or inbound message sent on behalf of
-- a client_lead (Sprint 2 of the AI-package buildout).
--
-- Each row is one message. Outbound rows are written by the funnel runner
-- before sending so that a crash mid-send doesn't leave us in an unknown
-- state — `status` reflects send outcome.
--
-- Inbound rows are written by the existing /api/inbound/sms and
-- /api/inbound/email handlers when a reply matches a known client_lead.
-- That's how we detect "responded" and pause the funnel.
--
-- The (lead_id, funnel_step, channel) combo lets the runner dedupe so a
-- restarted cron doesn't double-send the same touch.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_lead_messages (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid not null references public.client_leads(id) on delete cascade,
  client_slug text not null,

  -- Which funnel step generated this message. NULL for inbound messages
  -- (replies don't belong to a step).
  funnel_step int,

  channel text not null check (channel in ('email', 'sms', 'voicemail')),
  direction text not null default 'outbound'
    check (direction in ('outbound', 'inbound')),

  -- Address used. For outbound: the lead's email/phone we sent to.
  -- For inbound: the address the reply came FROM (used to match leads).
  to_address text,
  from_address text,

  subject text,            -- email only
  body text,               -- final rendered body
  template_id text,        -- which template (eg. "parents.day0.email") for analytics
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'bounced', 'delivered',
                      'replied', 'skipped')),
  provider text,           -- 'sendgrid' | 'twilio' | 'vonage' | 'mock'
  provider_id text,        -- external message id from the provider
  error text,              -- error string if status='failed'

  sent_at timestamptz not null default now()
);

-- Most-common queries.
create index if not exists client_lead_messages_lead_idx
  on public.client_lead_messages (lead_id, sent_at desc);

create index if not exists client_lead_messages_client_idx
  on public.client_lead_messages (client_slug, sent_at desc);

-- Dedupe lookup for the runner — fast "have we already sent this step?".
create unique index if not exists client_lead_messages_dedupe_idx
  on public.client_lead_messages (lead_id, funnel_step, channel)
  where direction = 'outbound' and funnel_step is not null;

comment on table public.client_lead_messages is
  'Per-client_lead message log (outbound funnel sends + inbound replies). Sprint 2 of the AI-package buildout.';
