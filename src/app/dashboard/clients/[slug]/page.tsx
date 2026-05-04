"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import type {
  ClientTask,
  ClientTaskCategory,
  ClientTaskOwner,
  ClientTaskPriority,
  ClientTaskStatus,
} from "@/lib/client-tasks";

/**
 * /dashboard/clients/[slug]
 *
 * Mobile-first per-client task board. Designed for Ben to glance at from
 * his phone while on a job site — large tap targets, no horizontal scroll,
 * status flips are one-tap.
 *
 * Data flow:
 *   GET   /api/client-tasks?client=zenith-sports
 *   PATCH /api/client-tasks/[id] for any in-place edit
 *   POST  /api/client-tasks for "Add task" form
 */

const STATUS_ORDER: ClientTaskStatus[] = [
  "in_progress",
  "blocked",
  "pending",
  "done",
  "wont-do",
];
const STATUS_LABEL: Record<ClientTaskStatus, string> = {
  pending: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
  "wont-do": "Won't do",
};
const STATUS_COLOR: Record<ClientTaskStatus, string> = {
  pending: "border-slate-700 bg-slate-900/50",
  in_progress: "border-blue-500/50 bg-blue-950/40",
  blocked: "border-rose-500/50 bg-rose-950/40",
  done: "border-emerald-500/40 bg-emerald-950/30 opacity-60",
  "wont-do": "border-slate-800 bg-slate-950/60 opacity-50",
};
const PRIORITY_COLOR: Record<ClientTaskPriority, string> = {
  urgent: "bg-rose-500 text-white",
  high: "bg-amber-500 text-amber-950",
  medium: "bg-slate-700 text-slate-200",
  low: "bg-slate-800 text-slate-400",
};
const CATEGORY_LABEL: Record<ClientTaskCategory, string> = {
  decision: "💭 Decision",
  asset: "📦 Asset",
  build: "🔧 Build",
  "client-action": "👤 Client",
  reminder: "🔔 Reminder",
};
const OWNER_LABEL: Record<ClientTaskOwner, string> = {
  ben: "Ben",
  client: "Client",
  claude: "Claude",
  external: "External",
};

