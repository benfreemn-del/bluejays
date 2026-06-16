-- ─────────────────────────────────────────────────────────────────────────────
-- 20260616_mtv_ops_backend
--
-- Backing tables for the Mountain View operations + profitability backend
-- (/clients/mt-view-landscaping/ops). Replaces the visual-first mock seed
-- (src/app/clients/mt-view-landscaping/ops/mock-ops-data.ts) with real,
-- editable rows. The job-costing engine (profit-engine.ts) is unchanged —
-- it reads whatever dataset the store hands it.
--
-- Tables (all carry client_slug for future multi-tenant promotion; bespoke
-- for mt-view-landscaping today):
--   ops_assumptions   — one row per client: burden %, overhead split, tax %
--   ops_vehicles      — trucks: mpg, fuel $/gal, maintenance $/mile
--   ops_crews         — crews: lead, vehicle, map color
--   ops_employees     — roster: pay type, hourly rate, burden override, crew
--   ops_properties    — recurring maintenance customers + geocode + pricing
--   ops_routes        — recurring route days (crew + return-to-shop leg)
--   ops_route_stops   — ordered stops per route (service + drive legs)
--
-- Text PKs match the app's id scheme (e_*, c_*, v_*, p_*, r_*) so the seed
-- reproduces the approved mock exactly. New rows created via the UI get
-- generated ids. IDEMPOTENT — re-running won't duplicate (ON CONFLICT).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.ops_assumptions (
  client_slug                     text primary key,
  labor_burden_pct                numeric not null default 0.31,
  maintenance_overhead_share_pct  numeric not null default 0.32,
  tax_set_aside_pct               numeric not null default 0.20,
  overhead_lines                  jsonb   not null default '[]'::jsonb,
  shop_name                       text,
  shop_address                    text,
  shop_city                       text,
  shop_lat                        numeric,
  shop_lng                        numeric,
  weeks_per_month                 numeric not null default 4.33,
  updated_at                      timestamptz not null default now()
);

create table if not exists public.ops_vehicles (
  id                   text primary key,
  client_slug          text not null,
  name                 text not null,
  mpg                  numeric not null default 12,
  fuel_cost_per_gal    numeric not null default 4.85,
  maintenance_per_mile numeric not null default 0.18,
  created_at           timestamptz not null default now()
);

create table if not exists public.ops_crews (
  id          text primary key,
  client_slug text not null,
  name        text not null,
  lead_id     text,                  -- soft ref to ops_employees (circular; no FK)
  vehicle_id  text references public.ops_vehicles(id) on delete set null,
  color       text not null default '#15803d',
  created_at  timestamptz not null default now()
);

create table if not exists public.ops_employees (
  id                  text primary key,
  client_slug         text not null,
  name                text not null,
  role                text not null default '',
  pay_type            text not null default 'hourly',  -- 'hourly' | 'salary'
  hourly_rate         numeric not null default 0,
  burden_pct_override numeric,
  crew_id             text references public.ops_crews(id) on delete set null,
  tenure_years        numeric not null default 0,
  phone               text,
  billable            boolean not null default true,
  active              boolean not null default true,
  created_at          timestamptz not null default now()
);

create table if not exists public.ops_properties (
  id                     text primary key,
  client_slug            text not null,
  customer               text not null,
  address                text not null default '',
  city                   text not null default '',
  lat                    numeric,
  lng                    numeric,
  tier                   text not null default 'full_care', -- essentials|full_care|estate
  price_per_visit_usd    numeric not null default 0,
  visits_per_month       numeric not null default 4,
  materials_per_visit_usd numeric not null default 0,
  started_at             date,
  active                 boolean not null default true,
  created_at             timestamptz not null default now()
);

create table if not exists public.ops_routes (
  id                   text primary key,
  client_slug          text not null,
  day                  text not null,                 -- Tuesday | Wednesday | Thursday | Friday
  crew_id              text references public.ops_crews(id) on delete set null,
  return_drive_minutes numeric not null default 0,
  return_drive_miles   numeric not null default 0,
  sort_order           int not null default 0,
  created_at           timestamptz not null default now()
);

