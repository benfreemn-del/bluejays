-- Owner preferences — AI to-do nudge frequency (added 2026-05-06)
--
-- Controls how often the per-client AI Operator nudges the owner to
-- work through their `client_tasks` list. The nudge logic itself ships
-- with AI Operator Wave 1; this column captures the setting now so
-- the portal Notifications panel exposes the choice immediately.
--
-- Values:
--   - 'every_login' (default) — banner on every portal session until dismissed
--   - 'daily'                — once-a-day digest at digest_hour
--   - 'weekly'               — Monday-morning summary only
--   - 'off'                  — owner self-driven, no AI nudges

ALTER TABLE public.client_owner_preferences
  ADD COLUMN IF NOT EXISTS todo_nudge_frequency TEXT
    NOT NULL DEFAULT 'every_login';

CREATE INDEX IF NOT EXISTS client_owner_preferences_todo_nudge_idx
  ON public.client_owner_preferences (todo_nudge_frequency)
  WHERE todo_nudge_frequency != 'off';

COMMENT ON COLUMN public.client_owner_preferences.todo_nudge_frequency IS
  'Frequency owner wants the AI Operator to nudge them through their
   client_tasks list. Values: every_login / daily / weekly / off.
   Default every_login (most engaging). Wiring lands with AI Operator
   Wave 1 — see bluejays/docs/AI_PACKAGE_PLAYBOOK.md Phase 9.';
