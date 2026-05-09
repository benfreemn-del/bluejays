import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * PATCH  /api/madie/tasks/[id]   {content?, done?}
 * DELETE /api/madie/tasks/[id]
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  if (typeof body.content === "string") {
    const trimmed = body.content.trim();
    if (!trimmed) {
      return NextResponse.json(
        { ok: false, error: "content cannot be empty" },
        { status: 400 },
      );
    }
    patch.content = trimmed;
  }
  if (typeof body.done === "boolean") {
    patch.done = body.done;
    patch.done_at = body.done ? new Date().toISOString() : null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "nothing to update" });
  }
  const { data, error } = await supabase
    .from("madie_tasks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message });
  }
  return NextResponse.json({ ok: true, task: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" });
  }
  const { id } = await params;
  const { error } = await supabase.from("madie_tasks").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message });
  }
  return NextResponse.json({ ok: true });
}
