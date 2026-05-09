"use client";

/**
 * /dashboard/clients/[slug]/camps
 *
 * Admin board for the per-client camps catalog. Drop in real partner
 * camps Philip + Paul send over, edit dates, hide expired sessions,
 * delete duplicates. The Camp Finder quiz at /clients/[slug]/camps
 * pulls live from the API on submit so the catalog is always fresh
 * without a redeploy.
 */

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Camp = {
  id: string;
  client_slug: string;
  name: string;
  org: string | null;
  city: string | null;
  state: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  start_date: string | null;
  end_date: string | null;
  age_range: string | null;
  format: string | null;
  ball_included: boolean;
  url: string | null;
  blurb: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Draft = {
  name: string;
  org: string;
  city: string;
  state: string;
  region: string;
  start_date: string;
  end_date: string;
  age_range: string;
  format: string;
  ball_included: boolean;
  url: string;
  blurb: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  org: "",
  city: "",
  state: "",
  region: "",
  start_date: "",
  end_date: "",
  age_range: "",
  format: "Day camp",
  ball_included: false,
  url: "",
  blurb: "",
  sort_order: 100,
  is_active: true,
};

const FORMATS = ["Day camp", "Residential", "Clinic", "Demo"];
const REGIONS = [
  "Pacific NW",
  "West",
  "Mountain",
  "Midwest",
  "South",
  "Northeast",
];

export default function CampsAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [items, setItems] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/client-camps?client=${encodeURIComponent(slug)}&all=1`,
      );
      const j = (await r.json()) as { ok: boolean; camps?: Camp[] };
      if (j.ok && j.camps) setItems(j.camps);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const draftToBody = (d: Draft) => ({
    name: d.name.trim(),
    org: d.org.trim() || null,
    city: d.city.trim() || null,
    state: d.state.trim().toUpperCase() || null,
    region: d.region || null,
    start_date: d.start_date || null,
    end_date: d.end_date || null,
    age_range: d.age_range.trim() || null,
    format: d.format || null,
    ball_included: d.ball_included,
    url: d.url.trim() || null,
    blurb: d.blurb.trim() || null,
    sort_order: d.sort_order,
    is_active: d.is_active,
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    await fetch("/api/client-camps", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ client_slug: slug, ...draftToBody(draft) }),
    });
    setDraft(EMPTY_DRAFT);
    setAdding(false);
    load();
  };

  const startEdit = (c: Camp) => {
    setEditing(c.id);
    setEditDraft({
      name: c.name,
      org: c.org ?? "",
      city: c.city ?? "",
      state: c.state ?? "",
      region: c.region ?? "",
      start_date: c.start_date ?? "",
      end_date: c.end_date ?? "",
      age_range: c.age_range ?? "",
      format: c.format ?? "Day camp",
      ball_included: c.ball_included,
      url: c.url ?? "",
      blurb: c.blurb ?? "",
      sort_order: c.sort_order,
      is_active: c.is_active,
    });
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/client-camps/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draftToBody(editDraft)),
    });
    setEditing(null);
    load();
  };

  const toggleActive = async (c: Camp) => {
    setItems((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)),
    );
    await fetch(`/api/client-camps/${c.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (
      !confirm(
        "Delete this camp permanently? Use 'Hide' instead if it's just out of season.",
      )
    )
      return;
    await fetch(`/api/client-camps/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      {/* Sub-action bar — count + Add Camp button.
          Tab bar supplied by zenith-sports/layout via ClientTabsBar. */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 border-b border-slate-800/50 flex items-center gap-3">
        <span className="text-[11px] text-slate-500 flex-1">
          {items.length} total · {items.filter((c) => c.is_active).length} live
        </span>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-[11px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2.5 py-1 rounded"
        >
          {adding ? "Cancel" : "+ Add camp"}
        </button>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-5 pb-32">
        <div className="mb-5 rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
          <strong>How to use:</strong> live camps power the Camp Finder quiz
          results at <code className="text-emerald-300">/clients/{slug}/camps</code>.
          Hide a camp once it sells out or the season ends; delete only when
          you posted a duplicate. State should be a 2-letter postal code (WA,
          CA, TX) so the quiz state-match works.
        </div>

        {adding && (
          <form
            onSubmit={save}
            className="mb-6 rounded-lg border border-slate-700 bg-slate-900/60 p-4 space-y-3"
          >
            <div className="text-[10px] tracking-wider uppercase font-bold text-emerald-300">
              New camp
            </div>
            <DraftFields draft={draft} setDraft={setDraft} />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={!draft.name.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-1.5 rounded text-sm font-bold"
              >
                Save camp
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
            <div className="text-4xl mb-2">🏕️</div>
            <p>No camps yet for {slug}.</p>
            <p className="text-xs mt-2 text-slate-600">
              Camp Finder quiz still captures leads with a "notify me" CTA.
              Once you add a camp here, it shows up in matching quiz results.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {items.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg border p-4 ${
                c.is_active
                  ? "border-slate-700 bg-slate-900/40"
                  : "border-slate-800 bg-slate-950/40 opacity-60"
              }`}
            >
              {editing === c.id ? (
                <div className="space-y-3">
                  <DraftFields draft={editDraft} setDraft={setEditDraft} />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => saveEdit(c.id)}
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
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-bold text-white text-base">
                        {c.name}
                        {c.ball_included && (
                          <span className="ml-2 text-[10px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-500/30">
                            ⚽ ball
                          </span>
                        )}
                        {!c.is_active && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-400">
                            hidden
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400 flex flex-wrap items-center gap-2">
                        {c.org && <span>{c.org}</span>}
                        {(c.city || c.state) && (
                          <span>· {[c.city, c.state].filter(Boolean).join(", ")}</span>
                        )}
                        {c.format && <span>· {c.format}</span>}
                        {c.age_range && <span>· {c.age_range}</span>}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {c.start_date
                          ? `${c.start_date}${c.end_date ? ` → ${c.end_date}` : ""}`
                          : "rolling enrollment"}
                        {c.region && <span> · {c.region}</span>}
                        <span className="ml-2 tabular-nums">order {c.sort_order}</span>
                      </div>
                      {c.blurb && (
                        <p className="mt-1.5 text-[12px] text-slate-300 leading-relaxed">
                          {c.blurb}
                        </p>
                      )}
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-block text-[11px] text-blue-300 hover:text-blue-200"
                        >
                          {c.url} ↗
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`px-2 py-0.5 rounded font-bold ${
                          c.is_active
                            ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                      >
                        {c.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => startEdit(c)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(c.id)}
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
    </>
  );
}

function DraftFields({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
}) {
  return (
    <>
      <Field label="Camp name *">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="TEKKY® Summer Skills Camp"
          className={inputCls}
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-2">
        <Field label="Run by (org)">
          <input
            type="text"
            value={draft.org}
            onChange={(e) => setDraft({ ...draft, org: e.target.value })}
            placeholder="Zenith Sports"
            className={inputCls}
          />
        </Field>
        <Field label="Format">
          <select
            value={draft.format}
            onChange={(e) => setDraft({ ...draft, format: e.target.value })}
            className={inputCls}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        <Field label="City">
          <input
            type="text"
            value={draft.city}
            onChange={(e) => setDraft({ ...draft, city: e.target.value })}
            placeholder="Seattle"
            className={inputCls}
          />
        </Field>
        <Field label="State (2-letter)">
          <input
            type="text"
            maxLength={2}
            value={draft.state}
            onChange={(e) =>
              setDraft({ ...draft, state: e.target.value.toUpperCase() })
            }
            placeholder="WA"
            className={inputCls}
          />
        </Field>
        <Field label="Region">
          <select
            value={draft.region}
            onChange={(e) => setDraft({ ...draft, region: e.target.value })}
            className={inputCls}
          >
            <option value="">—</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        <Field label="Start date">
          <input
            type="date"
            value={draft.start_date}
            onChange={(e) =>
              setDraft({ ...draft, start_date: e.target.value })
            }
            className={inputCls}
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={draft.end_date}
            onChange={(e) =>
              setDraft({ ...draft, end_date: e.target.value })
            }
            className={inputCls}
          />
        </Field>
        <Field label="Age range">
          <input
            type="text"
            value={draft.age_range}
            onChange={(e) => setDraft({ ...draft, age_range: e.target.value })}
            placeholder="U10–U14"
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Camp page URL">
        <input
          type="url"
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          placeholder="https://…"
          className={inputCls}
        />
      </Field>
      <Field label="Blurb (1–2 sentences)">
        <textarea
          value={draft.blurb}
          onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
          rows={2}
          placeholder="5-day technical-skills camp at TEKKY HQ. Each player goes home with their own ball."
          className={`${inputCls} resize-none`}
        />
      </Field>
      <div className="grid sm:grid-cols-3 gap-2 items-end">
        <Field label="Sort order">
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) =>
              setDraft({
                ...draft,
                sort_order: parseInt(e.target.value, 10) || 0,
              })
            }
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            checked={draft.ball_included}
            onChange={(e) =>
              setDraft({ ...draft, ball_included: e.target.checked })
            }
          />
          <span>⚽ TEKKY ball included</span>
        </label>
        <label className="flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) =>
              setDraft({ ...draft, is_active: e.target.checked })
            }
          />
          <span>Live in Camp Finder</span>
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
