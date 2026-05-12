import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET    /api/dashboard/blog       — list every post (any status)
 * PATCH  /api/dashboard/blog       — update status / title / body
 * POST   /api/dashboard/blog/run   — trigger the writer cron on demand
 *                                    (separate /run subroute below)
 *
 * Owner-only via /dashboard middleware gate.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("blog_posts")
    .select("id, slug, title, excerpt, topic, status, word_count, published_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, posts: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  let body: {
    id?: string;
    status?: "draft" | "published" | "archived";
    title?: string;
    body_md?: string;
    excerpt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }

  const sb = getSupabase();
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.body_md !== undefined) {
    update.body_md = body.body_md;
    update.word_count = body.body_md.split(/\s+/).filter(Boolean).length;
  }
  if (body.excerpt !== undefined) update.excerpt = body.excerpt;
  if (body.status !== undefined) {
    update.status = body.status;
    if (body.status === "published") update.published_at = new Date().toISOString();
  }

  const { data, error } = await sb
    .from("blog_posts")
    .update(update)
    .eq("id", body.id)
    .select("id, slug, status, published_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, post: data });
}
