import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/loss-reasons/[id]/review
 *
 * Marks a loss-reason row as reviewed by Ben (sets `acted_on_at`).
 * Called from LossReasonsPanel's "Mark reviewed" button. Idempotent —
 * a second call updates `acted_on_at` to the new timestamp; not
 * strictly needed but harmless.
 *
 * See migration `20260424_loss_reasons.sql` and Rule 45 in CLAUDE.md.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Mock mode: report success so the dashboard's optimistic UI works in dev.
    return NextResponse.json({ ok: true, actedOnAt: new Date().toISOString() });
  }

  const actedOnAt = new Date().toISOString();
  const { error } = await supabase
    .from("loss_reasons")
    .update({ acted_on_at: actedOnAt })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, actedOnAt });
}
