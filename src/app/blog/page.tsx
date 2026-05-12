import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

/**
 * /blog — public BlueJays blog index.
 *
 * Server-rendered, reads from blog_posts where status='published'.
 * No JS on the client beyond Next.js link prefetch. ISR every 5
 * minutes so a freshly-published post shows up quickly without
 * recompiling the whole site.
 */

export const revalidate = 300;

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  topic: string | null;
}

export const metadata = {
  title: "Blog — BlueJays",
  description:
    "Notes on custom websites, AI marketing, and lead-gen economics for owner-operators of $250k–$5M service businesses.",
};

async function getPosts(): Promise<Post[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, topic")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Post[];
}

export default async function BlogIndexPage() {
  const posts = await getPosts();
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-white uppercase tracking-wider mb-6 inline-block"
          >
            ← BlueJays
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Notes</h1>
          <p className="mt-4 text-slate-400 max-w-xl">
            Concrete writing on custom websites, AI marketing, and lead-gen
            economics for owner-operators of $250k–$5M service businesses. No hype.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center text-slate-500 text-sm">
            New posts every day starting soon.
          </div>
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/80 hover:border-white/20 transition-colors p-5"
                >
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    {p.published_at &&
                      new Date(p.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    {p.topic && ` · ${p.topic.replace(/-/g, " ")}`}
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{p.title}</h2>
                  {p.excerpt && (
                    <p className="text-sm text-slate-400 leading-relaxed">{p.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
