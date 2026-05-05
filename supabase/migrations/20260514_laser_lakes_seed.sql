-- ─────────────────────────────────────────────────────────────────────────────
-- 20260514 — Laser Lakes (Nate) seed + client_purchases table
--
-- Adds a new tenant for laserlakes.com — handcrafted Baltic-birch lake maps +
-- wildlife wood art out of Minnesota. Run by Nate.
--
-- Two pieces:
--   1. client_owners row so Nate can log in at /clients/laser-lakes/login
--   2. NEW client_purchases table — tracks every sale across channels
--      (Shopify orders auto-imported via webhook later, plus manual entries
--      for craft fairs, wholesale, and in-person sales). Customer-tracking +
--      email-list growth is the value-add for Nate's tier.
--
-- Default password is "laser-lakes-2026" (sha256-hashed). Nate can rotate
-- it from the portal Account tab.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Owner login — sha256(salt || ":" || password) per src/lib/client-auth.ts.
--    Default salt + "laser-lakes-2026" computed offline.
insert into public.client_owners (client_slug, email, password_hash, name)
values (
  'laser-lakes',
  'hello@laserlakes.com',
  encode(
    digest(
      coalesce(current_setting('app.portal_salt', true), 'bluejays-portal-2026-default-salt')
        || ':laser-lakes-2026',
      'sha256'
    ),
    'hex'
  ),
  'Nate · Laser Lakes'
)
on conflict (lower(email)) do nothing;

-- 2. client_purchases — per-customer purchase log spanning Shopify + manual.
--    Joined to client_leads via email or phone for cross-channel rollups.
create table if not exists public.client_purchases (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,

  -- Customer identity (any combination — at least one of email/phone required)
  customer_name text,
  customer_email text,
  customer_phone text,

  -- The sale
  product_name text not null,
  amount_cents integer not null check (amount_cents >= 0),
  quantity integer not null default 1 check (quantity > 0),
  currency text not null default 'USD',

  -- Where it came from. Determines reporting + which channel UI badge shows.
  --   shopify     — auto-imported from Shopify Orders webhook
  --   event       — craft fair / pop-up / show
  --   wholesale   — bulk B2B order
  --   in-person   — at the workshop / cabin
  --   referral    — comped piece for a referrer
  --   manual      — anything else
  channel text not null default 'manual'
    check (channel in (
      'shopify', 'event', 'wholesale', 'in-person', 'referral', 'manual'
    )),

  -- Optional context: lake name (for custom map orders), event name, etc.
  context text,

  -- Source-of-truth ID from the upstream system (Shopify order ID, Square
  -- transaction ID, etc.) — lets the importer dedupe re-runs.
  external_id text,

  -- Order date — separate from created_at so backfilled craft-fair rows
  -- can record the actual sale date without losing the ledger creation time.
  ordered_at timestamptz not null default now(),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_purchases_slug_idx
  on public.client_purchases (client_slug, ordered_at desc);
create index if not exists client_purchases_email_idx
  on public.client_purchases (client_slug, lower(customer_email))
  where customer_email is not null;
create index if not exists client_purchases_external_idx
  on public.client_purchases (client_slug, external_id)
  where external_id is not null;

create or replace function public.client_purchases_touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_purchases_touch_updated_at on public.client_purchases;
create trigger client_purchases_touch_updated_at
  before update on public.client_purchases
  for each row execute function public.client_purchases_touch_updated_at();

comment on table public.client_purchases is
  'Per-tenant customer purchase log. Combines Shopify webhook auto-imports with manual entries for craft fairs / wholesale / in-person sales. Joined to client_leads for cross-channel customer rollups.';

-- 3. Seed a few starter rows so the Customers tab isn't empty when Nate
--    logs in for the first time. Delete after he syncs his actual Shopify.
-- Skip the seed block entirely on re-run — cleaner than ON CONFLICT for
-- a table with no natural unique key on (slug, customer, product).
insert into public.client_purchases (
  client_slug, customer_name, customer_email,
  product_name, amount_cents, quantity, channel, context, ordered_at
)
select * from (values
  ('laser-lakes', 'Aimee Larsen', 'aimee.l@example.com',
   'Custom Lake Map · Burntside Lake', 47500, 1, 'shopify',
   'Burntside Lake', now() - interval '14 days'),
  ('laser-lakes', 'Aimee Larsen', 'aimee.l@example.com',
   'Bald Eagle Wall Art', 2200, 1, 'shopify',
   null, now() - interval '14 days'),
  ('laser-lakes', 'Mark Hennessey', 'm.hennessey@example.com',
   'Custom Lake Map · Ten Mile Lake', 52500, 1, 'event',
   'Brainerd Lakes Festival 2025', now() - interval '32 days'),
  ('laser-lakes', 'Sarah Tomas', 'sarah@example.com',
   'Minnesota Strong Ornament', 2000, 3, 'event',
   'Brainerd Lakes Festival 2025', now() - interval '32 days'),
  ('laser-lakes', 'Twin Cities Cabin Co.', 'orders@twincitiescabinco.example',
   'Wholesale: Mixed Ornaments', 84000, 60, 'wholesale',
   'Q4 holiday restock', now() - interval '60 days')
) as v(client_slug, customer_name, customer_email, product_name, amount_cents, quantity, channel, context, ordered_at)
where not exists (
  select 1 from public.client_purchases where client_slug = 'laser-lakes'
);
