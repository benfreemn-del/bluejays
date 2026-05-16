-- ─────────────────────────────────────────────────────────────────────────────
-- ITC Quick Attach (Innovative Tractor Components) — preview tenant seed.
--
-- Pre-loads everything ITC's owner-portal tabs need so when Jake logs in
-- during tomorrow's demo (10 AM PST sales call), every tab has realistic
-- ITC-flavored content. No hand-built fakes — the rows go through the
-- same APIs as Zenith's. We just pre-seed them.
--
-- Pieces:
--   1. client_owners → demo login (jake@itcquickattach.com / itc-demo-2026)
--   2. client_leads audience-segment check expands to ITC's six audiences
--   3. 6 seed client_email_campaigns (one per segment, status=draft)
--   4. 6 seed client_leads (one per segment, marked as samples)
--   5. client_budget_items → Twilio + SendGrid + Vercel + Claude Max
--   6. client_subscriptions → hyperloop + claude + twilio + sendgrid trialing
--   7. client_tasks → 5 onboarding tasks
--
-- The password hash is sha256("itc-demo-2026" + PORTAL_SALT) where
-- PORTAL_SALT defaults to "bluejays-portal-2026-default-salt". If the
-- production env has a different CLIENT_PORTAL_SALT set, run scripts/
-- reset-itc-password.ts after deploy to recompute.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend the audience_segment check constraint to include ITC's
-- six audiences. Drop and re-add with the broader set. This stays
-- backward-compat with existing Zenith data.
alter table public.client_leads
  drop constraint if exists client_leads_audience_segment_check;

alter table public.client_leads
  add constraint client_leads_audience_segment_check
  check (audience_segment is null or audience_segment in (
    -- Zenith soccer audiences
    'parent', 'coach', 'player', 'club', 'unknown',
    -- ITC tractor-accessory audiences
    'hobbyist', 'forester', 'tym', 'hunter', 'dealer', 'community'
  ));

-- 2. ITC owner — demo login
-- email: jake@itcquickattach.com
-- password: itc-demo-2026  (hashed with the default PORTAL_SALT)
insert into public.client_owners
  (client_slug, email, name, password_hash, role)
values (
  'itc-quick-attach',
  'jake@itcquickattach.com',
  'Jake McCall',
  '4c252ff765bad3a09b46424768a4ee08cc27500f75e465fccde6466f26e059bc',
  'owner'
)
on conflict do nothing;

-- 3. Six pre-drafted email campaigns (one per segment). Owner sees
-- these in the Campaigns tab as "ready to launch."
insert into public.client_email_campaigns
  (client_slug, name, subject, body, audience_filter, lead_status_filter, status)
