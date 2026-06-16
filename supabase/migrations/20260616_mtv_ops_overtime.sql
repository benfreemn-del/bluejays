-- ─────────────────────────────────────────────────────────────────────────────
-- 20260616_mtv_ops_overtime
--
-- Overtime for the Mt View ops backend. Each employee logs weekly OT hours,
-- paid at a multiplier (time-and-a-half by default) on top of the normal route
-- labor. The engine treats OT as an extra labor cost that reduces gross profit.
-- Additive + idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.ops_employees
  add column if not exists overtime_hours_weekly numeric not null default 0;

alter table public.ops_assumptions
  add column if not exists overtime_multiplier numeric not null default 1.5;
