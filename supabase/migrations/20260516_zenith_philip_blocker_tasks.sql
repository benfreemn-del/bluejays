-- Five client-action tasks for Philip — the items blocking the
-- Zenith / TEKKY lead system from running at full power. Captured
-- during the 2026-05-05 backend review.
--
-- Idempotency: gated on the title of the first task so re-runs are
-- no-ops. Each insert is a single row.

do $$
begin
  if not exists (
    select 1 from public.client_tasks
    where client_slug = 'zenith-sports'
      and title = 'Twilio: provision a phone number (unlocks every SMS in the drip)'
  ) then

    -- ─── #1 · Twilio number — unlocks all SMS + missed-call auto-reply ───
    insert into public.client_tasks
      (client_slug, title, description, status, priority, category, owner)
    values
    ('zenith-sports',
     'Twilio: provision a phone number (unlocks every SMS in the drip)',
     E'Right now every SMS step in the parent / coach / player drips silently SKIPS because we don''t have a Twilio number. SMS open rates are 98% vs email''s 20% — this is the single biggest unlock for the funnel.\n\nWhat we need:\n  1. Sign up at twilio.com (free trial credit covers the first ~30 days)\n  2. Buy a local Seattle / Tacoma number ($1.15 / month)\n  3. Send Ben the number + Account SID + Auth Token (Ben adds them as secrets — never visible in code)\n\nAlternative: if you picked "Ben sets up accounts" on the umbrella decision task, just confirm and Ben does this in one sitting.',
     'pending', 'urgent', 'client-action', 'client'),

    -- ─── #2 · Calendly link — unlocks coach booking funnel ───
    ('zenith-sports',
     'Calendly: create a coach-demo booking link',
     E'The coach drip sequence sends "book a 15-min demo with Philip" — but right now that link routes to a generic contact page. Coaches click → bounce.\n\nWhat we need:\n  1. Free Calendly account at calendly.com\n  2. One event: "TEKKY Coach Demo · 15 min" (or your preferred title + duration)\n  3. Send Ben the public URL (something like calendly.com/philip-zenith/coach-demo)\n\nAlternative: if you picked "Ben sets up accounts" on the umbrella decision task and granted email access, Ben can stand up Calendly + the event in ~10 min. You just confirm the meeting title + duration.\n\nOnce we have the URL the {{coachDemoCalendly}} variable goes live in every coach email.',
     'pending', 'high', 'client-action', 'client'),

    -- ─── #3 · Voicemail clips — unlocks the VM follow-up step ───
    ('zenith-sports',
     'Record 6 voicemail clips for the VM-drop drip step',
     E'Voicemail-drop messages get 30%+ callback rates and feel personal. The funnel runner has VM steps wired but skips them because we have no audio clips.\n\nWhat we need (each 20–30 seconds):\n  1. Parent VM #1 — "Hey it''s Philip with TEKKY, saw {kid name} signed up for the player builder, give me a call when you''ve got a sec at..."\n  2. Parent VM #2 — follow-up if no response after 3 days\n  3. Coach VM #1 — "Hey coach, Philip with TEKKY, you grabbed our training guide..."\n  4. Coach VM #2 — follow-up\n  5. Player VM #1 — direct-to-player tone\n  6. Player VM #2 — follow-up\n\nRecord on your phone, AirDrop or text them to Ben as .m4a or .mp3 files.',
     'pending', 'medium', 'asset', 'client'),

    -- ─── #4 · BAE hero video — biggest single homepage conversion lift ───
    ('zenith-sports',
     'Film the BAE (Before & After) hero video',
     E'Brand-voice doc flagged this as your #1 priority — A/B tests show +68% conversion vs a static hero photo. Currently the homepage falls back to a static photo because BAE_VIDEO_SRC is null.\n\nWhat we need:\n  • 10–30 second clip of a kid: BEFORE shot (struggling first-touch) → AFTER (clean control 4 weeks later, with the Tekky ball)\n  • Phone vertical OK, but landscape preferred for desktop\n  • Send the file or a Drive link, Ben wires it up the same day\n\nPick a player whose parent will sign a brief release — Ben can supply a one-paragraph release form.',
     'pending', 'high', 'asset', 'client'),

    -- ─── #5 · Real testimonials — fills 2-3 social proof spots ───
    ('zenith-sports',
     'Collect 3-5 real testimonials (text or short video)',
     E'Currently the testimonial sections on the showcase site are placeholder copy. Brand-voice doc flagged 11+ video testimonials = 68% conversion lift on landing pages.\n\nWhat works (any of these — pick whichever is easiest):\n  • 3-5 short text testimonials with full name + city ("Sarah W., parent in Sammamish · ECNL Forward Soccer Club") — easiest, ask via text\n  • 1-2 vertical phone clips (15-30 sec each) with the parent / coach on camera — highest conversion impact\n  • Mix and match\n\nSend Ben whatever you collect; he''ll wire them into the testimonial carousel.',
     'pending', 'medium', 'asset', 'client');

  end if;
end $$;
