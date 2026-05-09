-- ─────────────────────────────────────────────────────────────────────────────
-- 20260510_zenith_owners_and_subscriptions
--
-- Pre-walkthrough seed for the 2026-05-10 Tekky meeting:
--   1. client_owners rows for Paul Hanson + Philip Lund so they can log
--      into /clients/zenith-sports/portal
--   2. client_subscriptions rows so the AI Operator dashboard can correctly
--      gate features via hasCapability(slug, "claude.*") / "hyperloop.*"
--
-- Both seeds are IDEMPOTENT — re-running won't duplicate rows.
--
-- Default tiers (locked 2026-05-09):
--   hyperloop = "off"     — Zero-cost until 50+ leads in system, then
--                            recommend upgrade to Starter ($99/mo).
--   claude    = "starter" — $49/mo from day 1 — Lead Reply Drafter saves
--                            Philip 3-5 hours/week even at low lead volume.
--   twilio    = "off"     — Awaiting ZENITH_TWILIO_NUMBER env var
--   sendgrid  = "active"  — Already routing through bluejayportfolio.com
--   meta-ads  = "off"     — Awaiting Phase A account stand-up
--   google-ads= "off"     — Awaiting Phase A account stand-up
--
-- These tiers can flip via /dashboard/clients/zenith-sports/insights →
-- Subscriptions panel after the walkthrough. The walkthrough demo
-- presents the AI Operator dashboard with Claude Starter active so
-- Lead Reply Drafter can be shown as the first AI skill coming online.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── PART 1: client_owners ───────────────────────────────────────────────────
-- Paul Hanson + Philip Lund seeded with TEMPORARY passwords. Both will
-- need to change passwords on first login (best practice — no rotation
-- mechanism enforced in code yet, just a discipline note).
--
-- The password_hash format is: sha256(plain || PORTAL_PASSWORD_SALT)
-- where PORTAL_PASSWORD_SALT = process.env.CLIENT_PORTAL_SALT (set on Vercel).
--
-- ⚠ DO NOT paste the temporary plaintext passwords into Slack, email,
-- ticket comments, or git commits. Share them via signal / phone /
-- in-person ONLY.
--
-- TEMPORARY PASSWORDS (regenerate via crypto.randomBytes if leaked):
--   Paul:   tekky-walkthrough-paul-2026
--   Philip: tekky-walkthrough-philip-2026
--
-- These hashes were computed assuming PORTAL_SALT = "bluejays-portal-2026-default-salt"
-- (the in-code default). If CLIENT_PORTAL_SALT is set to anything else
-- on Vercel, REGENERATE THESE HASHES — see the helper script at
-- the bottom of this file.

insert into public.client_owners
  (client_slug, email, name, password_hash, role)
values
  ('zenith-sports',
   'paul@zenithsports.org',
   'Paul Hanson',
   -- sha256('tekky-walkthrough-paul-2026' || 'bluejays-portal-2026-default-salt')
   '52b888e8b97843e97e9942751cb059019143452045d8a6fa8abecbb1462d9a7c',
   'owner'),
  ('zenith-sports',
   'philip@zenithsports.org',
   'Philip Lund',
   -- sha256('tekky-walkthrough-philip-2026' || 'bluejays-portal-2026-default-salt')
   '9652e0d08f1418ec47acb014f7e584de81b123203b396a5bf238554e59223d59',
   'owner')
on conflict (lower(email)) do nothing;

-- ⚠ HASHES ABOVE ASSUME PORTAL_SALT = 'bluejays-portal-2026-default-salt'
-- (the in-code default in src/lib/client-auth.ts). If CLIENT_PORTAL_SALT
-- is set to anything else on Vercel, REGENERATE these two hashes:
--
--   node -e "const c=require('crypto');const salt=process.env.CLIENT_PORTAL_SALT||'bluejays-portal-2026-default-salt';['tekky-walkthrough-paul-2026','tekky-walkthrough-philip-2026'].forEach(p=>console.log(p, c.createHash('sha256').update(p+salt).digest('hex')));"
--
-- Replace the two hash strings above with the real outputs, THEN paste
-- the migration into Supabase SQL editor.


-- ─── PART 2: client_subscriptions ────────────────────────────────────────────
-- Seed all 6 services so the AI Operator dashboard has explicit state to
-- read. "off" tier = service exists but capability is gated off.

insert into public.client_subscriptions
  (client_slug, service, tier, status, monthly_price_usd, managed_by, started_at)
values
  ('zenith-sports', 'hyperloop',  'off',     'trialing', 0,   'bluejays', now()),
  ('zenith-sports', 'claude',     'starter', 'trialing', 49,  'bluejays', now()),
  ('zenith-sports', 'twilio',     'off',     'paused',   0,   'bluejays', now()),
  ('zenith-sports', 'sendgrid',   'active',  'active',   0,   'bluejays', now()),
  ('zenith-sports', 'meta-ads',   'off',     'paused',   0,   'bluejays', now()),
  ('zenith-sports', 'google-ads', 'off',     'paused',   0,   'bluejays', now())
on conflict (client_slug, service) do nothing;
