-- Multi-tenant partner program — extends the BlueJays partners table to
-- support per-client (Zenith Sports / TEKKY, ITC Quick Attach, etc.)
-- partner programs without forking the schema.
--
-- Pattern matches client_funnels / client_leads / client_ads:
--   client_slug = 'bluejays'      → BlueJays website-sales partners ($200/close)
--   client_slug = 'zenith-sports' → TEKKY ball + coaching partners ($25/ball)
--   client_slug = 'itc-quick-attach' → tractor accessory partners (TBD)
--
-- Backward compatible — existing partner rows are stamped 'bluejays' so
-- the existing /partners login + dashboard stay working with no code
-- changes beyond the slug filter.
--
-- Codes (the ?ref=<code> slug) stay globally unique across all clients.
-- Two partners across two clients can NOT collide on a code — keeps
-- attribution unambiguous when a prospect crosses tenant boundaries.
--
-- Each row also gets a `default_payout_cents` so a Zenith coach can
-- be set to $25 (ball commission) while a BlueJays sales partner stays
-- at $20000 ($200/close). The actual partner_referrals.amount_cents
-- remains per-row so a coaching-package upgrade ($100) is recorded
-- alongside ball sales ($25) on the same partner record.

-- ─── partners.client_slug ────────────────────────────────────────────
alter table public.partners
  add column if not exists client_slug text not null default 'bluejays';

create index if not exists partners_client_slug_idx
  on public.partners(client_slug);

-- Optional default payout per partner (overrides the per-referral default
-- when a referral is created without an explicit amount_cents). Keeps
-- the BlueJays $200 default behavior unchanged for existing rows.
alter table public.partners
  add column if not exists default_payout_cents integer;

-- ─── partner_referrals.client_slug ───────────────────────────────────
alter table public.partner_referrals
  add column if not exists client_slug text not null default 'bluejays';

create index if not exists partner_referrals_client_slug_idx
  on public.partner_referrals(client_slug);

-- Optional kind label so a partner with multiple commission types
-- (Zenith: ball / coaching package / parent referral) can categorize
-- each referral row. Free-form text — the dashboard groups by it.
alter table public.partner_referrals
  add column if not exists kind text;

-- ─── existing rows ────────────────────────────────────────────────
-- Anything created before this migration is BlueJays website sales.
-- Default already handles new inserts — this stamps any row that was
-- created with an explicit NULL.
update public.partners
  set client_slug = coalesce(client_slug, 'bluejays')
  where client_slug is null or client_slug = '';

update public.partner_referrals
  set client_slug = coalesce(client_slug, 'bluejays')
  where client_slug is null or client_slug = '';
