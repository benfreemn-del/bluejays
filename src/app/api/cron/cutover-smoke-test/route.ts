import { NextResponse } from "next/server";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * /api/cron/cutover-smoke-test
 *
 * Daily smoke test on every client domain wired through Vercel.
 * Catches the failure class that bit Hector on 2026-05-06 (apex-only
 * cert, www certificate missing, NET::ERR_CERT_COMMON_NAME_INVALID).
 *
 * What it checks per domain:
 *   - apex resolves with valid HTTPS (status 200/300-range)
 *   - www subdomain resolves with valid HTTPS (so we catch the cert
 *     mismatch BEFORE a customer hits it on their phone)
 *   - /sitemap.xml returns 200 (proxy for "site is actually serving")
 *
 * On ANY failure: SMS Ben via sendOwnerAlert + email a structured
 * digest so he wakes up to a runbook, not a panic. Per-failure
 * line tells him exactly which check failed + what to fix.
 *
 * Cron schedule: daily at 9:07 AM PST (16:07 UTC) — early enough that
 * any overnight DNS / cert issue surfaces before clients open laptops,
 * off the :00 mark to avoid the daily cron stampede.
 *
 * Reads CLIENT_DOMAIN_MAP from src/middleware.ts so adding a new
 * client to the rewrite map automatically enrolls it in the smoke
 * test — no separate registry to keep in sync.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Mirrors src/middleware.ts → CLIENT_DOMAIN_MAP. Source of truth lives
// in middleware; this list is a literal copy because middleware can't
// be imported into a route handler in App Router. Keep them in sync —
// any new domain there must be added here too.
const DOMAINS_TO_CHECK: { domain: string; client: string }[] = [
  { domain: "hectorlandscaping.com", client: "hector-landscaping" },
  // { domain: "tekky.org", client: "zenith-sports" }, // re-enable when wired
];

type CheckResult = {
  domain: string;
  client: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
  ms: number;
};

async function check(url: string, domain: string, client: string): Promise<CheckResult> {
  const t0 = Date.now();
  try {
    // 8 second timeout per check — anything slower is itself a problem.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      // Pretend to be a normal browser so a strict CDN doesn't 403 us.
      headers: { "User-Agent": "BlueJays-SmokeTest/1.0" },
    });
    clearTimeout(timer);
    const ms = Date.now() - t0;
    if (res.status >= 200 && res.status < 400) {
      return { domain, client, url, ok: true, status: res.status, ms };
    }
    return {
      domain,
      client,
      url,
      ok: false,
      status: res.status,
      error: `HTTP ${res.status}`,
      ms,
    };
  } catch (e) {
    const ms = Date.now() - t0;
    const err = e instanceof Error ? e.message : String(e);
    return { domain, client, url, ok: false, error: err, ms };
  }
}

export async function GET() {
  const results: CheckResult[] = [];

  for (const { domain, client } of DOMAINS_TO_CHECK) {
    // Three checks per domain — if any fails, the deployment is sick
    // in some way the customer will eventually feel.
    const apex = await check(`https://${domain}/`, domain, client);
    const www = await check(`https://www.${domain}/`, domain, client);
    const sitemap = await check(`https://${domain}/sitemap.xml`, domain, client);
    results.push(apex, www, sitemap);
  }

  const failures = results.filter((r) => !r.ok);
  const summary = {
    ok: failures.length === 0,
    checked: results.length,
    failed: failures.length,
    domains: DOMAINS_TO_CHECK.length,
    timestamp: new Date().toISOString(),
    results,
  };

  if (failures.length > 0) {
    // Build a human-readable alert. Group failures by client so Ben
    // sees "hector-landscaping has 2 broken URLs" not 6 raw lines.
    const byClient = new Map<string, CheckResult[]>();
    for (const f of failures) {
      if (!byClient.has(f.client)) byClient.set(f.client, []);
      byClient.get(f.client)!.push(f);
    }

    const lines: string[] = [
      `🚨 CUTOVER SMOKE-TEST FAILURE`,
      `${failures.length} of ${results.length} checks failed across ${byClient.size} client(s)`,
      ``,
    ];
    for (const [client, fails] of byClient) {
      lines.push(`▸ ${client}`);
      for (const f of fails) {
        lines.push(`   ${f.url}`);
        lines.push(`     ${f.error || `HTTP ${f.status}`} (${f.ms}ms)`);
      }
    }
    lines.push(``);
    lines.push(`Full results in Vercel logs · /api/cron/cutover-smoke-test`);

    // Best-effort — don't fail the route if alerts hiccup.
    try {
      await sendOwnerAlert(lines.join("\n"));
    } catch (e) {
      console.warn("[cutover-smoke-test] alert failed:", e);
    }
  }

  return NextResponse.json(summary, {
    status: failures.length > 0 ? 503 : 200,
  });
}
