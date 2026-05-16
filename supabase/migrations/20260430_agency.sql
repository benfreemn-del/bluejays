-- BlueJays AI Marketing System — full-stack agency offer ($10,000 base; $300 off pay-in-full = $9,700).
--
-- Two tables:
--   agency_applications — pre-customer applications from /agency/apply
--   agency_customers     — signed customers (one row per paid engagement)
--
-- The application table is the qualifying funnel: anyone can submit,
-- Ben reviews + decides who books a strategy call. The customer table
-- is created when payment lands (Stripe webhook).
--
-- Per the Plan doc (in OneDrive): we do NOT build full multi-tenant
-- isolation in this migration. First 5–10 customers get hand-set-up
-- using existing Hyperloop infra. Multi-tenant tables added later
-- when volume justifies the rebuild.

-- ─── Applications ────────────────────────────────────────────────────
create table if not exists agency_applications (
  id uuid primary key default gen_random_uuid(),
  -- Contact + business
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  -- Qualification answers (8-question form)
  industry text,
  what_they_sell text,                 -- product/service description
  avg_customer_value_cents int,        -- average customer LTV in cents
  monthly_revenue_cents int,            -- ballpark monthly revenue in cents
  current_close_rate_per_month int,    -- # customers/mo they close currently
  ideal_customer text,                 -- ICP one-liner
  current_marketing text,              -- what they're doing now
  budget_confirmed boolean default false, -- did they confirm $10K liquid budget?
  success_criteria text,               -- what success looks like to them at Day 90
  -- Operational state
  -- new           — just submitted, awaiting Ben's review
  -- qualified     — Ben reviewed, sent Calendly link
  -- called        — strategy call completed
  -- won           — customer paid → agency_customers row created
  -- lost          — said no on call OR ghosted
  -- dnq           — Ben declined; sent polite "not a fit" email
  status text not null default 'new',
  notes text,                          -- Ben's internal notes
  reviewed_at timestamptz,
  reviewed_by text,                    -- 'ben' or future operator name
  -- Tracking
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_referrer text,
  user_agent text,
  ip text,
  applied_at timestamptz not null default now()
);

create index if not exists agency_applications_status_idx
  on agency_applications(status, applied_at desc);
create index if not exists agency_applications_email_idx
  on agency_applications(email);

-- ─── Customers ───────────────────────────────────────────────────────
create table if not exists agency_customers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references agency_applications(id),
  -- Snapshot of contact (in case application gets edited later)
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  -- Engagement scope
  internal_codename text unique,        -- e.g. "dental-clear-water"
  industry text not null,
  paid_amount_cents int not null default 1000000, -- $10,000 default
  paid_at timestamptz,
  stripe_session_id text,
  payment_plan text default 'full',    -- 'full' | '50-50'
  -- Service Agreement (AI Marketing System variant)
  service_agreement_accepted_at timestamptz,
  service_agreement_version text,
  -- 90-day timeline
  start_date date,
  end_date date,                       -- start_date + 90 days
  -- Status
  -- onboarding   — Days 1–7, kickoff + setup
  -- warmup       — Days 8–14, sender warming
  -- active       — Days 15–90, full engine running
  -- completed    — Day 90+, no retainer
  -- retained     — Day 90+, on $497/mo retainer
  -- paused       — engagement paused (deliverability issue, refund pending, etc.)
  -- refunded     — engagement ended in refund
  status text not null default 'onboarding',
  -- Lead-volume guarantee tracking
  qualified_leads_delivered int default 0,
  guarantee_threshold int default 100,  -- minimum leads we promised
  guarantee_extended_to date,          -- if Day 90 hit but threshold not met, extend until this date
  -- Retainer (post-90)
  retainer_active boolean default false,
  retainer_started_at timestamptz,
  retainer_monthly_cents int default 49700, -- $497/mo
  retainer_stripe_subscription_id text,
  -- Configuration (JSON for flexibility — promote to columns later if needed)
  config jsonb default '{}',
  /* config shape (informal):
   * {
   *   "icp": {
   *     "industry": "dental",
   *     "geo": "Pacific Northwest",
   *     "company_size": "1–5 chairs",
   *     "buyer_title": "owner / practice manager"
   *   },
   *   "lead_magnet": "free 60-second site audit",
   *   "sender_domain": "trycleardentat.co",
   *   "sender_mailboxes": ["outreach@...", "drsmith@..."],
   *   "twilio_number": "+1 360 555 0123",
   *   "calendly_url": "https://calendly.com/...",
   *   "apollo_target_count": 16000,
   *   "channels_active": ["email", "sms", "postcard"],
   *   "retargeting_pixels": { "meta": "...", "google": "..." }
   * }
   */
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_customers_status_idx
  on agency_customers(status, end_date);
create index if not exists agency_customers_email_idx
  on agency_customers(email);

-- ─── Auto-update updated_at on customer rows ─────────────────────────
create or replace function agency_touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_agency_updated_at on agency_customers;
create trigger trg_agency_updated_at before update on agency_customers
for each row execute function agency_touch_updated_at();

-- ─── Reload PostgREST schema cache so the API picks up the new tables
notify pgrst, 'reload schema';
