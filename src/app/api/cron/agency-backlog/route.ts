import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerEmail } from "@/lib/alerts";

/**
 * GET /api/cron/agency-backlog
 *
 * Daily morning digest of agency_applications still waiting on Ben's
 * review. Runs at 8am Pacific via Vercel Cron. Sends to Ben's email
 * IFF there's at least one stale or new app.
 *
 * "Stale" = status='new' AND applied_at > 24 hours ago.
 * "Fresh new" = status='new' AND applied_at within last 24 hours.
 *
 * Goal: Ben never has to remember to check /dashboard/agency. The
 * email is the prompt; the dashboard is where he acts.
 *
 * Auth: gated by CRON_SECRET header per Vercel Cron convention.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Vercel Cron sets `Authorization: Bearer <CRON_SECRET>` automatically.
  // If CRON_SECRET is unset (local dev), we still allow the route to
  // fire so Ben can manually hit it; but warn.
  if (CRON_SECRET) {
    const authz = request.headers.get("authorization") || "";
    if (authz !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[cron/agency-backlog] CRON_SECRET unset — allowing unauthenticated request");
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
  }

  // Pull all 'new' applications and bucket client-side. Volume is tiny
  // (we expect <50/mo for the foreseeable future) so this is fine.
  const { data, error } = await supabase
    .from("agency_applications")
    .select("id, business_name, contact_name, email, applied_at, avg_customer_value_cents, monthly_revenue_cents, budget_confirmed")
    .eq("status", "new")
    .order("applied_at", { ascending: true });

  if (error) {
    console.error("[cron/agency-backlog] query failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const now = Date.now();
  const stale: typeof data = [];
  const fresh: typeof data = [];
  for (const a of data || []) {
    const ageHrs = (now - new Date(a.applied_at).getTime()) / 3_600_000;
    if (ageHrs > 24) stale!.push(a);
    else fresh!.push(a);
  }

  // No work to surface — quiet success.
  if (stale!.length === 0 && fresh!.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: "no pending applications" });
  }

  const lines: string[] = [
    `📬 Agency apply queue — ${stale!.length} stale, ${fresh!.length} fresh`,
    "",
  ];

  if (stale!.length > 0) {
    lines.push(`⚠️  STALE (>24h, broke the 1-business-day promise — review these FIRST):`);
    for (const a of stale!) {
      const ageHrs = Math.floor((now - new Date(a.applied_at).getTime()) / 3_600_000);
      const avg = a.avg_customer_value_cents ? `$${(a.avg_customer_value_cents / 100).toLocaleString()}` : "?";
      const mrr = a.monthly_revenue_cents ? `$${(a.monthly_revenue_cents / 100).toLocaleString()}/mo` : "?";
      const budget = a.budget_confirmed ? "budget✓" : "budget✗";
      lines.push(`  • ${a.business_name} — ${a.contact_name} <${a.email}> (${ageHrs}h, AVG ${avg}, ${mrr}, ${budget})`);
    }
    lines.push("");
  }

  if (fresh!.length > 0) {
    lines.push(`🆕  FRESH (<24h, in SLA):`);
    for (const a of fresh!) {
      const avg = a.avg_customer_value_cents ? `$${(a.avg_customer_value_cents / 100).toLocaleString()}` : "?";
      const mrr = a.monthly_revenue_cents ? `$${(a.monthly_revenue_cents / 100).toLocaleString()}/mo` : "?";
      lines.push(`  • ${a.business_name} — ${a.contact_name} <${a.email}> (AVG ${avg}, ${mrr})`);
    }
    lines.push("");
  }

  lines.push("Review queue: https://bluejayportfolio.com/dashboard/agency");

  const body = lines.join("\n");
  const subject = stale!.length > 0
    ? `⚠️ ${stale!.length} agency app${stale!.length === 1 ? "" : "s"} aged out — please review`
    : `📬 ${fresh!.length} agency app${fresh!.length === 1 ? "" : "s"} pending review`;

  await sendOwnerEmail({ subject, body }).catch((err) =>
    console.error("[cron/agency-backlog] email failed:", err),
  );

  return NextResponse.json({
    ok: true,
    sent: true,
    stale: stale!.length,
    fresh: fresh!.length,
  });
}