export default function ClientTasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [filter, setFilter] = useState<"all" | ClientTaskCategory>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(
      `/api/client-tasks?client=${encodeURIComponent(slug)}${includeCompleted ? "&includeCompleted=1" : ""}`,
    );
    const j = (await r.json()) as { ok: boolean; tasks?: ClientTask[] };
    if (j.ok && j.tasks) setTasks(j.tasks);
    setLoading(false);
  }, [slug, includeCompleted]);

  useEffect(() => {
    load();
  }, [load]);

  const updateTask = async (id: string, patch: Partial<ClientTask>) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
    await fetch(`/api/client-tasks/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  };

  const createTask = async (form: {
    title: string;
    description?: string;
    category: ClientTaskCategory;
    priority: ClientTaskPriority;
    owner: ClientTaskOwner;
  }) => {
    await fetch("/api/client-tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ client_slug: slug, ...form }),
    });
    setShowNewForm(false);
    load();
  };

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.category === filter);

  // Group by status
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    items: filteredTasks.filter((t) => t.status === status),
  })).filter((g) => g.items.length > 0);

  const totalOpen = tasks.filter(
    (t) => t.status !== "done" && t.status !== "wont-do",
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header — mobile-first, sticky */}
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              {slug}
            </h1>
            <div className="text-[11px] text-slate-500">
              {totalOpen} open · {tasks.length - totalOpen} done
            </div>
          </div>
          <Link
            href={`/dashboard/clients/${slug}/leads`}
            className="text-[11px] tracking-wider uppercase font-bold text-cyan-300 hover:text-white border border-cyan-700/50 px-2.5 py-1 rounded"
          >
            Leads
          </Link>
          <Link
            href={`/dashboard/clients/${slug}/ads`}
            className="text-[11px] tracking-wider uppercase font-bold text-violet-300 hover:text-white border border-violet-700/50 px-2.5 py-1 rounded"
          >
            Ads
          </Link>
          <Link
            href={`/dashboard/clients/${slug}/affiliates`}
            className="text-[11px] tracking-wider uppercase font-bold text-amber-300 hover:text-white border border-amber-700/50 px-2.5 py-1 rounded"
          >
            Affiliates
          </Link>
          <Link
            href={`/dashboard/clients/${slug}/insights`}
            className="text-[11px] tracking-wider uppercase font-bold text-violet-300 hover:text-white border border-violet-700/50 px-2.5 py-1 rounded"
            title="Hyperloop variant analysis + subscriptions"
          >
            Insights
          </Link>
          <Link
            href={`/dashboard/clients/${slug}/reports`}
            className="text-[11px] tracking-wider uppercase font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2.5 py-1 rounded"
          >
            Report
          </Link>
          <Link
            href={`/clients/${slug}`}
            target="_blank"
            className="text-[11px] tracking-wider uppercase font-bold text-slate-400 hover:text-white border border-slate-700 px-2.5 py-1 rounded"
          >
            Site ↗
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-5 pb-32">
        {/* Filters + add */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm"
          >
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_LABEL) as ClientTaskCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
              className="accent-blue-500"
            />
            Show done
          </label>
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="ml-auto bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-3 py-1.5 rounded"
          >
            {showNewForm ? "Cancel" : "+ Task"}
          </button>
        </div>

        {showNewForm && (
          <NewTaskForm onSubmit={createTask} onCancel={() => setShowNewForm(false)} />
        )}

        {loading && tasks.length === 0 && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            <div className="text-4xl mb-2">📋</div>
            No tasks yet for {slug}.
          </div>
        )}

        {byStatus.map((group) => (
          <section key={group.status} className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 px-1">
              {STATUS_LABEL[group.status]} · {group.items.length}
            </h2>
            <div className="space-y-2">
              {group.items.map((t) => (
                <TaskCard key={t.id} task={t} onUpdate={updateTask} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function TaskCard({
  task,
  onUpdate,
}: {
  task: ClientTask;
  onUpdate: (id: string, patch: Partial<ClientTask>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notesDraft, setNotesDraft] = useState(task.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const cycleStatus = () => {
    const next: Record<ClientTaskStatus, ClientTaskStatus> = {
      pending: "in_progress",
      in_progress: "done",
      blocked: "in_progress",
      done: "pending",
      "wont-do": "pending",
    };
    onUpdate(task.id, { status: next[task.status] });
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await onUpdate(task.id, { notes: notesDraft });
    setSavingNotes(false);
  };

  return (
    <article
      className={`rounded-lg border ${STATUS_COLOR[task.status]} transition`}
    >
      <div className="p-3 sm:p-4 flex items-start gap-3">
        {/* Status checkbox */}
        <button
          onClick={cycleStatus}
          aria-label={`Cycle status (currently ${task.status})`}
          className={`mt-0.5 shrink-0 w-7 h-7 rounded-md border-2 flex items-center justify-center text-xs font-bold transition ${
            task.status === "done"
              ? "border-emerald-400 bg-emerald-500 text-white"
              : task.status === "in_progress"
                ? "border-blue-400 bg-blue-500/20 text-blue-300"
                : task.status === "blocked"
                  ? "border-rose-500 bg-rose-500/20 text-rose-300"
                  : "border-slate-600 hover:border-slate-400"
          }`}
        >
          {task.status === "done"
            ? "✓"
            : task.status === "in_progress"
              ? "▶"
              : task.status === "blocked"
                ? "⏸"
                : ""}
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-start gap-2 flex-wrap">
            <span className="font-semibold text-[15px] leading-snug">
              {task.title}
            </span>
            <span
              className={`text-[9px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded ${PRIORITY_COLOR[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap text-[10px] text-slate-400">
            <span>{CATEGORY_LABEL[task.category]}</span>
            <span>·</span>
            <span>{OWNER_LABEL[task.owner]}</span>
            {task.blocked_on && (
              <>
                <span>·</span>
                <span className="text-rose-300">⚠ {task.blocked_on}</span>
              </>
            )}
            {task.notes && (
              <>
                <span>·</span>
                <span className="text-slate-500">📝 has notes</span>
              </>
            )}
          </div>
        </button>
      </div>

      {expanded && (
        <div className="px-3 sm:px-4 pb-3 pt-0 border-t border-slate-800/60 space-y-3">
          {task.description && (
            <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          )}

          {/* Quick actions */}
          <div className="flex flex-wrap gap-1.5">
            {(["pending", "in_progress", "blocked", "done", "wont-do"] as ClientTaskStatus[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => onUpdate(task.id, { status: s })}
                  disabled={task.status === s}
                  className={`text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded border transition ${
                    task.status === s
                      ? "bg-slate-700 border-slate-600 text-white cursor-default"
                      : "border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Priority:</span>
            {(["urgent", "high", "medium", "low"] as ClientTaskPriority[]).map((p) => (
              <button
                key={p}
                onClick={() => onUpdate(task.id, { priority: p })}
                disabled={task.priority === p}
                className={`text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded transition ${
                  task.priority === p
                    ? PRIORITY_COLOR[p] + " cursor-default"
                    : "border border-slate-700 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
              Notes / running thread
            </label>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={3}
              placeholder="Add a note (saves on Save)…"
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-[13px] text-slate-200 leading-relaxed"
            />
            {notesDraft !== (task.notes ?? "") && (
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="mt-1.5 text-[11px] font-bold bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {savingNotes ? "Saving…" : "Save notes"}
              </button>
            )}
          </div>

          <div className="text-[10px] text-slate-600">
            Created {new Date(task.created_at).toLocaleDateString()} · Updated{" "}
            {new Date(task.updated_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </article>
  );
}

function NewTaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (form: {
    title: string;
    description?: string;
    category: ClientTaskCategory;
    priority: ClientTaskPriority;
    owner: ClientTaskOwner;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ClientTaskCategory>("build");
  const [priority, setPriority] = useState<ClientTaskPriority>("medium");
  const [owner, setOwner] = useState<ClientTaskOwner>("ben");

  return (
    <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-950/20 p-4 space-y-3">
      <input
        type="text"
        placeholder="Title (imperative — e.g. 'Record voicemail clips')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm"
        autoFocus
      />
      <textarea
        placeholder="Description / context (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ClientTaskCategory)}
          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm"
        >
          {(Object.keys(CATEGORY_LABEL) as ClientTaskCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as ClientTaskPriority)}
          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm"
        >
          {(["urgent", "high", "medium", "low"] as ClientTaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value as ClientTaskOwner)}
          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm"
        >
          {(Object.keys(OWNER_LABEL) as ClientTaskOwner[]).map((o) => (
            <option key={o} value={o}>
              {OWNER_LABEL[o]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!title.trim()) return;
            onSubmit({ title: title.trim(), description: description.trim() || undefined, category, priority, owner });
          }}
          disabled={!title.trim()}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-4 py-2 rounded disabled:opacity-50"
        >
          Create task
        </button>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white text-sm px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
