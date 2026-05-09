import { NextResponse } from "next/server";

/**
 * GET /api/admin/env-status
 *
 * Owner-only diagnostic — returns a yes/no for every env var the
 * system depends on so Ben can see at a glance what's provisioned
 * vs missing. Doesn't return values, only presence.
 *
 * Middleware-auth gated (admin cookie). Surfaced via the dashboard
 * Settings tab.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Group = {
  group: string;
  vars: Array<{
    key: string;
    set: boolean;
    /** Why this matters — surfaced to Ben as a one-liner */
    why: string;
  }>;
};

export async function GET() {
  const has = (k: string) => !!process.env[k];

  const groups: Group[] = [
    {
      group: "Authentication",
      vars: [
        {
          key: "ADMIN_PASSWORD",
          set: has("ADMIN_PASSWORD"),
          why: "Ben's owner login password. Falls back to 'bluejay2026' if unset.",
        },
        {
          key: "ADMIN_PASSWORD_BEN",
          set: has("ADMIN_PASSWORD_BEN"),
          why: "Optional alias for ADMIN_PASSWORD — lets Ben rotate without breaking the legacy var.",
        },
        {
          key: "ADMIN_PASSWORD_MADIE",
          set: has("ADMIN_PASSWORD_MADIE"),
          why: "Madie's login. WITHOUT THIS, her login attempts fall through to checking against ADMIN_PASSWORD — she'd get owner role + see Ben's UI.",
        },
      ],
    },
    {
      group: "Twilio (SMS + voice)",
      vars: [
        {
          key: "TWILIO_ACCOUNT_SID",
          set: has("TWILIO_ACCOUNT_SID"),
          why: "Twilio account ID — required for any SMS or voice route.",
        },
        {
          key: "TWILIO_AUTH_TOKEN",
          set: has("TWILIO_AUTH_TOKEN"),
          why: "Twilio auth — required for sends.",
        },
        {
          key: "TWILIO_PHONE_NUMBER",
          set: has("TWILIO_PHONE_NUMBER"),
          why: "Default Twilio sender number for owner alerts + cold outreach.",
        },
        {
          key: "OWNER_PHONE_NUMBER",
          set: has("OWNER_PHONE_NUMBER"),
          why: "Ben's phone — receives owner SMS alerts + social-lead capture replies.",
        },
        {
          key: "OIT_TWILIO_NUMBER",
          set: has("OIT_TWILIO_NUMBER"),
          why: "Olympic Inspections-specific number. Without this, OIT funnel SMS steps SILENTLY SKIP — Luke's drip is email-only.",
        },
        {
          key: "ZENITH_TWILIO_NUMBER",
          set: has("ZENITH_TWILIO_NUMBER"),
          why: "Zenith-specific number for Philip's funnel SMS.",
        },
      ],
    },
    {
      group: "Email (SendGrid)",
      vars: [
        {
          key: "SENDGRID_API_KEY",
          set: has("SENDGRID_API_KEY"),
          why: "Required for any email send (funnel drips, owner alerts, confirmations).",
        },
        {
          key: "FROM_EMAIL",
          set: has("FROM_EMAIL"),
          why: "Default From address. Defaults to ben@bluejayportfolio.com.",
        },
      ],
    },
    {
      group: "Database + AI",
      vars: [
        {
          key: "NEXT_PUBLIC_SUPABASE_URL",
          set: has("NEXT_PUBLIC_SUPABASE_URL"),
          why: "Supabase project URL.",
        },
        {
          key: "SUPABASE_SERVICE_ROLE_KEY",
          set: has("SUPABASE_SERVICE_ROLE_KEY"),
          why: "Server-side Supabase key for privileged writes (cron, admin routes).",
        },
        {
          key: "ANTHROPIC_API_KEY",
          set: has("ANTHROPIC_API_KEY"),
          why: "Claude API for AI responder, voice agent, social-lead drafting, audit engine.",
        },
        {
          key: "OPENAI_API_KEY",
          set: has("OPENAI_API_KEY"),
          why: "Fallback / non-Claude features.",
        },
      ],
    },
    {
      group: "Scout + scrape",
      vars: [
        {
          key: "GOOGLE_PLACES_API_KEY",
          set: has("GOOGLE_PLACES_API_KEY"),
          why: "Required for Manufacturer Scout, Auto-Scout, OIT/Zenith partner-scout crons. Without this they all return 0 results.",
        },
        {
          key: "APOLLO_API_KEY",
          set: has("APOLLO_API_KEY"),
          why: "LinkedIn enrichment + decision-maker email lookup.",
        },
      ],
    },
    {
      group: "Ad-platform OAuth",
      vars: [
        {
          key: "GOOGLE_ADS_CLIENT_ID",
          set: has("GOOGLE_ADS_CLIENT_ID"),
          why: "Google Ads OAuth client ID — owner-side Connect button targets this.",
        },
        {
          key: "GOOGLE_ADS_CLIENT_SECRET",
          set: has("GOOGLE_ADS_CLIENT_SECRET"),
          why: "Pair with GOOGLE_ADS_CLIENT_ID. Both required.",
        },
        {
          key: "GOOGLE_ADS_DEVELOPER_TOKEN",
          set: has("GOOGLE_ADS_DEVELOPER_TOKEN"),
          why: "Required for actual Google Ads API calls (separate from OAuth — apply via Google Ads → Tools → API Center).",
        },
        {
          key: "META_ADS_APP_ID",
          set: has("META_ADS_APP_ID"),
          why: "Meta Marketing API app ID — owner-side Connect for Facebook/Instagram ads.",
        },
        {
          key: "META_ADS_APP_SECRET",
          set: has("META_ADS_APP_SECRET"),
          why: "Pair with META_ADS_APP_ID.",
        },
        {
          key: "LOB_API_KEY",
          set: has("LOB_API_KEY"),
          why: "Lob API key for direct-mail postcards. Single key handles all tenants.",
        },
        {
          key: "AD_OAUTH_KEY",
          set: has("AD_OAUTH_KEY"),
          why: "32-byte secret for encrypting refresh tokens at rest in client_ad_accounts. CRITICAL — no token storage works without this.",
        },
      ],
    },
    {
      group: "Misc + integrations",
      vars: [
        {
          key: "NEXT_PUBLIC_SITE_URL",
          set: has("NEXT_PUBLIC_SITE_URL"),
          why: "Used as the OAuth redirect URI base + email link prefix.",
        },
        {
          key: "STRIPE_SECRET_KEY",
          set: has("STRIPE_SECRET_KEY"),
          why: "Stripe payment processing.",
        },
        {
          key: "HEYGEN_API_KEY",
          set: has("HEYGEN_API_KEY"),
          why: "Personalized audit-page videos.",
        },
        {
          key: "CRON_SECRET",
          set: has("CRON_SECRET"),
          why: "Bearer token for cron endpoints.",
        },
      ],
    },
  ];

  // Counts for the summary card
  const total = groups.reduce((s, g) => s + g.vars.length, 0);
  const setCount = groups.reduce(
    (s, g) => s + g.vars.filter((v) => v.set).length,
    0,
  );

  return NextResponse.json({
    ok: true,
    summary: { total, set: setCount, missing: total - setCount },
    groups,
  });
}
