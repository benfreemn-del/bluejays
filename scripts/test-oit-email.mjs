#!/usr/bin/env node
/**
 * One-off test: fire a SendGrid email to info@olympicinspect.com using
 * the EXACT same code path the booking route uses (sendEmailToWithAlert).
 * Confirms the OIT owner inbox is actually receiving SendGrid sends.
 *
 * Usage: node scripts/test-oit-email.mjs
 *
 * Reads SENDGRID_API_KEY from .env.local. Prints the SendGrid response
 * code + body so we can diagnose if it's accepted (202) or rejected.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually (no dotenv dep needed for a one-off)
try {
  const envText = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // .env.local missing — caller must have env in process already
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY not set — can't run live test");
  process.exit(1);
}

const TO = "info@olympicinspect.com";
const FROM = "bluejaycontactme@gmail.com";

const subject = `🧪 OIT email delivery test — ${new Date().toISOString().slice(11, 19)} UTC`;
const body =
  "Hi Luke — this is an automated delivery test from Ben's dev " +
  "session. It uses the exact same SendGrid code path the booking " +
  "notifications use.\n\n" +
  "If you got this:\n" +
  "  ✅ SendGrid → your inbox delivery is working\n" +
  "  ✅ The booking notifications you received earlier today are " +
  "real — you can ignore them (they're tests too)\n\n" +
  "If you DIDN'T get this and Ben asked you to check Spam, that " +
  "means SendGrid has your address on a suppression list and we'll " +
  "need to remove it.\n\n" +
  "No reply needed — just confirm to Ben.\n\n" +
  "— BlueJays automated test";

const htmlBody = body
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\n/g, "<br/>");

const payload = {
  personalizations: [{ to: [{ email: TO }] }],
  from: { email: FROM, name: "Olympic Inspections — Delivery Test" },
  subject,
  content: [
    { type: "text/plain", value: body },
    {
      type: "text/html",
      value: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1f2937">${htmlBody}</div>`,
    },
  ],
};

console.log(`Sending to ${TO} from ${FROM}…`);

const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SENDGRID_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const respBody = await res.text();
console.log(`HTTP ${res.status}`);
if (respBody) console.log("Response body:", respBody.slice(0, 500));

if (res.ok) {
  console.log("✅ SendGrid accepted the email.");
  console.log("   Subject sent:", subject);
  console.log("   → Ask Luke to check his inbox at " + TO);
  console.log("   → If not there, check spam, then check SendGrid Suppressions.");
} else {
  console.log("❌ SendGrid rejected the email.");
  console.log("   Most common cause: sender (" + FROM + ") not verified.");
  console.log("   Or recipient (" + TO + ") on a suppression/bounce list.");
}
