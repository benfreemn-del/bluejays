-- ─────────────────────────────────────────────────────────────────────────────
-- 20260518_tekky_shared_password
--
-- Replace the per-person temp passwords from 20260510 with a single shared
-- password for both Paul + Philip. Same access either way.
--
-- Reasoning (Ben 2026-05-18): "create a login for Philip too with a general
-- password — same access". Shared password is easier to coordinate verbally
-- with both founders + lets either of them sign in to react to leads
-- without password-rotation friction.
--
-- Shared password: tekky-launch-2026
-- Hash: sha256(password || "bluejays-portal-2026-default-salt")
--
-- ⚠ Both founders should change to personal passwords once they're
-- comfortable in the portal (Settings → Change Password). Until then,
-- treat tekky-launch-2026 as the "founder unlock" password.
--
-- ⚠ HASH ASSUMES PORTAL_SALT = 'bluejays-portal-2026-default-salt'.
-- If CLIENT_PORTAL_SALT is set differently on Vercel, regenerate via:
--   node -e "const c=require('crypto');const s=process.env.CLIENT_PORTAL_SALT||'bluejays-portal-2026-default-salt';console.log(c.createHash('sha256').update('tekky-launch-2026'+s).digest('hex'));"
-- and replace the hash below.
-- ─────────────────────────────────────────────────────────────────────────────

-- Upsert Paul + Philip with the shared password. Idempotent — works whether
-- 20260510 was applied or not.

insert into public.client_owners
  (client_slug, email, name, password_hash, role)
values
  ('zenith-sports',
   'paul@zenithsports.org',
   'Paul Hanson',
   'd04031bf072d7889a6e52a1193479737318aebf19d99cccb17fb48c267e6a974',
   'owner'),
  ('zenith-sports',
   'philip@zenithsports.org',
   'Philip Lund',
   'd04031bf072d7889a6e52a1193479737318aebf19d99cccb17fb48c267e6a974',
   'owner')
on conflict (lower(email)) do update
  set password_hash = excluded.password_hash,
      name          = excluded.name,
      role          = excluded.role,
      client_slug   = excluded.client_slug;
