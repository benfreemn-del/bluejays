import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/audit/[id]/cta-click
 *
 * Logs which fork of the 3-CTA hub a prospect clicked on the audit
 * page (Buy / Schedule / Get Preview). Fired by the AuditCTAHub
 * component via navigator.sendBeacon() right before navigation so
 * the request lands even when the prospect is leaving the page.
 *
 * Public via PUBLIC_API_PATHS (`/api/audit/`) — URL-as-secret
 * pattern, same as the audit-display page.
 *
 * Rate-limited 30/min/IP (generous; one prospect could legitimately
 * click multiple forks while deciding).
 *
 * Idempotent in spirit but not in practice — multiple clicks per
 * prospect ARE logged because they're interesting signal (indecision,
 * revisits). Aggregation happens at the funnel-stats endpoint.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: auditId } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const { allowed } = rateLimit(`cta-click:${ip}`, 30, 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many clicks" }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    // Silently no-op in dev — the audit page must keep working without DB
    return NextResponse.json({ ok: true, mock: true });
  }

  let body: { fork?: string; metadata?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fork = String(body.fork || "").trim();
  if (!["buy", "schedule", "preview"].includes(fork)) {
    return NextResponse.json(
      { error: "fork must be one of: buy, schedule, preview" },
      { status: 400 },
    );
  }

  // Resolve prospect_id from the audit row
  const { data: audit } = await supabase
    .from("site_audits")
    .select("id, prospect_id")
    .eq("id", auditId)
    .maybeSingle();

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const referer = req.headers.get("referer") || null;
  const userAgent = req.headers.get("user-agent") || null;

  const { error } = await supabase.from("cta_clicks").insert({
    audit_id: audit.id,
    prospect_id: audit.prospect_id,
    fork,
    metadata: {
      ...(body.metadata || {}),
      referer,
      ua: userAgent?.slice(0, 200),
    },
  });

  if (error) {
    // Don't leak DB internals; the click is non-critical
    console.error("[cta-click] insert failed:", error.message);
    return NextResponse.json({ error: "Couldn't log click" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