create table if not exists public.ops_route_stops (
  id              text primary key,
  client_slug     text not null,
  route_id        text not null references public.ops_routes(id) on delete cascade,
  property_id     text not null references public.ops_properties(id) on delete cascade,
  seq             int not null default 0,
  service_minutes numeric not null default 0,
  drive_minutes   numeric not null default 0,
  drive_miles     numeric not null default 0
);

create index if not exists idx_ops_vehicles_slug    on public.ops_vehicles(client_slug);
create index if not exists idx_ops_crews_slug        on public.ops_crews(client_slug);
create index if not exists idx_ops_employees_slug    on public.ops_employees(client_slug);
create index if not exists idx_ops_employees_crew    on public.ops_employees(crew_id);
create index if not exists idx_ops_properties_slug   on public.ops_properties(client_slug);
create index if not exists idx_ops_routes_slug       on public.ops_routes(client_slug);
create index if not exists idx_ops_route_stops_route on public.ops_route_stops(route_id);

-- ─────────────────────────── SEED (mt-view-landscaping) ───────────────────────────

insert into public.ops_assumptions
  (client_slug, labor_burden_pct, maintenance_overhead_share_pct, tax_set_aside_pct, overhead_lines,
   shop_name, shop_address, shop_city, shop_lat, shop_lng, weeks_per_month)
values
  ('mt-view-landscaping', 0.31, 0.32, 0.20,
   '[{"label":"Shop + yard lease","monthlyUsd":1800},
     {"label":"Insurance (GL + commercial auto)","monthlyUsd":1250},
     {"label":"Equipment loans + depreciation","monthlyUsd":1400},
     {"label":"Software, phones, admin","monthlyUsd":450},
     {"label":"Owner unbilled admin time","monthlyUsd":2500}]'::jsonb,
   'Mt View Shop + Yard', '2800 Auburn Way N', 'Auburn', 47.3225, -122.2285, 4.33)
on conflict (client_slug) do nothing;

insert into public.ops_vehicles (id, client_slug, name, mpg, fuel_cost_per_gal, maintenance_per_mile) values
  ('v_truck1', 'mt-view-landscaping', 'Truck 1 — F-250 + 16'' trailer', 11,   4.85, 0.19),
  ('v_truck2', 'mt-view-landscaping', 'Truck 2 — RAM 2500 + dump trailer', 10.5, 4.85, 0.21)
on conflict (id) do nothing;

insert into public.ops_crews (id, client_slug, name, lead_id, vehicle_id, color) values
  ('c_maint',   'mt-view-landscaping', 'Bonnie''s Maintenance Crew',       'e_marcus', 'v_truck1', '#15803d'),
  ('c_install', 'mt-view-landscaping', 'Tim''s Install + Hardscape Crew',  'e_jose',   'v_truck2', '#b45309')
on conflict (id) do nothing;

insert into public.ops_employees (id, client_slug, name, role, pay_type, hourly_rate, crew_id, tenure_years, phone, billable) values
  ('e_tim',    'mt-view-landscaping', 'Tim Hunsaker',    'Owner · Design + Install Lead',  'salary', 46, 'c_install', 50, '(253) 555-0111', true),
  ('e_bonnie', 'mt-view-landscaping', 'Bonnie Hunsaker', 'Owner · Maintenance Director',   'salary', 42, null,        38, '(253) 555-0112', false),
  ('e_marcus', 'mt-view-landscaping', 'Marcus Vega',     'Crew Lead · Maintenance',        'hourly', 28, 'c_maint',    5, '(253) 555-0131', true),
  ('e_diego',  'mt-view-landscaping', 'Diego Morales',   'Crew · Maintenance',             'hourly', 22, 'c_maint',    3, '(253) 555-0132', true),
  ('e_tyler',  'mt-view-landscaping', 'Tyler Brooks',    'Crew · Install',                 'hourly', 20, 'c_install',  1, '(253) 555-0133', true),
  ('e_jose',   'mt-view-landscaping', 'José Restrepo',   'Crew Lead · Install + Hardscape','hourly', 26, 'c_install', 11, '(253) 555-0134', true),
  ('e_sam',    'mt-view-landscaping', 'Sam Kowalski',    'Crew · Install',                 'hourly', 24, 'c_install',  2, '(253) 555-0135', true)
