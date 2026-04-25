-- Wave-2 LTV protection: email retry queue + renewal email tracking.
--
-- The Stripe webhook (`/api/webhooks/stripe`) calls `sendEmail()` for the
-- post-purchase welcome email. SendGrid is normally reliable but a 429
-- rate-limit or transient outage on the exact second of payment used to
-- result in the customer never getting their welcome email — the catch
-- block logged and swallowed and `welcomeEmailSentAt` stayed null.
--
-- This table queues failed sends. The daily
-- `/api/billing/retry-failed-sends` cron drains the queue with exponential
-- backoff (1h → 4h → 24h between attempts). After 3 failures, the row is
-- marked `failed` and Ben gets an SMS so he can intervene manually.
--
-- The same table also handles failed renewal-reminder emails (30-day and
-- 7-day pre-charge nudges) and any other transactional email that the
-- pipeline can't afford to silently drop.

create table if not exists public.email_retry_queue (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  email_type text not null,
  -- 'welcome' | 'handoff' | 'renewal_30' | 'renewal_7' | 'payment_failed'
  -- | 'payment_failed_urgent' | other transactional types as added
  attempts int not null default 0,
  last_attempt_at timestamptz,
  last_error text,
  status text not null default 'pending',
  -- 'pending' | 'succeeded' | 'failed'
  -- 'pending' = needs attempt, 'succeeded' = sent ok, 'failed' = exhausted retries
  next_attempt_at timestamptz default now(),
  -- when the cron should next try this row. Updated on each failure with
  -- exponential backoff so we don't hammer SendGrid.
  payload jsonb,
  -- optional: cached subject/body so the cron can re-send without
  -- re-rendering the template (preserves any prospect data that may have
  -- changed by the time the retry fires).
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_email_retry_status
  on public.email_retry_queue (status);

create index if not exists idx_email_retry_next_attempt
  on public.email_retry_queue (next_attempt_at)
  where status = 'pending';

create index if not exists idx_email_retry_prospect
  on public.email_retry_queue (prospect_id);

-- Tracks which renewal-reminder emails have been sent for a given
-- subscription. Prevents the daily upcoming-renewals cron from re-sending
-- the same 30-day or 7-day reminder if it runs twice or if the cron's
-- date-range query overlaps. One row per (prospect_id, kind) — `kind` is
-- '30' or '7' for the 30-day-out and 7-day-out emails respectively.

create table if not exists public.renewal_reminders (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  subscription_id text not null,
  kind text not null check (kind in ('30', '7')),
  scheduled_charge_at timestamptz not null,
  sent_at timestamptz not null default now(),
  unique (prospect_id, subscription_id, kind, scheduled_charge_at)
);

create index if not exists idx_renewal_reminders_prospect
  on public.renewal_reminders (prospect_id);

create index if not exists idx_renewal_reminders_sub
  on public.renewal_reminders (subscription_id);

-- Tracks Stripe payment failure attempts per subscription so we can
-- escalate after the 3rd consecutive `invoice.payment_failed` event.
-- Reset to 0 when a subsequent invoice succeeds.

alter table public.prospects
  add column if not exists payment_failure_count int default 0;

alter table public.prospects
  add column if not exists last_payment_failure_at timestamptz;
