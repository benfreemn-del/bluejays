"use client";

import { useEffect, useState } from "react";
import { WORK_LOG_KINDS, kindMeta, type WorkLogEntry, type WorkLogKind, type WorkLogLink } from "@/lib/work-log";

/**
 * Admin-side quick-add + recent-entries panel for the client work log.
 *
 * Mount on /dashboard/clients/[slug]. Ben taps "+ Log" while doing the
 * work — title + kind + optional details. Entries surface in:
 *   - This panel's recent-entries list (last 10)
 *   - /clients/[slug]/portal "What we built" section (visible to client)
 *   - Friday auto-digest email to the client
 *
 * Pattern: mobile-first, big tap targets, optimistic UI. Per CLAUDE.md
 * "Weekly Work-Log Pattern" (locked 2026-05-18).
 */

export default function WorkLogPanel({ slug }: { slug: string }) {
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  // Auto-expand when there's content. Empty panel stays collapsed to
  // keep the dashboard simple per 2026-05-18 audit.
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  // First load reveals only when there are entries — keeps brand-new
  // client pages quiet.
  useEffect(() => {
    if (entries.length > 0 && !expanded) setExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const [kind, setKind] = useState<WorkLogKind>("feature_shipped");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [visibleToClient, setVisibleToClient] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/clients/${slug}/work-log?limit=10`);
      const j = await r.json();
      if (j.ok) setEntries(j.entries);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [slug]);

  function resetForm() {
    setTitle("");
    setDetails("");
    setLinkLabel("");
    setLinkUrl("");
    setKind("feature_shipped");
    setVisibleToClient(true);
  }

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    const links: WorkLogLink[] = [];
    if (linkUrl.trim()) {
      links.push({
        label: linkLabel.trim() || linkUrl.trim(),
        url: linkUrl.trim(),
      });
    }
    try {
      const r = await fetch(`/api/clients/${slug}/work-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: title.trim(),
          details: details.trim() || null,
          links,
          visible_to_client: visibleToClient,
        }),
      });
      const j = await r.json();
      if (j.ok) {
        resetForm();
        setShowForm(false);
        void load();
      } else {
        alert(`Could not save: ${j.error}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this log entry?")) return;
    const r = await fetch(`/api/clients/${slug}/work-log/${id}`, {
      method: "DELETE",
    });
    if (r.ok) void load();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 mb-6">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20">
        {/* Header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg" aria-hidden>📝</span>
            <span className="font-bold text-sm tracking-wide text-emerald-100">
              Work log
            </span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-bold">
              {entries.length} this week
            </span>
          </div>
          <span className="text-emerald-300 text-xs">
            {expanded ? "▾ Hide" : "▸ Show"}
          </span>
        </button>

        {expanded && (
          <div className="border-t border-emerald-500/20 px-4 py-3 space-y-3">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full text-sm font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 py-2.5"
              >
                + Log something
              </button>
            ) : (
              <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-slate-900/60 p-3">
                {/* Kind picker */}
                <div className="flex flex-wrap gap-1">
                  {WORK_LOG_KINDS.map((k) => (
                    <button
                      key={k.kind}
                      onClick={() => setKind(k.kind)}
                      className={`text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded border ${
                        kind === k.kind
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                          : "border-slate-700 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {k.emoji} {k.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short headline (e.g. 'Launched Powerwall Homeowner ad set')"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm"
                />

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                  placeholder="Optional details — what / why / what's next"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm"
                />

                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    placeholder="Link label"
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs"
                  />
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https:// (PR / dashboard / ad library)"
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleToClient}
                    onChange={(e) => setVisibleToClient(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  Show this entry in the Friday digest / portal (uncheck for internal-only notes)
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={submit}
                    disabled={saving || !title.trim()}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-emerald-950 font-bold text-sm py-2 rounded"
                  >
                    {saving ? "Saving…" : "Log entry"}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="border border-slate-700 text-slate-300 font-bold text-sm py-2 px-3 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Recent entries */}
            <div className="space-y-1.5">
              {loading && entries.length === 0 && (
                <p className="text-xs text-slate-500 py-2">Loading…</p>
              )}
              {!loading && entries.length === 0 && (
                <p className="text-xs text-slate-500 py-2">
                  No entries yet. Log the first thing you ship for this client.
                </p>
              )}
              {entries.map((e) => {
                const meta = kindMeta(e.kind);
                return (
                  <article
                    key={e.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">
                            {meta.emoji} {meta.label}
                          </span>
                          {!e.visible_to_client && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                              Internal only
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">
                            {new Date(e.created_at).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-100 mt-0.5">
                          {e.title}
                        </p>
                        {e.details && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">
                            {e.details}
                          </p>
                        )}
                        {e.links.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                            {e.links.map((l, i) => (
                              <a
                                key={i}
                                href={l.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                              >
                                {l.label} ↗
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => remove(e.id)}
                        className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-rose-400 shrink-0"
                        title="Delete entry"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
