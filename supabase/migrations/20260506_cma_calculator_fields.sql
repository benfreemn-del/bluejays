-- Cut-My-Agency calculator lead-gate fields (added 2026-05-06)
--
-- Three new top-level columns let the dashboard filter calculator leads
-- by industry / timeline / goal without parsing scraped_data JSON every
-- query. The same values are also written into
-- scraped_data.cutMyAgencyCalculator.gate for redundant raw access.
--
-- All three are nullable + free-form TEXT — the calculator UI passes
-- whitelisted slug values (e.g. "manufacturer", "this_month",
-- "more_leads") but we don't enforce that at the DB layer so future
-- A/B variant question sets can land without a column-type migration.
--
-- Indexes are partial (only when the column is set) so the cold-prospect
-- backlog (where these columns are null) doesn't pay the index-bloat
-- cost.

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS cma_industry TEXT,
  ADD COLUMN IF NOT EXISTS cma_timeline TEXT,
  ADD COLUMN IF NOT EXISTS cma_goal     TEXT;

CREATE INDEX IF NOT EXISTS prospects_cma_industry_idx
  ON public.prospects (cma_industry)
  WHERE cma_industry IS NOT NULL;

CREATE INDEX IF NOT EXISTS prospects_cma_timeline_idx
  ON public.prospects (cma_timeline)
  WHERE cma_timeline IS NOT NULL;

CREATE INDEX IF NOT EXISTS prospects_cma_goal_idx
  ON public.prospects (cma_goal)
  WHERE cma_goal IS NOT NULL;

COMMENT ON COLUMN public.prospects.cma_industry IS
  'Industry slug captured from /cut-my-agency calculator gate (Q1=industry).
   Whitelist driven by client UI tile config; new values OK without migration.';
COMMENT ON COLUMN public.prospects.cma_timeline IS
  'Buying-timeline slug from /cut-my-agency gate (Q2=timeline). Values:
   this_month / 60_90_days / just_looking. Drives thank-you page urgency.';
COMMENT ON COLUMN public.prospects.cma_goal IS
  '#1-goal slug from /cut-my-agency gate (Q3=goal). Values: more_leads /
   lower_cost / better_tracking / own_system. Drives email personalization.';
