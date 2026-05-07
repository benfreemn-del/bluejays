-- Madie partnership · shared Calendly setup task
--
-- The Madie sales script bookings are still pointed at Ben's existing
-- scheduleUrl. Need a SHARED Calendly that:
--   1. Madie can drop into the call (her ID, her name on the link)
--   2. Routes bookings into Ben's actual Google Calendar
--   3. Notifies Ben + Madie on every new booking
--   4. Lets Ben adjust availability live
--   5. Smoke-tested end-to-end before Madie's first dial
--
-- Lives on Ben's task list (owner='ben') since this is BlueJays-internal
-- ops setup, not a per-client client-action item.
--
-- Idempotent — gated on the title.

do $$
begin
  if not exists (
    select 1 from public.client_tasks
    where title = 'Madie partnership · set up shared Calendly + smoke test end-to-end'
  ) then
    insert into public.client_tasks
      (client_slug, title, description, status, priority, category, owner)
    values
    ('bluejays',
     'Madie partnership · set up shared Calendly + smoke test end-to-end',
     E'Madie''s sales script needs a shared booking link before she goes live.\n\nWHAT TO BUILD\n  1. New Calendly event titled "BlueJays Custom Build Walkthrough" — 15 min, weekday afternoons\n  2. Connect to Ben''s Google Calendar (real availability, not a static schedule)\n  3. Link Madie as a co-host so the booking is visible to her too — OR send confirmations to her email\n  4. Both Ben + Madie get email notifications on every new booking\n  5. Ben can edit availability live (block off via Google Cal, Calendly auto-updates)\n\nSMOKE TEST (must pass before Madie''s first dial)\n  · Madie sends a test booking link from a fake call\n  · Test prospect books a slot\n  · Ben gets the email + sees it on Google Calendar\n  · Madie gets the email\n  · Ben can drag the appointment in Google Calendar → it stays in sync\n  · Ben can block off a day on Google → Calendly hides those slots\n\nWIRE THE URL\n  Set NEXT_PUBLIC_BEN_CALENDLY_URL env var on Vercel.\n  fillVars() in src/lib/partners-script.ts already substitutes\n  {scheduleUrl} in every script line — flipping the env updates\n  every script invocation simultaneously.',
     'pending', 'urgent', 'build', 'ben');
  end if;
end $$;
