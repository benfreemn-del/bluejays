/**
 * Recover prospects who received broken outreach links.
 *
 * Every funnel email/SMS/retarget from before commit a290376 shipped a
 * preview URL built from the first 8 chars of the UUID (e.g.
 * /p/ad954c6f) instead of the actual short_code (/p/145eb9eb).
 * Every one of those links 404'd. The most likely reason nobody has
 * claimed: they all tried the link, saw "Not Found," and bounced.
 *
 * This script re-sends an honest "link was broken" email to every
 * contacted/responded prospect, with the working short URL. It:
 *   - Skips prospects who already paid, dismissed, or unsubscribed
 *   - Skips hard-bounced emails (sendEmail handles that gate)
 *   - Respects the parallel-domain warming cap (sendEmail handles)
 *   - Spaces sends by a few seconds to avoid tripping SendGrid rate limits
 *
 * Dry-run: npx tsx scripts/recover-broken-link-sends.ts
 * Apply:   npx tsx scripts/recover-broken-link-sends.ts --apply
 * Limit:   npx tsx scripts/recover-broken-link-sends.ts --apply --max=10
 */

import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const c = fs.readFileSync(envPath, "utf-8");
  for (const line of c.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import { createClient } from "@supabase/supabase-js";
import { getShortPreviewUrl } from "../src/lib/short-urls";
import type { Prospect } from "../src/lib/types";

// email-sender.ts captures SENDGRID_API_KEY at module-evaluation time.
// ES imports hoist above the .env.local loader at the top of this file,
// so a normal import captures the key as undefined → mock mode. Dynamic
// import inside main() runs AFTER process.env is populated.
async function loadSendEmail() {
  const mod = await import("../src/lib/email-sender");
  return mod.sendEmail;
}

const RESEND_SEQUENCE = 99;      // out-of-band sequence so it doesn't collide with the normal funnel
const DELAY_MS = 3000;           // 3s between sends — gentle on SendGrid + warming caps

function firstName(p: Prospect): string {
  return (p.ownerName?.split(" ")[0] || "").trim() || "there";
}

/**
 * Filter out scraper garbage + obvious placeholder emails. Sending to
 * these would hard-bounce and hurt sender reputation during the warming
 * phase. The scraper sometimes grabs random mailto-looking strings from
 * page HTML that aren't real addresses.
 */
function isRealEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  // Obvious non-email strings (scraped image filenames, etc.)
  if (/\.(webp|png|jpg|jpeg|svg|gif)$/.test(e)) return false;
  // Demo/placeholder domains
  const placeholderDomains = ["domain.com", "example.com", "mysite.com", "mail.com", "yoursite.com", "yourdomain.com"];
  const host = e.split("@")[1];
  if (placeholderDomains.includes(host)) return false;
  // Generic local-parts paired with generic domains
  const isGenericLocal = /^(user|email|example|info|contact|admin|test|demo|sample)$/.test(e.split("@")[0]);
  if (isGenericLocal && /^(domain|example|mysite|sample)\./.test(host)) return false;
  return true;
}

