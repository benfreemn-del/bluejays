-- ─────────────────────────────────────────────────────────────────────────────
-- Madie commission ledger — lap-at-time-of-close (audit B7).
--
-- Problem: the commission API was reading Madie's CURRENT lap and applying
-- those rates uniformly across every paid prospect. So if she promoted from
-- setter (Lap 4 → $1k/AI close) to closer (Lap 5 → $2k/AI close), every
-- previously-credited close in the lifetime ledger jumped to $2k retroactively,
-- inflating lifetime totals.
--
-- Fix: stamp the lap that was active AT THE MOMENT each prospect's status
-- flipped to 'paid'. Future updateProspect() writes this when status
-- transitions in to 'paid'. The commission API then reads lap_at_close per
-- row (falls back to current lap when null for legacy data).
--
-- Backfill: for already-paid prospects (legacy rows from before this column
-- existed), copy the current lap as a one-time best-effort. They were ALL
-- credited at the same rate before this change anyway, so this preserves the
-- behavior of "current rate applied" for legacy data while every NEW close
-- gets locked at its actual lap.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.prospects
  add column if not exists madie_lap_at_close smallint check (
    madie_lap_at_close is null or (madie_lap_at_close between 1 and 6)
  );

comment on column public.prospects.madie_lap_at_close is
  'Madie''s lap (1-6) at the moment status flipped to paid. NULL for non-Madie-attributed closes; commission API falls back to current lap when reading.';

-- One-time backfill: stamp the current lap from app_settings on rows that
-- are already paid but missing the lap. Legacy rows behave identically to
-- before (always credited at current rate); going forward, lap is locked.
update public.prospects p
set madie_lap_at_close = greatest(1, least(6, coalesce(
  (select (s.value->>'lap')::int from public.app_settings s where s.key = 'madie_current_lap'),
  1
)))
where p.status = 'paid'
  and p.paid_at is not null
  and p.madie_lap_at_close is null;
