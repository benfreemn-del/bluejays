import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { logTouch } from "@/lib/prospect-touches";

/**
 * POST /api/prospects/[id]/nurture
 *
 * Flips a prospect to status='nurturing'. The default GET /api/prospects
 * filter hides nurturing prospects so Madie's LeadPicker stays focused
 * on warm/cold-callable leads. She can reveal them with the "Show
 * nurturing" chip when she wants to re-engage.
 *
 * Body (optional): { reason?: string } — short tag like
 * "no_budget", "not_ready", "competitor" — appended as a touch note
 * so the timeline shows why we set them aside.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid prospect id" },
      { status: 400 },
    );
  }

  let reason: string | null = null;
  try {
    const body = await request.json();
    if (body && typeof body.reason === "string" && body.reason.trim()) {
      reason = body.reason.trim().slice(0, 200);
    }
  } catch {
    // body optional
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { ok: false, error: "Prospect not found" },
      { status: 404 },
    );
  }

  await updateProspect(
    id,
    { status: "nurturing" },
    { source: `nurture${reason ? `:${reason}` : ""}` },
  );

  void logTouch({
    prospectId: id,
    kind: "note",
    direction: "outbound",
    by_user: "madie",
    notes: `Moved to nurture${reason ? ` — ${reason}` : ""}`,
  }).catch((err) =>
    console.error("[nurture] touch log failed:", err),
  );

  return NextResponse.json({
    ok: true,
    prospectId: id,
    status: "nurturing",
    reason,
  });
}
