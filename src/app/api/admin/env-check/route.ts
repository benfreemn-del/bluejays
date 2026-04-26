import { NextResponse } from "next/server";

/**
 * GET /api/admin/env-check
 *
 * Returns presence/absence (booleans only — never the values) of the
 * env vars that gate the marketing pipeline. Use this to confirm a
 * Vercel deploy actually has the secrets it needs without exposing
 * any secret material.
 *
 * Auth: middleware.ts already gates /api/admin/* behind the dashboard
 * session cookie, so this is admin-only by virtue of its path.
 */
export const dynamic = "force-dynamic";

const ENV_KEYS = [
  // Stripe
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_SETUP_ID",
  "STRIPE_PRICE_MGMT_ID",
  "STRIPE_PRICE_CUSTOM_ID",
  "STRIPE_PRICE_REVIEW_BLAST",
  "STRIPE_PRICE_EXTRA_PAGES",
  "STRIPE_PRICE_GBP_SETUP",
  "STRIPE_PRICE_MONTHLY_UPDATES",
  "STRIPE_CUSTOMER_PORTAL_URL",
  // SendGrid + email
  "SENDGRID_API_KEY",
  "FROM_EMAIL",
  // Twilio
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  // Lob (postcards)
  "LOB_API_KEY",
  "LOB_FROM_NAME",
  "LOB_FROM_LINE1",
  "LOB_FROM_CITY",
  "LOB_FROM_STATE",
  "LOB_FROM_ZIP",
  // Vercel (domain auto-add)
  "VERCEL_API_TOKEN",
  "VERCEL_PROJECT_ID",
  "VERCEL_TEAM_ID",
  // Namecheap (domain registration)
  "NAMECHEAP_API_USER",
  "NAMECHEAP_API_KEY",
  "NAMECHEAP_USERNAME",
  "NAMECHEAP_CLIENT_IP",
  // Browserless (video)
  "BROWSERLESS_API_KEY",
  // AI safety + funnel
  "AI_AUTO_REPLY_ENABLED",
  "ENABLE_HTML_PITCH_EMAIL",
  // Stripe LIVE kill-switch + tier gate (Rules 52, 53)
  "STRIPE_LIVE_ENABLED",
  "STRIPE_ALLOW_NON_STANDARD_TIERS",
  // Misc
  "BEN_PHONE",
  "GOOGLE_PLACES_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  // Apollo (LinkedIn enrichment — tier 2 marketing)
  "APOLLO_API_KEY",
  // Supabase
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export async function GET() {
  const present: Record<string, boolean> = {};
  for (const key of ENV_KEYS) {
    present[key] = Boolean((process.env[key] || "").trim());
  }

  // Lob-specific summary so it's easy to spot the gap at a glance.
  const lobReady =
    present.LOB_API_KEY &&
    present.LOB_FROM_NAME &&
    present.LOB_FROM_LINE1 &&
    present.LOB_FROM_CITY &&
    present.LOB_FROM_STATE &&
    present.LOB_FROM_ZIP;

  // Vercel build identifier so you can verify which deploy answered.
  const deploy = {
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelUrl: process.env.VERCEL_URL || null,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
    commitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
  };

  // Stripe price-ID prefix audit (added 2026-04-25 to debug a "No such
  // price: prod_xxx" error from a wrong-prefix copy/paste during the LIVE
  // flip). Returns only the prefix character group — NEVER the full ID
  // value. `price` = correct (Stripe price object). `prod` = WRONG (this
  // is a Product ID, not a Price ID — checkout will 400 with
  // "No such price: prod_xxx"). `null` = unset.
  const STRIPE_PRICE_KEYS = [
    "STRIPE_PRICE_SETUP_ID",
    "STRIPE_PRICE_MGMT_ID",
    "STRIPE_PRICE_CUSTOM_ID",
    "STRIPE_PRICE_REVIEW_BLAST",
    "STRIPE_PRICE_EXTRA_PAGES",
    "STRIPE_PRICE_GBP_SETUP",
    "STRIPE_PRICE_MONTHLY_UPDATES",
  ];
  const stripePricePrefixes: Record<string, "price" | "prod" | "other" | null> = {};
  for (const key of STRIPE_PRICE_KEYS) {
    const v = (process.env[key] || "").trim();
    if (!v) {
      stripePricePrefixes[key] = null;
    } else if (v.startsWith("price_")) {
      stripePricePrefixes[key] = "price";
    } else if (v.startsWith("prod_")) {
      stripePricePrefixes[key] = "prod";
    } else {
      stripePricePrefixes[key] = "other";
    }
  }

  return NextResponse.json({
    deploy,
    lobReady,
    present,
    stripePricePrefixes,
  });
}
