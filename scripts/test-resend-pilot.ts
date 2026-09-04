/**
 * One-off Resend pilot smoke test (2026-09-04).
 *
 * Exercises the EXACT production code path for an Olympic Inspections
 * send: sendEmailTo({clientSlug: "olympic-inspections"}) →
 * resendPilotEnabled() → sendViaResend() (SendGrid fallback on failure).
 * Recipient is Ben ONLY — no client, no customer is emailed.
 *
 * Run: npx tsx --env-file=.env.pilot-test scripts/test-resend-pilot.ts
 */
import { sendEmailTo } from "../src/lib/alerts";

async function main() {
  console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);
  console.log("RESEND_PILOT_SLUGS:", process.env.RESEND_PILOT_SLUGS);
  const ok = await sendEmailTo({
    to: "benfreemn@gmail.com",
    subject: "✅ Resend pilot test — Olympic Inspections path",
    body:
      "This email traveled the exact Olympic Inspections booking-alert code path,\n" +
      "but via RESEND instead of SendGrid.\n\n" +
      "If you're reading this, the pilot works:\n" +
      "• From: alerts@bluejayportfolio.com (DKIM-signed by Resend)\n" +
      "• Fallback: SendGrid (untouched, still live)\n" +
      "• Scope: olympic-inspections only — Meyer Electric untouched\n\n" +
      "Open the three-dot menu → Show original → confirm SPF/DKIM/DMARC all PASS.",
    fromName: "Olympic Inspections — Booking Alert",
    clientSlug: "olympic-inspections",
    category: "transactional",
  });
  console.log("SEND RESULT:", ok ? "SUCCESS" : "FAILED");
  process.exit(ok ? 0 : 1);
}

main();
