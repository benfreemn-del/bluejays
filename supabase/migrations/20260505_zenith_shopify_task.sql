-- Add the Shopify connection task to Zenith's punch list. Discovered
-- during the AI-package post-launch review — Zenith already runs their
-- store on Shopify, so wiring revenue + AOV + top-product into the owner
-- portal Insights tab is a high-value, low-effort plug-in once Philip
-- shares access.
--
-- The portal already gracefully degrades to a "Connect Your Store" card
-- when status='pending'. This task captures the actual-world steps Philip
-- needs to take so we can flip status='connected' and start syncing.
--
-- Idempotent: only inserts if no zenith-sports task with the same title
-- already exists.

do $$
begin
  if not exists (
    select 1 from public.client_tasks
    where client_slug = 'zenith-sports'
      and title = 'Shopify access (revenue + AOV in dashboard)'
  ) then
    insert into public.client_tasks
      (client_slug, title, description, status, priority, category, owner)
    values
    ('zenith-sports',
     'Shopify access (revenue + AOV in dashboard)',
     E'For the AI Package portal "Connect Your Store" card.\n\nPhilip already runs the TEKKY shop on Shopify. Plugging it in surfaces revenue (last 30d), AOV, top product, and repeat-customer rate alongside the lead pipeline — so he sees marketing → sales attribution in one place.\n\nWhat we need from Philip:\n  1. Add Ben as a Staff member in Shopify Admin (Settings → Users → Add staff). Permissions needed: View orders, View products, View customers, View marketing.\n  2. (Alternative — preferred) Install our private Shopify Custom App. Ben will share a one-tap install URL.\n  3. Confirm the storefront URL (probably tekky.zenithsports.org or similar — needed for the Shopify API base).\n\nWhen access is granted, Ben will:\n  - Insert the row in client_shopify with status=''connected''\n  - Wire the OAuth callback to encrypt + store the access token\n  - Enable the hourly sync cron (already scaffolded in syncClientShopify)\n  - Portal Insights tab auto-shows the live revenue strip\n\nNo code changes needed once the row is connected — the system gracefully no-ops until then.',
     'pending', 'medium', 'client-action', 'client'),
    ('zenith-sports',
     'Shopify Email automations review (post-Shopify-connect)',
     E'After Shopify is connected, audit Philip''s existing Shopify Email automations (cart abandon, post-purchase, win-back). Cross-reference against the funnels we run server-side so we don''t double-message a TEKKY buyer.\n\nGoal: route prospect funnels through BlueJays (Twilio + SendGrid via funnel-engine) and customer-lifecycle funnels through Shopify Email (where they live next to order data). One source of truth per stage.',
     'pending', 'low', 'client-action', 'ben');
  end if;
end;
$$;
