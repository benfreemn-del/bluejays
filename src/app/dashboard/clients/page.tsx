"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clientSiteFor } from "@/lib/client-site-urls";

/**
 * /dashboard/clients
 *
 * Index of every client that has open tasks OR is snoozed for
 * follow-up. One row per client_slug. Locked features
 * 2026-05-09:
 *
 *   - Multi-select checkboxes + bulk toolbar with "Mark all done"
 *   - Per-row "Mark all done" button (single-client shortcut)
 *   - Per-row neon-blue snooze toggle (bottom-right) — opens
 *     calendar picker; flips row to neon-blue ring; cron at
 *     /api/client-tasks/check-reminders fires SMS+email at the
 *     chosen moment.
 *   - Snoozed rows render with a bright neon-blue accent
 *     (electric-cyan) and a "snoozed until {date}" badge.
 */

type ClientSummary = {
  client_slug: string;
  open_count: number;
  done_count: number;
  snoozed: boolean;
  snooze_reason: string | null;
  snooze_until: string | null;
  snooze_notes: string | null;
};

const SNOOZE_REASONS: { value: string; label: string }[] = [
  { value: "interested_10k", label: "Interested in $10k AI System — check back" },
  { value: "awaiting_decision", label: "Awaiting their decision" },
  { value: "needs_budget", label: "Waiting on budget approval" },
  { value: "next_quarter", label: "Wants to revisit next quarter" },
  { value: "manual", label: "Other / manual" },
];

