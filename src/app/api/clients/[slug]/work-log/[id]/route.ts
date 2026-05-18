import { NextRequest, NextResponse } from "next/server";
import { deleteWorkLogEntry } from "@/lib/work-log";

/**
 * DELETE /api/clients/[slug]/work-log/[id]
 *   Admin-only (middleware-gated). Hard-deletes a work-log entry.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid work-log id" },
      { status: 400 },
    );
  }
  const ok = await deleteWorkLogEntry(id);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Could not delete entry" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
