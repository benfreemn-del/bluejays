-- ─────────────────────────────────────────────────────────────────────────────
-- 20260506 — Laser Lakes / Nate: promote from lead → client work
--
-- Nate's been sitting in `prospects` as a lead since the bespoke build went
-- live. He's actually a paying client now (Shopify storefront stays his,
-- BlueJays runs the back-office customer+purchase ledger). This migration:
--
--   1. Flips his prospect.status to 'live' so he stops showing up in the
--      sales pipeline / Madie's call queue.
--   2. Seeds the four standing client_tasks that move him into
--      /dashboard/clients (which keys off "any laser-lakes row in
--      client_tasks" to render him on the dashboard index).
--
-- Idempotent — every statement checks first. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Flip Nate's prospect.status to 'live'.
--    Match by business_name OR email — whichever we have. Don't touch anything
--    if no row matches (don't create — we want a hard match on existing data).
update public.prospects
   set status = 'live',
       updated_at = now()
 where (lower(business_name) like '%laser lakes%'
        or lower(email) like '%laserlakes%')
   and status not in ('live', 'paid');

-- 2. Seed the standing client_tasks for laser-lakes. Skip if any row exists
--    for this slug already (we don't want to keep re-creating them).
insert into public.client_tasks (
  client_slug, owner, category, priority, title, description
)
select * from (values
  ('laser-lakes', 'ben', 'client-action', 'high',
   'Wire Shopify orders webhook → client_purchases',
   'Set up Shopify Admin → Settings → Notifications → Webhooks → "Order created" pointing at /api/clients/laser-lakes/shopify-webhook so Nate''s portal Customers tab auto-fills from real sales instead of seed rows.'),
  ('laser-lakes', 'ben', 'client-action', 'medium',
   'Replace seed client_purchases rows with Nate''s real data',
   'The 5 seed rows in client_purchases (Aimee Larsen / Mark Hennessey / Sarah Tomas / Twin Cities Cabin Co.) are placeholders. Once Shopify webhook is live, delete them so the ledger only shows real customers.'),
  ('laser-lakes', 'client', 'client-action', 'medium',
   'Nate: confirm hello@laserlakes.com is the right login email',
   'Default portal login is hello@laserlakes.com / laser-lakes-2026. Confirm with Nate that this address is monitored, or rotate to nate@ specifically before he starts using the portal regularly.'),
  ('laser-lakes', 'ben', 'build', 'low',
   'Add laserlakes.com → /clients/laser-lakes domain rewrite',
   'Optional — wire the apex laserlakes.com to point at this Next app via CNAME, then add an entry to CLIENT_DOMAIN_MAP in src/middleware.ts. Today the BlueJays-built marketing front lives at /clients/laser-lakes; if Nate wants it as his apex too, this is the path. Skip if Shopify themes stay the public face.')
) as v(client_slug, owner, category, priority, title, description)
where not exists (
  select 1 from public.client_tasks where client_slug = 'laser-lakes'
);
