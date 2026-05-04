import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { generateWeeklyReport } from "@/lib/client-reports";

/**
 * GET /api/client-portal/report
 * Same generator as the operator-side dashboard, scoped to the
 * logged-in owner's client_slug.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }
  try {
    const report = await generateWeeklyReport(owner.client_slug);
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