on conflict (id) do nothing;

insert into public.ops_properties (id, client_slug, customer, address, city, lat, lng, tier, price_per_visit_usd, visits_per_month, materials_per_visit_usd, started_at) values
  ('p_olano',     'mt-view-landscaping', 'Olano Property',      '8240 168th Ave SE',      'Snohomish',     47.9112, -122.0840, 'full_care',  165, 4, 14, '2019-04-02'),
  ('p_aquavista', 'mt-view-landscaping', 'Aquavista (Wilkins)', '14520 Lake Hills Blvd',  'Bellevue',      47.5821, -122.1503, 'full_care',  175, 4, 18, '2021-06-15'),
  ('p_park',      'mt-view-landscaping', 'Linda Park',          '2700 NE 24th St',        'Renton',        47.4990, -122.1820, 'essentials',  78, 4,  4, '2026-04-28'),
  ('p_kovacs',    'mt-view-landscaping', 'Patricia Kovacs',     '8517 Bridgeport Way W',  'Tacoma',        47.2098, -122.5246, 'full_care',  148, 4, 10, '2026-05-14'),
  ('p_reynolds',  'mt-view-landscaping', 'Reynolds Estate',     '11200 Hidden Valley Rd', 'Bonney Lake',   47.1820, -122.1605, 'estate',     410, 4, 36, '2017-03-20'),
  ('p_henderson', 'mt-view-landscaping', 'Henderson Property',  '612 Sunrise Dr',         'Auburn',        47.3015, -122.2210, 'essentials',  72, 4,  4, '2023-05-11'),
  ('p_kirse',     'mt-view-landscaping', 'Kirse Residence',     '9810 SE 195th Pl',       'Kent',          47.3790, -122.2040, 'full_care',  158, 4, 12, '2020-07-08'),
  ('p_mckinley',  'mt-view-landscaping', 'McKinley Property',   '418 16th Ave E',         'Seattle',       47.6230, -122.3120, 'full_care',  162, 4, 12, '2018-09-01'),
  ('p_davies',    'mt-view-landscaping', 'Davies Residence',    '2240 NW 80th St',        'Seattle',       47.6870, -122.3850, 'essentials',  76, 4,  4, '2022-08-19'),
  ('p_thompson',  'mt-view-landscaping', 'Thompson Estate',     '5510 W Mercer Way',      'Mercer Island', 47.5701, -122.2410, 'estate',     460, 4, 42, '2016-05-30'),
  ('p_sato',      'mt-view-landscaping', 'Sato Residence',      '1860 Olympic Blvd',      'Lynnwood',      47.8205, -122.3020, 'full_care',  152, 4, 11, '2021-10-12'),
  ('p_branson',   'mt-view-landscaping', 'Branson Garden',      '4225 218th Ave SE',      'Issaquah',      47.5300, -122.0340, 'full_care',  168, 4, 15, '2019-11-05'),
  ('p_highland',  'mt-view-landscaping', 'Highland Property',   '8920 35th Ave NE',       'Seattle',       47.6920, -122.2870, 'essentials',  70, 4,  3, '2024-04-22'),
  ('p_garrett',   'mt-view-landscaping', 'Garrett Estate',      '210 W Highland Dr',      'Bothell',       47.7620, -122.2055, 'estate',     360, 4, 30, '2018-06-14'),
  ('p_mancini',   'mt-view-landscaping', 'Mancini Garden',      '7180 Madrona Lane',      'Federal Way',   47.3225, -122.3120, 'full_care',  155, 4, 12, '2020-03-28'),
  ('p_brennan',   'mt-view-landscaping', 'Brennan Property',    '918 Front St',           'Lynnwood',      47.8290, -122.3050, 'full_care',  150, 4, 11, '2023-09-09'),
  ('p_patel',     'mt-view-landscaping', 'Patel Residence',     '3309 56th Ave NE',       'Seattle',       47.6505, -122.2740, 'essentials',  80, 4,  4, '2022-05-17'),
  ('p_walsh',     'mt-view-landscaping', 'Walsh Residence',     '1140 NE 95th St',        'Seattle',       47.6980, -122.3150, 'full_care',  160, 4, 12, '2021-07-21')
