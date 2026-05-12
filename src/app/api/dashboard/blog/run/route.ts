import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pickNextTopic, writeDraft } from "@/lib/seo-blog-writer";

/**
 * POST /api/dashboard/blog/run
 *
 * Trigger the SEO blog writer on demand from /dashboard/blog. Same
 * logic as the daily cron, but skips the CRON_SECRET gate since this
 * route lives under /dashboard which is owner-authed upstream.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
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