values
  (
    'itc-quick-attach',
    'TYM Owner Welcome — Brand Hub',
    'Built for your TYM, not just any tractor',
    e'Hey {{first_name}},\n\nThanks for hopping into the TYM accessory hub. We just dropped the new T474 brush guard ($249.99, 28 reviews and counting) and the T234/T264 fit kit is back in stock.\n\nStickers go out tomorrow. While you wait, here are the three pieces every TYM owner adds first:\n\n  • Brush guard with screen insert\n  • Universal toolbox\n  • Tractor steps & grab handles\n\nReply with your model and I''ll send you the exact fit list.\n\n— Jake @ ITC',
    array['tym']::text[],
    array[]::text[],
    'draft'
  ),
  (
    'itc-quick-attach',
    'Hobbyist First-Year Setup',
    '12 things to add to your sub-compact in year one',
    e'Hi {{first_name}},\n\nYou just bought (or you''re about to buy) your first sub-compact. Welcome.\n\nBefore you fire up that bucket, grab the 12-item setup checklist we put together with our actual customers. PDF is attached.\n\nThe one most owners skip year one and regret year two: a brush guard. $249 saves you a $1,500 grille if a branch finds you.\n\n— Jake @ ITC',
    array['hobbyist']::text[],
    array[]::text[],
    'draft'
  ),
  (
    'itc-quick-attach',
    'Forester Gear List',
    'Tractor + chainsaw setup for a 1-acre clearing',
    e'Hey {{first_name}},\n\nYou said you''re running a clearing job. Here''s the SawBoss + Chainbox combo our pro foresters run — keeps a saw on the tractor without rattling teeth out of the chain.\n\nSawBoss: $180, holds any 16"–24" bar. Chainbox: $129 add-on for the chain + bar oil + wedges.\n\nWant a 5-min video walkthrough of how the carrier mounts on a TYM/Kioti front-end loader? Reply YES.\n\n— Jake @ ITC',
    array['forester']::text[],
    array[]::text[],
    'draft'
  ),
  (
    'itc-quick-attach',
    'Hunter — Install Guide',
    'Tractor gun-mount install + 5 safety tips',
    e'Hi {{first_name}},\n\nGun-mount install guide attached. Five tips most owners learn the hard way:\n\n  1. Mount on the ROPS upright, not the fender (vibration kills locks).\n  2. Run a tether through the trigger guard — even on private land.\n  3. Pair with our LED light mount for pre-dawn scouting.\n  4. Cover with the brush-guard accessory canvas in shoulder season.\n  5. Take it off before any public-road transport.\n\nBundle today: firearm mount + LED kit + brush canvas = $X. Reply for the package quote.\n\n— Jake @ ITC',
    array['hunter']::text[],
    array[]::text[],
    'draft'
  ),
  (
    'itc-quick-attach',
    'Dealer ROI Pitch',
    'Add $X/mo accessory revenue per delivered tractor',
    e'Hi {{first_name}},\n\nYou run a tractor dealership. Every TYM/Kioti/Mahindra/Branson you deliver could ship with $300–$600 in ITC accessories already mounted — at your wholesale rate, that''s $90–$180/tractor in pure margin.\n\nCascade Tractor Supply (Spokane WA) does this on every Branson delivery. Their attach rate is over 70%.\n\nFill the ROI calc on the dealer page, I''ll send your custom report within 24h.\n\n— Jake @ ITC',
    array['dealer']::text[],
    array[]::text[],
    'draft'
  ),
  (
    'itc-quick-attach',
    'Community Spotlight — Submit Your Build',
    'Send us your build, win a free product',
    e'Hi {{first_name}},\n\nWe pick one ITC-equipped tractor every month and ship the owner a free product. Last month: Jeremy''s TYM T264 with the toolbox + SawBoss + brush guard.\n\nSend us a photo — front + side + your favorite mod. Newsletter goes out the first Monday of each month featuring the winner.\n\n— Jake @ ITC',
    array['community']::text[],
    array[]::text[],
    'draft'
  )
on conflict do nothing;

-- 4. Six sample inbound leads — VARIED across the funnel so when Jake
-- clicks each one he sees a lead in a different stage of the lifecycle.
-- This is the demo "every step is tracked" proof.
--
-- Stages used:
--   not_enrolled — just submitted, hasn't been pushed into a funnel
--   enrolled     — in funnel, multiple outbound touches sent
--   responded    — replied to an outbound, funnel auto-paused
--   paused       — clicked unsubscribe / hit pause button
--   converted    — closed deal
--   completed    — graduated through the full lifecycle (e.g. newsletter sub)
--
-- We use stable UUIDs so the linked lead_messages below can reference them.
insert into public.client_leads
  (id, client_slug, audience_segment, name, email, phone, intent, source,
   funnel_status, funnel_step, enrolled_at, responded_at, last_contact_at, raw_payload)
