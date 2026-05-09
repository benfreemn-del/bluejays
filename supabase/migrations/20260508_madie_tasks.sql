-- ─────────────────────────────────────────────────────────────────────────────
-- 20260508 — madie_tasks (Madie's personal editable to-do list)
--
-- Madie's overview tab on /dashboard was showing the same panels Ben sees
-- (BusinessSetupChecklist for tax/legal, PaymentLinksPanel, etc.) — none
-- of which are her job. This table backs her own to-do list:
-- add / edit / remove / complete line by line, click-the-circle to toggle.
--
-- Per-row, simple. No assignee, no priority, no due dates — Madie wanted
-- a plain editable list, not a project-management tool. The MadieRaceTrack
-- already gamifies her larger progression; this is the day-to-day "what
-- am I knocking out today" surface.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.madie_tasks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  done boolean not null default false,
  done_at timestamptz,
  sort_order numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists madie_tasks_done_sort_idx
  on public.madie_tasks (done, sort_order asc);

create or replace function public.madie_tasks_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists madie_tasks_touch on public.madie_tasks;
create trigger madie_tasks_touch
  before update on public.madie_tasks
  for each row execute function public.madie_tasks_touch_updated_at();
