-- Rewrite the Zenith client-action to-do list (2026-05-04).
--
-- Why: the previous task set was scattered (Calendly, Twilio, Meta,
-- Google Ads, Clarity, Stripe, Shopify all listed as separate
-- "client must create the account" items), which both overwhelmed
-- Philip + Paul AND duplicated work — Ben can stand up most of these
-- accounts himself in a single sitting given delegated business-email
-- access. The new list reframes everything around the actual decision
-- the client owns ("do you want Ben to do it, or will you?") and
-- separates that from the things ONLY they can do (voicemails, video,
-- testimonials, domain purchase).
--
-- Two bugs also necessitated this rewrite:
--   1. The portal "checkbox = mark done" bug auto-completed two tasks
--      ("Decide missed-call behavior" + "Stripe access"). Fixed in
--      the UI; restoring the tasks here as still-open.
--   2. Some tasks were accidentally bulk-deleted by Ben while testing.
--
-- Strategy: wipe all client_slug='zenith-sports' AND owner='client'
-- rows, then insert the canonical 2026-05-04 set. This is destructive
-- so it's idempotency-gated — only runs if a marker task title doesn't
-- already exist (re-running is a no-op).

do $$
begin
  if not exists (
    select 1 from public.client_tasks
    where client_slug = 'zenith-sports'
      and title = 'Pick: do you want Ben to set up your accounts, or will you?'
  ) then
    -- Wipe the old client-owned task set
    delete from public.client_tasks
    where client_slug = 'zenith-sports'
      and owner = 'client';

    -- ─────────── BUCKET 1: THE FRICTIONLESS LEVER ───────────
    insert into public.client_tasks
      (client_slug, title, description, status, priority, category, owner)
    values

    ('zenith-sports',
     'Pick: do you want Ben to set up your accounts, or will you?',
     E'This is the ONE choice that makes everything else easy.\n\nOption A — Ben sets them up (recommended):\n  Grant Ben delegated access to info@zenithsports.org (or any business email you''re comfortable with). Ben can then create + verify Twilio, Meta Business Manager, Google Ads, Calendly, SendGrid, Microsoft Clarity in ONE sitting (~3 hours). Accounts are still 100% OWNED by you — you keep billing + control. Ben just does the heavy lifting.\n\nOption B — You set them up yourself:\n  Walk through ~6 separate signup flows (4–8 hours total over a few days). Each platform has its own verification + 2FA + payment-method requirements. Ben will provide step-by-step instructions per platform.\n\nReply in the notes field below: "Ben does it — here''s the email" OR "I''ll do it myself."',
     'pending', 'urgent', 'decision', 'client'),

    -- ─────────── BUCKET 2: SMALL DECISIONS BEN NEEDS (each ~5 min) ───────────

    ('zenith-sports',
     'Confirm: missed-call → text-back default message',
     E'When someone calls your TEKKY number and you don''t answer, we auto-fire a text. Default reads:\n\n  "Hi, this is Philip @ TEKKY® — sorry I missed your call. Quickest reply is text. What''s the best way to help — info on the ball, club demo, or training?"\n\nReply in the notes:\n  "looks good"  → we ship the default\n  "change to: …" → we use your version',
     'pending', 'medium', 'decision', 'client'),

    ('zenith-sports',
     'Confirm: authenticate email sends from zenithsports.org?',
     E'Optional but recommended (improves deliverability ~15-30%).\n\nWe can set up SPF + DKIM + DMARC on the zenithsports.org domain so funnel emails to coaches/parents come from "philip@zenithsports.org" instead of a generic sender. Inboxes treat authenticated mail as more trustworthy.\n\nIf yes: Ben needs ONE-TIME access to your domain DNS records (Cloudflare, GoDaddy, wherever zenithsports.org is registered). Reply with hosting provider + best contact path.\n\nIf no: we send from a BlueJays-authenticated subdomain. Still works, just slightly higher spam-folder risk.',
     'pending', 'medium', 'decision', 'client'),

    ('zenith-sports',
     'Confirm: process payments through us, or stay on Shopify?',
     E'Your TEKKY shop already runs on Shopify. We can leave it that way (recommended — your existing checkout, customer base, and Shopify Email automations stay intact), and our funnels just drive traffic to your zenithsports.org checkout.\n\nOR — if you want any add-on products (training plans, camp registrations) processed through bluejayportfolio.com, we''d set up Stripe. Lower priority unless you have a specific upsell in mind.\n\nReply: "stay on Shopify" or "let''s discuss Stripe upsells."',
     'pending', 'low', 'decision', 'client'),

    -- ─────────── BUCKET 3: ASSET DELIVERABLES — ONLY YOU CAN DO THESE ───────────

    ('zenith-sports',
     'Film the BAE (Before & After Effect) hero video',
     E'Brand-voice doc PRIORITY 1 — the single biggest conversion lever on the homepage. Currently using a placeholder.\n\nWhat we need:\n  - Player using a regulation ball (heavy touches, ball runs away)\n  - Same player switches to TEKKY® (visibly sharper, tighter touch)\n  - 8–15 seconds, vertical or square format works for both web + ad use\n  - No audio needed (autoplays muted on hero)\n  - Send raw file to Ben — he''ll handle the cuts + compression + encoding\n\nGood lighting + a clean background outperform "production value." A phone shot in good light beats a dim DSLR shot.',
     'pending', 'high', 'asset', 'client'),

    ('zenith-sports',
     'Record 6 voicemail clips for the funnel auto-callback',
     E'Used when a parent/coach/player misses our outbound call. Voice = trust. 30 seconds each, recorded as voice memos on your phone.\n\nThe 6 clips:\n  1. Parent — first touch ("Hi {name}, this is Philip from TEKKY…")\n  2. Parent — follow-up ("Hi {name}, just circling back…")\n  3. Coach — first touch\n  4. Coach — follow-up\n  5. Player — first touch\n  6. Player — follow-up\n\nBen will share a Google Doc with the exact scripts — natural reads, NOT performed. Send the .m4a/.mp3 files back when done.',
     'pending', 'high', 'asset', 'client'),

    ('zenith-sports',
     'Capture 11+ video testimonials (PRIORITY 4 — biggest conversion lift)',
     E'Brand-voice doc says this is a 68% conversion lift. Single biggest thing missing from the site.\n\nMix needed (at least one of each):\n  - 4+ parents (especially showing the BAE moment with their kid)\n  - 4+ players ("here''s how my touches changed")\n  - 3+ coaches ("we use TEKKY at our club because…")\n\nFormat: 10–15 second phone clips, vertical works fine. Subjects say their name + role + one sentence about TEKKY. Get a signed consent line in writing or on-camera ("I''m happy to be featured on TEKKY''s website + socials").\n\nBest sources: existing camp attendees, the ECNL/MLS Next clubs you already work with, parents who''ve already bought.\n\nBen handles the editing + upload to the site once you send the raw clips.',
     'pending', 'high', 'asset', 'client'),

    ('zenith-sports',
     'Add Ben as Staff in your Shopify Admin',
     E'So we can pull revenue / AOV / top-product / repeat-customer-rate into your portal Insights tab alongside the leads.\n\nSettings → Users and permissions → Add staff. Permissions: View orders, View products, View customers, View marketing.\n\nOR — preferred — install our private Custom App. Ben will share a one-tap install URL when you''re ready. Cleaner than Staff access, easier to revoke.\n\nReply with the storefront URL (e.g. tekky.zenithsports.org) when access is granted.',
     'pending', 'medium', 'asset', 'client'),

    ('zenith-sports',
     'Purchase tekky.org domain',
     E'Lock the natural primary domain for the TEKKY® brand before someone else does. ~$11/yr at Cloudflare Registrar (cheapest with free WHOIS privacy) or Namecheap or GoDaddy.\n\nUse cases once owned:\n  - Redirect tekky.org → /clients/zenith-sports (or eventually production-host the showcase there)\n  - Email aliases like philip@tekky.org for the funnel sender domain (cleaner than info@zenithsports.org for TEKKY-specific outreach)\n  - Vanity short URLs in ads (e.g. tekky.org/build instead of bluejayportfolio.com/clients/zenith-sports/build-your-player)\n\nNothing else blocks on this — but it''s a 5-min purchase that protects the brand long-term.',
     'pending', 'medium', 'asset', 'client'),

    ('zenith-sports',
     'Set up Microsoft Clarity (3 min — free, even if Ben does the rest)',
     E'Free heatmaps + session recordings + dead-click analysis. Feeds the Hyperloop optimizer + gives you visual proof of how visitors actually use the site.\n\nIf you picked Option A above (Ben does accounts), skip this — Ben will set it up.\n\nIf you''re doing accounts yourself:\n  1. Sign in at https://clarity.microsoft.com/ (free with Microsoft or Google account)\n  2. + New project → name it "Zenith Sports" or "TEKKY"\n  3. Site URL: https://bluejayportfolio.com/clients/zenith-sports\n  4. Copy the 10-character Project ID from the install snippet\n  5. Paste the ID into the notes field below\n\nWhen Ben sees the ID, he sets the env var and Clarity goes live within 5 minutes.',
     'pending', 'medium', 'asset', 'client');

  end if;
end;
$$;
