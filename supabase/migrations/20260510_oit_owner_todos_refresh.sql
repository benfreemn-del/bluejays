-- ─────────────────────────────────────────────────────────────────────────────
-- 20260510_oit_owner_todos_refresh
--
-- Per Ben spec 2026-05-10: comprehensive OIT audit done; update Luke's
-- to-do list to reflect what's actually still manual on his side.
-- Idempotent — uses upsert-by-title so re-running won't duplicate.
--
-- This migration does THREE things:
--   1. Corrects owner + priority on existing tasks where the audit
--      surfaced a mismatch (e.g. slot population was filed under
--      Ben/low — actually Luke uses the admin Calendar tab in 1 click,
--      so it's client/high since it blocks customer booking).
--   2. Adds missing client-owner manual items the audit found.
--   3. Adds missing Ben-owner build items the audit found.
--
-- Cross-reference with the audit report 2026-05-10. Each task here
-- maps 1:1 to a specific gap. When everything in this list flips to
-- 'done', OIT is fully launched.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Reclassify existing tasks ────────────────────────────────────────────

-- Slot population: was ben/build/low — wrong owner + wrong priority.
-- Luke does this in the admin Calendar tab via the "Pre-fill 30 days"
-- button; takes 1 click. And it BLOCKS customer booking until done.
update public.client_tasks
   set owner = 'client',
       category = 'client-action',
       priority = 'high',
       title = 'Pre-populate 30 days of bookable slots (admin → Calendar tab)',
       description = E'Customers can''t book without slots. Easiest path: log into /clients/olympic-inspections/admin → Calendar tab → click "⚡ Pre-fill 30 days (M-F · 9 / 12 / 3)" — 90 slots in one shot.\n\nManual single-slot adds are also there if you want a custom schedule (e.g. half-days Friday).\n\nBLOCKING: public site shows "no slots available" until this is done.',
       updated_at = now()
 where client_slug = 'olympic-inspections'
   and title in (
     'Pre-populate 30 days of bookable slots',
     'Pre-populate 30 days of bookable slots (admin → Calendar tab)'
   );

-- Testimonials: was client/medium — bump to high. Placeholders read as
-- "not yet launched" and erode trust on the most credibility-sensitive
-- section of the page.
update public.client_tasks
   set priority = 'high',
       updated_at = now()
 where client_slug = 'olympic-inspections'
   and title = 'Luke: send 3 real testimonials to replace placeholders';

-- Hero photo: was client/low — bump to medium. Stock works for v1 but
-- a real photo of Luke + truck on-site is high-leverage.
update public.client_tasks
   set priority = 'medium',
       updated_at = now()
 where client_slug = 'olympic-inspections'
   and title = 'Luke: send 1 hero photo (truck on-site, lab equipment, or owner)';

-- Referral tiers confirmation: was ben/build/low — actually a Luke
-- DECISION (he picks the rate, Ben updates copy). client/decision/high.
update public.client_tasks
   set owner = 'client',
       category = 'decision',
       priority = 'high',
       title = 'Confirm referral payout tiers ($50 / $75 / $100 — or different?)',
       description = E'Realtor funnel emails reference a tiered payout: $50 first close · $75 ongoing · $100 power partner.\n\nThis was a working assumption when the funnel copy was drafted. Confirm those rates match what you actually want to pay, OR tell Ben the real numbers and he''ll update the copy in src/lib/client-funnels/olympic-inspections.ts.\n\nWhy it matters: realtor sees "$50 per referral" in the email. If they refer one and you pay $30, that''s a trust break.',
       updated_at = now()
 where client_slug = 'olympic-inspections'
   and title in (
     'Confirm $50/$75/$100 referral payout tiers with owner',
     'Confirm referral payout tiers ($50 / $75 / $100 — or different?)'
   );

-- ─── 2. Insert NEW client-owner manual items (audit gaps) ────────────────────

insert into public.client_tasks (client_slug, owner, category, priority, title, description)
select * from (values
  ('olympic-inspections', 'client', 'client-action', 'high',
   'Verify (360) 670-3367 + hello@olympicinspections.com both work',
   E'Public site footer + admin login both reference these. If either is disconnected, the customer-response path breaks silently.\n\nQuick test:\n  1. Call (360) 670-3367 from your phone — does it ring?\n  2. Email yourself at hello@olympicinspections.com — do you get it?\n\nIf either is wrong, tell Ben the correct one and he''ll update across the site + funnels in one batch.'),

  ('olympic-inspections', 'client', 'decision', 'medium',
   'Confirm pricing on calculator ($150 base + $50/500sqft + $250/$100 samples)',
   E'Public site calculator uses these rules:\n  • Base: $150 for ≤1,500 sqft\n  • Add $50 per 500 sqft after that\n  • Air sample: $250 first (with outdoor control), $100 each additional\n  • Surface sample: $100 each\n  • >5,000 sqft: "Custom quote"\n\nDoes this match what you actually charge today? Reply with any changes — Ben updates the calculator in main.js + the booking confirmation copy in one shot.'),

  ('olympic-inspections', 'client', 'asset', 'medium',
   'Record 3 voicemail clips (one per audience)',
   E'When SMS funnel is live (after Twilio number provisions), voicemail-drop on day 5 lands as a personal touch. Three clips needed:\n  • Homeowner — "Hey {{firstName}}, Luke from OIT — saw your inspection booking request, just wanted to introduce myself..."\n  • Realtor — "Hey {{firstName}}, Luke from OIT — heard you might have clients needing pre-listing inspections..."\n  • Insurance — "Hey {{firstName}}, Luke from OIT — wanted to drop a note about how our reports format for adjusters..."\n\n18-24 sec each. Phone recording is fine. Drop into shared Drive, Ben uploads to Twilio media URL.'),

  ('olympic-inspections', 'client', 'decision', 'low',
   'Decide: SMS funnel for realtors too, or keep email-only?',
   E'Currently the realtor funnel is email-only (4 emails over 7 days). Homeowner + insurance audiences get email + SMS. Realtors are typically heavy email users.\n\nQuestion: do you want SMS touches added to the realtor funnel? Tradeoff:\n  • +SMS: more touchpoints, higher conversion, ~$0.02/SMS cost\n  • Email-only: lower cost, less intrusive (realtors get a lot of SMS already)\n\nDefault recommendation: keep email-only. Reply if you disagree.'),

  ('olympic-inspections', 'client', 'decision', 'low',
   'Decide: AI Operator skills (auto-reply drafter, customer-save agent)',
   E'OIT could optionally add the AI System tier ($499/mo Hyperloop + $149/mo Claude Pro) which unlocks:\n  • Lead Reply Drafter — AI drafts a personalized email reply to every inbound, you hit send\n  • Customer Save Agent — re-engages leads who go quiet for 14+ days\n  • Lead Scorer — ranks new inquiries by likelihood-to-buy\n\nFor a high-touch local service business, this often isn''t worth the cost — you''re fast enough manually. Recommend deferring until volume hits 50+ inbound leads/month.\n\nNo decision needed yet — just flagging this exists if you ever want it.')
) as v(client_slug, owner, category, priority, title, description)
where not exists (
  select 1 from public.client_tasks
  where client_slug = 'olympic-inspections'
    and title = v.title
);

-- ─── 3. Insert NEW Ben-owner build items (audit gaps) ────────────────────────

insert into public.client_tasks (client_slug, owner, category, priority, title, description)
select * from (values
  ('olympic-inspections', 'ben', 'build', 'medium',
   'Wire Google Calendar OAuth so slots auto-sync from Luke''s personal calendar',
   E'CalendarSetupBanner component already mounts in the portal Calendar tab. Need to actually wire /api/calendar/connect/[slug] handlers.\n\nFlow:\n  1. Luke clicks "Connect Google Calendar" in portal\n  2. OAuth consent screen\n  3. Once authed, every "busy" event on his calendar = blocked slot\n  4. Public booking form filters out blocked slots automatically\n\nStubbed today; manual slot management is the working fallback.\n\nDeprioritize unless Luke specifically asks — manual works fine for v1.'),

  ('olympic-inspections', 'ben', 'build', 'low',
   'Hardened admin password (move from cookie-static to bcrypt-hashed)',
   E'Admin login currently uses a static cookie + hardcoded password. Works but doesn''t support self-serve password reset. For long-term security:\n  1. Migrate /api/clients/olympic-inspections/admin/login to use the universal client_owners table\n  2. bcrypt-hash the password\n  3. Add a "change password" route Luke can self-serve\n\nNo urgent threat today (the slug → admin URL is not enumerable + cookie-bound). Do during the next security pass.'),

  ('olympic-inspections', 'ben', 'reminder', 'low',
   'Run partner-affiliate seed (40 pre-researched partners)',
   E'src/lib/client-affiliates-seeds/olympic-inspections.ts has 40 pre-researched partners (10 realtors, 8 insurance, 4 remediation, 4 restoration + others) ready to bulk-insert.\n\nOne-line trigger: POST /api/client-affiliates/seed?client=olympic-inspections (owner-cookie required). This populates the Affiliates Map tab on day one without Luke having to scout from scratch.\n\nDo right after Luke''s admin password lands so the map isn''t empty on first login.')
) as v(client_slug, owner, category, priority, title, description)
where not exists (
  select 1 from public.client_tasks
  where client_slug = 'olympic-inspections'
    and title = v.title
);

-- ─── Verification — surface a count of OIT tasks by owner + status ───────────
-- (Run as a separate select after this migration to confirm:)
--
--   select owner, status, count(*)
--     from public.client_tasks
--    where client_slug = 'olympic-inspections'
--    group by owner, status
--    order by owner, status;
