-- ─────────────────────────────────────────────────────────────────────────────
-- 20260616_mtv_ops_crew_side
--
-- Construction vs maintenance split for the Mt View ops backend. Every crew
-- belongs to one side:
--   maintenance  → runs recurring routes (route-based P&L, already modeled)
--   construction → runs projects/jobs (job-based P&L — modeled in a later step)
--
-- Additive + idempotent. Existing crews are classified: Bonnie's crew =
-- maintenance, Tim's install/hardscape crew = construction.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.ops_crews
  add column if not exists side text not null default 'maintenance';

update public.ops_crews set side = 'construction'
  where id = 'c_install' and client_slug = 'mt-view-landscaping';
update public.ops_crews set side = 'maintenance'
  where id = 'c_maint' and client_slug = 'mt-view-landscaping';
