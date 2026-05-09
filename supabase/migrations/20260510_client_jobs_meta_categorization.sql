-- ─────────────────────────────────────────────────────────────────────────────
-- 20260510_client_jobs_meta_categorization
--
-- Three jobs in one migration:
--
-- 1. Add `category` + `tier` columns to client_jobs_meta so jobs in
--    /dashboard/clients can carry per-niche + per-pricing-tier metadata
--    independently of the prospect record (some clients are custom-tier
--    and don't have a prospect row at all — Tekky, Bloodlines, etc.).
--
-- 2. Backfill prospects.pipeline_stage for every prospect that's missing
--    it. Without this, /dashboard/sales-pipeline shows almost nobody —
--    the page filters on pipeline_stage NOT NULL. Inferred from status:
--      paid           → '4' (delivered / purchased)
--      onboarded      → '4'
--      claimed        → '3' (bought + paid OR meeting completed)
--      pending-review → '2'
--      contacted      → '2'
--      replied        → '2'
--      pending        → '1'
--      bounced        → null (excluded from pipeline view)
--      unsubscribed   → null
--      dismissed      → null
--      everything else → '1'
--
-- 3. Set the column default to '1' for newly inserted prospects so the
--    next inquiry/audit submission lands ON the pipeline view at stage 1.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. client_jobs_meta — add category + tier ───────────────────────────────
-- Funnel-stage stays on prospects.pipeline_stage (single source of truth).
-- We DON'T duplicate it here per Ben's spec 2026-05-10.

alter table public.client_jobs_meta
  add column if not exists category text,
  add column if not exists tier text;

create index if not exists client_jobs_meta_category_idx
  on public.client_jobs_meta (category);

-- Helper for the application's ensureClientJobsMeta() — single round-trip
-- upsert that NEVER clobbers a value an operator manually set. Coalesce
-- means: if there's already a category and we're called with another,
-- the existing one wins.

create or replace function public.upsert_client_jobs_meta(
  p_client_slug text,
  p_category text default null,
  p_tier text default null
) returns public.client_jobs_meta as $$
declare
  v_row public.client_jobs_meta;
begin
  insert into public.client_jobs_meta (
    client_slug, category, tier
  ) values (
    p_client_slug, p_category, p_tier
  )
  on conflict (client_slug) do update set
    category   = coalesce(public.client_jobs_meta.category, excluded.category),
    tier       = coalesce(public.client_jobs_meta.tier, excluded.tier),
    updated_at = now()
  returning * into v_row;
  return v_row;
end;
$$ language plpgsql;

-- ─── 2. Backfill known slugs (category + tier) ───────────────────────────────
-- Matches the slug list in src/lib/client-site-urls.ts + src/app/clients/.
-- Idempotent — uses upsert helper so existing rows aren't clobbered.

-- AI System / fullsystem tier
select public.upsert_client_jobs_meta('zenith-sports', 'manufacturer', 'fullsystem');
select public.upsert_client_jobs_meta('itc-quick-attach', 'manufacturer', 'fullsystem');

-- Custom-tier bespoke clients
select public.upsert_client_jobs_meta('hector-landscaping', 'landscaping', 'custom');
select public.upsert_client_jobs_meta('lewis-county-autism', 'nonprofit', 'custom');
select public.upsert_client_jobs_meta('laser-lakes', 'food-bev', 'custom');
select public.upsert_client_jobs_meta('nevarland-outpost', 'apparel', 'custom');
select public.upsert_client_jobs_meta('wholme-naturopathy', 'health-wellness', 'custom');
select public.upsert_client_jobs_meta('greatminds-ae', 'consulting', 'custom');
select public.upsert_client_jobs_meta('riv-inc', 'consulting', 'custom');
select public.upsert_client_jobs_meta('visit-marfa', 'travel', 'custom');
select public.upsert_client_jobs_meta('bloodlines', 'indie-author', 'custom');
select public.upsert_client_jobs_meta('masters-window-tinting', 'auto-detail', 'custom');
select public.upsert_client_jobs_meta('meyer-electric', 'electrician', 'custom');
select public.upsert_client_jobs_meta('theoregonappraisers', 'real-estate', 'custom');
select public.upsert_client_jobs_meta('ways-executive-sedan', 'luxury-transport', 'custom');
select public.upsert_client_jobs_meta('mt-view-landscaping', 'landscaping', 'custom');
select public.upsert_client_jobs_meta('kr-ranches', 'food-bev', 'custom');
select public.upsert_client_jobs_meta('olympic-inspections', 'inspections', 'custom');

-- Friend-rate clients
select public.upsert_client_jobs_meta('ps-reiki', 'health-wellness', 'friend-rate');
select public.upsert_client_jobs_meta('heale-counseling', 'health-wellness', 'friend-rate');
select public.upsert_client_jobs_meta('tacos-yum', 'food-bev', 'friend-rate');

comment on column public.client_jobs_meta.category is
  'Niche / industry tag (electrician, manufacturer, indie-author, food-bev, etc.) — drives /dashboard/clients per-row badge';
comment on column public.client_jobs_meta.tier is
  'Pricing tier: standard | custom | fullsystem | friend-rate';

-- ─── 3. Backfill prospects.pipeline_stage from status ────────────────────────
-- Ben's pipeline page (/dashboard/sales-pipeline) only renders prospects
-- with pipeline_stage set. Most existing rows have NULL because the column
-- is recent + no auto-default existed at insert time. This puts every
-- active prospect ON the board so Ben sees his real pipeline.
--
-- Skips rows where pipeline_stage is already set (e.g. manually advanced).

update public.prospects
   set pipeline_stage = '4'
 where pipeline_stage is null
   and status in ('paid', 'onboarded');

update public.prospects
   set pipeline_stage = '3'
 where pipeline_stage is null
   and status = 'claimed';

update public.prospects
   set pipeline_stage = '2'
 where pipeline_stage is null
   and status in ('pending-review', 'contacted', 'replied');

update public.prospects
   set pipeline_stage = '1'
 where pipeline_stage is null
   and status in ('pending', 'pending_review', 'scouted', 'enriched', 'qc-passed', 'qc-failed');

-- Anything still NULL (e.g. bounced/unsubscribed/dismissed) stays NULL —
-- pipeline view filters them out by design (they're terminal states).

-- ─── 4. Set default for NEW prospects ────────────────────────────────────────
-- Going forward, every new prospect lands on the pipeline at stage 1
-- automatically. The prospect-creation API routes (audit/submit,
-- leads/submit, etc.) don't need code changes — the column default
-- applies on every INSERT that doesn't supply pipeline_stage.

alter table public.prospects
  alter column pipeline_stage set default '1';

comment on column public.prospects.pipeline_stage is
  'Sales pipeline stage (1-4 for website tier, 1-6 for fullsystem). Sub-state via lowercase letter suffix (e.g. 4a, 4b). Default 1 on insert. NULL = excluded from pipeline view (terminal states like bounced/unsubscribed).';
