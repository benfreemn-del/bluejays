-- Tiny global key/value settings table for cross-browser admin
-- toggles that don't fit into existing per-tenant tables.
--
-- First use case: madie_current_lap — Ben presses a button on the
-- race track to graduate Madie past her current lap (Lap 1-2 are
-- auto-detected from call volume; Laps 3-5 are skill-based and
-- require manual graduation since we don't yet log skill-completion
-- events). Persisted server-side so Madie's browser reads the same
-- value Ben set from his browser.
--
-- Future uses: feature flags, ramp gates, anything that's "one
-- value globally" without belonging to a specific client_slug.
--
-- Safe to run repeatedly — IF NOT EXISTS guards everywhere.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- Seed Madie's current lap to 1 (Cold Caller). Once she clears the
-- 500-call/15-meeting weekly cadence, the API auto-advances her to
-- Lap 2. Past that, Ben graduates manually via the admin button.
insert into public.app_settings (key, value)
values ('madie_current_lap', '{"lap": 1}'::jsonb)
on conflict (key) do nothing;
