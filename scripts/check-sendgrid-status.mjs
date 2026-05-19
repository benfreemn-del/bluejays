#!/usr/bin/env node
// Query SendGrid directly for the silent-failure root cause.
// Checks: API key validity, account status, suppressions for the two
// addresses, recent email Activity Feed events, verified senders, and
// authenticated domains.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const key = env.SENDGRID_API_KEY;
if (!key) {
  console.error("SENDGRID_API_KEY missing from .env.local");
  process.exit(1);
}

const sg = (path) =>
  fetch(`https://api.sendgrid.com/v3${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });

console.log("─── SendGrid Diagnostic ───\n");

const scopes = await sg("/scopes");
console.log(`1. API key: HTTP ${scopes.status}  ${scopes.ok ? "✓ valid" : "✗ INVALID"}`);
if (!scopes.ok) {
  console.log("   →", await scopes.text());
  process.exit(0);
}

const user = await sg("/user/account");
const userJ = await user.json();
console.log(`2. Account: type=${userJ.type || "?"}  reputation=${userJ.reputation ?? "?"}`);

const addresses = [
  "info@olympicinspect.com",
  "bluejaycontactme@gmail.com",
  "alerts@bluejayportfolio.com",
];
const lists = [
  ["bounces", "/suppression/bounces"],
  ["blocks", "/suppression/blocks"],
  ["invalid_emails", "/suppression/invalid_emails"],
  ["spam_reports", "/suppression/spam_reports"],
];

for (const [label, path] of lists) {
  const r = await sg(path);
  if (!r.ok) {
    console.log(`3. ${label}: HTTP ${r.status} — skipping`);
    continue;
  }
  const rows = await r.json();
  const hits = (Array.isArray(rows) ? rows : []).filter((row) =>
    addresses.includes((row.email || "").toLowerCase()),
  );
  console.log(
    `3. ${label.padEnd(15)}: ${rows.length} total · ${hits.length} match our addresses`,
  );
  hits.forEach((h) =>
    console.log(
      `     ✗ ${h.email}  reason=${h.reason || h.status || "?"}  at=${new Date((h.created || 0) * 1000).toISOString().slice(0, 16)}`,
    ),
  );
}

const since = Math.floor(Date.now() / 1000) - 24 * 3600;
const actUrl = `/messages?query=${encodeURIComponent(
  `last_event_time BETWEEN TIMESTAMP "${new Date(since * 1000).toISOString()}" AND TIMESTAMP "${new Date().toISOString()}"`,
)}&limit=50`;
const act = await sg(actUrl);
console.log(`\n4. Activity Feed (last 24h): HTTP ${act.status}`);
if (act.ok) {
  const j = await act.json();
  const msgs = j.messages || [];
  console.log(`   Total: ${msgs.length}`);
  const byStatus = {};
  msgs.forEach((m) => {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
  });
  Object.entries(byStatus).forEach(([s, n]) => console.log(`     ${s}: ${n}`));
  const interesting = msgs.filter(
    (m) =>
      (m.to_email || "").includes("olympicinspect") ||
      (m.to_email || "").includes("bluejaycontactme") ||
      (m.from_email || "").includes("alerts@bluejayportfolio") ||
      (m.from_email || "").includes("bluejaycontactme"),
  );
  console.log(`   Relevant (OIT / Ben / alerts FROM): ${interesting.length}`);
  interesting.slice(0, 20).forEach((m) =>
    console.log(
      `     ${new Date(m.last_event_time).toISOString().slice(11, 16)}  ${m.status.padEnd(10)}  ${m.from_email} → ${m.to_email}  "${(m.subject || "").slice(0, 45)}"`,
    ),
  );
} else {
  console.log(`   ${(await act.text()).slice(0, 200)}`);
}

const senders = await sg("/verified_senders");
console.log(`\n5. Verified senders: HTTP ${senders.status}`);
if (senders.ok) {
  const j = await senders.json();
  (j.results || j || []).forEach((s) => {
    console.log(`   ${s.verified ? "✓" : "✗"} ${s.from_email}  locked=${s.locked || false}`);
  });
}

const dom = await sg("/whitelabel/domains");
console.log(`\n6. Authenticated domains: HTTP ${dom.status}`);
if (dom.ok) {
  const j = await dom.json();
  j.forEach((d) => {
    console.log(`   ${d.valid ? "✓" : "✗"} ${d.domain}`);
    Object.entries(d.dns || {}).forEach(([k, v]) => {
      console.log(`     ${v.valid ? "✓" : "✗"} ${k.padEnd(12)} (${v.type})`);
    });
  });
}
