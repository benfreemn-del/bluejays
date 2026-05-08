-- AI Package welcome-sequence tracker on prospects.
--
-- Used by /api/cron/ai-package-welcome to send the 3-email post-purchase
-- welcome sequence (immediate / Day 1 / Day 2) to fullsystem clients.
--
-- 0 = no email sent yet (initial state; cron picks them up + sends 1)
-- 1 = welcome email 1 sent
-- 2 = welcome email 2 sent
-- 3 = welcome email 3 sent (sequence complete)
--
-- Idempotent — safe to re-run.

alter table public.prospects
  add column if not exists ai_package_welcome_step smallint default 0;

alter table public.prospects
  add column if not exists ai_package_welcome_at timestamptz;

-- Common query: "show me fullsystem clients with welcome incomplete"
create index if not exists prospects_ai_package_welcome_idx
  on public.prospects (pricing_tier, ai_package_welcome_step)
  where pricing_tier = 'fullsystem';
