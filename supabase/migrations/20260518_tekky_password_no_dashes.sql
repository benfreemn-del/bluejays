-- ─────────────────────────────────────────────────────────────────────────────
-- 20260518_tekky_password_no_dashes
--
-- Update shared password to "tekkylaunch2026" (dashes removed for easier
-- verbal delivery + typing). Same access either way.
--
-- Replaces the previous shared password from 20260518_tekky_shared_password.
-- Idempotent — works whether the previous migration was applied or not.
--
-- Shared password: tekkylaunch2026
-- Hash: sha256("tekkylaunch2026" || "bluejays-portal-2026-default-salt")
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.client_owners
  (client_slug, email, name, password_hash, role)
values
  ('zenith-sports',
   'paul@zenithsports.org',
   'Paul Hanson',
   '60d1cf8ec3024ba5f8f523b44488d8a6da3a3d5e8b82008f4e408867a6a68c36',
   'owner'),
  ('zenith-sports',
   'philip@zenithsports.org',
   'Philip Lund',
   '60d1cf8ec3024ba5f8f523b44488d8a6da3a3d5e8b82008f4e408867a6a68c36',
   'owner')
on conflict (lower(email)) do update
  set password_hash = excluded.password_hash,
      name          = excluded.name,
      role          = excluded.role,
      client_slug   = excluded.client_slug;
