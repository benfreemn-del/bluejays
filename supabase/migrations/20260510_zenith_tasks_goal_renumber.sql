-- ─────────────────────────────────────────────────────────────────────────────
-- 20260510_zenith_tasks_goal_renumber
--
-- Per Ben spec 2026-05-10: rename "Sprint 1/2/3/4:" prefixes on Zenith
-- tasks to "Goal 1/2/3/4:" so the work isn't hardwired to a timeline.
-- Same dependency ordering (Goal 2 depends on Goal 1, etc.) but the
-- framing now reads as outcomes-to-hit rather than weeks-to-deliver.
--
-- Also strips "Day 14" / "D14"-type day-anchor language from the
-- description bodies where it appears as a deadline; the funnel-
-- cadence references (D0/D2/D5/D9/D14) stay because they're
-- operational facts about email send-day offsets, not project
-- deadlines.
--
-- Idempotent — uses string replace, so re-running is a no-op.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Rename task titles: Sprint N → Goal N ────────────────────────────────

update public.client_tasks
   set title = regexp_replace(title, '^Sprint (\d+):', 'Goal \1:')
 where client_slug = 'zenith-sports'
   and title ~ '^Sprint \d+:';

-- ─── 2. Rename any inline "Sprint N:" inside descriptions too ────────────────
-- (covers cases where one task description references another by name.)

update public.client_tasks
   set description = regexp_replace(description, 'Sprint (\d+):', 'Goal \1:', 'g')
 where client_slug = 'zenith-sports'
   and description ~ 'Sprint \d+:';

-- ─── 3. Strip remaining "Day 14" / "Day-14" / etc. deadline language ─────────
-- Per Ben: don't be hardwired into a timeline. Replaces:
--   "Day 14" / "Day-14" / "day 14"  → "the goal"
-- Cadence references like "(D0/D2/D5/D9/D14)" are LEFT ALONE — those are
-- operational email-send-day offsets, not project deadlines.

update public.client_tasks
   set description = regexp_replace(description, '\m[Dd]ay[ -]?14\M', 'the goal', 'g')
 where client_slug = 'zenith-sports'
   and description ~ '[Dd]ay[ -]?14';

-- ─── 4. Audit row — log what was touched so the operator sees the diff ───────
-- Returns the count of rows whose title now starts with Goal so Ben can
-- verify post-migration. Run as a separate select after the migration:
--
--   select count(*) from public.client_tasks
--    where client_slug = 'zenith-sports' and title ~ '^Goal \d+:';
