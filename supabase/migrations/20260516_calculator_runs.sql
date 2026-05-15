-- Calculator-run telemetry for /cut-my-agency.
--
-- Closes the "highest-intent $10K funnel runs in a black hole" gap
-- flagged in the 2026-05-14 Hormozi backend review. Before this table
-- existed, Ben could see WHO submitted the calculator's lead form (via
-- prospects.scraped_data.cma_*) but NOT how many people calculated
-- their savings number, bounced, and left. The savings number is the
-- dopamine moment — most users see it, most don't submit. We want to
-- measure both halves.
--
-- One row per results-screen hit. Updated to converted=true when the
-- user submits the lead form (POST /api/cut-my-agency/submit).
--
-- ip_hash (not raw IP) for soft duplicate detection without storing PII.

create table if not exists public.calculator_runs (
  id uuid primary key default gen_random_uuid(),
  -- SHA-256 hash of client IP — lets us count unique runs without keeping IPs.
  ip_hash text,
  -- Step-1 inputs
  monthly_retainer_cents bigint,
  months_as_client integer,
  monthly_ad_spend_cents bigint,
  services text[],
  -- Step-2/3/4 visual-gate answers
  industry text,
  timeline text,
  goal text,
  -- Computed math (cents to avoid float drift)
  three_year_agency_cost_cents bigint,
  savings_cents bigint,
  monthly_savings_cents bigint,
  -- Conversion tracking
  converted_to_lead boolean not null default false,
  converted_email text,
  converted_at timestamptz,
  -- Attribution
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_referrer text,
  -- Lifecycle
  ran_at timestamptz not null default now()
);

-- Common queries: "runs this week" and "conversion rate by week".
create index if not exists calculator_runs_ran_at_idx
  on public.calculator_runs (ran_at desc);

-- For the dashboard tile: "X of Y runs converted to leads".
create index if not exists calculator_runs_converted_idx
  on public.calculator_runs (converted_to_lead, ran_at desc);

-- For the per-industry breakdown if Ben wants to see which verticals
-- are calculating (manufacturer / author / service).
create index if not exists calculator_runs_industry_idx
  on public.calculator_runs (industry, ran_at desc)
  where industry is not null;
