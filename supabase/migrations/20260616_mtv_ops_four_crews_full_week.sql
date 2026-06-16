-- ─────────────────────────────────────────────────────────────────────────────
-- 20260616_mtv_ops_four_crews_full_week
--
-- Scales the Mt View ops backend to TWO maintenance crews + TWO construction
-- crews, with maintenance routes spread across the work week (Mon–Fri):
--   Bonnie's Maintenance Crew (c_maint)  → Monday, Wednesday, Friday
--   Henry's  Maintenance Crew (c_maint2) → Tuesday, Thursday
--   Tim's Install + Hardscape Crew (c_install)   → construction (project-based)
--   Second Build Crew              (c_install2)  → construction (project-based)
--
-- Adds 2 trucks, 4 employees (Tyler moves to the 2nd build crew), 10 new
-- maintenance customers, and the Monday + Thursday routes with their stops.
-- Additive + idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.ops_vehicles (id, client_slug, name, mpg, fuel_cost_per_gal, maintenance_per_mile) values
  ('v_truck3', 'mt-view-landscaping', 'Truck 3 — Chevy 2500 + trailer', 11, 4.85, 0.20),
  ('v_truck4', 'mt-view-landscaping', 'Truck 4 — F-350 flatbed', 10, 4.85, 0.22)
on conflict (id) do nothing;

insert into public.ops_crews (id, client_slug, name, side, lead_id, vehicle_id, color) values
  ('c_maint2',   'mt-view-landscaping', 'Henry''s Maintenance Crew', 'maintenance',  'e_henry', 'v_truck3', '#0d9488'),
  ('c_install2', 'mt-view-landscaping', 'Second Build Crew',        'construction', 'e_caleb', 'v_truck4', '#7c3aed')
on conflict (id) do nothing;

insert into public.ops_employees (id, client_slug, name, role, pay_type, hourly_rate, crew_id, tenure_years, phone, billable, overtime_hours_weekly) values
  ('e_henry',  'mt-view-landscaping', 'Henry Alvarez',  'Crew Lead · Maintenance', 'hourly', 27, 'c_maint2',   6, '(253) 555-0141', true, 0),
  ('e_luis',   'mt-view-landscaping', 'Luis Ortega',    'Crew · Maintenance',      'hourly', 21, 'c_maint2',   2, '(253) 555-0142', true, 0),
  ('e_caleb',  'mt-view-landscaping', 'Caleb Reyes',    'Crew Lead · Build',       'hourly', 26, 'c_install2', 7, '(253) 555-0143', true, 0),
  ('e_dwayne', 'mt-view-landscaping', 'Dwayne Foster',  'Crew · Build',            'hourly', 25, 'c_install2', 4, '(253) 555-0144', true, 0)
on conflict (id) do nothing;
update public.ops_employees set crew_id = 'c_install2' where id = 'e_tyler' and client_slug = 'mt-view-landscaping';

insert into public.ops_properties (id, client_slug, customer, address, city, lat, lng, tier, price_per_visit_usd, visits_per_month, materials_per_visit_usd, started_at) values
  ('p_halverson','mt-view-landscaping','Halverson Residence','3120 7th St SW','Puyallup',    47.1850,-122.3000,'full_care',  145,4,11,'2022-04-10'),
  ('p_decker',   'mt-view-landscaping','Decker Property',    '811 Main St',   'Sumner',      47.2030,-122.2400,'essentials',  74,4, 4,'2023-06-01'),
  ('p_ostrander','mt-view-landscaping','Ostrander Estate',   '14002 86th Ave E','Puyallup',  47.1500,-122.2900,'estate',     395,4,34,'2018-05-20'),
  ('p_beck',     'mt-view-landscaping','Beck Residence',     '9210 198th Ave E','Bonney Lake',47.1790,-122.1700,'full_care',  150,4,12,'2021-08-15'),
  ('p_trent',    'mt-view-landscaping','Trent Garden',       '5520 12th St SE','Puyallup',    47.1700,-122.2700,'full_care',  138,4,12,'2020-09-30'),
  ('p_whitfield','mt-view-landscaping','Whitfield Property', '2204 228th Ave SE','Sammamish', 47.6080,-122.0350,'full_care',  168,4,14,'2021-05-12'),
  ('p_acharya',  'mt-view-landscaping','Acharya Residence',  '780 NW Juniper St','Issaquah',  47.5400,-122.0400,'essentials',  82,4, 4,'2024-03-22'),
  ('p_caldwell', 'mt-view-landscaping','Caldwell Estate',    '1801 268th Ave SE','Sammamish', 47.5900,-122.0200,'estate',     430,4,40,'2017-06-18'),
  ('p_nguyen',   'mt-view-landscaping','Nguyen Garden',      '16410 NE 50th St','Redmond',    47.6650,-122.1200,'full_care',  158,4,13,'2022-07-08'),
  ('p_pratt',    'mt-view-landscaping','Pratt Residence',    '3325 213th Pl SE','Sammamish',  47.6020,-122.0450,'full_care',  152,4,12,'2023-04-19')
on conflict (id) do nothing;

update public.ops_routes set crew_id = 'c_maint2' where id = 'r_tue' and client_slug = 'mt-view-landscaping';
insert into public.ops_routes (id, client_slug, day, crew_id, return_drive_minutes, return_drive_miles, sort_order) values
  ('r_mon', 'mt-view-landscaping', 'Monday',   'c_maint',  20, 12.0, 0),
  ('r_thu', 'mt-view-landscaping', 'Thursday', 'c_maint2', 30, 20.0, 4)
on conflict (id) do nothing;

insert into public.ops_route_stops (id, client_slug, route_id, property_id, seq, service_minutes, drive_minutes, drive_miles) values
  ('s_mon_1','mt-view-landscaping','r_mon','p_trent',    1, 60, 10,  5.5),
  ('s_mon_2','mt-view-landscaping','r_mon','p_halverson',2, 60,  9,  4.8),
  ('s_mon_3','mt-view-landscaping','r_mon','p_decker',   3, 45, 13,  7.2),
  ('s_mon_4','mt-view-landscaping','r_mon','p_beck',     4, 60, 18, 11.5),
  ('s_mon_5','mt-view-landscaping','r_mon','p_ostrander',5,120, 16,  9.8),
  ('s_thu_1','mt-view-landscaping','r_thu','p_acharya',  1, 45, 26, 17.0),
  ('s_thu_2','mt-view-landscaping','r_thu','p_whitfield',2, 60, 11,  6.0),
  ('s_thu_3','mt-view-landscaping','r_thu','p_pratt',    3, 60,  7,  3.1),
  ('s_thu_4','mt-view-landscaping','r_thu','p_caldwell', 4,150, 10,  5.2),
  ('s_thu_5','mt-view-landscaping','r_thu','p_nguyen',   5, 55, 22, 14.5)
on conflict (id) do nothing;
