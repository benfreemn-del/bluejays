import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/replies/[id]/reject
 *
 * Body: { reason?: string }
 *
 * Marks a queued_replies row as rejected so the cron will never pick it
 * up. Records the optional reason in the new `rejection_reason` column
 * (added in 20260424_pending_replies.sql).
 *
 * Funnel auto-pause from the inbound webhook stays in place — Ben can
 * manually unpause via prospect detail if a different response is needed.
 *
 * Mock-mode safe.
 */

interface RejectBody {
  reason?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: RejectBody = {};
  try {
    if (request.headers.get("content-length") !== "0") {
      body = (await request.json()) as RejectBody;
    }
  } catch {
    body = {};
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { data: existing, error: lookupErr } = await supabase
    .from("queued_replies")
    .select("id, status")
    .eq("id", id)
    .single();

  if (lookupErr || !existing) {
    return NextResponse.json(
      { error: "Reply not found" },
      { status: 404 }
    );
  }

  // Allow rejecting from pending_review OR pending (in case Ben wants to
  // kill an auto-queued reply before the cron catches it).
  if (existing.status === "sent" || existing.status === "rejected") {
    return NextResponse.json(
      {
        error: `Reply is in status '${existing.status}', cannot reject`,
      },
      { status: 409 }
    );
  }

  const patch: Record<string, unknown> = {
    status: "rejected",
    reviewed_at: new Date().toISOString(),
  };
  if (typeof body.reason === "string" && body.reason.trim().length > 0) {
    patch.rejection_reason = body.reason.trim().slice(0, 1000);
  }

  const { error: updErr } = await supabase
    .from("queued_replies")
    .update(patch)
    .eq("id", id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
