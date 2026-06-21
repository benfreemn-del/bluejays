-- KR Ranches backend: Customers CRM + Orders + Order line items + Inventory + Square
-- Generic client_slug-keyed tables (mirrors client_menu_items) so the same
-- backend powers any future custom-tier client + BlueJays Pro installs.
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS everywhere).

-- ───────────────────────── 1) Customers (CRM) ─────────────────────────
create table if not exists client_customers (
  id                uuid primary key default gen_random_uuid(),
  client_slug       text not null,
  name              text not null,
  phone             text,
  email             text,
  address           text,
  tags              text[] not null default '{}',  -- subscriber | wholesale | repeat | ...
  notes             text,
  total_spent_cents bigint not null default 0,      -- denormalized; recomputed on order changes
  order_count       integer not null default 0,
  first_order_at    timestamptz,
  last_order_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists client_customers_slug_idx  on client_customers (client_slug);
create index if not exists client_customers_email_idx on client_customers (lower(email));
create index if not exists client_customers_phone_idx on client_customers (phone);

-- ───────────────────────── 2) Orders ─────────────────────────
create table if not exists client_orders (
  id                uuid primary key default gen_random_uuid(),
  client_slug       text not null,
  order_number      bigserial,                       -- human-friendly incrementing #
  customer_id       uuid references client_customers(id) on delete set null,
  customer_name     text,                            -- snapshot (survives customer delete)
  customer_phone    text,
  customer_email    text,
  status            text not null default 'new',     -- new | confirmed | ready | completed | cancelled
  fulfillment       text not null default 'pickup',  -- pickup | delivery | shipped
  payment_status    text not null default 'unpaid',  -- unpaid | deposit | paid | refunded
  payment_method    text,                            -- square | cash | check | other
  subtotal_cents    bigint not null default 0,
  total_cents       bigint not null default 0,
  notes             text,                            -- cut sheet / special instructions
  source            text not null default 'manual',  -- manual | website | square
  square_payment_id text,
  square_order_id   text,
  square_link_id    text,
  ordered_at        timestamptz not null default now(),  -- date the order was placed (editable)
  season            text,                            -- spring | summer | fall | winter (derived)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists client_orders_slug_idx     on client_orders (client_slug);
create index if not exists client_orders_customer_idx on client_orders (customer_id);
create index if not exists client_orders_status_idx   on client_orders (status);
create index if not exists client_orders_ordered_idx  on client_orders (ordered_at desc);
create index if not exists client_orders_sq_order_idx on client_orders (square_order_id);

-- ───────────────────────── 3) Order line items ─────────────────────────
create table if not exists client_order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references client_orders(id) on delete cascade,
  menu_item_id     uuid references client_menu_items(id) on delete set null,
  name             text not null,                    -- snapshot
  unit_price_cents bigint not null default 0,        -- price per unit at time of order
  unit_label       text,                             -- lb | dozen | each | share
  quantity         numeric not null default 1,
  line_total_cents bigint not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists client_order_items_order_idx on client_order_items (order_id);
create index if not exists client_order_items_menu_idx  on client_order_items (menu_item_id);

-- ───────────────────────── 4) Inventory on client_menu_items ─────────────────────────
alter table client_menu_items add column if not exists quantity         numeric;          -- units on hand
alter table client_menu_items add column if not exists unit_label       text;             -- lb | dozen | each
alter table client_menu_items add column if not exists low_threshold    numeric default 3;
alter table client_menu_items add column if not exists price_cents      bigint;           -- numeric price (checkout/math)
alter table client_menu_items add column if not exists category         text;             -- beef | pork | poultry | eggs | lamb | other
alter table client_menu_items add column if not exists track_inventory  boolean default false;
alter table client_menu_items add column if not exists square_catalog_id text;
alter table client_menu_items add column if not exists buyable          boolean default false; -- show in online checkout
