import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/mini-markdown";

/**
 * /blog/[slug] — public blog post detail.
 *
 * Server-rendered. Renders the markdown body via mini-markdown (no
 * external dep). ISR — same revalidate window as the index.
 */

export const revalidate = 300;

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  published_at: string | null;
  topic: string | null;
  word_count: number | null;
}

async function getPost(slug: string): Promise<Post | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("blog_posts")
    .select("slug, title, excerpt, body_md, published_at, topic, word_count")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as Post) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found — BlueJays" };
  return {
    title: `${post.title} — BlueJays`,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = renderMarkdown(post.body_md);
  const readMin = Math.max(1, Math.round((post.word_count ?? 600) / 220));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <article className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/blog"
          className="text-xs text-slate-500 hover:text-white uppercase tracking-wider mb-6 inline-block"
        >
          ← All posts
        </Link>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
          {post.published_at &&
            new Date(post.published_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          {" · "}
          {readMin} min read
          {post.topic && ` · ${post.topic.replace(/-/g, " ")}`}
        </p>
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <Link
            href="/audit"
            className="inline-block rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6 py-3 text-sm"
          >
            Get a free 30-second site audit →
          </Link>
        </div>
      </article>
    </main>
  );
}
