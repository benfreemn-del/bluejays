-- ─────────────────────────────────────────────────────────────────────────────
-- 20260519_mt_view_owners
--
-- Pre-launch seed for Mountain View Landscape & Design (Auburn, WA).
--
-- Mt View is moving from "inquire-only routing" (no portal) to a full
-- Custom $100/yr tier with the per-tenant /clients/mt-view-landscaping/portal
-- enabled. The portal config already exists in
-- src/lib/portal-configs.ts (MT_VIEW_LANDSCAPING) — this migration seeds
-- the two `client_owners` rows so Tim and Bonnie Hunsaker can log in.
--
-- IDEMPOTENT — re-running won't duplicate rows (ON CONFLICT (lower(email))
-- DO NOTHING).
--
-- Tabs visible to the Hunsakers (per portal-configs.ts MT_VIEW_LANDSCAPING):
--   - Overview · Leads · Insights · Account · Routes
--   - AI/Ads/Funnels/Map/Customers OFF (no AI Marketing System on this tier)
--
-- TEMPORARY PASSWORDS (regenerate via crypto.randomBytes if leaked):
--   Tim:    mt-view-launch-tim-2026
--   Bonnie: mt-view-launch-bonnie-2026
--
-- ⚠ DO NOT paste the temporary plaintext passwords into Slack, email,
-- ticket comments, or git commits. Share them via phone / SMS / in-person
-- ONLY. Both owners should change their password on first login.
--
-- Hash format: sha256(plain || PORTAL_PASSWORD_SALT)
--   PORTAL_SALT = process.env.CLIENT_PORTAL_SALT, default
--   'bluejays-portal-2026-default-salt' (from src/lib/client-auth.ts:20).
--
-- If CLIENT_PORTAL_SALT is set to a non-default value on Vercel,
-- REGENERATE THESE HASHES via:
--
--   node -e "const c=require('crypto');const salt=process.env.CLIENT_PORTAL_SALT||'bluejays-portal-2026-default-salt';['mt-view-launch-tim-2026','mt-view-launch-bonnie-2026'].forEach(p=>console.log(p, c.createHash('sha256').update(p+salt).digest('hex')));"
--
-- NOTE: The login emails below use the @mountainviewlandscape.com domain
-- (the brand-facing address). If Tim or Bonnie prefer their daily-checked
-- gmail (mtviewlandscapeonline@gmail.com) as the login handle, update
-- via the dashboard /dashboard/clients/mt-view-landscaping/account tab.
-- Email is only the login handle — the portal cookie is owner-id scoped,
-- not email-confirmation gated, so any unique handle works.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.client_owners
  (client_slug, email, name, password_hash, role)
values
  ('mt-view-landscaping',
   'tim@mountainviewlandscape.com',
   'Tim Hunsaker',
   -- sha256('mt-view-launch-tim-2026' || 'bluejays-portal-2026-default-salt')
   'b31473036ca3d4512ac6e4a61c95cde134c298121cfed9ca3348174347394c32',
   'owner'),
  ('mt-view-landscaping',
   'bonnie@mountainviewlandscape.com',
   'Bonnie Hunsaker',
   -- sha256('mt-view-launch-bonnie-2026' || 'bluejays-portal-2026-default-salt')
   '956fbe828de8150ab94d34f23be23a004a834bd5c7283278b1e74f0ed6840aea',
   'owner')
on conflict (lower(email)) do nothing;
