-- bj ai Day 3 — prospects.ai_qualification JSONB column.
--
-- Caches the output of the ai_skill:qualify run for each prospect.
-- Written by src/lib/ai-skills/skills/qualify.ts after each
-- qualify invocation. Read by triage to skip already-qualified
-- prospects, and by future Madie pipeline UI to surface the AI
-- recommendation inline on the prospect card.
--
-- Shape:
-- {
--   "fit_score": 0-100,
--   "recommended_tier": "free_audit_only" | "$997_website" | "$10k_ai_system" | "disqualify",
--   "recommended_action": "<specific next move>",
--   "recommended_channel": "email" | "sms" | "phone" | "wait",
--   "drafted_message": "<Ben-voice first-touch>",
--   "reasoning": "<why these recommendations>",
--   "summary": "<one-line for SMS / logs>",
--   "qualified_at": "<ISO timestamp>",
--   "audit_id": "<the audit row this qualification was based on>"
-- }

alter table prospects
  add column if not exists ai_qualification jsonb;

comment on column prospects.ai_qualification is
  'Cached output of the ai_skill:qualify run for this prospect. Shape: { fit_score, recommended_tier, recommended_action, recommended_channel, drafted_message, reasoning, summary, qualified_at, audit_id }. Written by src/lib/ai-skills/skills/qualify.ts; consumed by triage + future Madie pipeline UI.';