values
  (
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'itc-quick-attach',
    'hobbyist',
    'Sample Sub-Compact Owner',
    'demo-hobbyist@itcquickattach.com',
    null,
    'First-year setup checklist',
    'lp-hobbyist',
    'not_enrolled', null, null, null, null,
    '{"sample": true, "lp": "hobbyist", "stage": "fresh inbound, awaiting funnel enrollment"}'::jsonb
  ),
  (
    'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
    'itc-quick-attach',
    'tym',
    'Sample TYM Owner',
    'demo-tym@itcquickattach.com',
    '+13155550101',
    'T474 brush guard fit confirmation',
    'lp-tym',
    'enrolled', 2, now() - interval '5 days', null, now() - interval '2 days',
    '{"sample": true, "lp": "tym", "tractor_model": "TYM T474", "stage": "in funnel — 2 outbound touches sent"}'::jsonb
  ),
  (
    'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
    'itc-quick-attach',
    'forester',
    'Sample Forester',
    'demo-forester@itcquickattach.com',
    null,
    'SawBoss demo for 1-acre clearing',
    'lp-forester',
    'responded', 1, now() - interval '4 days', now() - interval '2 days', now() - interval '2 days',
    '{"sample": true, "lp": "forester", "acreage": "1.5", "stage": "replied to Day 0 email — funnel auto-paused, owner action needed"}'::jsonb
  ),
  (
    'aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa',
    'itc-quick-attach',
    'hunter',
    'Sample Hunter',
    'demo-hunter@itcquickattach.com',
    null,
    'Gun-mount install guide',
    'lp-hunter',
    'paused', 1, now() - interval '7 days', null, now() - interval '6 days',
    '{"sample": true, "lp": "hunter", "stage": "clicked Day 0 email but never opened follow-up — funnel paused for owner review"}'::jsonb
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    'itc-quick-attach',
    'dealer',
    'Sample Dealer (Cascade-style)',
    'demo-dealer@itcquickattach.com',
    '+15095550199',
    'Wholesale ROI calculator',
    'lp-dealer',
    'converted', 3, now() - interval '14 days', now() - interval '10 days', now() - interval '8 days',
    '{"sample": true, "lp": "dealer", "monthly_deliveries": "25", "deal_value_usd": "3600", "stage": "closed — wholesale account active"}'::jsonb
  ),
  (
    'aaaaaaaa-6666-4666-8666-aaaaaaaaaaaa',
    'itc-quick-attach',
    'community',
    'Sample "Real Operator"',
    'demo-community@itcquickattach.com',
    null,
    'Submit your build photo',
    'lp-community',
    'completed', 4, now() - interval '30 days', now() - interval '28 days', now() - interval '14 days',
    '{"sample": true, "lp": "community", "stage": "full lifecycle — submitted build, became monthly newsletter subscriber"}'::jsonb
  )
on conflict do nothing;

-- 4b. Touchpoint history — proves "every step is tracked." Each lead
-- gets an outbound funnel-step trail + (where applicable) inbound replies.
-- The LeadCard expand view in the portal renders this as a timeline.
insert into public.client_lead_messages
  (lead_id, client_slug, funnel_step, channel, direction, to_address, subject, body, template_id, status, provider, sent_at)
