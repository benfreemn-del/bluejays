"use client";

import { useEffect, useState } from "react";

/**
 * MadieTodoList — editable to-do list pinned to Madie's overview.
 *
 * Per Ben's spec 2026-05-08:
 *   · add / edit / remove line by line
 *   · click the circle on the LEFT to toggle done
 *   · visual cross-off when complete (strikethrough + dim)
 *   · plain list, no priorities / due-dates / assignees — Madie wanted
 *     a clean editable list, not a project tracker
 *
 * Data: madie_tasks table. CRUD via /api/madie/tasks + /[id].
 * Open items render first; completed items render below with the
 * cross-off styling so she can see what she crushed today without
 * deleting it (psychological win — survives until she clears it).
 */

type Task = {
  id: string;
  content: string;
  done: boolean;
  done_at: string | null;
  sort_order: number;
  created_at: string;
};

export default function MadieTodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");

  const load = async () => {
    try {
      const r = await fetch("/api/madie/tasks", { credentials: "include" });
      const j = (await r.json()) as { ok: boolean; tasks?: Task[] };
      if (j.ok && j.tasks) setTasks(j.tasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    // Optimistic insert at the bottom of the open list
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Task = {
      id: tempId,
      content,
      done: false,
      done_at: null,
      sort_order: 9999,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, optimistic]);
    try {
      const r = await fetch("/api/madie/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const j = (await r.json()) as { ok: boolean; task?: Task };
      if (j.ok && j.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? (j.task as Task) : t)),
        );
      } else {
        // rollback
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const toggle = async (task: Task) => {
    const next = !task.done;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, done: next, done_at: next ? new Date().toISOString() : null }
          : t,
      ),
    );
    await fetch(`/api/madie/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ done: next }),
    });
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingDraft(task.content);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const content = editingDraft.trim();
    if (!content) {
      setEditingId(null);
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, content } : t)),
    );
    await fetch(`/api/madie/tasks/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    setEditingId(null);
    setEditingDraft("");
  };

  const remove = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/madie/tasks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <section
      className="rounded-2xl border border-pink-500/25 bg-gradient-to-br from-pink-950/30 via-slate-900/60 to-slate-950 p-5 shadow-[0_0_30px_rgba(236,72,153,0.08)]"
      aria-label="Madie's to-do list"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white">
            Today's checklist
          </h2>
          <p className="text-xs text-pink-200/60 mt-0.5">
            {open.length === 0
              ? done.length > 0
                ? `🔥 ${done.length} crushed today — add another or take a breath`
                : "Add what you're knocking out today. One line each."
              : `${open.length} open · ${done.length} done`}
          </p>
        </div>
      </div>

      {/* Add new */}
      <form
        className="flex items-center gap-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <span className="w-6 h-6 shrink-0 rounded-full border-2 border-dashed border-pink-500/40 flex items-center justify-center text-pink-400 text-sm">
          +
        </span>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task and hit Enter…"
          className="flex-1 bg-slate-900/70 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/60"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-400 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      {/* Open items */}
      {loading && tasks.length === 0 && (
        <p className="text-sm text-slate-500 italic px-2 py-3">Loading…</p>
      )}

      <ul className="space-y-1">
        {open.map((task) => (
          <TodoRow
            key={task.id}
            task={task}
            isEditing={editingId === task.id}
            editingDraft={editingDraft}
            onToggle={() => toggle(task)}
            onStartEdit={() => startEdit(task)}
            onChangeEdit={setEditingDraft}
            onSaveEdit={saveEdit}
            onCancelEdit={() => {
              setEditingId(null);
              setEditingDraft("");
            }}
            onRemove={() => remove(task.id)}
          />
        ))}
      </ul>

      {/* Done items — visual cross-off, kept until manually removed */}
      {done.length > 0 && (
        <>
          <div className="mt-5 mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-pink-300/60 font-bold">
            <span>Crushed</span>
            <span className="flex-1 h-px bg-pink-500/15" />
            <span>{done.length}</span>
          </div>
          <ul className="space-y-1">
            {done.map((task) => (
              <TodoRow
                key={task.id}
                task={task}
                isEditing={false}
                editingDraft=""
                onToggle={() => toggle(task)}
                onStartEdit={() => startEdit(task)}
                onChangeEdit={() => {}}
                onSaveEdit={() => {}}
                onCancelEdit={() => {}}
                onRemove={() => remove(task.id)}
              />
            ))}
          </ul>
        </>
      )}

      {!loading && tasks.length === 0 && (
        <p className="text-sm text-slate-500 italic px-2 py-6 text-center">
          Empty list. Type above ↑ to add your first one.
        </p>
      )}
    </section>
  );
}

function TodoRow({
  task,
  isEditing,
  editingDraft,
  onToggle,
  onStartEdit,
  onChangeEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: {
  task: Task;
  isEditing: boolean;
  editingDraft: string;
  onToggle: () => void;
  onStartEdit: () => void;
  onChangeEdit: (s: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      className={`flex items-center gap-2 rounded-md py-2 px-2 group transition-colors ${
        task.done ? "opacity-50" : "hover:bg-slate-900/50"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={task.done ? "Mark not done" : "Mark done"}
        title={task.done ? "Mark not done" : "Click to complete"}
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.done
            ? "border-pink-400 bg-pink-500 text-white"
            : "border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/10"
        }`}
      >
        {task.done && (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414l2.793 2.793 6.793-6.793a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isEditing ? (
        <input
          autoFocus
          value={editingDraft}
          onChange={(e) => onChangeEdit(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit();
            if (e.key === "Escape") onCancelEdit();
          }}
          className="flex-1 bg-slate-900/70 border border-pink-500/40 rounded px-2 py-1 text-sm text-white focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          className={`flex-1 text-left text-sm leading-snug px-1 py-1 rounded hover:bg-slate-900/40 ${
            task.done ? "line-through text-slate-400" : "text-white"
          }`}
        >
          {task.content}
        </button>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Delete task"
        title="Delete"
        className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 text-base px-2 py-1 transition-opacity"
      >
        ✕
      </button>
    </li>
  );
}
