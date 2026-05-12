"use client";

import { useEffect, useState } from "react";

/**
 * /dashboard/onboarding — operator view of every client's onboarding
 * wizard status. Shows who's stuck, who's ready to launch, and who's
 * already live. Click a row to jump into that client's wizard (as
 * operator, you'll need to log in as them to actually edit — this is
 * a status surface, not a remote-edit tool).
 */

type Status = "not_started" | "in_progress" | "ready_to_launch" | "launched";

interface Row {
  client_slug: string;
  status: Status;
  progress_pct: number;
  updated_at: string;
  launched_at: string | null;
}

const STATUS_STYLES: Record<Status, string> = {
  not_started: "bg-slate-800 text-slate-400",
  in_progress: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  ready_to_launch: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  launched: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
};

const STATUS_LABELS: Record<Status, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  ready_to_launch: "Ready to launch",
  launched: "Launched",
};

export default function DashboardOnboardingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/dashboard/onboarding");
        const j = await r.json();
        if (!j.ok) setErr(j.error);
        else setRows(j.rows);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
            BlueJays internal · operator
          </p>
          <h1 className="text-3xl font-bold mb-2">Client onboarding</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Every client&apos;s post-deal wizard status. &ldquo;Ready to launch&rdquo; means
            they&apos;ve completed all six steps and just need to hit the button.
            &ldquo;Launched&rdquo; auto-seeds the per-tenant TODO list in /dashboard/all-tasks.
          </p>
        </header>

        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {err && <p className="text-sm text-rose-400">{err}</p>}

        {rows.length === 0 && !loading && !err && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center text-slate-500 text-sm">
            No clients have started onboarding yet. Once a paid prospect
            visits <code className="text-slate-300">/clients/[slug]/onboarding</code>,
            they&apos;ll show up here.
          </div>
        )}

        <div className="space-y-2">
          {rows.map((r) => (
            <a
              key={r.client_slug}
              href={`/clients/${r.client_slug}/onboarding`}
              className="block rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-white/20 px-5 py-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{r.client_slug}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Updated {new Date(r.updated_at).toLocaleString()}
                    {r.launched_at && ` · Launched ${new Date(r.launched_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 hidden sm:block">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${r.progress_pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 text-right">{r.progress_pct}%</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