on conflict (id) do nothing;

insert into public.ops_routes (id, client_slug, day, crew_id, return_drive_minutes, return_drive_miles, sort_order) values
  ('r_tue', 'mt-view-landscaping', 'Tuesday',   'c_maint', 22, 14.0, 1),
  ('r_wed', 'mt-view-landscaping', 'Wednesday', 'c_maint', 32, 22.0, 2),
  ('r_fri', 'mt-view-landscaping', 'Friday',    'c_maint', 34, 24.0, 3)
on conflict (id) do nothing;

insert into public.ops_route_stops (id, client_slug, route_id, property_id, seq, service_minutes, drive_minutes, drive_miles) values
  -- Tuesday — South Sound
  ('s_tue_1', 'mt-view-landscaping', 'r_tue', 'p_henderson', 1,  40,  8,  4.5),
  ('s_tue_2', 'mt-view-landscaping', 'r_tue', 'p_park',      2,  45, 16,  9.2),
  ('s_tue_3', 'mt-view-landscaping', 'r_tue', 'p_kirse',     3,  60, 13,  7.0),
  ('s_tue_4', 'mt-view-landscaping', 'r_tue', 'p_mancini',   4,  60, 15,  8.4),
  ('s_tue_5', 'mt-view-landscaping', 'r_tue', 'p_kovacs',    5,  90, 18, 11.5),
  ('s_tue_6', 'mt-view-landscaping', 'r_tue', 'p_reynolds',  6, 120, 26, 16.8),
  -- Wednesday — Seattle core
  ('s_wed_1', 'mt-view-landscaping', 'r_wed', 'p_mckinley',  1,  50, 30, 19.0),
  ('s_wed_2', 'mt-view-landscaping', 'r_wed', 'p_davies',    2,  40, 14,  6.1),
  ('s_wed_3', 'mt-view-landscaping', 'r_wed', 'p_highland',  3,  35,  9,  3.8),
  ('s_wed_4', 'mt-view-landscaping', 'r_wed', 'p_patel',     4,  40,  8,  3.2),
  ('s_wed_5', 'mt-view-landscaping', 'r_wed', 'p_walsh',     5,  55,  7,  2.9),
  -- Friday — Eastside + North
  ('s_fri_1', 'mt-view-landscaping', 'r_fri', 'p_aquavista', 1,  60, 28, 18.0),
  ('s_fri_2', 'mt-view-landscaping', 'r_fri', 'p_thompson',  2, 150, 12,  5.5),
  ('s_fri_3', 'mt-view-landscaping', 'r_fri', 'p_branson',   3,  70, 16,  9.3),
  ('s_fri_4', 'mt-view-landscaping', 'r_fri', 'p_garrett',   4,  90, 26, 17.0),
  ('s_fri_5', 'mt-view-landscaping', 'r_fri', 'p_sato',      5,  55, 14,  8.1),
  ('s_fri_6', 'mt-view-landscaping', 'r_fri', 'p_brennan',   6,  65,  6,  2.2),
  ('s_fri_7', 'mt-view-landscaping', 'r_fri', 'p_olano',     7,  75, 18, 11.0)
on conflict (id) do nothing;
