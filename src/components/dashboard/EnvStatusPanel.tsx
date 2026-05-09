"use client";

import { useEffect, useState } from "react";

/**
 * EnvStatusPanel — diagnostic panel showing which Vercel env vars are
 * set vs missing. Surfaced in the dashboard Settings tab so Ben can
 * see at a glance what's blocking what (e.g. ADMIN_PASSWORD_MADIE
 * unset → Madie's role won't take, OIT_TWILIO_NUMBER unset → OIT
 * funnel SMS skipped, GOOGLE_ADS_CLIENT_ID unset → ad OAuth fails).
 *
 * Owner-only — backed by /api/admin/env-status which is admin-cookie
 * gated by middleware.
 */

type EnvVar = { key: string; set: boolean; why: string };
type Group = { group: string; vars: EnvVar[] };
type EnvStatus = {
  ok: boolean;
  summary: { total: number; set: number; missing: number };
  groups: Group[];
};

export default function EnvStatusPanel() {
  const [data, setData] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideSet, setHideSet] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/env-status", {
          credentials: "include",
        });
        if (!r.ok) return;
        const j = (await r.json()) as EnvStatus;
        if (!cancelled) setData(j);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
        <p className="text-sm text-slate-500">Checking env vars…</p>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5">
        <p className="text-sm text-rose-300">
          Could not load env status. Check /api/admin/env-status route.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-400 mb-1">
            Env-var diagnostic
          </p>
          <h3 className="text-base font-bold text-white">
            🔧 {data.summary.set} of {data.summary.total} provisioned
            {data.summary.missing > 0 && (
              <span className="text-rose-300 font-bold">
                {" "}
                · {data.summary.missing} missing
              </span>
            )}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setHideSet((v) => !v)}
          className="text-[11px] uppercase tracking-wider font-bold border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded"
        >
          {hideSet ? "Show all" : "Hide ✓ set"}
        </button>
      </div>

      <div className="space-y-4">
        {data.groups.map((g) => {
          const visible = hideSet ? g.vars.filter((v) => !v.set) : g.vars;
          if (visible.length === 0) return null;
          return (
            <div key={g.group}>
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                {g.group}
                {hideSet && (
                  <span className="text-slate-600 ml-2 normal-case">
                    ({g.vars.filter((v) => !v.set).length}/{g.vars.length} missing)
                  </span>
                )}
              </h4>
              <ul className="space-y-1.5">
                {visible.map((v) => (
                  <li
                    key={v.key}
                    className={`flex items-start gap-3 rounded-md p-2.5 ${
                      v.set
                        ? "bg-emerald-950/20 border border-emerald-700/30"
                        : "bg-rose-950/20 border border-rose-500/30"
                    }`}
                  >
                    <span
                      className={`shrink-0 mt-0.5 ${
                        v.set ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {v.set ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <code
                        className={`text-[12px] font-mono font-bold ${
                          v.set ? "text-emerald-200" : "text-rose-200"
                        }`}
                      >
                        {v.key}
                      </code>
                      <p className="text-[12px] text-slate-300 leading-snug mt-0.5">
                        {v.why}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
        Set missing vars in Vercel → bluejays → Settings → Environment
        Variables. Redeploy after adding. Some (Twilio, SendGrid) take
        effect immediately on next request; OAuth client IDs need a
        deploy to load.
      </p>
    </section>
  );
}
