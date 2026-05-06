"use client";

/**
 * /dashboard/all-tasks
 *
 * Master to-do board across every client. The single screen Ben opens
 * when he wants to know "what is everyone — me, Claude, all clients —
 * actually waiting on right now."
 *
 * Filters:
 *   · Search (title/description/notes contains)
 *   · Client (multi-select chip row, populated from loaded data)
 *   · Owner (ben / client / claude / external)
 *   · Status (pending / in-progress / blocked / done / wont-do)
 *   · Priority (urgent / high / medium / low)
 *   · Assignee (free-text dropdown of unique assigned_to_name values)
 *   · Show done (toggle — off by default)
 *
 * Counts at the top show the active-filter slice + grand totals.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Task = {
  id: string;
  client_slug: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "blocked" | "done" | "wont-do";
  priority: "urgent" | "high" | "medium" | "low";
  category: string;
  owner: string;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  notes: string | null;
  created_at: string;
};

const STATUS_RANK: Record<Task["status"], number> = {
  in_progress: 0,
  pending: 1,
  blocked: 2,
  done: 3,
  "wont-do": 4,
};
const PRIORITY_RANK: Record<Task["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STATUS_COLOR: Record<Task["status"], string> = {
  pending: "bg-slate-700 text-slate-300",
  in_progress: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
  blocked: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
  done: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  "wont-do": "bg-slate-800 text-slate-500",
};
const PRIORITY_COLOR: Record<Task["priority"], string> = {
  urgent: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
  high: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  medium: "bg-slate-700 text-slate-300",
  low: "bg-slate-800 text-slate-500",
};
const OWNER_COLOR: Record<string, string> = {
  ben: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  client: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  claude: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  external: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
};

export default function AllTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeDone, setIncludeDone] = useState(false);

  // Filter state
  const [q, setQ] = useState("");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await fetch(
        `/api/client-tasks?all=1${includeDone ? "&includeCompleted=1" : ""}`,
      );
      const j = (await r.json()) as { ok: boolean; tasks?: Task[] };
      if (!cancelled && j.ok && j.tasks) setTasks(j.tasks);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [includeDone]);

  // Derive filter pools from the loaded set so chips only show real
  // values that exist (don't render "claude" if no claude tasks etc.)
  const pools = useMemo(() => {
    const clients = new Set<string>();
    const owners = new Set<string>();
    const assignees = new Set<string>();
    for (const t of tasks) {
      clients.add(t.client_slug);
      owners.add(t.owner);
      if (t.assigned_to_name) assignees.add(t.assigned_to_name);
    }
    return {
      clients: Array.from(clients).sort(),
      owners: Array.from(owners).sort(),
      assignees: Array.from(assignees).sort(),
    };
  }, [tasks]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (ql) {
          const hay = `${t.title} ${t.description ?? ""} ${t.notes ?? ""}`.toLowerCase();
          if (!hay.includes(ql)) return false;
        }
        if (clientFilter && t.client_slug !== clientFilter) return false;
        if (ownerFilter && t.owner !== ownerFilter) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        if (priorityFilter && t.priority !== priorityFilter) return false;
        if (assigneeFilter && t.assigned_to_name !== assigneeFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort: status (in-progress first) → priority → newest
        const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (s !== 0) return s;
        const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (p !== 0) return p;
        return b.created_at.localeCompare(a.created_at);
      });
  }, [tasks, q, clientFilter, ownerFilter, statusFilter, priorityFilter, assigneeFilter]);

  const anyFilterActive =
    q || clientFilter || ownerFilter || statusFilter || priorityFilter || assigneeFilter;
  const clearAll = () => {
    setQ("");
    setClientFilter("");
    setOwnerFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setAssigneeFilter("");
  };

  // Top-of-page rollup counts
  const counts = useMemo(() => {
    const c = {
      total: tasks.length,
      open: 0,
      in_progress: 0,
      blocked: 0,
      urgent: 0,
      ben: 0,
      client: 0,
    };
    for (const t of tasks) {
      if (t.status !== "done" && t.status !== "wont-do") c.open += 1;
      if (t.status === "in_progress") c.in_progress += 1;
      if (t.status === "blocked") c.blocked += 1;
      if (t.priority === "urgent" && t.status !== "done") c.urgent += 1;
      if (t.owner === "ben" && t.status !== "done") c.ben += 1;
      if (t.owner === "client" && t.status !== "done") c.client += 1;
    }
    return c;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              Master to-do <span className="text-slate-500 font-normal">· all clients</span>
            </h1>
            <div className="text-[11px] text-slate-500">
              {counts.open} open · {counts.in_progress} in progress · {counts.blocked} blocked
              · {counts.urgent} urgent · {counts.ben} on Ben · {counts.client} on clients
            </div>
          </div>
          <Link
            href="/dashboard/clients"
            className="text-[11px] tracking-wider uppercase font-bold text-slate-400 hover:text-white border border-slate-700 px-2.5 py-1 rounded"
          >
            By client →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-5 pb-32">
        {/* Filter row */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 mb-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title / description / notes…"
              className="flex-1 min-w-[180px] bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm"
            />
            <FacetSelect
              label="Client"
              value={clientFilter}
              onChange={setClientFilter}
              options={pools.clients.map((c) => ({ value: c, label: c }))}
            />
            <FacetSelect
              label="Owner"
              value={ownerFilter}
              onChange={setOwnerFilter}
              options={pools.owners.map((o) => ({ value: o, label: o }))}
            />
            <FacetSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "in_progress", label: "In progress" },
                { value: "pending", label: "Pending" },
                { value: "blocked", label: "Blocked" },
                ...(includeDone
                  ? [
                      { value: "done", label: "Done" },
                      { value: "wont-do", label: "Won't do" },
                    ]
                  : []),
              ]}
            />
            <FacetSelect
              label="Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
            {pools.assignees.length > 0 && (
              <FacetSelect
                label="Assignee"
                value={assigneeFilter}
                onChange={setAssigneeFilter}
                options={pools.assignees.map((a) => ({ value: a, label: a }))}
              />
            )}
            <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDone}
                onChange={(e) => setIncludeDone(e.target.checked)}
              />
              Show done
            </label>
            {anyFilterActive && (
              <button
                onClick={clearAll}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Clear filters ✕
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-500">
            Showing {filtered.length} of {tasks.length} tasks
          </div>
        </div>

        {loading && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-lg">
            <div className="text-4xl mb-2">🎯</div>
            <p>{tasks.length === 0 ? "No tasks anywhere." : "No tasks match these filters."}</p>
          </div>
        )}

        <ul className="space-y-2">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Link
                      href={`/dashboard/clients/${t.client_slug}`}
                      className="text-[10px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                      title="Open client tasks"
                    >
                      {t.client_slug}
                    </Link>
                    <span
                      className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded ${OWNER_COLOR[t.owner] ?? "bg-slate-800 text-slate-300"}`}
                    >
                      {t.owner}
                    </span>
                    <span
                      className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded ${STATUS_COLOR[t.status]}`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    {t.priority !== "medium" && t.priority !== "low" && (
                      <span
                        className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded ${PRIORITY_COLOR[t.priority]}`}
                      >
                        {t.priority}
                      </span>
                    )}
                    {t.assigned_to_name && (
                      <span
                        className="text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        title={t.assigned_to_email ?? undefined}
                      >
                        👤 {t.assigned_to_name}
                      </span>
                    )}
                    {t.category && (
                      <span className="text-[9px] tracking-wider uppercase text-slate-500">
                        {t.category}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-slate-600 tabular-nums">
                      {timeAgo(t.created_at)}
                    </span>
                  </div>
                  <div className="text-[14px] font-semibold text-slate-100 leading-tight">
                    {t.title}
                  </div>
                  {t.description && (
                    <details className="mt-1">
                      <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-300">
                        {t.description.slice(0, 100)}
                        {t.description.length > 100 ? "…" : ""}
                      </summary>
                      <pre className="mt-2 text-[12px] bg-slate-950/60 border border-slate-800 rounded p-2 whitespace-pre-wrap text-slate-300 font-sans">
                        {t.description}
                      </pre>
                    </details>
                  )}
                  {t.notes && (
                    <div className="mt-1 text-[11px] text-amber-300">
                      📝 {t.notes}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function FacetSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "";
  return (
    <label
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 ${
        active ? "border-blue-500/50 bg-blue-500/10" : "border-slate-700 bg-slate-900/40"
      }`}
    >
      <span
        className={`text-[10px] tracking-wider uppercase font-bold ${
          active ? "text-blue-200" : "text-slate-500"
        }`}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[12px] text-slate-200 outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}
