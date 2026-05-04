-- ─────────────────────────────────────────────────────────────────────────────
-- client_budget_items — per-client cost tracking for the AI Package /
-- website investment.
--
-- Owners use this to track every dollar they're spending on their site
-- + AI system, ad spend, third-party tools (Twilio, SendGrid, Calendly,
-- ad platforms, etc.). Recurring items roll up into a monthly total
-- shown on the portal Budget tab.
--
-- Designed to be owner-extensible: any owner can add a custom line item
-- (e.g. "Yard sign printing $250 one-time" or "Truck wrap $150/mo lease")
-- without Ben needing to seed it from the admin side.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_budget_items (
  id uuid primary key default gen_random_uuid(),

  client_slug text not null,

  -- Display label (eg. "Twilio SMS", "Meta Ads", "Custom site build")
  label text not null,
  -- Optional longer description (notes from the owner about what this
  -- covers, vendor names, account ids, etc.)
  description text,

  -- Cost in USD cents (100 = $1.00). Stored as cents to avoid float
  -- math. Negative values allowed for refunds / credits.
  amount_cents bigint not null,

  -- Whether this fires monthly (true) or is one-time (false).
  recurring_monthly boolean not null default false,

  -- For one-time items: date it was paid.
  -- For recurring: date it started (so we can compute "months billed").
  charge_date date not null default current_date,

  -- For recurring items: optional end date when subscription cancels.
  -- NULL = still active.
  ended_on date,

  -- Free-text category to group rows in the UI:
  --   site, ai-system, ad-spend, communication, tools, marketing, other
  -- Not a hard enum — owners can write whatever.
  category text not null default 'other',

  -- Vendor / payee (optional, for receipts).
  vendor text,

  -- Who entered this (NULL = system-seeded by Ben).
  created_by_owner_id uuid references public.client_owners(id),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for the portal "show me everything for this client, newest
-- first" lookup.
create index if not exists client_budget_items_client_idx
  on public.client_budget_items (client_slug, charge_date desc);

-- Auto-bump updated_at on any change.
create or replace function public.client_budget_items_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_budget_items_touch on public.client_budget_items;
create trigger client_budget_items_touch
  before update on public.client_budget_items
  for each row execute function public.client_budget_items_touch();

comment on table public.client_budget_items is
  'Per-client investment + cost line items. Surfaced on the owner portal Budget tab. Owner-extensible — owners can add custom rows alongside Ben-seeded ones.';
