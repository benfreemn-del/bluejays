"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clientSiteFor } from "@/lib/client-site-urls";

/**
 * /dashboard/clients
 *
 * Index of every client that has open tasks. One row per client, tap-target
 * sized for phone. Sorts by open-task count descending so the noisiest job
 * is on top.
 */

type ClientSummary = {
  client_slug: string;
  open_count: number;
  done_count: number;
};

export default function ClientsIndexPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/client-tasks");
      const j = (await r.json()) as { ok: boolean; clients?: ClientSummary[] };
      if (j.ok && j.clients) setClients(j.clients);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1">
            Client jobs
          </h1>
          <Link
            href="/dashboard/all-tasks"
            className="text-[11px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2.5 py-1 rounded"
            title="Master to-do across every client"
          >
            Master to-do →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 pb-32">
        {loading && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && clients.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            <div className="text-4xl mb-2">📋</div>
            No active client jobs yet.
            <div className="mt-3 text-xs max-w-sm mx-auto">
              Once a client signs on, their open tasks will land here.
              Each row links into that client's job board.
            </div>
          </div>
        )}

        <div className="space-y-2">
          {clients.map((c) => {
            const allDone = c.open_count === 0 && c.done_count > 0;
            const site = clientSiteFor(c.client_slug);
            return (
              <div
                key={c.client_slug}
                className={`relative flex items-center gap-3 rounded-lg border p-4 transition ${
                  allDone
                    ? "border-emerald-700/40 bg-emerald-900/15 hover:border-emerald-600/60 hover:bg-emerald-900/25"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <Link
                  href={`/dashboard/clients/${c.client_slug}`}
                  className="flex-1 min-w-0 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold tracking-tight truncate flex items-center gap-2">
                      {allDone && (
                        <span
                          aria-label="all tasks done"
                          className="text-emerald-400 text-base leading-none"
                        >
                          ✅
                        </span>
                      )}
                      {c.client_slug}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        allDone ? "text-emerald-400/80" : "text-slate-500"
                      }`}
                    >
                      {allDone
                        ? `All ${c.done_count} tasks done · live`
                        : `${c.open_count} open task${c.open_count === 1 ? "" : "s"}`}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      allDone
                        ? "bg-emerald-500/20 text-emerald-300"
                        : c.open_count > 10
                          ? "bg-rose-500/20 text-rose-300"
                          : c.open_count > 5
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {allDone ? "✓" : c.open_count}
                  </div>
                </Link>

                {/* Quick-access preview site link — opens the bespoke
                    /clients/{slug} build (or the client's actual production
                    URL if external) without drilling into the detail page. */}
                {site.kind === "none" ? (
                  <span
                    title="No site URL set yet — wire it in src/lib/client-site-urls.ts"
                    className="text-[10px] tracking-wider uppercase font-bold border border-slate-800 text-slate-600 px-2 py-1 rounded cursor-not-allowed"
                  >
                    Site ↗
                  </span>
                ) : (
                  <a
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={
                      site.kind === "internal"
                        ? "Open the bespoke preview site"
                        : "Open the client's production site"
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] tracking-wider uppercase font-bold border border-cyan-700/60 text-cyan-300 hover:text-white hover:bg-cyan-900/30 px-2 py-1 rounded transition"
                  >
                    Site ↗
                  </a>
                )}

                <span className="text-slate-600">→</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
