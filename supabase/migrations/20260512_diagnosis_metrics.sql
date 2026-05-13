-- Diagnosis Metrics — per-prospect financial profile that persists
-- across Hormozi diagnostic runs. Powers the LTV/CAC/Churn/MRR/AOV/GM
-- intake on /dashboard/diagnostic + magic-link client-completion view.
--
-- Schema choices:
--   · Keyed by prospect_id (unique) so it's a single living record
--     per prospect that updates over time, not per-run ephemeral
--   · Standalone fields (not JSONB) on the 6 core metrics so we can
--     index/aggregate (e.g. "show all prospects w/ churn > 10%")
--   · estimates JSONB tracks WHICH fields are user-entered vs
--     industry-benchmark vs reverse-engineered (audit trail)
--   · derived JSONB caches computed metrics (LTV, payback, ratios)
--     so the dashboard reads are fast — recompute on every save
--   · magic_token = URL-as-secret for client-facing completion view
--     at /diagnosis/[token] (CLAUDE.md auth pattern, same as /client/[id])

create table if not exists diagnosis_metrics (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid unique references prospects(id) on delete cascade,

  -- Industry context (drives benchmark selection)
  industry text,
  -- Allowed v1: 'landscaping' | 'electrician' | 'contractor' |
  --             'small_ecomm' | 'other'
  -- Stored free-form so we can add verticals without DDL.

  -- Six core metrics — smart-ordered for entry
  monthly_revenue numeric(12,2),         -- Step 1 (unlocks ARPU, LTV, MRR)
  active_customers int,                   -- Step 2 (unlocks ARPU)
  average_order_value numeric(12,2),      -- Step 3 (often derived from above)
  gross_margin_pct numeric(5,2),          -- Step 4 (cap 100.00)
  churn_monthly_pct numeric(5,2),         -- Step 5 (often unknown — qualifier flow)
  customer_acquisition_cost numeric(12,2),-- Step 6 (often unknown — qualifier flow)

  -- Which fields used industry-default vs reverse-engineered vs user-entered.
  -- Shape: { "churn_monthly_pct": "industry_default" | "derived" | "user_entered" }
  estimates jsonb not null default '{}'::jsonb,

  -- Reverse-engineering qualifier raw answers (for audit + recompute).
  -- Shape: { "churn_returning_customers_last_year": 60,
  --          "churn_total_customers_last_year": 100, ... }
  qualifier_answers jsonb not null default '{}'::jsonb,

  -- Derived metrics — cached, recomputed on every save.
  -- Shape: { "ltv": 480, "ltv_cac_ratio": 3.2, "payback_months": 4,
  --          "avg_lifespan_months": 10, "arpu_monthly": 40,
  --          "health_score": "healthy" | "watch" | "red_flag" }
  derived jsonb not null default '{}'::jsonb,

  -- Magic-link for prospect-facing completion view
  magic_token text unique,
  magic_token_expires_at timestamptz,
  client_last_opened_at timestamptz,
  client_completed_at timestamptz,

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagnosis_metrics_prospect_idx
  on diagnosis_metrics(prospect_id);
create index if not exists diagnosis_metrics_magic_token_idx
  on diagnosis_metrics(magic_token)
  where magic_token is not null;
create index if not exists diagnosis_metrics_industry_idx
  on diagnosis_metrics(industry);

-- updated_at auto-bump trigger
create or replace function diagnosis_metrics_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists diagnosis_metrics_updated_at_trg on diagnosis_metrics;
create trigger diagnosis_metrics_updated_at_trg
  before update on diagnosis_metrics
  for each row execute function diagnosis_metrics_set_updated_at();
