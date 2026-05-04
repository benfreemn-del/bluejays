"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ClientAdCreative, AdStatus } from "@/lib/client-ads";

const STATUS_COLOR: Record<AdStatus, string> = {
  draft: "bg-slate-700/40 text-slate-300",
  ready: "bg-blue-500/20 text-blue-300",
  live: "bg-emerald-500/20 text-emerald-300",
  paused: "bg-amber-500/20 text-amber-300",
  archived: "bg-slate-800 text-slate-500",
  killed: "bg-rose-500/15 text-rose-400",
};
const PLATFORM_LABEL: Record<string, string> = {
  "meta-feed": "Meta · Feed",
  "meta-reels": "Meta · Reels",
  "meta-stories": "Meta · Stories",
  "google-search": "Google · Search",
  "google-pmax": "Google · PMax",
  "google-yt": "Google · YT",
};

export default function AdsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [creatives, setCreatives] = useState<ClientAdCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/client-ads?client=${slug}`);
    const j = (await r.json()) as { ok: boolean; creatives?: ClientAdCreative[] };
    if (j.ok && j.creatives) setCreatives(j.creatives);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const seed = async () => {
    setSeeding(true);
    await fetch(`/api/client-ads?client=${slug}&action=seed`, { method: "POST" });
    setSeeding(false);
    load();
  };

  const updateStatus = async (id: string, status: AdStatus) => {
    setCreatives((p) => p.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch(`/api/client-ads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const filtered = audienceFilter
    ? creatives.filter((c) => c.audience === audienceFilter)
    : creatives;
  const audiences = [...new Set(creatives.map((c) => c.audience))];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <Link href={`/dashboard/clients/${slug}`} className="text-slate-400 hover:text-white text-sm">
            ← Tasks
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1 min-w-0 truncate">
            {slug} <span className="text-slate-500 font-normal">/ ads</span>
          </h1>
          <button
            onClick={seed}
            disabled={seeding}
            className="text-[11px] tracking-wider uppercase font-bold text-violet-300 hover:text-white border border-violet-700/50 px-2.5 py-1 rounded disabled:opacity-50"
            title="Sync the in-code seed library to the DB"
          >
            {seeding ? "Seeding…" : "Sync seeds"}
          </button>
          <a
            href={`/api/client-ads?client=${slug}&csv=meta`}
            className="text-[11px] tracking-wider uppercase font-bold text-blue-300 hover:text-white border border-blue-700/50 px-2.5 py-1 rounded"
          >
            CSV · Meta
          </a>
          <a
            href={`/api/client-ads?client=${slug}&csv=google`}
            className="text-[11px] tracking-wider uppercase font-bold text-blue-300 hover:text-white border border-blue-700/50 px-2.5 py-1 rounded"
          >
            CSV · Google
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-5 pb-24">
        {audiences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {["", ...audiences].map((a) => (
              <button
                key={a || "all"}
                onClick={() => setAudienceFilter(a)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                  audienceFilter === a
                    ? "bg-blue-500 border-blue-400 text-white"
                    : "border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {a || "All"}
              </button>
            ))}
          </div>
        )}

        {loading && <div className="text-center text-slate-500 py-10">Loading…</div>}

        {!loading && creatives.length === 0 && (
          <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded">
            No ad creatives in DB yet.
            <div className="mt-3 text-xs">
              Hit <span className="text-violet-300 font-bold">Sync seeds</span>{" "}
              to load the in-code library.
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400">
                  {c.audience} · {PLATFORM_LABEL[c.platform] ?? c.platform}
                </span>
                <span
                  className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded ${STATUS_COLOR[c.status]}`}
                >
                  {c.status}
                </span>
              </div>
              {c.variant_label && (
                <div className="text-[10px] text-violet-300 font-semibold mb-1">
                  {c.variant_label}
                </div>
              )}
              <h3 className="text-[15px] font-bold leading-snug text-white">
                {c.headline}
              </h3>
              <p className="mt-1.5 text-[12px] text-slate-300 leading-relaxed line-clamp-3">
                {c.body}
              </p>
              {c.cta && (
                <div className="mt-2 inline-block text-[10px] tracking-wider uppercase font-extrabold bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded">
                  {c.cta}
                </div>
              )}
              {(c.image_brief || c.video_brief) && (
                <details className="mt-3">
                  <summary className="text-[10px] tracking-wider uppercase font-bold text-slate-500 cursor-pointer">
                    Asset brief
                  </summary>
                  {c.image_brief && (
                    <p className="mt-1 text-[11px] text-slate-400">📷 {c.image_brief}</p>
                  )}
                  {c.video_brief && (
                    <p className="mt-1 text-[11px] text-slate-400">🎬 {c.video_brief}</p>
                  )}
                </details>
              )}
              <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                {(["draft", "ready", "live", "paused", "archived", "killed"] as AdStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(c.id, s)}
                    disabled={c.status === s}
                    className={`text-[9px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded transition ${
                      c.status === s
                        ? STATUS_COLOR[s] + " cursor-default"
                        : "border border-slate-700 text-slate-500 hover:text-white"
                    }`}
                  >
                    {s}
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
