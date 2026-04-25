-- Bounce tracking columns on prospects.
--
-- Soft-bounce escalation logic in src/lib/email-deliverability.ts
-- relies on these columns to detect when a prospect has hit 3 soft
-- bounces inside a rolling 7-day window — at which point we treat
-- them as a hard bounce, suppress the address at SendGrid, and pause
-- their funnel enrollment.
--
-- The `prospects.status` TEXT column already accepts free-form text
-- (no CHECK constraint, no enum). Adding the value `"bounced"` to
-- the ProspectStatus union in src/lib/types.ts is the only code-side
-- change required to start writing this status — no DDL is needed
-- on the status column itself. Documenting it here so future
-- maintainers know `"bounced"` is now a recognized terminal state
-- (excluded from outreach sweeps, similar to `"unsubscribed"` and
-- `"dismissed"`).

alter table public.prospects
  add column if not exists soft_bounce_count int not null default 0;

alter table public.prospects
  add column if not exists last_soft_bounce_at timestamptz;

create index if not exists prospects_soft_bounce_idx
  on public.prospects (last_soft_bounce_at desc)
  where soft_bounce_count > 0;
