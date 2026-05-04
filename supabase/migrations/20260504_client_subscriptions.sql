-- ─────────────────────────────────────────────────────────────────────────────
-- client_subscriptions — per-client AI/infra subscription tracking
--
-- Tracks which AI add-on subscriptions each AI Package client has active:
--   hyperloop  — auto-learning funnel + ad optimization
--   claude     — AI variant generation, reply drafting, content suggestions
--   twilio     — SMS + voice infrastructure (their own Twilio account)
--   sendgrid   — email infrastructure (their own SendGrid account)
--
-- Service tiers in code (src/lib/client-subscriptions.ts) define pricing
-- + features. This table tracks the lifecycle: trialing → active → paused
-- → cancelled, plus who's footing the bill (managed_by = bluejays|client).
--
-- "Frictionless onboarding" = we (BlueJays) start the client on our
-- managed accounts (managed_by='bluejays', trialing) for the first 30
-- days, then transition to their own (managed_by='client') with their
-- own credentials. The system degrades gracefully if a subscription
-- lapses — see client-subscriptions.ts capability checks.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_subscriptions (
  id uuid primary key default gen_random_uuid(),

  client_slug text not null,
  service text not null
    check (service in ('hyperloop', 'claude', 'twilio', 'sendgrid', 'meta-ads', 'google-ads')),
  tier text not null,            -- 'none' | 'starter' | 'pro' | 'elite' | service-specific

  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'paused', 'cancelled')),

  monthly_price_usd numeric(10, 2),

  -- Lifecycle stamps
  started_at timestamptz not null default now(),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,

  -- Account ownership
  managed_by text not null default 'bluejays'
    check (managed_by in ('bluejays', 'client')),
  -- For BYO services: external account reference (their Stripe sub id,
  -- their Twilio account SID, their Anthropic workspace ID, etc).
  external_account_ref text,

  -- API key handoff (encrypted/redacted at the application layer if used).
  -- Most credentials live in env vars per-client (e.g. ZENITH_TWILIO_NUMBER)
  -- — this column is for tracking the key existence + rotation, not the
  -- value itself.
  credential_status text default 'not-set'
    check (credential_status in ('not-set', 'pending', 'verified', 'expired')),

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One active subscription per (client, service) at a time.
create unique index if not exists client_subscriptions_active_unique
  on public.client_subscriptions (client_slug, service)
  where status in ('trialing', 'active', 'past_due');

create index if not exists client_subscriptions_client_idx
  on public.client_subscriptions (client_slug, service, status);

create or replace function public.client_subscriptions_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_subscriptions_touch on public.client_subscriptions;
create trigger client_subscriptions_touch
  before update on public.client_subscriptions
  for each row execute function public.client_subscriptions_touch();

comment on table public.client_subscriptions is
  'Per-client AI add-on subscription tracking. Capability gates live in src/lib/client-subscriptions.ts.';
