-- Seed the Zenith Sports task list with everything captured during the
-- AI-package planning session (2026-05-03). Each row maps back to a
-- decision, asset ask, build item, or client-action that came up while
-- scoping the Full System integration.
--
-- Idempotent guard: check if any zenith-sports tasks exist; if so, skip.
-- Re-running this file won't dupe rows.

do $$
begin
  if exists (select 1 from public.client_tasks where client_slug = 'zenith-sports') then
    raise notice 'zenith-sports tasks already exist, skipping seed';
    return;
  end if;

  insert into public.client_tasks
    (client_slug, title, description, status, priority, category, owner, blocked_on)
  values

  -- ─────────── CLIENT-ACTION (Philip + Paul owe us things) ───────────

  ('zenith-sports',
   'Create a Twilio account + provision a TEKKY-dedicated number',
   E'For SMS funnel + missed-call → text-back + voicemail drops.\n\nBen will help walk Philip through:\n  1. twilio.com/try-twilio (use info@zenithsports.org)\n  2. Buy a local number near WA HQ\n  3. Share Account SID + Auth Token + Number with Ben so we can wire it into the funnel.',
   'pending', 'high', 'client-action', 'client', null),

  ('zenith-sports',
   'Record voicemail clips (3 audiences × 2 follow-ups = 6 clips)',
   E'Per the brand voice guide, voicemails must feel personal — recorded by Philip (or Paul). 30–45s each, mention TEKKY by name, leave warm callback.\n\nClips needed:\n  • Parents — first VM (after no email reply)\n  • Parents — second VM (final touch)\n  • Coaches/DOCs — first VM\n  • Coaches/DOCs — second VM\n  • Players — first VM\n  • Players — second VM\n\nDeliver as mp3 or wav, drop into shared Drive. Ben will upload to Twilio media URL.',
   'pending', 'high', 'asset', 'client', null),

  ('zenith-sports',
   'Create a Calendly account + share Coach-demo booking link',
   E'For the "Request a club demo" CTA on the Coach-Credible section.\n\n  1. Sign up at calendly.com (use info@zenithsports.org)\n  2. Set up a 30-min "TEKKY Club Demo" event type\n  3. Share the public booking URL with Ben to embed.\n\nAlternative: Cal.com if they prefer open-source.',
   'pending', 'high', 'client-action', 'client', null),

  ('zenith-sports',
   'Film the BAE (Before & After Effect) hero video',
   E'Per brand voice guide PRIORITY 1. Specs:\n  • mp4 / H.264, AAC\n  • 6–12 seconds, looped seamlessly (so the loop point is invisible)\n  • <8 MB after compression\n  • Player on TEKKY → switches to standard ball → visibly sharper touch in the same shot\n  • No audio (autoplay requires muted on iOS/Android anyway)\n\nWhen delivered, set BAE_VIDEO_SRC in src/app/clients/zenith-sports/page.tsx and the hero will play it automatically.',
   'pending', 'high', 'asset', 'client', null),

  ('zenith-sports',
   'Capture 11+ video testimonials (parents, players, coaches)',
   E'Per brand voice guide PRIORITY 4 — "Minimum 11 reviews live at launch · 68% conversion lift."\n\n  • 10–15s clips with consent\n  • At least one parent, one player, one coach\n  • At least one BAE moment ("I was on the regular ball, switched to TEKKY, the difference was…")\n  • Drop into shared Drive when collected.',
   'pending', 'medium', 'asset', 'client', null),

  ('zenith-sports',
   'Confirm whether to authenticate sending domain (zenithsports.org)',
   E'For outbound funnel emails to come from "info@zenithsports.org" (or noreply@send.zenithsports.org), Ben needs to add DKIM + SPF + DMARC records to their Squarespace DNS.\n\nOptions:\n  A) Authenticated send from their actual domain (best deliverability, requires DNS access)\n  B) Send from a BlueJay subdomain like tekky@send.bluejaymail.com (faster, but "from" looks less native)\n\nDefault we''ll start with: A — Philip provides DNS access OR adds the records manually with our instructions.',
   'pending', 'medium', 'client-action', 'client', null),

  -- ─────────── DECISIONS (Ben/Philip/Paul to decide) ───────────

  ('zenith-sports',
   'Decide: missed-call → text-back behavior',
   E'When someone calls Zenith and nobody picks up, the system can auto-text back. Open questions:\n  • Always, or after-hours only? (e.g. 9pm–7am Pacific)\n  • Default text? Suggested: "Hi, this is Philip @ TEKKY — sorry I missed you. What''s the best way to help — info on the ball, a club demo, or training?"\n  • Different text by day-part?\n\nAsk Philip + Paul.',
   'pending', 'medium', 'decision', 'client', 'Awaiting Philip & Paul'),

  ('zenith-sports',
   'Decide: what the "Player Challenge" actually is',
   E'Currently the email-capture below the drill grid is framed as "Submit your touches. Get featured" with #TEKKYTouch. Ben thinks this could be something more concrete than just "tag us on IG" — maybe:\n  • A monthly leaderboard (most reps logged)\n  • A skill-tree progression players unlock as they submit clips\n  • A camp-scholarship raffle for active community members\n  • A weekly drill-of-the-week response submission with feedback\n\nPin and revisit with Philip + Paul.',
   'pending', 'medium', 'decision', 'ben', null),

  -- ─────────── BUILD (Claude/Ben — code + content we owe) ───────────

  ('zenith-sports',
   'Sprint 1: client_leads table + wire Zenith forms to write into it',
   E'Right now /api/clients/inquire only emails Ben. We need a real Supabase table so leads persist + funnel can pick them up.\n\nSchema: id, client_slug, audience_segment (parent/coach/player), name, email, phone, intent, source, raw_payload, created_at, status, funnel_step.\n\nWire main inquiry form + Player Challenge + Training Guide email-captures to write here in addition to emailing.',
   'pending', 'high', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 1: per-client lead dashboard at /dashboard/clients/zenith-sports/leads',
   E'Mirror the client-tasks UI pattern. List all client_leads for zenith-sports, filter by audience + status, click into a lead to see full payload + funnel position.',
   'pending', 'high', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 2: per-audience funnel definitions (Parents / Coaches / Players)',
   E'Three parallel funnels with distinct copy + cadence:\n\n  PARENTS — Lead with confidence + progress, close with parent testimonials + BAE, primary CTA = Shop TEKKY®. Soft 5-touch cadence (D0/D2/D5/D9/D14).\n\n  COACHES/DOCs — Lead with touches + measurable outcomes, close with pro testimonials + credentials, primary CTA = Request a Club Demo. Heavier 6-touch cadence (D0/D1/D3/D7/D14/D21) since B2B cycle is longer.\n\n  PLAYERS — Lead with feel-the-difference, close with peer player stories, primary CTA = Training Videos. Light 3-touch cadence (D0/D3/D7) — players churn fast, don''t over-message.',
   'pending', 'high', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 2: write email + SMS content for all 3 funnels',
   E'14 emails + ~10 SMS total. Use the brand voice guide Copy Vault as the foundation. Each touch must:\n  • Be in TEKKY voice (clear, coach-credible, ambitious-not-arrogant)\n  • Have a single CTA matching the audience-segment table\n  • Pass the "Does this make a young player better?" test\n  • Use first-name personalization from form submit\n\nFlag any copy that needs Philip/Paul approval before it ships.',
   'pending', 'high', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 2: reply detection — pause funnel when lead replies',
   E'When a Zenith lead replies to email or SMS, mark their client_lead as "responded" and stop further funnel sends. Reuse the existing /api/inbound/email and /api/inbound/sms handlers but route by client_slug.',
   'pending', 'high', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 3: wire Twilio number once Philip provisions one',
   E'Blocked on the Twilio task above. When ready:\n  1. Set ZENITH_TWILIO_NUMBER + ZENITH_TWILIO_SID env vars\n  2. Wire outbound SMS sender to use this number for all client_slug=zenith-sports messages\n  3. Wire missed-call webhook → /api/missed-call/twiml?client=zenith-sports\n  4. Wire voicemail-drop endpoint with the recorded clips',
   'pending', 'high', 'build', 'claude', 'Twilio account provisioned'),

  ('zenith-sports',
   'Sprint 3: build Camp Finder lead magnet',
   E'For parent audience. Map UI showing TEKKY-affiliated camps + clinics + clubs Philip + Paul partner with. Filter by region. Submit form to "Notify me when a camp opens near you" (captures email → enrolls in Parent funnel).\n\nNeed list of partner camps from Philip/Paul before we can populate. Build the UI shell first.',
   'pending', 'medium', 'build', 'claude', 'Partner camp list from Philip & Paul'),

  ('zenith-sports',
   'Sprint 3: write the Training Guide PDF (coach lead magnet)',
   E'Per the Coach-Credible email-capture form. Source material:\n  • The 26-drill video library (training-drills.tsx)\n  • The brand voice guide''s European-style methodology section\n  • Sample 4-week session plan\n\nDeliverable: ~12-page designed PDF, branded TEKKY®, watermark with patent-pending notice. Hosted on Vercel Blob; auto-emailed to coaches who submit the form.',
   'pending', 'medium', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 4: Meta ad iterations for each audience (Parents / Coaches / Players)',
   E'Zenith currently runs Meta but mostly boosts. Need proper campaign structure:\n  • Parent campaign — confidence/progress angle, TEKKY ball product image, "Shop TEKKY" CTA\n  • Coach campaign — outcome-focused, "Request a club demo" CTA, ECNL/MLS Next mention\n  • Player campaign — feel-the-difference, drill-clip video creative, "Watch training" CTA\n\n3 ad sets per campaign × 3 creatives each = ~27 ad variants for proper learning-phase optimization.',
   'pending', 'medium', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 4: Google Ads setup + auto-affiliate targeting',
   E'Search + Performance Max campaigns:\n  • Search: "youth soccer training ball", "tekky ball", "ball mastery drills", competitor terms\n  • Performance Max: feed-driven from /shop product pages\n\nAffiliate auto-target: programmatic outreach to youth soccer coaches/clubs/influencers with TEKKY pitch. Build a target-discovery script (scrape ECNL coach lists, follow-up via cold email) → tag matches as "affiliate-prospect" in CRM.',
   'pending', 'medium', 'build', 'claude', null),

  ('zenith-sports',
   'Sprint 4: weekly performance report (email + dashboard)',
   E'For the "Monthly performance reports" line in the AI Package offering. Emit weekly:\n  • Lead volume by audience\n  • Funnel step conversion rates\n  • Ad spend + CAC by channel\n  • Top performing creative\n  • Suggested optimizations\n\nDelivered as both PDF email to Philip + Paul AND visible at /dashboard/clients/zenith-sports/reports.',
   'pending', 'low', 'build', 'claude', null),

  -- ─────────── REMINDERS ───────────

  ('zenith-sports',
   'Add Zenith to recurring_costs table when funnel goes live',
   E'AI Package = $9,700 one-time + $500–1,000/mo ongoing. Once Twilio + ad accounts are live and lead-flow starts, add the recurring revenue line so MRR tracks.',
   'pending', 'low', 'reminder', 'ben', null);

  raise notice 'Seeded % zenith-sports tasks', (select count(*) from public.client_tasks where client_slug = 'zenith-sports');
end;
$$;
