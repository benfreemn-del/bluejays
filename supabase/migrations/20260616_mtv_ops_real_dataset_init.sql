-- ─────────────────────────────────────────────────────────────────────────────
-- 20260616_mtv_ops_real_dataset_init
--
-- A separate "real data" space for the Mt View ops backend, kept apart from the
-- example/demo data:
--   example data → client_slug 'mt-view-landscaping'
--   real data    → client_slug 'mt-view-landscaping-real'
--
-- The UI flips between them with a header toggle (cookie bj_mtv_ops_mode); the
-- page reads from the chosen slug and the /ops/mutate endpoint writes to it, so
-- switching never touches the other space.
--
-- Seed only the business-numbers (assumptions) row + shop so the math works on
-- day one. Everything else (trucks, crews, people, customers, routes, hours)
-- the owner enters — it shows empty until they do, with a "Start here" guide.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.ops_assumptions
  (client_slug, labor_burden_pct, maintenance_overhead_share_pct, tax_set_aside_pct, overhead_lines,
   shop_name, shop_address, shop_city, shop_lat, shop_lng, weeks_per_month, overtime_multiplier)
values
  ('mt-view-landscaping-real', 0.31, 0.32, 0.20,
   '[{"label":"Shop + yard lease","monthlyUsd":1800},
     {"label":"Insurance (GL + commercial auto)","monthlyUsd":1250},
     {"label":"Equipment loans + depreciation","monthlyUsd":1400},
     {"label":"Software, phones, admin","monthlyUsd":450},
     {"label":"Owner unbilled admin time","monthlyUsd":2500}]'::jsonb,
   'Mt View Shop + Yard', '18225 SE 313th St', 'Auburn', 47.3207, -122.0984, 4.33, 1.5)
on conflict (client_slug) do nothing;
