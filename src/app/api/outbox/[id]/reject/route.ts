/**
 * POST /api/outbox/[id]/reject
 *
 * Reject a pending outbox draft — terminal state. Used by:
 *   - Dashboard one-tap button (/dashboard/outbox)
 *   - bj outbox reject CLI subcommand
 *   - Extended /api/inbound/sms handler when Ben replies "NO <code>"
 *
 * Already-rejected / sent / failed drafts are returned as-is (no
 * status change). Idempotent.
 */

import { NextRequest, NextResponse } from "next/server";
import { rejectOutboxDraft } from "@/lib/outbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  }
  const row = await rejectOutboxDraft(id.trim().toLowerCase());
  if (!row) {
    return NextResponse.json(
      { ok: false, error: "outbox draft not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, row });
}
