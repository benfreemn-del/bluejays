-- Partner workspace — /partners/work logged-in dialer for sisters /
-- 1099 contractors. Adds:
--   * agreement timestamp + last login on partners
--   * partner_calls log (one row per dial outcome)
--
-- Auth uses signed HMAC cookies (no DB sessions), so no session table.
-- Login form gates on email + partner code (one-factor — fine for
-- internal team; tighten to email-magic-link before opening to outside).

alter table partners
  add column if not exists agreement_accepted_at timestamptz,
  add column if not exists last_login_at timestamptz,
  add column if not exists daily_call_goal int default 10;

create table if not exists partner_calls (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners(id) on delete cascade,
  -- Loose FK on prospect_id — same pattern as partner_referrals so
  -- prospect deletes don't cascade into history.
  prospect_id uuid not null,
  -- One of:
  --   no_answer                — phone rang, no pickup
  --   voicemail                — left a voicemail
  --   wrong_number             — disconnected / wrong person
  --   answered_not_interested  — picked up, said no
  --   answered_call_scheduled  — PRIMARY WIN — booked Ben's calendar
  --   answered_audit_sent      — fallback — texted audit link only
  --   answered_callback        — asked us to call back later
  --   do_not_call              — TCPA flag — also sets prospect.dnc=true
  outcome text not null,
  notes text,
  -- ISO timestamp when the partner clicked "send audit link" — null if
  -- they never sent one for this dial. Used to compute a side-stat
  -- ("audits sent today").
  audit_link_sent_at timestamptz,
  called_at timestamptz not null default now()
);

create index if not exists partner_calls_partner_idx
  on partner_calls(partner_id, called_at desc);
create index if not exists partner_calls_prospect_idx
  on partner_calls(prospect_id, called_at desc);
create index if not exists partner_calls_outcome_idx
  on partner_calls(outcome, called_at desc);
