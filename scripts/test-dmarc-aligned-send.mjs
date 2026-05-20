#!/usr/bin/env node
/**
 * Fire ONE test email using the NEW DMARC-aligned FROM_EMAIL pattern
 * (alerts@bluejayportfolio.com + reply_to: bluejaycontactme@gmail.com).
 * Sends to Ben's Gmail so he can verify in real-time.
 *
 * Prints the SendGrid X-Message-Id so we can trace the exact message
 * through Activity Feed if it doesn't land.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const envText = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) { console.error("❌ SENDGRID_API_KEY missing"); process.exit(1); }

const TO = "bluejaycontactme@gmail.com";
const FROM = "alerts@bluejayportfolio.com";
const REPLY_TO = "bluejaycontactme@gmail.com";

const tag = `${new Date().toISOString().slice(11, 19).replace(/:/g, "")}-UTC`;
const subject = `🧪 DMARC test ${tag} — should land in Primary`;
const body =
  "This is a one-shot delivery test from the dev session.\n\n" +
  `Test tag: ${tag}\n` +
  `From: ${FROM}\n` +
  `To: ${TO}\n` +
  `Reply-To: ${REPLY_TO}\n` +
  `DMARC: bluejayportfolio.com domain authenticated (SPF + DKIM + p=none)\n\n` +
  "If you see this in your inbox: DMARC fix works. Mark it Not Spam if it's\n" +
  "in spam, and add alerts@bluejayportfolio.com to your Contacts to lock in\n" +
  "inbox delivery for all future booking alerts.\n\n" +
  "— BlueJays automated test";

const payload = {
  personalizations: [{ to: [{ email: TO }] }],
  from: { email: FROM, name: "BlueJays Alerts (Test)" },
  reply_to: { email: REPLY_TO, name: "BlueJays" },
  subject,
  content: [
    { type: "text/plain", value: body },
    { type: "text/html", value: `<pre style="font-family:Menlo,Consolas,monospace;font-size:14px;background:#f8f8f8;padding:14px;border-radius:6px;color:#1f2937">${body.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>` },
  ],
};

console.log(`Firing test: ${FROM} → ${TO}`);
console.log(`Subject: "${subject}"`);
console.log("");

const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

console.log(`SendGrid HTTP ${res.status}`);
console.log(`X-Message-Id: ${res.headers.get("x-message-id") || "(none)"}`);
const respBody = await res.text();
if (respBody) console.log("Body:", respBody);

if (res.ok) {
  console.log("\n✅ Accepted by SendGrid. Search Gmail RIGHT NOW for:");
  console.log(`   in:anywhere "DMARC test ${tag}"`);
  console.log("\nIf the search returns ZERO hits within 2 minutes, Gmail post-accept");
  console.log("dropped the message. Likely culprits:");
  console.log("  1. A Gmail filter you forgot about (Settings → Filters)");
  console.log("  2. Forwarding rule routing it elsewhere");
  console.log("  3. A different Gmail account (are you signed into the right one?)");
} else {
  console.log("\n❌ SendGrid rejected. Diagnosis above.");
}
