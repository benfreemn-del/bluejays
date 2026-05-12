-- Hormozi-fit score on inbound prospects. Claude scores 0-100 based
-- on Grand Slam Offer fit, Core Four lead-gen readiness, and
-- service-business ICP match. Triaged automatically so Madie /
-- Raidas / Tyler see hot leads first instead of working a flat queue.
--
-- Scored once per prospect on /api/audit/submit + /api/leads/submit
-- (fire-and-forget, never blocks the submission response).
--
-- Score thresholds (Hormozi-style):
--   80-100 → 🔥 priority (call within 24h)
--   60-79  → 🟢 good fit (call within week)
--   40-59  → 🟡 borderline (long-form qualification needed)
--   0-39   → 🔴 weak fit (audit-only nurture)
-- Nulls = not yet scored (legacy rows or feature disabled).

alter table prospects
  add column if not exists hormozi_fit_score int check (hormozi_fit_score between 0 and 100),
  add column if not exists hormozi_fit_summary text,
  add column if not exists hormozi_fit_scored_at timestamptz;

create index if not exists prospects_hormozi_fit_score_idx on prospects(hormozi_fit_score desc nulls last);
