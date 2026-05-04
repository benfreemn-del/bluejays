-- Add subscription + business-email-access tasks for Zenith.
-- Idempotent: skips if a task with the same title already exists.

do $$
begin
  if not exists (
    select 1 from public.client_tasks
    where client_slug = 'zenith-sports'
      and title = 'Grant Ben delegated business-email access (frictionless onboarding)'
  ) then
    insert into public.client_tasks
      (client_slug, title, description, status, priority, category, owner)
    values
    -- The big frictionless-onboarding ask
    ('zenith-sports',
     'Grant Ben delegated business-email access (frictionless onboarding)',
     E'Add Ben as a delegated user on info@zenithsports.org (Google Workspace → Settings → Accounts → Grant access to your account).\n\nThis lets Ben stand up the new accounts in one day:\n  - Twilio (number provisioning)\n  - Google Ads\n  - Meta Business Manager (if not already)\n  - Calendly\n  - SendGrid (if doing dedicated domain)\n\nAccounts are still OWNED by Zenith — Ben is just doing the setup work. Saves Philip + Paul 4-8 hours of verification flows. Once stood up, transfer billing + admin to Philip and revoke delegated access.',
     'pending', 'high', 'client-action', 'client'),

    -- Subscription decisions
    ('zenith-sports',
     'DECISION: Hyperloop subscription tier',
     E'Pick Zenith''s starting tier. Defaults to "Off" until 50+ leads in the system, then suggest upgrade to Starter ($99/mo) for on-demand variant analysis.\n\nTiers (full menu in docs/AI_PACKAGE_HANDOFF.md):\n  Off    — $0    — runs static, no auto-optimize\n  Starter — $99  — manual analysis from dashboard\n  Pro    — $249  — weekly auto-optimize + variant gen\n  Elite  — $499  — daily + budget rebalancing\n\nFlip via /dashboard/clients/zenith-sports/insights → Subscriptions panel.',
     'pending', 'medium', 'decision', 'ben'),

    ('zenith-sports',
     'DECISION: Claude subscription tier',
     E'Pick Zenith''s Claude AI tier. Default recommendation: Starter ($49/mo) from day 1 for AI reply drafting — saves Philip 3-5 hours/week even at low lead volume.\n\nTiers:\n  Off       — $0    — no AI features\n  Starter   — $49   — reply drafting + audience detection\n  Pro       — $149  — + variant gen + AI report narrative\n  Unlimited — $399  — soft-cap unlimited\n\nFlip via /dashboard/clients/zenith-sports/insights → Subscriptions panel.',
     'pending', 'medium', 'decision', 'ben'),

    -- Phase B handoff prep
    ('zenith-sports',
     'Phase B: Transfer Twilio + Google Ads ownership to Zenith (after 30 days)',
     E'Once accounts have been standing up + producing for 30+ days, transition billing + admin from BlueJays-managed to Zenith-owned:\n\n  1. Twilio: transfer billing to Philip''s card. Keep Ben as Admin user.\n  2. Google Ads: transfer billing to Philip''s card. Keep Ben as Standard user.\n  3. Meta Business Manager: transfer ownership of the Business Manager + Pixel + Ad Account.\n  4. Update client_subscriptions.managed_by = "client" for each.\n\nClient now owns the systems but BlueJays still operates them.',
     'pending', 'low', 'reminder', 'ben');
  end if;
end;
$$;
