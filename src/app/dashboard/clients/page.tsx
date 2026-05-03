"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * /dashboard/clients
 *
 * Index of every client that has open tasks. One row per client, tap-target
 * sized for phone. Sorts by open-task count descending so the noisiest job
 * is on top.
 */

type ClientSummary = { client_slug: string; open_count: number };

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
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Client jobs
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 pb-32">
        {loading && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && clients.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            <div className="text-4xl mb-2">📋</div>
            No client tasks yet.
            <div className="mt-3 text-xs">
              Create one with{" "}
              <code className="bg-slate-900 px-1.5 py-0.5 rounded">
                POST /api/client-tasks
              </code>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {clients.map((c) => (
            <Link
              key={c.client_slug}
              href={`/dashboard/clients/${c.client_slug}`}
              className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900 p-4 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold tracking-tight truncate">
                  {c.client_slug}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {c.open_count} open task{c.open_count === 1 ? "" : "s"}
                </div>
              </div>
              <div
                className={`text-xs font-bold px-2 py-1 rounded ${
                  c.open_count > 10
                    ? "bg-rose-500/20 text-rose-300"
                    : c.open_count > 5
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {c.open_count}
              </div>
              <span className="text-slate-600">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
