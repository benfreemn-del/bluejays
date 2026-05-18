/**
 * POST /api/outbox/[id]/approve
 *
 * Approve a pending outbox draft + trigger the send. Used by:
 *   - Dashboard one-tap button (/dashboard/outbox)
 *   - bj outbox approve CLI subcommand
 *   - Extended /api/inbound/sms handler when Ben replies "YES <code>"
 *
 * [id] accepts either the UUID or the 8-char short_code so the SMS
 * flow can pass the code verbatim without a UUID lookup.
 *
 * Auth: route is under /api/outbox/ which is admin-gated by
 * middleware. SMS-handler calls hit this via a separate code path
 * (it calls approveOutboxDraft directly rather than re-entering HTTP),
 * so the bearer/cookie check applies only to dashboard + CLI callers.
 */

import { NextRequest, NextResponse } from "next/server";
import { approveOutboxDraft } from "@/lib/outbox";

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

  const result = await approveOutboxDraft(id.trim().toLowerCase(), "dashboard");
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "outbox draft not found" },
      { status: 404 },
    );
  }
  if (result.status === "not_pending") {
    return NextResponse.json(
      {
        ok: false,
        error: `draft is already ${result.row.status}`,
        row: result.row,
      },
      { status: 409 },
    );
  }
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        row: result.row,
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, row: result.row });
}
