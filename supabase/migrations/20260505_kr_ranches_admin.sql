-- ─────────────────────────────────────────────────────────────────────────────
-- KR Ranches Admin — light-tier client portal (menu items + auth seed)
--
-- KR Ranches is a custom-tier static-HTML client (slug: kr-ranches). They
-- need a tiny admin to:
--   1. Edit their freezer menu items (price + status)
--   2. View customer inquiries from the contact form
--   3. (Future) export email list, configure Shopify
--
-- This migration creates the menu_items table and seeds it with the 7 items
-- currently hardcoded in their static site, so flipping the static site to
-- fetch dynamically is a no-op visually.
--
-- The owner row in client_owners must be inserted manually after this runs
-- (Ben fills in the password via the chat-provided SQL — see commit summary).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Menu items table ─────────────────────────────────────────────────────────
create table if not exists public.client_menu_items (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  name text not null,
  price text not null,                 -- "$22/lb", "$8/dozen" etc — display string
  note text,                           -- "call to confirm", "1 lb packs"
  status text not null default 'available'
    check (status in ('available', 'low', 'gone')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_menu_items_slug_sort_idx
  on public.client_menu_items (client_slug, sort_order);

-- Touch trigger
create or replace function public.client_menu_items_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_menu_items_touch on public.client_menu_items;
create trigger client_menu_items_touch
  before update on public.client_menu_items
  for each row execute function public.client_menu_items_touch();

-- ── Seed KR's 7 freezer items (idempotent — only inserts on first run) ───────
insert into public.client_menu_items (client_slug, name, price, note, status, sort_order)
select * from (values
  ('kr-ranches', 'Ribeye Steaks',        '$22/lb',     'call to confirm', 'available', 10),
  ('kr-ranches', 'Ground Beef (1 lb packs)', '$9/lb',  'call to confirm', 'available', 20),
  ('kr-ranches', 'Pork Chops',           '$12/lb',     'call to confirm', 'low',       30),
  ('kr-ranches', 'House Bratwurst',      '$11/lb',     'call to confirm', 'available', 40),
  ('kr-ranches', 'Beef Short Ribs',      '$14/lb',     'call to confirm', 'low',       50),
  ('kr-ranches', 'Lamb Chops',           '$26/lb',     'call to confirm', 'gone',      60),
  ('kr-ranches', 'Farm Eggs (dozen)',    '$8/dozen',   'call to confirm', 'available', 70)
) as v(client_slug, name, price, note, status, sort_order)
where not exists (
  select 1 from public.client_menu_items where client_slug = 'kr-ranches'
);

comment on table public.client_menu_items is
  'Per-client menu/inventory items, edited via the per-client admin page. Currently used by KR Ranches freezer; pattern reusable for any static-tier client.';
