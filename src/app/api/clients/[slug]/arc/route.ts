import { NextRequest, NextResponse } from "next/server";

import {
  listArcReviewers,
  updateArcReviewer,
  type ArcStatus,
} from "@/lib/arc-reviewers";

/**
 * GET   /api/clients/[slug]/arc?book=...&status=...
 * PATCH /api/clients/[slug]/arc      body: { id, ...patch }
 *
 * Admin-only via middleware gating of /api/clients/*. The author manages
 * approvals + status flips through these endpoints from the kanban view
 * at /dashboard/clients/[slug]/arc.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const book_title = req.nextUrl.searchParams.get("book");
  const status = req.nextUrl.searchParams.get("status") as
    | ArcStatus
    | null;
  const rows = await listArcReviewers({
    client_slug: slug,
    book_title: book_title || null,
    status,
  });
  return NextResponse.json({ ok: true, reviewers: rows });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid reviewer id" },
      { status: 400 },
    );
  }
  const patch: Record<string, unknown> = { ...body };
  delete patch.id;
  const updated = await updateArcReviewer(id, patch);
  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "Update failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, reviewer: updated });
}
