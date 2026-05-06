"use client";

/**
 * /dashboard/clients/[slug]/testimonials
 *
 * Admin board for managing the per-client testimonial carousel that
 * renders on /clients/[slug]. Drop in quotes Philip sends over text,
 * toggle hide/show, reorder, edit, delete. No redeploy required —
 * the public-facing carousel pulls live from the API.
 */

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Testimonial = {
  id: string;
  client_slug: string;
  name: string;
  location: string | null;
  role: string | null;
  quote: string;
  photo_url: string | null;
  video_url: string | null;
  sort_order: number;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type DraftTestimonial = {
  name: string;
  location: string;
  role: string;
  quote: string;
  photo_url: string;
  video_url: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY_DRAFT: DraftTestimonial = {
  name: "",
  location: "",
  role: "",
  quote: "",
  photo_url: "",
  video_url: "",
  sort_order: 100,
  is_active: true,
};

export default function TestimonialsAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<DraftTestimonial>(EMPTY_DRAFT);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftTestimonial>(EMPTY_DRAFT);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/client-testimonials?client=${encodeURIComponent(slug)}&all=1`,
      );
      const j = (await r.json()) as {
        ok: boolean;
        testimonials?: Testimonial[];
      };
      if (j.ok && j.testimonials) setItems(j.testimonials);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.quote.trim()) return;
    await fetch("/api/client-testimonials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_slug: slug,
        name: draft.name.trim(),
        quote: draft.quote.trim(),
        location: draft.location.trim() || undefined,
        role: draft.role.trim() || undefined,
        photo_url: draft.photo_url.trim() || undefined,
        video_url: draft.video_url.trim() || undefined,
        sort_order: draft.sort_order,
        is_active: draft.is_active,
      }),
    });
    setDraft(EMPTY_DRAFT);
    setAdding(false);
    load();
  };

  const startEdit = (t: Testimonial) => {
    setEditing(t.id);
    setEditDraft({
      name: t.name,
      location: t.location ?? "",
      role: t.role ?? "",
      quote: t.quote,
      photo_url: t.photo_url ?? "",
      video_url: t.video_url ?? "",
      sort_order: t.sort_order,
      is_active: t.is_active,
    });
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/client-testimonials/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: editDraft.name.trim(),
        quote: editDraft.quote.trim(),
        location: editDraft.location.trim() || null,
        role: editDraft.role.trim() || null,
        photo_url: editDraft.photo_url.trim() || null,
        video_url: editDraft.video_url.trim() || null,
        sort_order: editDraft.sort_order,
        is_active: editDraft.is_active,
      }),
    });
    setEditing(null);
    load();
  };

  const toggleActive = async (t: Testimonial) => {
    setItems((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, is_active: !x.is_active } : x)),
    );
    await fetch(`/api/client-testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_active: !t.is_active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (
      !confirm(
        "Delete this testimonial permanently? Use 'Hide' instead if you might want it back.",
      )
    )
      return;
    await fetch(`/api/client-testimonials/${id}`, { method: "DELETE" });
    load();
  };

  const reorder = async (id: string, delta: number) => {
    const t = items.find((x) => x.id === id);
    if (!t) return;
    const newOrder = t.sort_order + delta;
    await fetch(`/api/client-testimonials/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sort_order: newOrder }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href={`/dashboard/clients/${slug}`}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Tasks
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              {slug}{" "}
              <span className="text-slate-500 font-normal">/ testimonials</span>
            </h1>
            <div className="text-[11px] text-slate-500">
              {items.length} total · {items.filter((t) => t.is_active).length} live
            </div>
          </div>
          <button
            onClick={() => setAdding((v) => !v)}
            className="text-[11px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2.5 py-1 rounded"
          >
            {adding ? "Cancel" : "+ Add quote"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-5 pb-32">
        {/* Tip */}
        <div className="mb-5 rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
          <strong>How to use:</strong> drop in quotes Philip / the client sends
          you. Active quotes show on{" "}
          <code className="text-emerald-300">/clients/{slug}</code>. Hide
          quotes you want to retire without deleting; deleted ones are gone
          for good. Lower sort_order renders first.
        </div>

        {/* Add form */}
        {adding && (
          <form
            onSubmit={save}
            className="mb-6 rounded-lg border border-slate-700 bg-slate-900/60 p-4 space-y-3"
          >
            <div className="text-[10px] tracking-wider uppercase font-bold text-emerald-300">
              New testimonial
            </div>
            <DraftFields draft={draft} setDraft={setDraft} />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={!draft.name.trim() || !draft.quote.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-1.5 rounded text-sm font-bold"
              >
                Save quote
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setDraft(EMPTY_DRAFT);
                }}
                className="text-slate-400 hover:text-white px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && items.length === 0 && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && items.length === 0 && !adding && (
          <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-lg">
            <div className="text-4xl mb-2">💬</div>
            <p>No testimonials yet for {slug}.</p>
            <p className="text-xs mt-2 text-slate-600">
              When you have a quote, click <strong>+ Add quote</strong> above.
              The carousel on /clients/{slug} renders nothing until at least
              one is live.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {items.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg border p-4 ${
                t.is_active
                  ? "border-slate-700 bg-slate-900/40"
                  : "border-slate-800 bg-slate-950/40 opacity-60"
              }`}
            >
              {editing === t.id ? (
                <div className="space-y-3">
                  <DraftFields draft={editDraft} setDraft={setEditDraft} />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => saveEdit(t.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded text-sm font-bold"
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="text-slate-400 hover:text-white px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <blockquote
                    className="text-sm sm:text-base text-slate-100 italic leading-relaxed"
                    style={{ fontFamily: "ui-serif, Georgia, serif" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-xs">
                      <span className="font-bold text-slate-200">{t.name}</span>
                      {(t.role || t.location) && (
                        <span className="text-slate-500 ml-2">
                          {[t.role, t.location].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {t.video_url && (
                        <span className="ml-2 text-emerald-300 text-[10px] uppercase tracking-wider">
                          📹 video
                        </span>
                      )}
                      <span className="ml-3 text-[10px] text-slate-600 tabular-nums">
                        order {t.sort_order}
                      </span>
                      {!t.is_active && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-400">
                          hidden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        onClick={() => reorder(t.id, -10)}
                        title="Move up"
                        className="text-slate-400 hover:text-white px-1.5"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => reorder(t.id, 10)}
                        title="Move down"
                        className="text-slate-400 hover:text-white px-1.5"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => toggleActive(t)}
                        className={`px-2 py-0.5 rounded font-bold ${
                          t.is_active
                            ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                      >
                        {t.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => startEdit(t)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(t.id)}
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function DraftFields({
  draft,
  setDraft,
}: {
  draft: DraftTestimonial;
  setDraft: (d: DraftTestimonial) => void;
}) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-2">
        <Field label="Name *">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Sarah W."
            className={inputCls}
          />
        </Field>
        <Field label="Location">
          <input
            type="text"
            value={draft.location}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            placeholder="Sammamish, WA"
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Role / context">
        <input
          type="text"
          value={draft.role}
          onChange={(e) => setDraft({ ...draft, role: e.target.value })}
          placeholder="Parent · ECNL Forward SC"
          className={inputCls}
        />
      </Field>
      <Field label="Quote *">
        <textarea
          value={draft.quote}
          onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
          rows={3}
          placeholder="My U12 girls love the ball — first touch is night and day after 4 weeks."
          className={`${inputCls} resize-none`}
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-2">
        <Field label="Photo URL (optional)">
          <input
            type="url"
            value={draft.photo_url}
            onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })}
            placeholder="https://…"
            className={inputCls}
          />
        </Field>
        <Field label="Video URL (Loom / Vimeo / mp4)">
          <input
            type="url"
            value={draft.video_url}
            onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
            placeholder="https://…"
            className={inputCls}
          />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 items-end">
        <Field label="Sort order (lower = first)">
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) =>
              setDraft({ ...draft, sort_order: parseInt(e.target.value, 10) || 0 })
            }
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) =>
              setDraft({ ...draft, is_active: e.target.checked })
            }
          />
          <span>Live on the site</span>
        </label>
      </div>
    </>
  );
}

const inputCls =
  "w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-slate-500 block mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
