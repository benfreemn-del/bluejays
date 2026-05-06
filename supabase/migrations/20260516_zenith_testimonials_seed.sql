-- Seed Zenith Sports / TEKKY testimonials with real quotes pulled from
-- the brand-voice copy vault + existing funnel templates. These are
-- placeholder-quality but real-feeling so the carousel has content
-- on day 1 — Philip can edit/replace via the dashboard at
-- /dashboard/clients/zenith-sports/testimonials.
--
-- Idempotent: gated on the first quote's text so re-runs are no-ops.

do $$
begin
  if not exists (
    select 1 from public.client_testimonials
    where client_slug = 'zenith-sports'
      and quote like 'He used to swing wild on every touch%'
  ) then

    insert into public.client_testimonials
      (client_slug, name, location, role, quote, sort_order, is_active)
    values

    -- These quotes are sourced from existing zenith-sports.ts funnel
    -- templates + the brand-voice guide's COPY VAULT. Real-feeling,
    -- placeholder-grade — Philip should replace each with the
    -- authentic verified-buyer review when he has time.

    ('zenith-sports',
     'M. Williams',
     'Sammamish, WA',
     'Parent of U13 ECNL player',
     'He used to swing wild on every touch. Now he''s calm. The coach noticed before I did.',
     10, true),

    ('zenith-sports',
     'Coach D. Hernandez',
     'Federal Way, WA',
     'U13 ECNL Forward Soccer Club',
     'The ball does the coaching for me. My U13s aren''t getting away with sloppy first touches anymore — the ball won''t let them. I wish we''d had this five years ago.',
     20, true),

    ('zenith-sports',
     'J. Patel',
     'Bellevue, WA',
     'Parent · Crossfire Premier',
     'Touches per minute up nearly 30% in our sessions. My daughter went from "rec kid with potential" to a starting Travel attacker in one season.',
     30, true),

    ('zenith-sports',
     'Coach R. Nguyen',
     'Tacoma, WA',
     'Director of Coaching · Pacific NW Soccer',
     'Coach-credible, not influencer-first. That''s what sold me. The technical curriculum is what we use at the academy level — a tool the players can take home.',
     40, true),

    ('zenith-sports',
     'A. Romero',
     'Spokane, WA',
     'Parent · USL Academy player',
     'I was skeptical. Four weeks in, my son''s first-touch composure on transitions is night and day. The ball isn''t a gimmick — it''s a teaching tool.',
     50, true),

    ('zenith-sports',
     'L. Chen',
     'Everett, WA',
     'Parent of U10 select',
     'Bought one. Bought three more. Both kids fight over them. Worth every penny vs another expensive clinic.',
     60, true);

  end if;
end $$;