function buildEmail(p: Prospect): { subject: string; body: string } {
  const url = getShortPreviewUrl(p);
  const name = firstName(p);
  const subject = `Quick fix — the link in my last email was broken`;
  const body =
    `Hi ${name},\n\n` +
    `Found a bug on my end — the link I sent you to the site I built for ` +
    `${p.businessName} was going to a dead page. Apologies for the dead end.\n\n` +
    `Here's the working one:\n\n` +
    `${url}\n\n` +
    `Curious what you'd change about it. No response needed if it's not a ` +
    `fit — just wanted to make sure you had a link that actually opened.\n\n` +
    `— Ben\n` +
    `bluejaycontactme@gmail.com\n` +
    `Quilcene, WA · Opt out: https://bluejayportfolio.com/unsubscribe/${p.id}`;
  return { subject, body };
}

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const maxArg = process.argv.find((a) => a.startsWith("--max="));
  const maxSends = maxArg ? parseInt(maxArg.split("=")[1], 10) : Infinity;

  // Load sendEmail AFTER .env.local has populated process.env so the
  // module-level SENDGRID_API_KEY const in email-sender.ts sees the
  // real value (not undefined → mock mode).
  const sendEmail = await loadSendEmail();

  const hasSendgridKey = Boolean(process.env.SENDGRID_API_KEY);
  if (!dryRun && !hasSendgridKey) {
    console.error("\n❌ SENDGRID_API_KEY is not set in .env.local.");
    console.error("   Without it, email-sender.ts falls back to mock mode and");
    console.error("   nothing actually goes to SendGrid. Add the key to .env.local");
    console.error("   and re-run.\n");
    process.exit(1);
  }
  if (!dryRun) {
    console.log(`✓ SENDGRID_API_KEY detected — real sends will go out.\n`);
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Grab every prospect that was contacted (so they got a broken link),
  // page through the 1000-row cap the same way getAllProspects does.
  const affected: Prospect[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from("prospects")
      .select("id,business_name,email,phone,owner_name,status,short_code,category,city,address,generated_site_url")
      .in("status", ["contacted", "responded"])
      .not("email", "is", null)
      .range(from, from + 999);
    if (error) throw error;
    const rows = (data || []) as Array<Record<string, unknown>>;
    for (const r of rows) {
      affected.push({
        id: r.id as string,
        businessName: r.business_name as string,
        email: r.email as string,
        phone: (r.phone as string) || "",
        ownerName: r.owner_name as string | undefined,
        status: r.status as Prospect["status"],
        short_code: r.short_code as string | undefined,
        category: r.category as Prospect["category"],
        city: r.city as string,
        address: (r.address as string) || "",
        generatedSiteUrl: r.generated_site_url as string | undefined,
      } as Prospect);
    }
    if (rows.length < 1000) break;
    from += 1000;
  }

  console.log(`\n═══ Broken-Link Recovery ═══`);
  console.log(`Found ${affected.length} contacted/responded prospects with an email.`);
  console.log(`Dry-run: ${dryRun ? "YES (no emails sent)" : "NO — will send"}`);
  if (isFinite(maxSends)) console.log(`Max sends this run: ${maxSends}`);
  console.log();

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors: { business: string; reason: string }[] = [];

  for (const p of affected) {
    if (sent >= maxSends) {
      console.log(`\nHit --max=${maxSends} cap. Stopping.`);
      break;
    }
    if (!isRealEmail(p.email)) {
      skipped++;
      if (dryRun) console.log(`  [skip] ${p.businessName.slice(0, 35).padEnd(35)}  ← junk email: ${p.email}`);
      continue;
    }

    const { subject, body } = buildEmail(p);

    if (dryRun) {
      console.log(`  [${(sent + 1).toString().padStart(3)}] ${p.businessName.slice(0, 35).padEnd(35)}  ${p.email.slice(0, 40).padEnd(40)}  short_code=${p.short_code || "(derived)"}`);
      sent++;
      continue;
    }

    try {
      await sendEmail(p.id, p.email, subject, body, RESEND_SEQUENCE);
      sent++;
      console.log(`  ✓ [${sent.toString().padStart(3)}] ${p.businessName}`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    } catch (err) {
      failed++;
      const reason = err instanceof Error ? err.message : String(err);
      errors.push({ business: p.businessName, reason });
      console.log(`  ✗ ${p.businessName}: ${reason}`);
      // Stop early if warming cap hit — continuing would just keep failing
      if (reason.includes("warm-up limit")) {
        console.log(`\nDaily warm-up cap hit. Stopping. Re-run tomorrow for the rest.`);
        break;
      }
    }
  }

  console.log(`\n═══ Summary ═══`);
  console.log(`${dryRun ? "Would send" : "Sent"}: ${sent}`);
  if (!dryRun) console.log(`Failed: ${failed}`);
  if (skipped) console.log(`Skipped (missing / placeholder / malformed email): ${skipped}`);
  if (errors.length) {
    console.log(`\nErrors:`);
    for (const e of errors) console.log(`  - ${e.business}: ${e.reason}`);
  }
  if (dryRun) {
    console.log(`\n[DRY RUN] Re-run with --apply to actually send.`);
    console.log(`         Add --max=10 to send only the first 10 as a test.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