function formatLocalDate(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Default snooze: 14 days from now at 10am local. */
function defaultSnoozeISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  d.setHours(10, 0, 0, 0);
  // Convert local-time Date → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert <input type="datetime-local"> value → ISO UTC string. */
function localInputToISO(local: string): string {
  // The browser interprets datetime-local as local time, so the Date
  // constructor here naturally handles the offset.
  return new Date(local).toISOString();
}

export default function ClientsIndexPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [snoozingSlug, setSnoozingSlug] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const reload = async () => {
    const r = await fetch("/api/client-tasks");
    const j = (await r.json()) as { ok: boolean; clients?: ClientSummary[] };
    if (j.ok && j.clients) setClients(j.clients);
  };

  useEffect(() => {
    (async () => {
      await reload();
      setLoading(false);
    })();
  }, []);

  const allSelected = useMemo(() => {
    const eligible = clients.filter((c) => c.open_count > 0).map((c) => c.client_slug);
    return eligible.length > 0 && eligible.every((s) => selected.has(s));
  }, [clients, selected]);

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.filter((c) => c.open_count > 0).map((c) => c.client_slug)));
    }
  }

  async function bulkComplete() {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Mark ALL open tasks done for ${selected.size} client${selected.size === 1 ? "" : "s"}? This is reversible per-task but verbose to undo.`,
      )
    ) {
      return;
    }
    setBulkBusy(true);
    try {
      const res = await fetch("/api/client-tasks/bulk-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_slugs: Array.from(selected) }),
      });
      const j = await res.json();
      if (j.ok) {
        setSelected(new Set());
        await reload();
      } else {
        alert(`Bulk complete failed: ${j.error ?? "unknown"}`);
      }
    } finally {
      setBulkBusy(false);
    }
  }

  async function completeOne(slug: string) {
    if (!confirm(`Mark all open tasks done for ${slug}?`)) return;
    setBusySlug(slug);
    try {
      const res = await fetch("/api/client-tasks/bulk-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_slugs: [slug] }),
      });
      const j = await res.json();
      if (j.ok) await reload();
      else alert(`Failed: ${j.error ?? "unknown"}`);
    } finally {
      setBusySlug(null);
    }
  }

  async function unsnooze(slug: string) {
    setBusySlug(slug);
    try {
      const res = await fetch("/api/client-tasks/snooze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_slug: slug, snoozeUntil: null }),
      });
      const j = await res.json();
      if (j.ok) await reload();
      else alert(`Failed: ${j.error ?? "unknown"}`);
    } finally {
      setBusySlug(null);
    }
  }

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

        {/* Sub-header: select-all + bulk-action toolbar */}
        {clients.length > 0 && (
          <div className="border-t border-slate-800/70 bg-slate-950/60">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
              <button
                onClick={toggleSelectAll}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {allSelected ? "☑ Clear all" : "☐ Select all open"}
              </button>
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-semibold">
                    {selected.size} selected
                  </span>
                  <button
                    onClick={bulkComplete}
                    disabled={bulkBusy}
                    className="rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 font-semibold disabled:opacity-50"
                  >
                    {bulkBusy ? "Completing…" : "✓ Mark all done"}
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-slate-500 hover:text-white"
                  >
                    Clear ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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
              Each row links into that client&apos;s job board.
            </div>
          </div>
        )}

        <div className="space-y-2">
          {clients.map((c) => {
            const allDone = c.open_count === 0 && c.done_count > 0 && !c.snoozed;
            const site = clientSiteFor(c.client_slug);
            const isSelected = selected.has(c.client_slug);

            // Snooze styling — neon-blue ring + soft cyan tint
            const wrapperClass = c.snoozed
              ? "border-cyan-400/70 bg-cyan-500/10 ring-2 ring-cyan-400/60 hover:bg-cyan-500/15"
              : isSelected
                ? "border-blue-500/60 bg-blue-950/30 ring-1 ring-blue-500/40"
                : allDone
                  ? "border-emerald-700/40 bg-emerald-900/15 hover:border-emerald-600/60 hover:bg-emerald-900/25"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900";

            return (
              <div
                key={c.client_slug}
                className={`relative rounded-lg border p-4 transition ${wrapperClass}`}
              >
                <div className="flex items-center gap-3">
                  {/* Selection checkbox — only meaningful for rows
                      with open tasks (you can't bulk-complete a row
                      that has no open tasks). */}
                  {c.open_count > 0 ? (
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center cursor-pointer"
                      title="Select for bulk action"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.client_slug)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                      />
                    </label>
                  ) : (
                    <div className="w-4" aria-hidden />
                  )}

                  <Link
                    href={`/dashboard/clients/${c.client_slug}`}
                    className="flex-1 min-w-0 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold tracking-tight truncate flex items-center gap-2">
                        {c.snoozed && (
                          <span
                            aria-label="snoozed for follow-up"
                            className="text-cyan-300 text-base leading-none"
                            title={`Snoozed until ${formatLocalDate(c.snooze_until)}`}
                          >
                            🔵
                          </span>
                        )}
                        {allDone && !c.snoozed && (
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
                          c.snoozed
                            ? "text-cyan-300/90"
                            : allDone
                              ? "text-emerald-400/80"
                              : "text-slate-500"
                        }`}
                      >
                        {c.snoozed
                          ? `🔔 Reminder: ${formatLocalDate(c.snooze_until)}${
                              c.snooze_reason
                                ? ` · ${SNOOZE_REASONS.find((r) => r.value === c.snooze_reason)?.label ?? c.snooze_reason}`
                                : ""
                            }`
                          : allDone
                            ? `All ${c.done_count} tasks done · live`
                            : `${c.open_count} open task${c.open_count === 1 ? "" : "s"}`}
                      </div>
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        c.snoozed
                          ? "bg-cyan-500/30 text-cyan-200"
                          : allDone
                            ? "bg-emerald-500/20 text-emerald-300"
                            : c.open_count > 10
                              ? "bg-rose-500/20 text-rose-300"
                              : c.open_count > 5
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {c.snoozed ? "🔵" : allDone ? "✓" : c.open_count}
                    </div>
                  </Link>

                  {site.kind !== "none" && (
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

                {/* Bottom-right action bar — per-row complete + snooze toggle */}
                <div className="mt-3 flex justify-end items-center gap-2">
                  {c.open_count > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeOne(c.client_slug);
                      }}
                      disabled={busySlug === c.client_slug}
                      className="text-[10px] tracking-wider uppercase font-bold rounded border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/30 hover:text-white px-2 py-1 transition disabled:opacity-50"
                      title="Mark all open tasks done"
                    >
                      {busySlug === c.client_slug ? "…" : "✓ Done all"}
                    </button>
                  )}

                  {c.snoozed ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unsnooze(c.client_slug);
                      }}
                      disabled={busySlug === c.client_slug}
                      className="text-[10px] tracking-wider uppercase font-bold rounded border border-cyan-400/60 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 px-2 py-1 transition disabled:opacity-50"
                      title="Clear snooze"
                    >
                      🔵 Unsnooze
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSnoozingSlug(c.client_slug);
                      }}
                      className="text-[10px] tracking-wider uppercase font-bold rounded border border-cyan-700/50 text-cyan-300 hover:border-cyan-400/70 hover:bg-cyan-500/10 hover:text-white px-2 py-1 transition"
                      title="Interested but check back later"
                    >
                      🔵 Snooze
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Snooze modal — date+time + reason picker */}
      {snoozingSlug && (
        <SnoozeModal
          slug={snoozingSlug}
          onClose={() => setSnoozingSlug(null)}
          onSaved={async () => {
            setSnoozingSlug(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// SnoozeModal — date+time picker + reason + notes. Posts to
// /api/client-tasks/snooze. Closes on success or cancel.
// ───────────────────────────────────────────────────────────────────
function SnoozeModal({
  slug,
  onClose,
  onSaved,
}: {
  slug: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [when, setWhen] = useState<string>(defaultSnoozeISO());
  const [reason, setReason] = useState<string>("interested_10k");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const isoUtc = localInputToISO(when);
      const res = await fetch("/api/client-tasks/snooze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_slug: slug,
          snoozeUntil: isoUtc,
          reason,
          notes: notes.trim() || null,
        }),
      });
      const j = await res.json();
      if (!j.ok) {
        setError(j.error ?? "Failed to save");
        return;
      }
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border-2 border-cyan-400/70 bg-slate-950 p-6 shadow-2xl shadow-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🔵</span>
          <h2 className="text-lg font-bold">Snooze for follow-up</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          <code className="text-cyan-300">{slug}</code> · we&apos;ll text + email you to reach out
          again at the time you pick.
        </p>

        <label className="block mb-3">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Reason
          </span>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 text-sm px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            {SNOOZE_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-3">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Remind me on
          </span>
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 text-sm px-3 py-2 focus:border-cyan-500 focus:outline-none"
          />
          <span className="block mt-1 text-[11px] text-slate-500">
            Local time. Cron checks every 15 min.
          </span>
        </label>

        <label className="block mb-4">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Notes (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What you discussed, what to ask next…"
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 text-sm px-3 py-2 focus:border-cyan-500 focus:outline-none resize-none"
          />
        </label>

        {error && (
          <div className="mb-3 rounded border border-rose-700/50 bg-rose-900/20 text-rose-200 text-xs px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-2 text-sm transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg border border-cyan-400/70 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30 px-4 py-2 text-sm font-bold transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "🔵 Snooze + remind me"}
          </button>
        </div>
      </div>
    </div>
  );
}
