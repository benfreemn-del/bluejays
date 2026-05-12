-- client_onboarding — post-deal "make me a working client" wizard state.
--
-- After a prospect signs the deal, Ben can't actually stand up their
-- marketing system until he has: card on file (for Twilio/Lob/ad
-- pass-through), Twilio area code, business address + hours, brand
-- assets, ad-account access, and SMS-compliance approval.
--
-- The wizard lives at /clients/[slug]/onboarding and saves progress
-- on each step into this row. One row per client_slug.
--
-- Status transitions:
--   not_started → in_progress → ready_to_launch → launched
--
-- When status flips to "launched" the API route also auto-seeds the
-- BlueJays-side client_tasks (Buy Twilio number for ZIP, Connect GMB,
-- etc.) so Ben sees his TODO list per client immediately.

create table if not exists client_onboarding (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null unique,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'ready_to_launch', 'launched')),

  -- Per-step payloads. Each step writes its own jsonb blob so we can
  -- evolve fields without migrations. Null = step not yet completed.
  step_business jsonb,        -- name, address, hours, service areas
  step_phone jsonb,           -- twilio area code + forwarding preference
  step_brand jsonb,           -- logo url, primary color, hero photo urls
  step_accounts jsonb,        -- existing ad/biz accounts checklist
  step_payment jsonb,         -- stripe setup_intent ref + last 4 (never PAN)
  step_compliance jsonb,      -- sms disclosure signature + timestamp

  -- Per-step completion stamps drive the progress bar.
  business_completed_at timestamptz,
  phone_completed_at timestamptz,
  brand_completed_at timestamptz,
  accounts_completed_at timestamptz,
  payment_completed_at timestamptz,
  compliance_completed_at timestamptz,

  launched_at timestamptz,
  launched_by uuid references client_owners(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_onboarding_status_idx on client_onboarding(status);

-- Touch updated_at on every UPDATE so the operator dashboard can sort
-- by recent activity.
create or replace function touch_client_onboarding_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_client_onboarding_updated_at on client_onboarding;
create trigger trg_client_onboarding_updated_at
  before update on client_onboarding
  for each row execute function touch_client_onboarding_updated_at();