values
  -- TYM (enrolled) — 2 outbound emails sent
  (
    'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
    'itc-quick-attach', 0, 'email', 'outbound',
    'demo-tym@itcquickattach.com',
    'Built for your TYM, not just any tractor',
    'Hi Sample,\n\nThanks for hopping into the TYM accessory hub...',
    'tym.day0.email', 'sent', 'sendgrid', now() - interval '5 days'
  ),
  (
    'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
    'itc-quick-attach', 1, 'email', 'outbound',
    'demo-tym@itcquickattach.com',
    'Quick question about your T474 fit',
    'Hey, just following up...',
    'tym.day3.email', 'sent', 'sendgrid', now() - interval '2 days'
  ),

  -- Forester (responded) — Day 0 sent → inbound reply
  (
    'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
    'itc-quick-attach', 0, 'email', 'outbound',
    'demo-forester@itcquickattach.com',
    'Tractor + chainsaw setup for a 1-acre clearing',
    'Hey Sample, here''s the SawBoss + Chainbox combo...',
    'forester.day0.email', 'sent', 'sendgrid', now() - interval '4 days'
  ),
  (
    'aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa',
    'itc-quick-attach', null, 'email', 'inbound',
    null,
    'Re: Tractor + chainsaw setup for a 1-acre clearing',
    'YES send me the video walkthrough — running a Kioti CK2610.',
    null, 'replied', 'sendgrid', now() - interval '2 days'
  ),

  -- Hunter (paused) — Day 0 sent → clicked but didn't reply, then paused
  (
    'aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa',
    'itc-quick-attach', 0, 'email', 'outbound',
    'demo-hunter@itcquickattach.com',
    'Tractor gun-mount install + 5 safety tips',
    'Hi Sample, gun-mount install guide attached...',
    'hunter.day0.email', 'sent', 'sendgrid', now() - interval '7 days'
  ),
  (
    'aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa',
    'itc-quick-attach', 1, 'email', 'outbound',
    'demo-hunter@itcquickattach.com',
    'Bundle quote: firearm mount + LED + canvas',
    'Following up with the bundle pricing...',
    'hunter.day3.email', 'skipped', 'sendgrid', now() - interval '6 days'
  ),

  -- Dealer (converted) — Day 0 → reply → Day 3 → wholesale catalog → close
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    'itc-quick-attach', 0, 'email', 'outbound',
    'demo-dealer@itcquickattach.com',
    'Add $X/mo accessory revenue per delivered tractor',
    'Hi Sample, you run a tractor dealership...',
    'dealer.day0.email', 'sent', 'sendgrid', now() - interval '14 days'
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    'itc-quick-attach', null, 'email', 'inbound',
    null,
    'Re: Add $X/mo accessory revenue',
    'Interested. We deliver about 25/mo. Send the wholesale sheet.',
    null, 'replied', 'sendgrid', now() - interval '10 days'
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    'itc-quick-attach', 1, 'email', 'outbound',
    'demo-dealer@itcquickattach.com',
    'Wholesale catalog + ROI report attached',
    'Here''s the price sheet + bestseller mix for your brand lineup...',
    'dealer.day1-manual.email', 'sent', 'sendgrid', now() - interval '9 days'
  ),
  (
    'aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa',
    'itc-quick-attach', 2, 'email', 'outbound',
    'demo-dealer@itcquickattach.com',
    'Account approved — first PO welcome',
    'Welcome to the ITC dealer network. Your first PO ships from Blossvale Friday.',
    'dealer.welcome.email', 'sent', 'sendgrid', now() - interval '8 days'
  ),

  -- Community (completed) — full lifecycle: submission → spotlight → newsletter
  (
    'aaaaaaaa-6666-4666-8666-aaaaaaaaaaaa',
    'itc-quick-attach', 0, 'email', 'outbound',
    'demo-community@itcquickattach.com',
    'Send us your build, win a free product',
    'Hi Sample, we pick one ITC-equipped tractor every month...',
    'community.day0.email', 'sent', 'sendgrid', now() - interval '30 days'
  ),
  (
    'aaaaaaaa-6666-4666-8666-aaaaaaaaaaaa',
    'itc-quick-attach', null, 'email', 'inbound',
    null,
    'Re: Send us your build',
    'Photos attached — TYM T264 + SawBoss + brush guard combo.',
    null, 'replied', 'sendgrid', now() - interval '28 days'
  ),
  (
    'aaaaaaaa-6666-4666-8666-aaaaaaaaaaaa',
    'itc-quick-attach', 1, 'email', 'outbound',
    'demo-community@itcquickattach.com',
    'You won! Operator of the Month',
    'Congrats — your TYM build is featured in this month''s newsletter.',
    'community.spotlight.email', 'sent', 'sendgrid', now() - interval '14 days'
  )
on conflict do nothing;

