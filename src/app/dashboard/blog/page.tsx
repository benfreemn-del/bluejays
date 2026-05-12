"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Button, Pill, EmptyState, ErrorHint, type Tone } from "@/components/ui";

/**
 * /dashboard/blog — operator view of the SEO blog system.
 *
 * Lists every post (drafts + published + archived). Ben can preview
 * a draft, edit body inline, publish (sets published_at), archive,
 * or trigger a fresh draft on demand via "Write a new post".
 */

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  topic: string | null;
  status: "draft" | "published" | "archived";
  word_count: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_TONE: Record<Post["status"], Tone> = {
  draft: "amber",
  published: "emerald",
  archived: "slate",
};

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/dashboard/blog");
      const j = await r.json();
      if (j.ok) setPosts(j.posts);
      else setErr(j.error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: Post["status"]) {
    setBusy(id);
    try {
      const r = await fetch("/api/dashboard/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const j = await r.json();
      if (!j.ok) setErr(j.error);
      else await load();
    } finally {
      setBusy(null);
    }
  }

  async function generateNew() {
    setGenerating(true);
    setErr(null);
    try {
      const r = await fetch("/api/dashboard/blog/run", { method: "POST" });
      const j = await r.json();
      if (!j.ok) setErr(j.error);
      else await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Page max="4xl">
      <PageHeader
        eyebrow="BlueJays internal · SEO"
        title="Blog"
        description="Daily auto-drafts from the cron. Review, edit if needed, hit Publish to go live at /blog/[slug]."
        actions={
          <Button onClick={generateNew} disabled={generating}>
            {generating ? "Writing…" : "Write a new post"}
          </Button>
        }
      />

      {err && <div className="mb-4"><ErrorHint>{err}</ErrorHint></div>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}

      {!loading && posts.length === 0 && (
        <EmptyState
          icon="📝"
          title="No posts yet"
          description="Click 'Write a new post' to generate the first one, or wait for the 09:00 UTC cron."
        />
      )}

        <div className="space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">
                    {p.title}{" "}
                    <Pill tone={STATUS_TONE[p.status]} className="ml-2">
                      {p.status}
                    </Pill>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(p.created_at).toLocaleString()}
                    {p.topic && ` · ${p.topic}`}
                    {p.word_count && ` · ${p.word_count} words`}
                  </p>
                  {p.excerpt && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{p.excerpt}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.status === "published" ? (
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="text-xs font-semibold rounded-md border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 px-3 py-1.5"
                    >
                      View ↗
                    </Link>
                  ) : (
                    <button
                      onClick={() => setStatus(p.id, "published")}
                      disabled={busy === p.id}
                      className="text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 px-3 py-1.5"
                    >
                      Publish
                    </button>
                  )}
                  {p.status !== "archived" && (
                    <button
                      onClick={() => setStatus(p.id, "archived")}
                      disabled={busy === p.id}
                      className="text-xs font-semibold rounded-md border border-white/10 text-slate-400 hover:bg-slate-800 px-3 py-1.5"
                    >
                      Archive
                    </button>
                  )}
                  {p.status === "archived" && (
                    <button
                      onClick={() => setStatus(p.id, "draft")}
                      disabled={busy === p.id}
                      className="text-xs font-semibold rounded-md border border-white/10 text-slate-400 hover:bg-slate-800 px-3 py-1.5"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </Page>
  );
}
