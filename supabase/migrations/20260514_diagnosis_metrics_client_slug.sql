-- Diagnosis Metrics — make multi-tenant by adding client_slug as an
-- alternate key to prospect_id.
--
-- Why: the existing diagnosis-metrics tool is keyed by prospect_id,
-- which means it can only diagnose actual prospect records. Ben wants
-- to use the same tool to diagnose:
--   · BlueJays itself (no prospect record) → client_slug='bluejays'
--   · Any AI Package client portal (their own portal, no prospect tie) →
--     client_slug=<their slug, e.g. 'zenith-sports'>
--   · External businesses copied in for AI-chat diagnosis →
--     client_slug=<arbitrary, e.g. 'demo-acme-hvac'>
--
-- Each row is now keyed by EITHER prospect_id (for actual prospects)
-- OR client_slug (for everything else). Partial unique indexes enforce
-- exclusivity per key without requiring both to be NULL together.

alter table diagnosis_metrics
  alter column prospect_id drop not null;

alter table diagnosis_metrics
  add column if not exists client_slug text;

-- One row per prospect — replace the legacy UNIQUE constraint (which
-- treats NULL as "uniqueness violation") with a partial unique index
-- that ignores NULL rows. Dropping the constraint cascade-drops the
-- index it implicitly created.
alter table diagnosis_metrics
  drop constraint if exists diagnosis_metrics_prospect_id_key;
create unique index if not exists diagnosis_metrics_prospect_id_uidx
  on diagnosis_metrics(prospect_id)
  where prospect_id is not null;

-- One row per client_slug
create unique index if not exists diagnosis_metrics_client_slug_uidx
  on diagnosis_metrics(client_slug)
  where client_slug is not null;

-- Either-or check: every row must have AT LEAST one key.
alter table diagnosis_metrics
  drop constraint if exists diagnosis_metrics_key_required;
alter table diagnosis_metrics
  add constraint diagnosis_metrics_key_required
  check (prospect_id is not null or client_slug is not null);

-- Convenience: index for slug-based lookups
create index if not exists diagnosis_metrics_client_slug_idx
  on diagnosis_metrics(client_slug)
  where client_slug is not null;
