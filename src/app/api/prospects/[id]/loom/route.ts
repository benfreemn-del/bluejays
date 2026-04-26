import { NextRequest, NextResponse } from "next/server";
import { updateProspect } from "@/lib/store";

/**
 * POST /api/prospects/[id]/loom
 *
 * Body: { loomVideoUrl: string | null }
 *
 * Updates the prospect's loom_video_url field. Set to null/empty string
 * to clear. Drives the manual Loom recording flow for the Wave 1 test
 * cohort — Ben records a 60-90 sec Loom for each top-10 prospect, pastes
 * the URL via the dashboard form, and the next outbound pitch email
 * picks it up automatically (see getPitchEmail in src/lib/email-templates.ts).
 *
 * Auth: admin-only via middleware.ts (PROTECTED_PATHS default — every
 * /api/* path that isn't in PUBLIC_API_PATHS requires the dashboard
 * session cookie).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { loomVideoUrl?: string | null } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = body.loomVideoUrl;
  // Normalize: empty string / undefined / null all clear the field.
  let loomVideoUrl: string | undefined;
  if (raw == null || raw === "") {
    loomVideoUrl = "";
  } else if (typeof raw === "string") {
    loomVideoUrl = raw.trim();
  } else {
    return NextResponse.json(
      { error: "loomVideoUrl must be a string or null" },
      { status: 400 },
    );
  }

  // Sanity check: if non-empty, it should be an http(s) URL. Don't be
  // strict about loom.com specifically — Ben might use a different host
  // (Vimeo, manual upload, etc.) for some prospects.
  if (loomVideoUrl && !/^https?:\/\//i.test(loomVideoUrl)) {
    return NextResponse.json(
      { error: "loomVideoUrl must be an http(s) URL" },
      { status: 400 },
    );
  }

  const updated = await updateProspect(id, {
    loomVideoUrl,
  });

  if (!updated) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    prospectId: id,
    loomVideoUrl: updated.loomVideoUrl || null,
  });
}
