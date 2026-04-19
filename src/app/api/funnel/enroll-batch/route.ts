import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { enrollInFunnel } from "@/lib/funnel-manager";
import { updateProspect } from "@/lib/store";

/**
 * POST /api/funnel/enroll-batch
 *
 * One-shot convenience endpoint for warmup: picks the next N
 * `approved` + `not-yet-enrolled` + `has-email` prospects from the
 * backlog and enrolls them all into the funnel as email-only.
 *
 * Intended to be called daily during the 14-day email warmup window so
 * fresh Day-0 pitch emails fire every day and the SendGrid domain
 * reputation actually builds.
 *
 * Body: { count?: number } (default: 20)
 * Defaults to emailOnly=true because A2P 10DLC is still pending — the
 * SMS_FUNNEL_DISABLED env var is the stronger global kill-switch, this
 * is a belt-and-suspenders backup.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const count = Math.max(1, Math.min(100, Number(body?.count) || 20));

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  // 1. Grab the list of prospects already enrolled so we can exclude them
  const { data: enrolled, error: enrolledErr } = await supabase
    .from("funnel_enrollments")
    .select("prospect_id")
    .limit(10000);

  if (enrolledErr) {
    return NextResponse.json(
      { error: `Enrollment lookup failed: ${enrolledErr.message}` },
      { status: 500 }
    );
  }

  const enrolledIds = new Set((enrolled || []).map((r) => r.prospect_id as string));

  // 2. Fetch approved-with-email prospects, skip anyone already enrolled,
  //    take the first N
  const { data: candidates, error: candidatesErr } = await supabase
    .from("prospects")
    .select("id, business_name, email, updated_at")
    .eq("status", "approved")
    .not("email", "is", null)
    .order("updated_at", { ascending: true })
    .limit(500);

  if (candidatesErr) {
    return NextResponse.json(
      { error: `Candidate lookup failed: ${candidatesErr.message}` },
      { status: 500 }
    );
  }

  const pick = (candidates || [])
    .filter((p) => !enrolledIds.has(p.id as string))
    .slice(0, count);

  if (pick.length === 0) {
    return NextResponse.json({
      message: "No approved, not-yet-enrolled prospects with an email address found.",
      approvedTotal: (candidates || []).length,
      alreadyEnrolled: (candidates || []).filter((p) => enrolledIds.has(p.id as string)).length,
      enrolled: 0,
    });
  }

  // 3. Enroll each. Tag as email-only so the funnel-manager skips SMS
  //    for these specifically (in addition to the SMS_FUNNEL_DISABLED
  //    global flag).
  const results: { id: string; businessName: string; success: boolean; message: string }[] = [];

  for (const p of pick) {
    const id = p.id as string;
    const businessName = (p.business_name as string) || "(unknown)";
    try {
      await updateProspect(id, {
        outreachChannel: "email-only",
        needsSmsFollowup: true,
      });
      const result = await enrollInFunnel(id);
      results.push({ id, businessName, ...result });
    } catch (err) {
      results.push({
        id,
        businessName,
        success: false,
        message: (err as Error).message,
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;

  return NextResponse.json({
    message: `${succeeded}/${results.length} approved prospects enrolled (email-only).`,
    requested: count,
    enrolled: succeeded,
    failed: results.length - succeeded,
    candidatesInBacklog: (candidates || []).length,
    alreadyEnrolled: enrolledIds.size,
    results,
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST this endpoint with { count: N } (default 20) to enroll the next N approved prospects as email-only.",
  });
}
