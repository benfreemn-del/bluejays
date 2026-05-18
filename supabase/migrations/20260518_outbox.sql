-- bj ai Day 4 — outbox table.
--
-- Drafted outreach touches waiting on Ben's approval. Written by
-- ai_skill:draft-touch. Approved either via dashboard one-tap button
-- (/dashboard/outbox) OR via SMS reply "YES <short_code>" from the
-- OWNER_PHONE_NUMBER (handled by extended /api/inbound/sms).
--
-- On approval: triggers send via the channel's sender helper, status
-- flows pending → approved → sent (or failed). Rejection is terminal:
-- pending → rejected.
--
-- short_code is 8-char alphanumeric so the SMS "Reply YES <code>"
-- pattern stays tight enough to type back on a phone keyboard.

create table if not exists outbox (
  id uuid primary key default gen_random_uuid(),
  short_code text not null unique,
  prospect_id uuid not null references prospects(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'phone')),
  subject text,
  body text not null,
  tone_notes text,
  reasoning text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'sent', 'failed')),
  ai_skill_run_id uuid,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  sent_at timestamptz,
  sent_via text,
  sent_result jsonb,
  error text
);

create index if not exists outbox_prospect_idx on outbox(prospect_id, created_at desc);
create index if not exists outbox_status_idx on outbox(status, created_at desc);
create index if not exists outbox_short_code_idx on outbox(short_code);

comment on table outbox is
  'Drafted outreach touches waiting on Ben''s approval. Written by ai_skill:draft-touch. Approved via /api/outbox/[id]/approve (dashboard button OR SMS reply YES <short_code> from OWNER_PHONE_NUMBER). On approve: triggers send via the channel''s sender helper, status flows pending → approved → sent (or failed).';
