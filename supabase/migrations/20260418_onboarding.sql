-- Post-purchase onboarding flow
--
-- New customers land on /onboarding/[id] after Stripe checkout success. They
-- fill out a form capturing their real content (services, hours, brand colors,
-- logo, photos, testimonials, domain preferences, etc.) so Ben can customize
-- the template into a real production site.

-- Table: one row per prospect after they submit the onboarding form.
create table if not exists public.onboarding (
  prospect_id uuid primary key references public.prospects(id) on delete cascade,
  business_name text not null,
  submitted_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb
);

create index if not exists onboarding_submitted_at_idx
  on public.onboarding (submitted_at desc);

-- Track when we sent the 30-minute "haven't submitted yet" reminder so we
-- don't double-send. NULL = not sent yet.
alter table public.prospects
  add column if not exists onboarding_reminder_sent_at timestamptz;

-- Welcome email sent status so the webhook can be idempotent.
alter table public.prospects
  add column if not exists welcome_email_sent_at timestamptz;
