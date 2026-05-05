-- ─────────────────────────────────────────────────────────────────────────────
-- Add four existing clients to /dashboard/clients (Client Jobs).
--
-- These four already have sites + are in the leads pipeline. Adding
-- one onboarding task per client surfaces them on the Client Jobs
-- index (which shows clients with at least one open task).
--
-- Slugs picked to match the URL convention used by other clients
-- (lowercase, kebab-case, no abbreviations).
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.client_tasks
  (client_slug, title, description, status, priority, category, owner)
values
  -- ─── Lewis County Autism Coalition ───
  (
    'lewis-county-autism',
    'Confirm site routing + custom domain wiring',
    'Site is built; verify the production DNS / domain map before we promote anything to prospects. Once green-lit, advance to lead-magnet copy review.',
    'pending', 'high', 'client-action', 'ben'
  ),
  (
    'lewis-county-autism',
    'Draft donor + parent funnel copy',
    'Two audience tracks: (1) parents looking for resources, (2) donors / community sponsors. Need separate inbound flows.',
    'pending', 'medium', 'build', 'ben'
  ),

  -- ─── Mountain View Landscape ───
  (
    'mountain-view-landscape',
    'Confirm site routing + custom domain wiring',
    'Site is live; verify the domain map entry before pushing the inquiry form public.',
    'pending', 'high', 'client-action', 'ben'
  ),
  (
    'mountain-view-landscape',
    'Wire seasonal landscaping funnel',
    'Spring cleanup → mowing season → fall cleanup → snow removal. Four-stage seasonal automation.',
    'pending', 'medium', 'build', 'ben'
  ),

  -- ─── Pine ───
  (
    'pine',
    'Confirm site routing + custom domain wiring',
    'Site is live; verify domain map entry before promoting publicly.',
    'pending', 'high', 'client-action', 'ben'
  ),
  (
    'pine',
    'Define audience segments + lead-magnet copy',
    'Need to map Pine''s customer mix so we can configure the audience-segmented inbox routing.',
    'pending', 'medium', 'decision', 'client'
  ),

  -- ─── Particle ───
  (
    'particle',
    'Confirm site routing + custom domain wiring',
    'Site is live; verify domain map entry before promoting publicly.',
    'pending', 'high', 'client-action', 'ben'
  ),
  (
    'particle',
    'Define audience segments + lead-magnet copy',
    'Need to map Particle''s customer mix so we can configure the audience-segmented inbox routing.',
    'pending', 'medium', 'decision', 'client'
  )
on conflict do nothing;

comment on column public.client_tasks.client_slug is
  'Slug match: zenith-sports, hector-landscaping, itc-quick-attach, lewis-county-autism, mountain-view-landscape, pine, particle, etc.';
