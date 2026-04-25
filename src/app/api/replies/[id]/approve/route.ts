import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/replies/[id]/approve
 *
 * Body: { editedBody?: string, sendImmediately?: boolean }
 *
 * Flips a `status='pending_review'` row to `status='queued'` so the
 * `processQueuedReplies` cron picks it up on the next minute. Default
 * `send_after = now() + 30 seconds` (humanization buffer); pass
 * `sendImmediately: true` to bypass.
 *
 * Returns 404 if the row doesn't exist, 409 if it's not in
 * pending_review (already approved / rejected / sent / etc).
 *
 * Mock-mode safe: returns ok with a no-op shape.
 */

interface ApproveBody {
  editedBody?: string;
  sendImmediately?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: ApproveBody = {};
  try {
    if (request.headers.get("content-length") !== "0") {
      body = (await request.json()) as ApproveBody;
    }
  } catch {
    // Empty / non-JSON body is fine — defaults apply.
    body = {};
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      mock: true,
      reply: { id, status: "queued" },
    });
  }

  // 1. Find + verify status
  const { data: existing, error: lookupErr } = await supabase
    .from("queued_replies")
    .select("id, status, reply_body")
    .eq("id", id)
    .single();

  if (lookupErr || !existing) {
    return NextResponse.json(
      { error: "Reply not found" },
      { status: 404 }
    );
  }

  if (existing.status !== "pending_review") {
    return NextResponse.json(
      {
        error: `Reply is in status '${existing.status}', expected 'pending_review'`,
      },
      { status: 409 }
    );
  }

  // 2. Compute send_after — 30s humanization buffer by default
  const sendAfter = new Date();
  if (!body.sendImmediately) {
    sendAfter.setSeconds(sendAfter.getSeconds() + 30);
  }

  // 3. Build patch — only update reply_body if an edit was supplied AND
  //    it actually differs from the original draft.
  const patch: Record<string, unknown> = {
    status: "queued",
    send_after: sendAfter.toISOString(),
    reviewed_at: new Date().toISOString(),
  };
  if (
    typeof body.editedBody === "string" &&
    body.editedBody.trim().length > 0 &&
    body.editedBody !== existing.reply_body
  ) {
    patch.reply_body = body.editedBody;
  }

  const { data: updated, error: updErr } = await supabase
    .from("queued_replies")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reply: updated });
}
