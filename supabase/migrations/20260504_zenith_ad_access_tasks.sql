-- Add the missing ad-platform access tasks for Zenith. Discovered during
-- the AI-package post-build review — Meta + Google access wasn't on the
-- punch list yet but is required before any of the Sprint 4 ad creative
-- variants can actually run.
--
-- Idempotent: only inserts if no zenith-sports task with the same title
-- already exists.

do $$
begin
  if not exists (
    select 1 from public.client_tasks
    where client_slug = 'zenith-sports'
      and title = 'Meta Business Manager access + Pixel ID'
  ) then
    insert into public.client_tasks
      (client_slug, title, description, status, priority, category, owner)
    values
    ('zenith-sports',
     'Meta Business Manager access + Pixel ID',
     E'For the AI Package ad pipeline. Need:\n\n  1. Add Ben as an Admin in Meta Business Manager (business.facebook.com → Business Settings → People → Add).\n  2. Create or share an existing Meta Pixel — give Ben the Pixel ID (15-16 digits).\n  3. Generate a Meta Conversions API (CAPI) access token (Events Manager → your Pixel → Settings → Generate Access Token). This lets us send server-side conversion events for better attribution post iOS-14.\n\nWhen received, set Vercel envs:\n  ZENITH_META_PIXEL_ID=...\n  ZENITH_META_CAPI_TOKEN=...\n\nThe pixel auto-loads on /clients/zenith-sports/* once the env is set — no code changes needed.',
     'pending', 'high', 'client-action', 'client'),
    ('zenith-sports',
     'Meta Ad Account access (for running the 19 ad variants)',
     E'Add Ben as Advertiser (or Admin) in their Meta Ad Account so he can:\n  - Upload the 19 creatives we exported via /dashboard/clients/zenith-sports/ads → CSV · Meta\n  - Set budgets + bidding\n  - Watch performance to feed the weekly report\n\nShare the Ad Account ID (act_XXXXXXXXX) with Ben.',
     'pending', 'high', 'client-action', 'client'),
    ('zenith-sports',
     'Google Ads account access + GA4 / Tag IDs',
     E'For the Search + Performance Max campaigns we built creatives for.\n\n  1. Add Ben to their Google Ads account (Tools → Access & security → Add user). Standard or Admin level.\n  2. Share the Google Ads Customer ID (10-digit, e.g. 123-456-7890).\n  3. Create or share an existing GA4 property — share the Measurement ID (G-XXXXXXXXX).\n\nWhen received, set Vercel envs:\n  ZENITH_GA_MEASUREMENT_ID=G-...\n  ZENITH_GOOGLE_ADS_CUSTOMER_ID=...\n\nGA4 + Google Ads conversion tag auto-load on /clients/zenith-sports/* once env is set.',
     'pending', 'high', 'client-action', 'client'),
    ('zenith-sports',
     'Stripe / payment account access (if processing through us)',
     E'OPTIONAL: only needed if Ben handles payment processing for direct shop sales. Currently /shop CTAs link out to zenithsports.org Shopify checkout, so this can be skipped — but if Philip wants any of the package upsells (training plans, camp registrations) processed through Stripe, we''ll need:\n  - Ben added as an account user in Stripe Dashboard\n  - Connected account ID for Stripe Connect, OR direct Restricted Key\n\nFlag for Sprint 5 if Philip ever wants checkout on bluejayportfolio.',
     'pending', 'low', 'client-action', 'client'),
    -- Decisions just resolved by Ben (mark as done so they're off the board):
    ('zenith-sports',
     'DECISION RESOLVED: Missed-call → text-back behavior',
     E'Ben decided 2026-05-04: ALWAYS-ON text-back. Default text:\n\n  "Hi, this is Philip @ TEKKY® — sorry I missed your call. Quickest reply is text. What''s the best way to help — info on the ball, club demo, or training?"\n\nWired in src/lib/client-funnels/registry.ts under zenith-sports.missedCall.\nAuto-fires once ZENITH_TWILIO_NUMBER env var is set on Vercel.',
     'done', 'medium', 'decision', 'ben'),
    ('zenith-sports',
     'DECISION RESOLVED: Player Challenge → renamed "Build Your Player"',
     E'Ben decided 2026-05-04: scrap the "tag #TEKKYTouch get featured" version. Replace with a 3D-character-builder lead magnet:\n\n  - Page: /clients/zenith-sports/build-your-player\n  - User picks role (parent/player/coach) → enters identity → uses sliders for age/skill/size → answers goal questions\n  - SVG character morphs live as inputs change\n  - Submit returns a personalized training plan with recommended TEKKY product mix\n  - Lead saved to client_leads with intent="Build Your Player" + source="lead-gen-builder" + raw_payload containing all answers + generated plan\n  - Audience auto-detected from role choice → enrolls in correct funnel\n\nAd creative concept: 3D character on left, sliders on right, "Create your training plan" headline.',
     'done', 'medium', 'decision', 'ben');
  end if;
end;
$$;