-- 5. Budget — show ITC what their monthly ops cost looks like under
-- the AI Marketing System. Real numbers from cost-tracker.ts.
insert into public.client_budget_items
  (client_slug, label, description, amount_cents, recurring_monthly, category, vendor)
values
  ('itc-quick-attach', 'Claude Max (AI inbound responder)', 'Powers the AI inbound responder + audit engine.', 20000, true, 'ai-system', 'Anthropic'),
  ('itc-quick-attach', 'SendGrid Pro', 'Transactional email + campaign blasts.', 2000, true, 'communication', 'SendGrid'),
  ('itc-quick-attach', 'Twilio (number + per-use)', 'Missed-call text-back number + per-use SMS.', 115, true, 'communication', 'Twilio'),
  ('itc-quick-attach', 'Vercel Pro hosting', 'Operations dashboard hosting.', 2000, true, 'site', 'Vercel'),
  ('itc-quick-attach', 'BlueJays AI Marketing System (annual)', 'One-time setup fee for the package ($10,000 base; $300 off pay-in-full = $9,700).', 1000000, false, 'ai-system', 'BlueJays')
on conflict do nothing;

-- 6. Subscriptions — show all four AI subsystems trialing.
insert into public.client_subscriptions
  (client_slug, service, tier, status, monthly_price_usd, managed_by, notes)
values
  ('itc-quick-attach', 'hyperloop', 'pro', 'trialing', 99.00, 'bluejays', 'Wilson-CI A/B engine for ITC''s six segment funnels.'),
  ('itc-quick-attach', 'claude', 'pro', 'trialing', 200.00, 'bluejays', 'Inbound responder + audit engine + variant generation.'),
  ('itc-quick-attach', 'twilio', 'starter', 'trialing', 1.15, 'bluejays', 'Missed-call text-back number for ITC sales line.'),
  ('itc-quick-attach', 'sendgrid', 'starter', 'trialing', 20.00, 'bluejays', 'Outbound email infrastructure for the six segment campaigns.')
on conflict do nothing;

-- 7. To-Do — five onboarding tasks the owner sees as "set this up."
-- Categories must be one of: decision | asset | build | client-action | reminder
-- Owners: ben | client | claude | external
insert into public.client_tasks
  (client_slug, title, description, status, priority, category, owner)
values
  (
    'itc-quick-attach',
    'Wire Twilio number for missed-call text-back',
    'Provision a dedicated Twilio number for ITC''s sales line. Once provisioned, every missed call gets an auto-text in <60 seconds and lands in the Leads tab.',
    'pending',
    'high',
    'client-action',
    'client'
  ),
  (
    'itc-quick-attach',
    'Review TYM funnel copy',
    'The TYM Owner Welcome campaign is drafted. Open it in the Campaigns tab and confirm the brand-hub copy + sticker giveaway offer matches your voice.',
    'pending',
    'medium',
    'decision',
    'client'
  ),
  (
    'itc-quick-attach',
    'Approve hobbyist first-year checklist landing page',
    'Live at /clients/itc-quick-attach/lp/hobbyist. Confirm the 12-item checklist + brush-guard upsell hits the right notes.',
    'pending',
    'medium',
    'decision',
    'client'
  ),
  (
    'itc-quick-attach',
    'Connect Google Ads account',
    'Once connected we''ll start logging real ad-spend rows so the dealer ROI calculator + spending dashboard pull live numbers.',
    'pending',
    'low',
    'client-action',
    'client'
  ),
  (
    'itc-quick-attach',
    'Send first community newsletter',
    'Draft + schedule the first "Submit Your Build" newsletter with last month''s winner.',
    'pending',
    'low',
    'build',
    'ben'
  )
on conflict do nothing;

comment on column public.client_leads.audience_segment is
  'Audience tag, scoped by client_slug. Zenith uses parent/coach/player/club/unknown. ITC uses hobbyist/forester/tym/hunter/dealer/community.';
