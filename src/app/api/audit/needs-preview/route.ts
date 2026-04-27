import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/audit/needs-preview
 *
 * Returns audit prospects who completed the 5-email Hormozi sequence
 * (audit_email_step >= 5) but haven't converted AND don't have a
 * BlueJays preview site yet.
 *
 * These are the prospects Ben should generate a preview for. Once a
 * preview is generated and the site exists (generated_site_url populated),
 * the daily followup-cron will graduate them to status="approved" so the
 * auto-enroll cron picks them up and starts the cold outreach funnel.
 *
 * Auth: CRON_SECRET (same as other operator-only routes).
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Join site_audits to prospects:
  //   - audit sequence complete (step >= 5)
  //   - prospect still audit_lead (didn't convert during the audit sequence)
  //   - no preview site yet (Ben hasn't generated one)
  // Supabase doesn't support direct JOIN in the client library, so we do
  // it in two queries: fetch completed audits, then filter prospects.
  const { data: completedAudits, error } = await supabase
    .from("site_audits")
    .select("id, prospect_id, business_category, audit_email_step, last_audit_email_at, email_sent_at")
    .eq("status", "ready")
    .gte("audit_email_step", 5)
    .order("last_audit_email_at", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!completedAudits || completedAudits.length === 0) {
    return NextResponse.json({ prospects: [], total: 0 });
  }

  const prospectIds = completedAudits.map((a) => a.prospect_id as string);

  const { data: prospects } = await supabase
    .from("prospects")
    .select("id, business_name, email, phone, status, generated_site_url, city, state, category")
    .in("id", prospectIds)
    .eq("status", "audit_lead")
    .is("generated_site_url", null);

  if (!prospects || prospects.length === 0) {
    return NextResponse.json({ prospects: [], total: 0 });
  }

  const prospectMap = new Map(prospects.map((p) => [p.id as string, p]));

  const results = completedAudits
    .filter((a) => prospectMap.has(a.prospect_id as string))
    .map((a) => {
      const p = prospectMap.get(a.prospect_id as string)!;
      const daysSinceLastEmail = a.last_audit_email_at
        ? Math.floor((Date.now() - new Date(a.last_audit_email_at as string).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return {
        prospectId: p.id,
        businessName: p.business_name,
        email: p.email,
        phone: p.phone,
        city: p.city,
        state: p.state,
        category: p.category || a.business_category,
        auditId: a.id,
        auditEmailStep: a.audit_email_step,
        lastAuditEmailAt: a.last_audit_email_at,
        daysSinceLastEmail,
        generateUrl: `https://bluejayportfolio.com/lead/${p.id}`,
      };
    });

  return NextResponse.json({
    prospects: results,
    total: results.length,
    message: `${results.length} audit prospect${results.length !== 1 ? "s" : ""} completed the email sequence — generate a preview to move them to the cold funnel`,
  });
}
