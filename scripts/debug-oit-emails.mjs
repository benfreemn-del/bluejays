#!/usr/bin/env node
// Diagnostic for OIT booking email failures.
// Splits the silent-failure tree:
//   1. SendGrid cost rows fired (= SendGrid accepted the send, returned 200)
//   2. Twilio owner_alert SMS cost rows (= SMS path works)
//   3. agent_signals from the booking flow

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const supa = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const SLUG = "olympic-inspections";
const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

console.log(`Looking at the last 24h of OIT activity (since ${since.slice(0, 16)} UTC)\n`);

const bookings = await supa
  .from("client_bookings")
  .select("id, customer_name, customer_email, created_at")
  .eq("client_slug", SLUG)
  .gte("created_at", since)
  .order("created_at", { ascending: false });
console.log(`Bookings created: ${bookings.data?.length ?? 0}`);
bookings.data?.forEach((b) =>
  console.log(`  ${b.created_at.slice(11, 16)}  ${b.customer_name.padEnd(35)}  ${b.customer_email || "(no email)"}`),
);

const sgCosts = await supa
  .from("system_costs")
  .select("created_at, action, metadata, client_slug")
  .eq("service", "sendgrid_email")
  .gte("created_at", since)
  .order("created_at", { ascending: false });
const oitSends = (sgCosts.data ?? []).filter(
  (r) =>
    r.client_slug === SLUG ||
    JSON.stringify(r.metadata || {}).toLowerCase().includes("olympicinspect"),
);
console.log(`\nSendGrid sends (200 OK) in last 24h: ${sgCosts.data?.length ?? 0} total, ${oitSends.length} OIT-related`);
oitSends.forEach((r) => {
  const to = r.metadata?.to || "?";
  console.log(`  ${r.created_at.slice(11, 16)}  to=${to}  action=${r.action}`);
});

const smsCosts = await supa
  .from("system_costs")
  .select("created_at, action, metadata, client_slug")
  .eq("service", "twilio_sms")
  .gte("created_at", since)
  .order("created_at", { ascending: false });
const oitSms = (smsCosts.data ?? []).filter(
  (r) => r.action === "owner_alert" || r.client_slug === SLUG,
);
console.log(`\nTwilio owner-alert SMS in last 24h: ${oitSms.length}`);
oitSms.slice(0, 10).forEach((r) => {
  console.log(`  ${r.created_at.slice(11, 16)}  ${r.action}  client=${r.client_slug || "(none)"}`);
});

console.log("\n— DIAGNOSIS ——");
console.log(`bookings=${bookings.data?.length ?? 0}  sg_sends=${oitSends.length}  owner_sms=${oitSms.length}`);
if ((bookings.data?.length ?? 0) > 0 && oitSends.length === 0) {
  console.log("✗ Bookings landed but NO SendGrid cost rows → sendEmailTo() returned false → SendGrid 4xx.");
  console.log("  → Check SendGrid suppressions + sender authentication.");
} else if (oitSends.length > 0 && oitSms.length === 0) {
  console.log("✗ SendGrid succeeded but no owner SMS → Twilio path also broken.");
} else if (oitSends.length > 0 && oitSms.length > 0) {
  console.log("✓ Both pipes fired. If Luke/Ben still didn't get the email, run check-sendgrid-status.mjs");
  console.log("  to inspect Activity Feed (delivered vs bounced vs dropped) and search Gmail with:");
  console.log("  in:anywhere from:alerts@bluejayportfolio.com");
}
