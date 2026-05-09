import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET  /api/madie/tasks               — list Madie's tasks (open first, done at bottom)
 * POST /api/madie/tasks   {content}   — create a new task at end of list
 *
 * No auth gate beyond the existing dashboard auth — same posture as
 * /api/madie/today, /api/madie/commission. The role guard happens at
 * the page level (MadieTodoList only renders for role=sales).
 */

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, tasks: [] });
  }
  const { data, error } = await supabase
    .from("madie_tasks")
    .select("*")
    .order("done", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message });
  }
  return NextResponse.json({ ok: true, tasks: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const content = (body.content as string | undefined)?.trim();
  if (!content) {
    return NextResponse.json(
      { ok: false, error: "missing content" },
      { status: 400 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" });
  }

  // Append at the end of open list (highest sort_order + 1).
  const { data: maxRow } = await supabase
    .from("madie_tasks")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("madie_tasks")
    .insert({ content, sort_order: nextSort })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message });
  }
  return NextResponse.json({ ok: true, task: data });
}
