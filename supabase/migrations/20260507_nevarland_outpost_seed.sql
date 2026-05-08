-- ─────────────────────────────────────────────────────────────────────────────
-- 20260507 — Nevarland Outpost (Christopher) seed
--
-- Adds a new client tenant for nevarlandoutpost.com — handmade kids' +
-- adult apparel brand out of "the Outpost." Founder Christopher; brand
-- voice: "Created to express. Made to mean something" / "Good vibes,
-- rough edges, real people." Heavy mental-health + family + adventure
-- framing.
--
-- Pattern matches Laser Lakes (Nate): Shopify owns the storefront +
-- checkout (laser-lakes-style no-back-end-for-payments), BlueJays
-- builds the marketing front + a back-office for cross-channel
-- customer + order tracking.
--
-- Default password is "outpost-2026" (sha256-hashed). Christopher can
-- rotate it from the portal Account tab after first login.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Owner login — sha256(salt || ":" || password) per src/lib/client-auth.ts.
insert into public.client_owners (client_slug, email, password_hash, name)
values (
  'nevarland-outpost',
  'hello@nevarlandoutpost.com',
  encode(
    digest(
      coalesce(current_setting('app.portal_salt', true), 'bluejays-portal-2026-default-salt')
        || ':outpost-2026',
      'sha256'
    ),
    'hex'
  ),
  'Christopher · Nevarland Outpost'
)
on conflict (lower(email)) do nothing;

-- 2. Standing client_tasks so /dashboard/clients/nevarland-outpost has
--    a meaningful inbox on first load. Mirrors the Laser Lakes pattern.
insert into public.client_tasks (
  client_slug, owner, category, priority, title, description
)
select * from (values
  ('nevarland-outpost', 'ben', 'client-action', 'high',
   'Wire Shopify orders webhook → client_purchases',
   'Set up Shopify Admin → Settings → Notifications → Webhooks → "Order created" pointing at /api/webhooks/shopify/orders?slug=nevarland-outpost. Once live, every Shopify sale auto-imports into the portal Customers tab + cross-channel customer ledger.'),
  ('nevarland-outpost', 'client', 'client-action', 'high',
   'Christopher: confirm hello@nevarlandoutpost.com is the right login email',
   'Default portal login is hello@nevarlandoutpost.com / outpost-2026. Confirm with Christopher that this address is monitored, or rotate to a personal address before he starts using the portal regularly.'),
  ('nevarland-outpost', 'client', 'asset', 'medium',
   'Christopher: send 6-12 lifestyle + behind-the-scenes photos',
   'The site renders product photos pulled from his Shopify CDN. To round out the brand story we need: (a) Christopher with the three daughters; (b) the Outpost workspace / heat-press in action; (c) a wide adventure / outdoor-with-kids shot for the hero. Phone shots are fine — natural light beats production polish for this brand voice.'),
  ('nevarland-outpost', 'ben', 'build', 'medium',
   'Wire newsletter capture → SendGrid + Klaviyo handoff',
   'Newsletter signup on the bespoke page currently mailto:s Christopher. Once Klaviyo (or his existing ESP) is wired we''ll POST to /api/clients/inquire/nevarland-outpost which both stamps client_leads and forwards to the Klaviyo list ID Christopher provides.'),
  ('nevarland-outpost', 'ben', 'build', 'low',
   'Optional · point nevarlandoutpost.com at /clients/nevarland-outpost',
   'Today the BlueJays-built marketing front lives at /clients/nevarland-outpost. If Christopher wants nevarlandoutpost.com as the apex (with Shopify still owning /products and /checkout), wire CNAME → cname.vercel-dns.com + add the entry to CLIENT_DOMAIN_MAP in src/middleware.ts. Otherwise keep Shopify as the public face.'),
  ('nevarland-outpost', 'client', 'asset', 'medium',
   'Christopher: send a 90-second founder video for the hero',
   'Brand voice is intensely personal — a phone-shot 60-90s clip of Christopher on the heat-press / unfolding fresh tees / talking about the why beats any stock B-roll. Drop it on the hero and conversion lifts measurably.')
) as v(client_slug, owner, category, priority, title, description)
where not exists (
  select 1 from public.client_tasks where client_slug = 'nevarland-outpost'
);
