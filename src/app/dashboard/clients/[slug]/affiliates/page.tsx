"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  AffiliateChannel,
  AffiliateStatus,
  ClientAffiliate,
} from "@/lib/client-affiliates";

const STATUS_LABEL: Record<AffiliateStatus, string> = {
  cold: "Cold",
  queued: "Queued",
  contacted: "Contacted",
  replied: "Replied",
  onboarded: "Onboarded",
  declined: "Declined",
  "do-not-contact": "DNC",
};
const STATUS_COLOR: Record<AffiliateStatus, string> = {
  cold: "bg-slate-700/40 text-slate-300",
  queued: "bg-blue-500/20 text-blue-300",
  contacted: "bg-amber-500/20 text-amber-300",
  replied: "bg-emerald-500/20 text-emerald-300",
  onboarded: "bg-emerald-500 text-white",
  declined: "bg-rose-500/15 text-rose-300",
  "do-not-contact": "bg-slate-800 text-slate-500",
};

export default function AffiliatesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [list, setList] = useState<ClientAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ client: slug });
    if (statusFilter) params.set("status", statusFilter);
    const r = await fetch(`/api/client-affiliates?${params}`);
    const j = (await r.json()) as { ok: boolean; affiliates?: ClientAffiliate[] };
    if (j.ok && j.affiliates) setList(j.affiliates);
    setLoading(false);
  }, [slug, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, patch: Partial<ClientAffiliate>) => {
    setList((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    await fetch(`/api/client-affiliates/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <Link href={`/dashboard/clients/${slug}`} className="text-slate-400 hover:text-white text-sm">
            ← Tasks
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1 min-w-0 truncate">
            {slug} <span className="text-slate-500 font-normal">/ affiliates</span>
          </h1>
          <button
            onClick={async () => {
              if (!confirm("Bulk-seed the starter affiliate list? Idempotent — safe to re-run.")) return;
              const r = await fetch(`/api/client-affiliates/seed?client=${slug}`, {
                method: "POST",
              });
              const j = (await r.json()) as { ok: boolean; inserted?: number; skipped?: number };
              if (j.ok) alert(`Seeded ${j.inserted} affiliates (${j.skipped} already existed).`);
              load();
            }}
            className="text-[11px] tracking-wider uppercase font-bold text-amber-300 hover:text-white border border-amber-700/50 px-2.5 py-1 rounded"
            title="Bulk-load 30+ pre-researched affiliate prospects"
          >
            Seed list
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold px-3 py-1.5 rounded"
          >
            {showAdd ? "Cancel" : "+ Affiliate"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-5 pb-24">
        {showAdd && <AddForm slug={slug} onAdded={() => { setShowAdd(false); load(); }} />}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(["", ...Object.keys(STATUS_LABEL)] as (AffiliateStatus | "")[]).map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                statusFilter === s
                  ? "bg-blue-500 border-blue-400 text-white"
                  : "border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {s ? STATUS_LABEL[s as AffiliateStatus] : "All"}
            </button>
          ))}
        </div>

        {loading && <div className="text-center text-slate-500 py-10">Loading…</div>}

        {!loading && list.length === 0 && (
          <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded">
            No affiliate prospects yet.
            <div className="mt-3 text-xs">
              Click <span className="text-blue-300 font-bold">+ Affiliate</span>{" "}
              to add the first ECNL coach / club / influencer.
            </div>
          </div>
        )}

        <div className="space-y-2">
          {list.map((a) => (
            <article key={a.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[15px]">{a.org_name}</span>
                    {a.contact_name && (
                      <span className="text-[12px] text-slate-400">· {a.contact_name}</span>
                    )}
                    {a.role && (
                      <span className="text-[10px] text-slate-500">({a.role})</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                    {a.email && <span>{a.email}</span>}
                    {a.city && a.state && <span>· {a.city}, {a.state}</span>}
                    {a.channel && <span>· {a.channel}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded ${STATUS_COLOR[a.status]}`}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    fit {a.fit_score}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                {(Object.keys(STATUS_LABEL) as AffiliateStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => update(a.id, { status: s })}
                    disabled={a.status === s}
                    className={`text-[9px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded transition ${
                      a.status === s
                        ? STATUS_COLOR[s] + " cursor-default"
                        : "border border-slate-700 text-slate-500 hover:text-white"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function AddForm({ slug, onAdded }: { slug: string; onAdded: () => void }) {
  const [org, setOrg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<AffiliateChannel>("club");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!org.trim()) return;
    setSubmitting(true);
    await fetch(`/api/client-affiliates?client=${slug}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        org_name: org.trim(),
        contact_name: name.trim() || null,
        email: email.trim() || null,
        channel,
      }),
    });
    setSubmitting(false);
    setOrg(""); setName(""); setEmail("");
    onAdded();
  };

  return (
    <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-950/20 p-4 space-y-2">
      <input
        placeholder="Org name (e.g. Crossfire Premier ECNL) *"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm"
        autoFocus
      />
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          placeholder="Contact name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded p-2 text-sm"
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded p-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as AffiliateChannel)}
          className="bg-slate-900 border border-slate-800 rounded p-2 text-sm"
        >
          {(["club", "coach", "influencer", "podcast", "media", "parent-group"] as AffiliateChannel[]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={submitting || !org.trim()}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}
