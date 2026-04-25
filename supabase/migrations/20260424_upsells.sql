-- Upsell SKUs — productized add-on revenue per paid customer.
--
-- Wave-2 LTV protection: every paid customer should see upsell paths
-- in their lifecycle emails. The 4 SKUs (review_blast, extra_pages,
-- gbp_setup, monthly_updates) are 1-click-buyable from `/upsells/[id]`
-- and the Stripe Checkout session writes a row here on
-- `checkout.session.completed`.
--
-- One-time SKUs land with `stripe_subscription_id = null`. The
-- `monthly_updates` SKU lands with `stripe_subscription_id` populated
-- so the operator dashboard can deep-link into the Stripe sub
-- (and so we can react to `customer.subscription.deleted` events for
-- this SKU specifically without conflating with the management sub).
--
-- `status` defaults to 'paid' on the webhook insert. The operator
-- dashboard's "Mark fulfilled" button flips it to 'fulfilled'. Refunded
-- and cancelled states are reserved for future webhook hooks.

create table if not exists public.upsells (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  sku text not null,
  -- 'review_blast' | 'extra_pages' | 'gbp_setup' | 'monthly_updates'
  amount_cents int not null,
  currency text default 'usd',
  stripe_session_id text not null unique,
  stripe_subscription_id text,
  -- only populated for the monthly_updates SKU
  status text not null default 'paid',
  -- 'paid' | 'fulfilled' | 'cancelled' | 'refunded'
  fulfilled_at timestamptz,
  -- when Ben marks the upsell as delivered via the dashboard
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_upsells_prospect on public.upsells(prospect_id);
create index if not exists idx_upsells_status on public.upsells(status);
create index if not exists idx_upsells_sku on public.upsells(sku);
