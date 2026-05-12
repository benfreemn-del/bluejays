import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pickNextTopic, writeDraft } from "@/lib/seo-blog-writer";

/**
 * GET /api/cron/seo-blog-write
 *
 * Daily cron (09:00 UTC). Picks the next topic from the rotating
 * queue, has Claude draft a 700-1100 word post, and stores it in
 * blog_posts as status='draft'. Ben reviews + publishes from
 * /dashboard/blog.
 *
 * Auth: CRON_SECRET header.
 *
 * Mock-safe: when ANTHROPIC_API_KEY is unset, inserts a placeholder
 * draft so the cron stays green and Ben sees the flow working.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const topic = await pickNextTopic();
    const draft = await writeDraft(topic);
    const sb = getSupabase();
    const { data, error } = await sb
      .from("blog_posts")
      .insert({
        slug: draft.slug,
        title: draft.title,
        excerpt: draft.excerpt,
        body_md: draft.body_md,
        topic: topic.slug,
        status: "draft",
        word_count: draft.word_count,
      })
      .select("id, slug, title")
      .single();
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, post: data, topic: topic.slug });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
