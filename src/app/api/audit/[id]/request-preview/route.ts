import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/audit/[id]/request-preview
 *
 * The "Get my free preview" fork of the 3-CTA hub at the bottom of the
 * audit page. Prospect already gave us email + URL + category when they
 * submitted the audit, so this endpoint takes ZERO additional input
 * (Q2A): it just flips their prospect record into preview-requested
 * state and SMSes Ben so he can build the preview manually.
 *
 * Public via PUBLIC_API_PATHS (URL-as-secret pattern — same as the
 * audit display page itself; anyone with the audit UUID can request).
 *
 * Rule 43 ("Persist Before You Touch"): we update the prospect row
 * BEFORE firing the SMS so the audit trail captures the request even
 * if the SMS dispatch flakes.
 *
 * Rule 49 (manually-managed): preview-requested prospects MUST be
 * tagged manually_managed=true so the auto-enroll cron (Rule 47)
 * doesn't sweep them into the cold-outreach warming pool. Ben
 * customizes the preview personally — that's the whole point of
 * this fork.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: auditId } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // Rate limit: 3 preview requests per hour per IP. Stops abuse without
  // hurting genuine retries.
  const { allowed } = rateLimit(`audit-preview-req:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many preview requests. Try again in an hour." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 },
    );
  }

  // Load the audit to resolve the prospect_id.
  const { data: audit } = await supabase
    .from("site_audits")
    .select("id, prospect_id, target_url, business_category")
    .eq("id", auditId)
    .maybeSingle();

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // Load the prospect so we can stamp their record + know their name
  // for the alert message.
  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, business_name, email, phone, status, scraped_data")
    .eq("id", audit.prospect_id)
    .maybeSingle();

  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  // Status-downgrade guard (adversarial review A — Critical #3).
  // The audit UUID is URL-as-secret, so anyone with it can POST here.
  // Refuse when the prospect is already past lead-state: paid customers,
  // dismissed/unsub/bounced records, and active outreach prospects must
  // NOT be flipped back to audit_preview_requested + manually_managed=true.
  const TERMINAL_OR_ACTIVE = [
    "paid",
    "dismissed",
    "unsubscribed",
    "bounced",
    "contacted",
    "approved",
    "responded",
    "scheduled",
  ];
  if (prospect.status && TERMINAL_OR_ACTIVE.includes(prospect.status)) {
    return NextResponse.json(
      {
        ok: true,
        already: true,
        message:
          "We've got you in our records already. Ben will reach out shortly.",
      },
      { status: 200 },
    );
  }

  // Idempotent — if they've already requested, return 200 without
  // re-alerting Ben (avoids double-SMS spam if they double-click).
  const existingScrapedData = (prospect.scraped_data ?? {}) as Record<string, unknown>;
  if (existingScrapedData.auditPreviewRequested === true) {
    return NextResponse.json({
      ok: true,
      already: true,
      message: "We've already got your preview request. Ben will reach out within 48 hours.",
    });
  }

  const newScrapedData = {
    ...existingScrapedData,
    auditPreviewRequested: true,
    auditPreviewRequestedAt: new Date().toISOString(),
    auditPreviewRequestSource: {
      auditId: audit.id,
      targetUrl: audit.target_url,
    },
  };

  // Persist FIRST (Rule 43)
  const { error: updateErr } = await supabase
    .from("prospects")
    .update({
      status: "audit_preview_requested",
      scraped_data: newScrapedData,
      manually_managed: true, // Rule 49 — Ben handles preview personally
    })
    .eq("id", prospect.id);

  if (updateErr) {
    console.error("[audit/request-preview] Prospect update failed:", updateErr);
    return NextResponse.json(
      { error: "Couldn't save your request. Please email bluejaycontactme@gmail.com." },
      { status: 500 },
    );
  }

  // SMS Ben (Q3A — SMS only). Fire-and-forget — if SMS fails the
  // request still counts (we already persisted the flag), Ben just
  // misses the heads-up. Rule 43 again.
  const dashboardUrl = `https://bluejayportfolio.com/lead/${prospect.id}`;
  const alertMessage =
    `🆕 PREVIEW REQUEST\n` +
    `${prospect.business_name} (${audit.business_category}) wants you to build them a preview.\n` +
    `Audit: ${audit.target_url}\n` +
    `Lead: ${dashboardUrl}`;

  void sendOwnerAlert(alertMessage).catch((err) => {
    console.error("[audit/request-preview] Owner alert failed:", err);
  });

  return NextResponse.json({
    ok: true,
    message: "Got it. Ben will build your preview within 48 hours and email you the link.",
  });
}
