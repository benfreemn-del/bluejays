-- ─────────────────────────────────────────────────────────────────────────────
-- 20260616_mtv_ops_timeclock_and_billing
--
-- Two operator-requested capabilities:
--  1. Time clock — one row per (employee, weekday) of hours worked this week.
--     Construction labor is captured ONLY here (no job tracking, per the
--     maintenance operator's request); maintenance hours feed planned-vs-actual.
--  2. Billing status per maintenance customer (unbilled | billed | paid) for
--     simple cash visibility ("who owes me"), not a full AR ledger.
--
-- Seeds construction crews' hours (so their labor shows up), a couple of
-- maintenance crews for a planned-vs-actual example, and a spread of billing
-- states. Additive + idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.ops_timesheets (
  id          text primary key,
  client_slug text not null,
  employee_id text not null references public.ops_employees(id) on delete cascade,
  weekday     text not null,
  hours       numeric not null default 0,
  note        text,
  updated_at  timestamptz not null default now(),
  unique (client_slug, employee_id, weekday)
);
create index if not exists idx_ops_timesheets_emp on public.ops_timesheets(employee_id);
create index if not exists idx_ops_timesheets_slug on public.ops_timesheets(client_slug);

alter table public.ops_properties
  add column if not exists billing_status text not null default 'unbilled',
  add column if not exists billing_note text;

insert into public.ops_timesheets (id, client_slug, employee_id, weekday, hours) values
  ('t_jose_mon','mt-view-landscaping','e_jose','Monday',8),('t_jose_tue','mt-view-landscaping','e_jose','Tuesday',8),('t_jose_wed','mt-view-landscaping','e_jose','Wednesday',8),('t_jose_thu','mt-view-landscaping','e_jose','Thursday',8),('t_jose_fri','mt-view-landscaping','e_jose','Friday',6),
  ('t_sam_mon','mt-view-landscaping','e_sam','Monday',8),('t_sam_tue','mt-view-landscaping','e_sam','Tuesday',8),('t_sam_wed','mt-view-landscaping','e_sam','Wednesday',8),('t_sam_thu','mt-view-landscaping','e_sam','Thursday',8),('t_sam_fri','mt-view-landscaping','e_sam','Friday',8),
  ('t_tim_mon','mt-view-landscaping','e_tim','Monday',6),('t_tim_tue','mt-view-landscaping','e_tim','Tuesday',6),('t_tim_wed','mt-view-landscaping','e_tim','Wednesday',6),
  ('t_tyler_mon','mt-view-landscaping','e_tyler','Monday',8),('t_tyler_tue','mt-view-landscaping','e_tyler','Tuesday',8),('t_tyler_wed','mt-view-landscaping','e_tyler','Wednesday',8),('t_tyler_thu','mt-view-landscaping','e_tyler','Thursday',8),('t_tyler_fri','mt-view-landscaping','e_tyler','Friday',8),
  ('t_caleb_mon','mt-view-landscaping','e_caleb','Monday',8),('t_caleb_tue','mt-view-landscaping','e_caleb','Tuesday',8),('t_caleb_wed','mt-view-landscaping','e_caleb','Wednesday',8),('t_caleb_thu','mt-view-landscaping','e_caleb','Thursday',8),('t_caleb_fri','mt-view-landscaping','e_caleb','Friday',8),
  ('t_dwayne_mon','mt-view-landscaping','e_dwayne','Monday',8),('t_dwayne_tue','mt-view-landscaping','e_dwayne','Tuesday',8),('t_dwayne_wed','mt-view-landscaping','e_dwayne','Wednesday',8),('t_dwayne_thu','mt-view-landscaping','e_dwayne','Thursday',8),
  ('t_marcus_mon','mt-view-landscaping','e_marcus','Monday',8),('t_marcus_wed','mt-view-landscaping','e_marcus','Wednesday',7.5),('t_marcus_fri','mt-view-landscaping','e_marcus','Friday',7),
  ('t_diego_mon','mt-view-landscaping','e_diego','Monday',8),('t_diego_wed','mt-view-landscaping','e_diego','Wednesday',7.5),('t_diego_fri','mt-view-landscaping','e_diego','Friday',7),
  ('t_henry_tue','mt-view-landscaping','e_henry','Tuesday',8.5),('t_henry_thu','mt-view-landscaping','e_henry','Thursday',8),
  ('t_luis_tue','mt-view-landscaping','e_luis','Tuesday',8.5),('t_luis_thu','mt-view-landscaping','e_luis','Thursday',8)
on conflict (id) do nothing;

update public.ops_properties set billing_status='paid'  where client_slug='mt-view-landscaping' and id in ('p_olano','p_aquavista','p_reynolds','p_thompson','p_kirse','p_mckinley','p_garrett','p_branson');
update public.ops_properties set billing_status='billed' where client_slug='mt-view-landscaping' and id in ('p_sato','p_brennan','p_walsh','p_mancini','p_patel','p_henderson');
update public.ops_properties set billing_status='unbilled' where client_slug='mt-view-landscaping' and id in ('p_kovacs','p_park','p_davies','p_highland','p_caldwell','p_nguyen');
