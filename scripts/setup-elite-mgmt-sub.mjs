#!/usr/bin/env node
// @ts-check

/**
 * setup-elite-mgmt-sub — create Tyler Fritz's deferred $100/yr
 * management subscription in Stripe with a 1-year trial (year 1 free).
 *
 * Why a separate script: every other client's deferred mgmt sub is
 * created by the Stripe-webhook handler when they pay through
 * Checkout. Tyler paid $1k offline (bespoke tier) so the webhook
 * path never fired. This is the one-off equivalent.
 *
 * Outcome (when run successfully):
 *   - Creates / re-uses a Stripe Customer for Tyler (needs his email
 *     OR phone; passes whichever is set on the prospect row)
 *   - Creates a Stripe Subscription with trial_end = now + 365 days,
 *     $100/yr after trial (uses STRIPE_PRICE_MGMT_ID if set, else
 *     inline price_data — same fallback as the webhook handler).
 *   - Writes stripe_customer_id + mgmt_subscription_id back onto
 *     prospects(id='4e9c89b4-d321-4d9c-91bd-1dc071cf847a').
 *
 * Idempotent: if the prospect already has mgmt_subscription_id set,
 * the script refuses to run (avoids creating duplicate subs).
 *
 * Usage:
 *   node scripts/setup-elite-mgmt-sub.mjs            # dry-run
 *   node scripts/setup-elite-mgmt-sub.mjs --apply    # creates the sub
 *
 * Env required (from .env.local):
 *   STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   Optional: STRIPE_PRICE_MGMT_ID (else inline $100/yr price_data)
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  try {
    const txt = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // optional
  }
}
loadEnv();

const PROSPECT_ID = "4e9c89b4-d321-4d9c-91bd-1dc071cf847a";
const BUSINESS_NAME = "Elite Hardscapes & Landscaping";
const APPLY = process.argv.includes("--apply");

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!STRIPE_KEY) {
  console.error("✗ STRIPE_SECRET_KEY missing");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Supabase env missing");
  process.exit(1);
}

// ─── Supabase fetch ───
async function sb(path, opts = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) {
    throw new Error(`supabase ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
  return r.json();
}

// ─── Stripe fetch (REST, no SDK dep — same shape as the rest of the codebase) ───
async function stripe(path, opts = {}) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(opts.headers || {}),
    },
  });
  const body = await r.json();
  if (!r.ok) {
    throw new Error(`stripe ${r.status}: ${JSON.stringify(body).slice(0, 400)}`);
  }
  return body;
}

function form(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

// ─── Load Tyler's prospect row ───
const rows = await sb(`prospects?id=eq.${PROSPECT_ID}&select=*`);
if (!rows.length) {
  console.error(`✗ Prospect ${PROSPECT_ID} not found`);
  process.exit(1);
}
const p = rows[0];

console.log(`→ Prospect: ${p.business_name}`);
console.log(`  email: ${p.email ?? "(not set)"}`);
console.log(`  phone: ${p.phone ?? "(not set)"}`);
console.log(`  stripe_customer_id: ${p.stripe_customer_id ?? "(none)"}`);
console.log(`  mgmt_subscription_id: ${p.mgmt_subscription_id ?? "(none)"}`);

if (p.mgmt_subscription_id) {
  console.error(`\n✗ Refusing to run — mgmt_subscription_id already set (${p.mgmt_subscription_id}).`);
  console.error("  Delete that field in Supabase first if you really need to re-run.");
  process.exit(1);
}

if (!p.email) {
  console.warn("\n⚠  Tyler's email is not set on the prospect row.");
  console.warn("   Stripe customer will be created without an email, which means");
  console.warn("   he won't receive Stripe receipts / dunning notifications.");
  console.warn("   Add prospect.email FIRST for the standard experience.\n");
}

const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
const trialEndIso = new Date(oneYearFromNow * 1000).toISOString();
const priceId = process.env.STRIPE_PRICE_MGMT_ID;

console.log("\n────  plan  ────");
console.log(`  trial_end → ${trialEndIso} (year 1 free)`);
console.log(`  amount    → $100.00/yr (USD) starting at trial_end`);
console.log(`  price     → ${priceId ? `pre-created Stripe Price ${priceId}` : "inline price_data ($100/yr)"}`);

if (!APPLY) {
  console.log("\n(dry-run — pass --apply to create the customer + subscription)");
  process.exit(0);
}

// ─── Apply ───
console.log("\n──── applying ────");

// 1. Customer
const customer = await stripe("customers", {
  method: "POST",
  body: form({
    name: p.owner_name ? `${p.owner_name} (${BUSINESS_NAME})` : BUSINESS_NAME,
    email: p.email ?? "",
    phone: p.phone ?? "",
    "metadata[prospectId]": PROSPECT_ID,
    "metadata[businessName]": BUSINESS_NAME,
    "metadata[type]": "bespoke-1k-mgmt",
  }),
});
console.log(`  ✓ customer ${customer.id}`);

// 2. Subscription with 1-year trial
const subBody = {
  customer: customer.id,
  trial_end: String(oneYearFromNow),
  "metadata[prospectId]": PROSPECT_ID,
  "metadata[businessName]": BUSINESS_NAME,
  "metadata[type]": "management_fee",
  "payment_settings[save_default_payment_method]": "on_subscription",
};
if (priceId) {
  subBody["items[0][price]"] = priceId;
} else {
  subBody["items[0][price_data][currency]"] = "usd";
  subBody["items[0][price_data][product_data][name]"] = `Website Management — ${BUSINESS_NAME}`;
  subBody["items[0][price_data][product_data][description]"] =
    "Annual domain renewal, hosting, ongoing maintenance, and support for the website";
  subBody["items[0][price_data][unit_amount]"] = "10000";
  subBody["items[0][price_data][recurring][interval]"] = "year";
}
const sub = await stripe("subscriptions", { method: "POST", body: form(subBody) });
console.log(`  ✓ subscription ${sub.id}`);
console.log(`  ✓ first charge ${new Date(sub.trial_end * 1000).toISOString()}`);

// 3. Save back to Supabase
await sb(`prospects?id=eq.${PROSPECT_ID}`, {
  method: "PATCH",
  body: JSON.stringify({
    stripe_customer_id: customer.id,
    mgmt_subscription_id: sub.id,
    subscription_status: "active",
    updated_at: new Date().toISOString(),
  }),
});
console.log("  ✓ wrote stripe_customer_id + mgmt_subscription_id to prospects");
console.log("\nDone. Tyler is on the deferred-management-sub track.");
