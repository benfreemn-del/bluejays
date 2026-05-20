/**
 * Verify the TEKKY $997 Stripe Payment Link is set up correctly.
 *
 * Loads STRIPE_SECRET_KEY from .env.local internally — never echoes it.
 * Queries the Stripe API for recent payment links + their line items.
 * Prints ONLY the safe fields: name, currency, amount, tax behavior.
 *
 * Run: node scripts/verify-tekky-997-link.mjs
 */
import fs from "node:fs";
import path from "node:path";

const TARGET_URL_HINT = "00weVfeAX88G28T3Lq04803";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("No .env.local found");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) {
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] = val;
    }
  }
}

async function api(pathname, key) {
  const r = await fetch(`https://api.stripe.com/v1${pathname}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Stripe ${r.status}: ${body.slice(0, 200)}`);
  }
  return r.json();
}

async function main() {
  loadEnv();
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("STRIPE_SECRET_KEY not set in .env.local");
    process.exit(1);
  }
  console.log(`Stripe key mode: ${key.startsWith("sk_test_") ? "TEST" : key.startsWith("sk_live_") ? "LIVE" : "UNKNOWN"}`);
  console.log("");

  // List payment links — newest first by default
  const links = await api("/payment_links?limit=20", key);
  const targets = links.data.filter((pl) =>
    (pl.url || "").includes(TARGET_URL_HINT),
  );

  if (targets.length === 0) {
    console.log(`No payment link found matching URL hint "${TARGET_URL_HINT}".`);
    console.log("Recent payment links:");
    for (const pl of links.data.slice(0, 5)) {
      console.log(`  - ${pl.id} → ${pl.url || "no-url"} (active=${pl.active})`);
    }
    return;
  }

  for (const pl of targets) {
    console.log(`PAYMENT LINK: ${pl.id}`);
    console.log(`  URL:           ${pl.url}`);
    console.log(`  Active:        ${pl.active}`);
    console.log(`  Currency:      ${pl.currency || "(inherited from line items)"}`);
    console.log(`  Automatic tax: ${pl.automatic_tax?.enabled ?? false}`);
    console.log(`  Allow promo codes: ${pl.allow_promotion_codes ?? false}`);
    console.log(`  Customer creation: ${pl.customer_creation ?? "always"}`);
    if (pl.metadata && Object.keys(pl.metadata).length) {
      console.log(`  Metadata:`, pl.metadata);
    }

    // Get line items
    const items = await api(
      `/payment_links/${pl.id}/line_items?expand[]=data.price.product`,
      key,
    );
    console.log("  LINE ITEMS:");
    for (const li of items.data) {
      const amount = (li.amount_total ?? li.price?.unit_amount ?? 0) / 100;
      const currency = (li.currency || li.price?.currency || "?").toUpperCase();
      const productName = li.price?.product?.name || li.description || "(no name)";
      const productDescription = li.price?.product?.description || "(no description)";
      const taxBehavior = li.price?.tax_behavior || "(none)";
      const quantity = li.quantity ?? 1;
      console.log(`    - "${productName}"`);
      console.log(`        description:   ${productDescription}`);
      console.log(`        price:         $${amount.toFixed(2)} ${currency} (qty ${quantity})`);
      console.log(`        tax_behavior:  ${taxBehavior}`);
      console.log(`        recurring:     ${li.price?.recurring ? JSON.stringify(li.price.recurring) : "one-time"}`);
    }
    console.log("");
  }
}

main().catch((err) => {
  console.error("ERR:", err.message);
  process.exit(1);
});
