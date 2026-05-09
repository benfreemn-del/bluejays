-- ─────────────────────────────────────────────────────────────────────────────
-- 20260508 — app_settings table + Madie commission baseline
--
-- Two pieces:
--
-- 1. app_settings — generic key/value/jsonb config table the codebase had
--    been READING from (madie_current_lap, madie_commission_baseline_at)
--    but which was never actually created. This shipping migration
--    backfills it.
--
-- 2. madie_commission_baseline_at — reset Madie's commission to $0
--    going forward. The /api/madie/commission route now filters paid
--    prospects by paid_at >= baseline, so resetting the baseline
--    moves the displayed totals to zero without destroying any
--    historical prospect data. Ben can re-stamp at any time:
--      update app_settings set value = jsonb_build_object('at', now()::text)
--      where key = 'madie_commission_baseline_at';
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.app_settings_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists app_settings_touch on public.app_settings;
create trigger app_settings_touch
  before update on public.app_settings
  for each row execute function public.app_settings_touch_updated_at();

insert into public.app_settings (key, value)
values (
  'madie_commission_baseline_at',
  jsonb_build_object('at', now()::text, 'reset_by', 'ben', 'reason', 'fresh start 2026-05-08')
)
on conflict (key) do update set value = excluded.value, updated_at = now();
