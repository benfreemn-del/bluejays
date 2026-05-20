-- ─────────────────────────────────────────────────────────────────────────────
-- owner_notification_prefs — Ben's per-client notification preferences.
--
-- One row per client_slug. Drives which channels (email / sms / dashboard)
-- get fired when a per-client event triggers sendOwnerEmail() or
-- sendOwnerAlert(). When a non-"instant" frequency is set, the event
-- gets queued into owner_notification_queue and drained by the digest
-- cron at the requested cadence.
--
-- Defaults: instant on email + sms, dashboard signal on. Preserves the
-- pre-2026-05-20 behavior for any slug that doesn't yet have a row.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.owner_notification_prefs (
  client_slug text primary key,

  -- Email cadence:
  --   instant — fire SendGrid immediately (current behavior)
  --   daily   — queue, drain once a day in one digest
  --   weekly  — queue, drain once a week in one digest
  --   off     — silently drop
  email_frequency text not null default 'instant'
    check (email_frequency in ('instant', 'daily', 'weekly', 'off')),

  -- SMS cadence (Twilio → Ben's phone):
  --   instant — fire Twilio immediately
  --   daily   — queue, drain once a day in one SMS digest
  --   off     — silently drop
  -- Weekly SMS intentionally not offered — too sparse to matter.
  sms_frequency text not null default 'instant'
    check (sms_frequency in ('instant', 'daily', 'off')),

  -- In-app dashboard signal (agent_signals feed). Always cheap, always
  -- recorded for audit; this toggle just controls whether the signals
  -- panel surfaces them.
  dashboard_signal boolean not null default true,

  -- Last-digest send timestamps for cron de-dup.
  last_email_digest_at timestamptz,
  last_sms_digest_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.owner_notification_prefs_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists owner_notification_prefs_touch on public.owner_notification_prefs;
create trigger owner_notification_prefs_touch
  before update on public.owner_notification_prefs
  for each row execute function public.owner_notification_prefs_touch();

-- ─────────────────────────────────────────────────────────────────────────────
-- owner_notification_queue — pending email/SMS rows waiting for the
-- next daily or weekly digest. Drained by /api/cron/owner-notification-digest.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.owner_notification_queue (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  channel text not null check (channel in ('email', 'sms')),
  subject text,
  body text not null,
  prospect_id uuid,
  queued_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists owner_notification_queue_pending_idx
  on public.owner_notification_queue (client_slug, channel, sent_at)
  where sent_at is null;

create index if not exists owner_notification_queue_queued_at_idx
  on public.owner_notification_queue (queued_at desc);
