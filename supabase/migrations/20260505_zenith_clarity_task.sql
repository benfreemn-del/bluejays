-- Add Microsoft Clarity setup task to Zenith's punch list. Clarity is
-- now part of the standard AI Package tracking stack — gives the client
-- (and us) free heatmaps + session recordings + dead-click analysis,
-- which feeds back into the Hyperloop landing-page optimization loop.
--
-- Idempotent.

do $$
begin
  if not exists (
    select 1 from public.client_tasks
    where client_slug = 'zenith-sports'
      and title = 'Microsoft Clarity setup (heatmaps + session recordings)'
  ) then
    insert into public.client_tasks
      (client_slug, title, description, status, priority, category, owner)
    values
    ('zenith-sports',
     'Microsoft Clarity setup (heatmaps + session recordings)',
     E'Free analytics tool — heatmaps, scroll-depth, dead-clicks, session recordings. Feeds the Hyperloop optimizer + gives Philip visual proof of how visitors actually use the site.\n\nSteps:\n  1. Go to https://clarity.microsoft.com/ and sign in (Microsoft / Google account).\n  2. Click "+ New project". Name it "Zenith Sports" or "TEKKY".\n  3. Site URL: https://bluejayportfolio.com/clients/zenith-sports (or zenithsports.org once we move).\n  4. Copy the Project ID (10-character string from the install snippet).\n  5. Send Project ID to Ben.\n\nWhen received, set Vercel env:\n  ZENITH_SPORTS_CLARITY_ID=...\n\nClarity script auto-loads on /clients/zenith-sports/* once env is set — wired through src/components/client-tracking-scripts.tsx. No code changes needed.\n\nWhat we do with it:\n  - Watch session recordings of high-bounce pages → adjust hero / CTA\n  - Spot dead-clicks (users tapping non-interactive elements) → surface as clickable\n  - Funnel into Hyperloop weekly review',
     'pending', 'medium', 'client-action', 'client');
  end if;
end;
$$;
