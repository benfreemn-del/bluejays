#!/usr/bin/env node
// @ts-check

/**
 * clean-prospect-emails — bulk email validity sweep
 *
 * Walks every prospect with a non-null email + status NOT IN
 * ('paid','bounced','unsubscribed','dismissed') and runs MX-record
 * verification via Google DNS-over-HTTPS. Marks every invalid address
 * as status='bounced' + funnelPaused=true so the funnel cron skips
 * them and they stop counting against deliverability metrics.
 *
 * Usage:
 *   node scripts/clean-prospect-emails.mjs [--dry-run] [--limit N]
 *
 *   --dry-run   Print what WOULD be marked invalid without writing
 *   --limit N   Cap the number of prospects checked (default: all)
 *
 * Reads .env.local for SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Concurrency capped at 20 parallel DNS lookups (Google DNS is fast
 * but sane backoff prevents rate-limit headers).
 *
 * Why a script not a route: this is a one-time + occasional bulk
 * sweep, not a per-request operation. Running inline in a Vercel
 * serverless function would time out at ~10s per chunk.
 *
 * Per CLAUDE.md Rule 42 (Hard-Bounce Suppression Policy): flagged
 * prospects get status='bounced' + funnelPaused=true. The SendGrid
 * suppression group write happens at first real bounce (not here)
 * since this is preemptive — they haven't bounced yet, the MX
 * lookup just proves the domain can't receive email.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// Startup banner so "is it running?" is answered in milliseconds.
console.log(`[clean-emails] starting · pid=${process.pid} · cwd=${process.cwd()}`);

// ─── env ──────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const path = resolve(process.cwd(), ".env.local");
    const text = readFileSync(path, "utf-8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional — fall through to whatever is in process.env
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(
  `[clean-emails] env: SUPABASE_URL=${SUPABASE_URL ? "✓" : "✗"} · SERVICE_ROLE_KEY=${SUPABASE_KEY ? `✓ (${SUPABASE_KEY.length} chars)` : "✗"}`,
);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "\n[clean-emails] ✗ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  console.error("    Make sure you're in the bluejays/ directory and .env.local has both keys.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ─── args ─────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const LIMIT_IDX = argv.indexOf("--limit");
const LIMIT = LIMIT_IDX >= 0 ? Number(argv[LIMIT_IDX + 1]) || null : null;
const CONCURRENCY = 20;

// ─── disposable domains (matches src/lib/email-verifier.ts) ──────────
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "guerrillamail.info", "spam4.me", "trashmail.com", "dispostable.com",
  "fakeinbox.com", "maildrop.cc", "spamgourmet.com", "trashmail.me",
]);

// ─── MX-record check ──────────────────────────────────────────────────
async function verifyEmail(email) {
  if (!email || !email.includes("@")) {
    return { valid: false, reason: "missing or malformed email" };
  }
  const [, domain] = email.toLowerCase().split("@");
  if (!domain || !domain.includes(".")) {
    return { valid: false, reason: "invalid domain" };
  }
  if (DISPOSABLE.has(domain)) {
    return { valid: false, reason: "disposable email domain" };
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: ctrl.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return { valid: true, reason: "dns lookup http err — allowing" };
    const data = await res.json();
    if (data.Status !== 0 || !data.Answer || data.Answer.length === 0) {
      return { valid: false, reason: "no MX records" };
    }
    return { valid: true, reason: "MX ok" };
  } catch (err) {
    return { valid: true, reason: `network err — allowing: ${err.message}` };
  }
}

// ─── runner ───────────────────────────────────────────────────────────
async function main() {
  console.log(
    `[clean-emails] ${DRY_RUN ? "DRY RUN — " : ""}walking prospect list…`,
  );

  let q = sb
    .from("prospects")
    .select("id, business_name, email, status")
    .not("email", "is", null)
    .not("status", "in", "(paid,bounced,unsubscribed,dismissed)")
    .order("created_at", { ascending: false });
  if (LIMIT) q = q.limit(LIMIT);

  const { data, error } = await q;
  if (error) {
    console.error("[clean-emails] supabase select failed:", error.message);
    process.exit(1);
  }

  const rows = data || [];
  console.log(`[clean-emails] ${rows.length} prospects to verify · concurrency=${CONCURRENCY}`);
  if (rows.length === 0) {
    console.log(`[clean-emails] nothing to do — exiting.`);
    return;
  }

  let invalid = 0;
  let valid = 0;
  let processed = 0;
  const started = Date.now();

  // Heartbeat — guarantees a line every 3s even if everyone's valid
  // (no per-record output otherwise). Cleared on completion.
  const heartbeat = setInterval(() => {
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      `  ⏱ heartbeat · ${processed}/${rows.length} processed · ${invalid} invalid · ${elapsed}s elapsed`,
    );
  }, 3000);

  // Simple concurrency-limited runner
  const queue = [...rows];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const row = queue.shift();
      if (!row) break;
      processed += 1;
      const result = await verifyEmail(row.email);
      if (!result.valid) {
        invalid += 1;
        console.log(
          `  ✗ ${row.business_name?.slice(0, 30) ?? "?"} <${row.email}> — ${result.reason}`,
        );
        if (!DRY_RUN) {
          const { error: updErr } = await sb
            .from("prospects")
            .update({
              status: "bounced",
              funnel_paused: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
          if (updErr) {
            console.warn(`    (update failed: ${updErr.message})`);
          }
        }
      } else {
        valid += 1;
      }
      // Loud progress every 10 records (was 50 — too quiet)
      if (processed % 10 === 0) {
        console.log(
          `[clean-emails] progress: ${processed}/${rows.length} · ${invalid} invalid so far`,
        );
      }
    }
  });

  await Promise.all(workers);
  clearInterval(heartbeat);

  console.log(`\n[clean-emails] DONE`);
  console.log(`  total checked: ${processed}`);
  console.log(`  valid:         ${valid}`);
  console.log(`  invalid:       ${invalid} ${DRY_RUN ? "(would be) " : ""}flagged`);
  console.log(
    `  rate:          ${rows.length > 0 ? ((invalid / rows.length) * 100).toFixed(1) : 0}%`,
  );
  if (DRY_RUN) {
    console.log(`\n  Re-run without --dry-run to apply.`);
  }
}

main().catch((err) => {
  console.error("[clean-emails] fatal:", err);
  process.exit(1);
});
