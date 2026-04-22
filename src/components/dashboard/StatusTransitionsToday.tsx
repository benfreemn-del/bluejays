"use client";

import { useEffect, useState } from "react";

interface Transition {
  from_status: string;
  to_status: string;
  count: number;
}

interface RecentRow {
  id: number;
  prospect_id: string;
  business_name: string | null;
  from_status: string | null;
  to_status: string;
  changed_at: string;
  source: string | null;
}

interface Response {
  since: string | null;
  transitions: Transition[];
  recent: RecentRow[];
}

export default function StatusTransitionsToday() {
  const [data, setData] = useState<Response | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/status-changes/today", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Response;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
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
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        Loading today&rsquo;s status changes&hellip;
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
        Status log error: {error}
      </div>
    );
  }

  const transitions = data?.transitions ?? [];
  const recent = data?.recent ?? [];
  const total = transitions.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">Today&rsquo;s status changes</span>
          <span className="text-xs text-muted">{total} total</span>
        </div>
        {recent.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-blue-electric hover:underline"
          >
            {expanded ? "Hide detail" : "Show detail"}
          </button>
        )}
      </div>

      {transitions.length === 0 ? (
        <p className="mt-2 text-xs text-muted">No status changes recorded today.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {transitions.map((t) => (
            <span
              key={`${t.from_status}-${t.to_status}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs"
            >
              <span className="text-muted">{t.from_status || "—"}</span>
              <span className="text-muted">→</span>
              <span className="text-foreground">{t.to_status}</span>
              <span className="font-mono text-blue-electric">{t.count}</span>
            </span>
          ))}
        </div>
      )}

      {expanded && recent.length > 0 && (
        <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-border/60 bg-background/30">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface text-muted">
              <tr>
                <th className="px-3 py-2 font-normal">When</th>
                <th className="px-3 py-2 font-normal">Business</th>
                <th className="px-3 py-2 font-normal">From</th>
                <th className="px-3 py-2 font-normal">To</th>
                <th className="px-3 py-2 font-normal">Source</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr key={row.id} className="border-t border-border/40">
                  <td className="px-3 py-2 text-muted whitespace-nowrap">
                    {new Date(row.changed_at).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2 text-foreground">{row.business_name ?? row.prospect_id.slice(0, 8)}</td>
                  <td className="px-3 py-2 text-muted">{row.from_status ?? "—"}</td>
                  <td className="px-3 py-2 text-foreground">{row.to_status}</td>
                  <td className="px-3 py-2 text-muted">{row.source ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
