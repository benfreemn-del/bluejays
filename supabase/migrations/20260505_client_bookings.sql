-- ─────────────────────────────────────────────────────────────────────────────
-- Native booking calendar — slot management + customer bookings
-- per-client, slug-scoped (works for OIT, future static-tier clients).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Slots table — owner pre-populates available time blocks ─────────────────
create table if not exists public.client_booking_slots (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  -- Slot lifecycle:
  --   'available'  → customer can book it
  --   'booked'     → has a booking row claimed against it
  --   'blocked'    → owner blocked it off (vacation, lunch, etc) — invisible to customers
  status text not null default 'available'
    check (status in ('available', 'booked', 'blocked')),
  label text,                                -- optional: "Morning slot", "Sequim only", etc
  notes text,                                -- owner-only internal notes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_booking_slots_slug_start_idx
  on public.client_booking_slots (client_slug, start_at);
create index if not exists client_booking_slots_slug_status_idx
  on public.client_booking_slots (client_slug, status, start_at);

create or replace function public.client_booking_slots_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_booking_slots_touch on public.client_booking_slots;
create trigger client_booking_slots_touch
  before update on public.client_booking_slots
  for each row execute function public.client_booking_slots_touch();


-- ── Bookings table — actual customer claim against a slot ──────────────────
create table if not exists public.client_bookings (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  slot_id uuid references public.client_booking_slots(id) on delete set null,

  -- Customer identity
  customer_name text not null,
  customer_phone text,
  customer_email text,
  customer_address text,

  -- Service details (loose JSON since each industry differs)
  property_size text,                         -- e.g. "1500to3000" from OIT calc
  addons text,                                -- comma-list of selected add-ons
  estimate_low_cents int,
  estimate_high_cents int,
  service_type text,                          -- e.g. "mold-inspection-booking"
  notes text,                                 -- customer free-text

  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'completed', 'cancelled', 'no-show')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_bookings_slug_status_idx
  on public.client_bookings (client_slug, status, created_at desc);
create index if not exists client_bookings_slug_created_idx
  on public.client_bookings (client_slug, created_at desc);
create index if not exists client_bookings_slot_idx
  on public.client_bookings (slot_id);

create or replace function public.client_bookings_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_bookings_touch on public.client_bookings;
create trigger client_bookings_touch
  before update on public.client_bookings
  for each row execute function public.client_bookings_touch();


-- ── Seed Olympic Inspections owner row in client_owners ─────────────────────
-- Uses slug 'olympic-inspections'. Email + initial password is set here.
-- Default password is "trooper" (same as KR). Owner can change later.
do $$
declare
  oit_email text := 'hello@olympicinspect.com';
begin
  if not exists (select 1 from public.client_owners where lower(email) = oit_email) then
    insert into public.client_owners (client_slug, email, name, password_hash, role)
    values (
      'olympic-inspections',
      oit_email,
      'OIT Owner',
      encode(digest('trooper' || coalesce(current_setting('app.portal_salt', true), 'bluejays-portal-2026-default-salt'), 'sha256'), 'hex'),
      'owner'
    );
  end if;
end $$;


-- ── Comments ─────────────────────────────────────────────────────────────────
comment on table public.client_booking_slots is
  'Per-client available time slots. Owner pre-populates via /clients/[slug]/admin. Customers book via the public site picker.';
comment on table public.client_bookings is
  'Per-client customer bookings. Each booking optionally links to a client_booking_slots row (which gets flipped to status=booked).';
