-- 20260509_client_jobs_meta — per-client snooze/follow-up metadata
--
-- Wraps the client_tasks aggregation in /dashboard/clients with a
-- per-slug "snoozed for follow-up" surface. Use case (locked
-- 2026-05-09): a prospect was interested in the $10,000 AI System
-- offer but isn't ready yet — Ben snoozes the row + picks a
-- date/time, and the system fires SMS+email reminders at that
-- moment so the lead doesn't fall off.
--
-- Why a separate table: snooze is orthogonal to task status. The
-- client may have 0 tasks open AND be snoozed (waiting on a
-- decision), or have 12 open tasks AND be snoozed (long-running
-- build with a stale-thread warning). Per-slug metadata is the
-- right granularity for the /dashboard/clients UI which is
-- already aggregated to one row per client_slug.

create table if not exists public.client_jobs_meta (
  client_slug text primary key,

  -- Snooze state
  snoozed boolean not null default false,
  snooze_reason text,                -- 'interested_10k' | 'awaiting_decision' | 'manual' | etc.
  snooze_until timestamptz,          -- when the reminder should fire
  snooze_set_at timestamptz,         -- when Ben hit the snooze button
  snooze_notified_at timestamptz,    -- when the reminder fired (idempotency)
  snooze_notes text,                 -- free-form context — "wanted to wait until Q3"

  -- Misc per-slug metadata
  notes text,
  updated_at timestamptz not null default now(),
  updated_by text default 'owner'
);

create index if not exists client_jobs_meta_snoozed_idx
  on public.client_jobs_meta (snoozed)
  where snoozed = true;

create index if not exists client_jobs_meta_due_idx
  on public.client_jobs_meta (snooze_until)
  where snoozed = true and snooze_notified_at is null;

comment on table public.client_jobs_meta is
  'Per-client metadata for /dashboard/clients (snooze/follow-up reminders). Keyed by client_slug 1:1.';
