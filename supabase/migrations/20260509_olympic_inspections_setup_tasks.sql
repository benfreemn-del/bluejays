-- ─────────────────────────────────────────────────────────────────────────────
-- 20260509 — Olympic Inspections & Testing setup task seed
--
-- Captures everything backend-launch-blocking that's NOT shippable via
-- code (provisioning, DKIM, domain transfer, business assets). Ships
-- alongside the same-day pricing reconciliation, audience-detection,
-- and booking-→-funnel wiring so when Ben hits this list and clears it,
-- OIT's backend is fully live.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.client_tasks (client_slug, owner, category, priority, title, description)
select * from (values
  ('olympic-inspections', 'ben', 'build', 'high',
   'Provision OIT Twilio number',
   'Buy a dedicated Twilio number for olympicinspections.com and add it as OIT_TWILIO_NUMBER in Vercel env. Until this lands, the funnel runner skips SMS sends entirely (warm follow-ups go email-only). Number lives in src/lib/client-funnels/registry.ts under the OIT entry.'),
  ('olympic-inspections', 'ben', 'build', 'high',
   'Set up SendGrid DKIM on olympicinspections.com',
   'Currently funnel emails send from ben@bluejayportfolio.com with a display-name override. Spam-rate is elevated until DKIM is verified for the OIT domain. SendGrid → Sender Authentication → Authenticate Your Domain → drop the CNAMEs into Namecheap.'),
  ('olympic-inspections', 'ben', 'build', 'medium',
   'Transfer pineparticle.com from Squarespace → Namecheap',
   'Phase 2 cutover. Get the auth code from Squarespace, initiate transfer at Namecheap, point CNAME at cname.vercel-dns.com. The next.config.ts already rewrites pineparticle.com → /sites/olympic-inspections so the moment DNS resolves it serves the OIT site.'),
  ('olympic-inspections', 'client', 'asset', 'medium',
   'Christopher: send 3 real testimonials to replace placeholders',
   'Ideal: one each from a homeowner, realtor, and insurance customer. Even a screenshot of a text message works — we''ll style and quote-attribute. Currently using neutral placeholders.'),
  ('olympic-inspections', 'client', 'asset', 'low',
   'Christopher: send 1 hero photo (truck on-site, lab equipment, or owner)',
   'Public site currently uses stock. Phone photo at a real inspection (with permission) lands much harder than stock. Optional but high-leverage.'),
  ('olympic-inspections', 'ben', 'build', 'low',
   'Pre-populate 30 days of bookable slots',
   'Booking form needs available slots to claim. Use the admin Calendar tab at /clients/olympic-inspections/admin to bulk-add 30 days × 4 daily slots, OR run a one-off SQL seed if you want it scripted.'),
  ('olympic-inspections', 'ben', 'build', 'low',
   'Confirm $50/$75/$100 referral payout tiers with owner',
   'Realtor partner emails reference $50/$75/$100 tiered referrals. Either confirm those rates with the OIT owner or update the copy in src/lib/client-funnels/olympic-inspections.ts to whatever the actual pay is.')
) as v(client_slug, owner, category, priority, title, description)
where not exists (
  select 1 from public.client_tasks
  where client_slug = 'olympic-inspections'
    and title = v.title
);
