import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const LCAC_ID = "d20058f9-b874-4a8e-b742-c2e6e412ee56";

async function findStripeSub(): Promise<{ subId: string | null; customerId: string | null; note: string }> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { subId: null, customerId: null, note: "STRIPE_SECRET_KEY missing — skipping Stripe lookup" };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Try searching customers by email first
  try {
    const byEmail = await stripe.customers.search({
      query: "email:'info@lcautism.org'",
      limit: 5,
    });
    if (byEmail.data.length > 0) {
      const customer = byEmail.data[0];
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 5 });
      if (subs.data.length > 0) {
        return { subId: subs.data[0].id, customerId: customer.id, note: `found via email search` };
      }
      return { subId: null, customerId: customer.id, note: `found customer but no active subs` };
    }
  } catch (e) {
    console.error("Stripe customer search by email failed:", (e as Error).message);
  }

  // Fall back to name search
  try {
    const byName = await stripe.customers.search({
      query: "name~'Lewis County Autism'",
      limit: 5,
    });
    if (byName.data.length > 0) {
      const customer = byName.data[0];
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 5 });
      if (subs.data.length > 0) {
        return { subId: subs.data[0].id, customerId: customer.id, note: `found via name search` };
      }
      return { subId: null, customerId: customer.id, note: `found customer but no active subs` };
    }
  } catch (e) {
    console.error("Stripe customer search by name failed:", (e as Error).message);
  }

  return { subId: null, customerId: null, note: "no matching customer in Stripe" };
}

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log("Finding Stripe subscription for LCAC…");
  const { subId, customerId, note } = await findStripeSub();
  console.log(`  ${note}`);
  if (subId) console.log(`  Subscription: ${subId}`);
  if (customerId) console.log(`  Customer:     ${customerId}`);

  // Build the update payload — preserves existing fields, fills in the missing ones
  const update: Record<string, unknown> = {
    status: "paid",
    pricing_tier: "custom",
    email: "info@lcautism.org",
    phone: "(360) 644-5222",
    city: "Napavine",
    state: "WA",
    address: "375 Linhart Ave NE, Suite B, Napavine, WA 98565",
    custom_site_url: "https://www.lcautism.org",
    paid_at: new Date().toISOString(), // when the sub started; close enough since we don't have the original date
  };
  if (subId) update.mgmt_subscription_id = subId;
  if (customerId) update.stripe_customer_id = customerId;

  console.log("\nApplying update to prospects.id =", LCAC_ID);
  console.log(JSON.stringify(update, null, 2));

  const { data, error } = await sb
    .from("prospects")
    .update(update)
    .eq("id", LCAC_ID)
    .select()
    .single();

  if (error) {
    console.error("\n❌ UPDATE FAILED:", error);
    process.exit(1);
  }

  console.log("\n✅ Update applied successfully.\n");
  console.log("─".repeat(60));
  console.log("Verifying:");
  console.log(`  status:            ${data.status}`);
  console.log(`  pricing_tier:      ${data.pricing_tier}`);
  console.log(`  manually_managed:  ${data.manually_managed}`);
  console.log(`  email:             ${data.email}`);
  console.log(`  phone:             ${data.phone}`);
  console.log(`  city, state:       ${data.city}, ${data.state}`);
  console.log(`  address:           ${data.address}`);
  console.log(`  custom_site_url:   ${data.custom_site_url}`);
  console.log(`  mgmt_subscription_id: ${data.mgmt_subscription_id ?? "(null — Stripe lookup failed)"}`);
  console.log(`  stripe_customer_id:   ${data.stripe_customer_id ?? "(null — Stripe lookup failed)"}`);
  console.log(`  paid_at:           ${data.paid_at}`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
