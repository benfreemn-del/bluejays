"use client";

import { use, useCallback, useEffect, useState } from "react";

import {
  ARC_STATUS_LABELS,
  ARC_STATUS_ORDER,
  type ArcReviewer,
  type ArcStatus,
} from "@/lib/arc-reviewers";

/**
 * Admin ARC reviewer kanban.
 *
 * Five-column board: Applied → Approved → Copy sent → Posted review,
 * plus a Skipped column for rejections.
 *
 * Mobile-first; columns stack on small viewports. One-tap status flip
 * via per-row dropdown so Ben/Preston can move reviewers without
 * opening every card. Per CLAUDE.md "ARC Reader CRM" pattern.
 */

const STATUS_COLOR: Record<ArcStatus, string> = {
  applied: "border-slate-600 bg-slate-900/40",
  approved: "border-amber-500/40 bg-amber-950/30",
  copy_sent: "border-sky-500/40 bg-sky-950/30",
  posted_review: "border-emerald-500/40 bg-emerald-950/30",
  skipped: "border-rose-500/30 bg-rose-950/20 opacity-60",
};

const STATUS_HEADER_COLOR: Record<ArcStatus, string> = {
  applied: "text-slate-300",
  approved: "text-amber-300",
  copy_sent: "text-sky-300",
  posted_review: "text-emerald-300",
  skipped: "text-rose-300",
};

export default function ArcDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [rows, setRows] = useState<ArcReviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ArcStatus>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/clients/${slug}/arc`);
      const j = await r.json();
      if (j.ok) setRows(j.reviewers);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateRow(id: string, patch: Partial<ArcReviewer>) {
    const r = await fetch(`/api/clients/${slug}/arc`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const j = await r.json();
    if (j.ok) {
      setRows((curr) => curr.map((row) => (row.id === id ? j.reviewer : row)));
    }
  }

  const byStatus = ARC_STATUS_ORDER.map((s) => ({
    status: s,
    items: rows.filter((r) => r.status === s),
  }));

  const visible =
    filter === "all" ? byStatus : byStatus.filter((g) => g.status === filter);

  const applicationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/clients/${slug}/arc/apply`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-400 font-bold mb-2">
            {slug} · ARC reviewers
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Street team kanban
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-2xl">
            Applied → Approved → Copy sent → Posted review. Flip status
            as you work the launch. First two weeks post-launch is the
            algorithmic window — keep reviewers moving.
          </p>
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
              Public application link
            </p>
            <code className="text-amber-200 text-xs break-all">
              {applicationUrl}
            </code>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded ${
              filter === "all"
                ? "bg-slate-700 text-white"
                : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            All ({rows.length})
          </button>
          {ARC_STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded ${
                filter === s
                  ? "bg-slate-700 text-white"
                  : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {ARC_STATUS_LABELS[s]} (
              {rows.filter((r) => r.status === s).length})
            </button>
          ))}
        </div>

        {loading && rows.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">
            Loading…
          </p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
            <p className="text-slate-300 mb-2">No applicants yet.</p>
            <p className="text-xs text-slate-500">
              Share the public application link above on your social
              channels two weeks before launch.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {visible.map((group) => (
              <section key={group.status}>
                <h2
                  className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 ${STATUS_HEADER_COLOR[group.status]}`}
                >
                  {ARC_STATUS_LABELS[group.status]} · {group.items.length}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((r) => (
                    <article
                      key={r.id}
                      className={`rounded-xl border p-3 ${STATUS_COLOR[r.status]}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-100">{r.name}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {r.email}
                          </p>
                        </div>
                        {r.reach_estimate !== null && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
                            {r.reach_estimate.toLocaleString()} reach
                          </span>
                        )}
                      </div>

                      {r.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {r.platforms.map((p) => (
                            <span
                              key={p}
                              className="text-[10px] uppercase tracking-wider font-semibold text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded"
                            >
                              {p.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      )}

                      {r.motivation && (
                        <p className="text-xs text-slate-400 italic mb-2 line-clamp-3">
                          “{r.motivation}”
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            updateRow(r.id, {
                              status: e.target.value as ArcStatus,
                            })
                          }
                          className="text-xs bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        >
                          {ARC_STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>
                              → {ARC_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-slate-600 shrink-0">
                          {new Date(r.applied_at).toLocaleDateString()}
                        </span>
                      </div>

                      {r.status === "posted_review" && (
                        <div className="mt-2">
                          <input
                            type="url"
                            placeholder="Review URL"
                            value={r.review_url ?? ""}
                            onChange={(e) =>
                              updateRow(r.id, { review_url: e.target.value })
                            }
                            className="w-full text-xs bg-slate-950 border border-emerald-700 rounded px-2 py-1 text-emerald-200 placeholder-slate-600"
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
