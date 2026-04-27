import { NextRequest, NextResponse, after } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/audit/[id]/status
 *
 * Public polling endpoint — called by the /audit/[id]/processing page
 * every few seconds while the audit generates. Returns minimal data so
 * the page can flip to /audit/[id] when ready.
 *
 * Public via PUBLIC_API_PATHS (URL-as-secret pattern — anyone with the
 * audit UUID can poll, same as the audit display page itself).
 *
 * AUTO-RETRY SAFETY NET (added 2026-04-26 after the VERCEL_URL bug
 * stranded 2 audits at status='pending' forever): if an audit has been
 * 'pending' for more than 90 seconds, this endpoint fires a fire-and-
 * forget retry kick to /api/audit/generate/[id]. Idempotent — the
 * generate endpoint short-circuits if status is already 'generating'
 * or 'ready'. Belt-and-suspenders: even if /api/audit/submit's
 * fire-and-forget fails for any reason (function timeout, region
 * issue, transient 401), the polling itself recovers the audit.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("site_audits")
    .select("id, status, generated_at, failed_reason, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // Auto-retry if stuck in pending for >90s.
  //
  // Wrapped in `after()` so the kick actually completes after the
  // status response is sent. Plain `void fetch(...)` was unreliable on
  // Vercel — once the status Lambda invocation returned its JSON
  // response, the runtime was free to freeze before the unawaited
  // fetch's TCP handshake completed. Same root cause as the submit-
  // route fix; same forensic note (OVERNIGHT_REVIEW_D.md).
  const ageSeconds = data.created_at
    ? (Date.now() - new Date(data.created_at as string).getTime()) / 1000
    : 0;
  if (data.status === "pending" && ageSeconds > 90) {
    const baseUrl = "https://bluejayportfolio.com";
    const auditId = data.id as string;
    after(async () => {
      try {
        await fetch(`${baseUrl}/api/audit/generate/${auditId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CRON_SECRET || "dev"}`,
          },
          signal: AbortSignal.timeout(8000),
        });
        // Generate route is idempotent — short-circuits on
        // status='generating'/'ready', so a duplicate kick from the
        // status poll + the submit-route after() is safe.
      } catch (err) {
        const isTimeout = err instanceof Error && err.name === "TimeoutError";
        if (!isTimeout) {
          console.error(`[audit/status] Auto-retry kick failed for ${auditId}:`, err);
        }
      }
    });
  }

  return NextResponse.json({
    auditId: data.id,
    status: data.status,
    generatedAt: data.generated_at,
    failedReason: data.failed_reason || null,
  });
}
