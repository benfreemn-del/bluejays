-- Top up the recurring_costs table with the full BlueJays subscription
-- inventory as of 2026-04-29. Mirrors the master list at
-- /05 Internal Docs/Subscriptions Master List.md (in OneDrive).
--
-- The /spending dashboard reads from this table and shows real-time
-- monthly burn rate. Whenever a subscription changes (new tier,
-- cancel, or new service added), update BOTH the markdown master
-- list AND this table (or insert a new row with ON CONFLICT DO NOTHING).
--
-- Pre-existing seed (from 20260424_recurring_costs.sql) already
-- inserted: supabase, vercel_pro, sendgrid. ON CONFLICT DO NOTHING
-- means re-running this migration is safe — won't overwrite the
-- earlier seed even if costs differ slightly. To force-update an
-- existing row, use the dashboard's PATCH endpoint or update the
-- row manually in SQL Editor.

INSERT INTO recurring_costs
  (service, display_name, category, monthly_cost_usd, started_on, notes, metadata)
VALUES
  -- Variable / pay-as-you-go AI APIs (estimates based on typical scale)
  (
    'anthropic_api',
    'Anthropic API (Claude)',
    'tools',
    125.00,
    '2026-01-01',
    'Pay-as-you-go. Audit AI generation + Claude Code dev work. Estimate is midpoint of $50-200/mo range; actuals tracked per-call in system_costs.',
    '{"billing": "pay_as_you_go", "range": "$50-200/mo", "primary_use": "audit_engine + dev"}'
  ),
  (
    'openai_api',
    'OpenAI API (GPT)',
    'tools',
    25.00,
    '2026-01-01',
    'Pay-as-you-go. Backup AI for technical SEO checks + audit fallback. Estimate.',
    '{"billing": "pay_as_you_go", "range": "$10-50/mo", "primary_use": "audit_fallback"}'
  ),
  -- Lead-gen + outbound infrastructure
  (
    'apollo',
    'Apollo.io',
    'tools',
    49.00,
    '2026-02-01',
    'Cold prospect lead data — feeds the audit engine. Verify exact tier on next renewal.',
    '{"billing": "monthly_or_annual", "range": "$39-99/mo", "primary_use": "prospect_scouting"}'
  ),
  (
    'twilio',
    'Twilio',
    'sms',
    15.00,
    '2026-04-01',
    'SMS for partner workspace + audit notifications. Pay-as-you-go, billed monthly post-pay.',
    '{"billing": "pay_as_you_go", "range": "$5-30/mo", "next_milestone": "A2P 10DLC approval"}'
  ),
  (
    'lob',
    'Lob (postcards)',
    'other',
    20.00,
    '2026-03-01',
    'Direct-mail postcards to scouted prospects. Pay-per-postcard. Estimate based on test volume.',
    '{"billing": "pay_per_send", "range": "variable"}'
  ),
  -- Domain + email + identity
  (
    'namecheap',
    'Namecheap (domains)',
    'hosting',
    3.00,
    '2025-06-01',
    'Domain registration for bluejayportfolio.com + client domains. Annual fees amortized to monthly.',
    '{"billing": "annual_per_domain", "domains": ["bluejayportfolio.com", "+ client domains"]}'
  ),
  (
    'google_workspace',
    'Google Workspace',
    'email',
    7.00,
    '2025-06-01',
    'ben@bluejayportfolio.com email + Drive. Business Starter tier.',
    '{"plan": "Business Starter", "email": "ben@bluejayportfolio.com"}'
  ),
  -- Source code
  (
    'github',
    'GitHub',
    'tools',
    0.00,
    '2024-06-01',
    'Free tier covers source hosting. Move to Pro ($4/mo) only if needed for advanced security features.',
    '{"plan": "Free", "next_tier": "Pro @ $4/mo"}'
  )
ON CONFLICT (service) DO NOTHING;

-- Reload PostgREST schema cache to pick up any column changes
NOTIFY pgrst, 'reload schema';
