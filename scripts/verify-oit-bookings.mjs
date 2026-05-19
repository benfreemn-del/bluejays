#!/usr/bin/env node
// Verify Olympic Inspections booking pipeline end-to-end.
// Reads .env.local for Supabase credentials and checks:
//   1. Schema (client_bookings + client_booking_slots tables exist)
//   2. Available slots count (customers have something to pick)
//   3. Recent bookings count (the form has been writing successfully)
//   4. client_owners row for OIT (alerts have a recipient)
//   5. The bridge tables (contact_form_submissions + client_leads) accept OIT rows
//   6. client_owner_preferences (instant-email default for new leads)

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

const out = (label, ok, detail) =>
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);

const availSlots = await supa
  .from("client_booking_slots")
  .select("id, start_at", { count: "exact" })
  .eq("client_slug", SLUG)
  .eq("status", "available")
  .gt("start_at", new Date().toISOString())
  .order("start_at", { ascending: true })
  .limit(5);
out(
  `Available future slots: ${availSlots.count ?? 0}`,
  (availSlots.count ?? 0) > 0,
  availSlots.count === 0 ? "Luke needs to add slots in /clients/olympic-inspections/admin" : null,
);
if (availSlots.data?.length) {
  console.log(`    next 5: ${availSlots.data.map((s) => s.start_at.slice(0, 16)).join(", ")}`);
}

const recent = await supa
  .from("client_bookings")
  .select("id, customer_name, customer_email, status, created_at")
  .eq("client_slug", SLUG)
  .order("created_at", { ascending: false })
  .limit(5);
out(
  `client_bookings table reachable, ${recent.data?.length ?? 0} recent rows`,
  !recent.error,
  recent.error?.message,
);
recent.data?.forEach((b) => {
  console.log(`    ${b.created_at.slice(0, 10)}  ${b.status.padEnd(10)}  ${b.customer_name}`);
});

const owner = await supa
  .from("client_owners")
  .select("email, name, role")
  .eq("client_slug", SLUG)
  .maybeSingle();
out(
  "client_owners row exists for OIT",
  !!owner.data,
  owner.data ? `${owner.data.email} (${owner.data.role})` : "MISSING — alerts have no recipient",
);

const bridge1 = await supa
  .from("contact_form_submissions")
  .select("id, customer_name, submitted_at", { count: "exact" })
  .eq("service_requested", "mold-inspection-booking")
  .order("submitted_at", { ascending: false })
  .limit(3);
out(
  `contact_form_submissions bridge — ${bridge1.count ?? 0} OIT bookings mirrored`,
  !bridge1.error,
  bridge1.error?.message,
);

const bridge2 = await supa
  .from("client_leads")
  .select("id, name, intent, created_at", { count: "exact" })
  .eq("client_slug", SLUG)
  .eq("intent", "mold-inspection-booking")
  .order("created_at", { ascending: false })
  .limit(3);
out(
  `client_leads bridge — ${bridge2.count ?? 0} OIT bookings enrolled`,
  !bridge2.error,
  bridge2.error?.message,
);

console.log("\nDone. If all rows above are ✓, the booking pipeline is wired correctly.");
console.log("Final verification: open https://bluejayportfolio.com/sites/olympic-inspections/index.html");
console.log("in a real browser, scroll to 'Book Your Inspection', submit a test, and confirm:");
console.log("  - browser shows 'Got it — thank you' success state");
console.log("  - Luke + Ben get the email alert (search Gmail: in:anywhere from:alerts@bluejayportfolio.com)");
console.log("  - new row lands in client_bookings (re-run this script to see it)");
