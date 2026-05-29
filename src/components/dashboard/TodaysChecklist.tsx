"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

/**
 * <TodaysChecklist /> — pinned reminders panel.
 *
 * Surfaces every lead whose follow-up reminder is overdue OR scheduled
 * for sometime in the next 24h. Designed to mount at the top of:
 *   - /dashboard/script   (Madie's sales portal — primary surface)
 *   - /dashboard          (Ben's overview)
 *   - /partners/work      (CallWorkspace per-call focus)
 *
 * Data source: GET /api/touches/checklist (returns enriched + sorted
 * rows: overdue-first, then today's upcoming by scheduled time).
 *
 * Actions:
 *   - "Done" → POST /api/prospects/[id]/touches with kind="note",
 *     direction="outbound", notes="Reminder cleared". The new touch
 *     becomes the latest (no next_touch_at) so the reminder falls off
 *     the checklist on next refetch.
 *   - "Snooze 1h / Tomorrow" → POST quick-reminder with bumped time.
 *   - "Open" → navigates to /lead/[id] (full detail page).
 *   - Inline "Add reminder" form at the bottom — picks any prospect
 *     by search and a HH:MM time today (defaults to +2h).
 *
 * Auto-refreshes every 60s so the checklist stays live during a
 * dialing block.
 */

import type { ChecklistRow } from "@/app/api/touches/checklist/route";

type Props = {
  /** Where the operator should land when they click into a lead. The
   *  LeadPicker passes a callback that opens its own drawer instead;
   *  /dashboard + CallWorkspace let the default /lead/[id] route fire. */
  onOpenLead?: (prospectId: string) => void;
  /** Mounting surface label — purely cosmetic ("On your sales portal" vs
   *  "On Ben's overview"). Defaults to nothing. */
  surfaceLabel?: string;
  /** When true, hide the inline add-reminder form (e.g. CallWorkspace
   *  surface — too cramped). Default false. */
  hideAddForm?: boolean;
  /** Polling interval in ms. 0 = never poll. Default 60000 (60s). */
  pollMs?: number;
};

function formatRelative(iso: string, isOverdue: boolean): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const absMin = Math.abs(Math.round(diffMs / 60000));
  if (isOverdue) {
    if (absMin < 60) return `${absMin}m late`;
    const hrs = Math.round(absMin / 60);
    if (hrs < 24) return `${hrs}h late`;
    const days = Math.round(hrs / 24);
    return `${days}d late`;
  }
  if (absMin < 60) return `in ${absMin}m`;
  const hrs = Math.round(absMin / 60);
  if (hrs < 24) return `in ${hrs}h`;
  // Same-day window means this branch is rare, but cover it
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TodaysChecklist({
  onOpenLead,
  surfaceLabel,
  hideAddForm = false,
  pollMs = 60000,
}: Props) {
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/touches/checklist", { cache: "no-store" });
      const j = (await r.json()) as {
        ok?: boolean;
        rows?: ChecklistRow[];
        error?: string;
      };
      if (j.ok && Array.isArray(j.rows)) {
        setRows(j.rows);
        setError(null);
      } else {
        setError(j.error || "Failed to load checklist");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const id = setInterval(() => void load(), pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  const overdueCount = useMemo(
    () => rows.filter((r) => r.isOverdue).length,
    [rows],
  );

  return (
    <section
      className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950 p-5 shadow-[0_0_30px_rgba(245,158,11,0.06)]"
      aria-label="Today's reminders checklist"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white">
            ⏰ Today's reminders
          </h2>
          <p className="text-xs text-amber-200/70 mt-0.5">
            {loading
              ? "Loading…"
              : rows.length === 0
                ? "🎉 No reminders due — you're clear. Set new ones below or from any lead's row."
                : overdueCount > 0
                  ? `${overdueCount} overdue · ${rows.length - overdueCount} due soon`
                  : `${rows.length} due today`}
            {surfaceLabel && (
              <span className="text-amber-200/40"> · {surfaceLabel}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="text-[10px] uppercase tracking-wider font-bold text-amber-300/70 hover:text-amber-200 border border-amber-500/25 rounded px-2.5 py-1.5"
          title="Refresh now"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {rows.length > 0 && (
        <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {rows.map((row) => (
            <ChecklistRowCard
              key={row.touchId}
              row={row}
              onOpenLead={onOpenLead}
              onChange={() => void load()}
            />
          ))}
        </ul>
      )}

      {!hideAddForm && <AddReminderForm onAdded={() => void load()} />}
    </section>
  );
}

/* ─────────────────────────── Row card ─────────────────────────── */

function ChecklistRowCard({
  row,
  onOpenLead,
  onChange,
}: {
  row: ChecklistRow;
  onOpenLead?: (prospectId: string) => void;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState<null | "done" | "snooze">(null);

  const tone = row.isOverdue
    ? "border-rose-500/40 bg-rose-500/[0.06]"
    : "border-amber-500/30 bg-amber-500/[0.04]";

  const timeChipTone = row.isOverdue
    ? "bg-rose-500/15 text-rose-200 border-rose-400/40"
    : "bg-amber-500/15 text-amber-200 border-amber-400/40";

  // "Done" = log a follow-up note touch with no next_touch_at, which
  // becomes the latest touch for the prospect and clears the reminder
  // from /api/touches/checklist on next fetch.
  const markDone = async () => {
    if (busy) return;
    setBusy("done");
    try {
      await fetch(`/api/prospects/${row.prospectId}/touches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "note",
          direction: "outbound",
          notes: "Reminder completed (marked done from today's checklist)",
        }),
      });
      onChange();
    } finally {
      setBusy(null);
    }
  };

  // Snooze = log a new touch that bumps next_touch_at forward by hours.
  const snooze = async (hours: number) => {
    if (busy) return;
    setBusy("snooze");
    try {
      const nextTouchAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      await fetch(`/api/prospects/${row.prospectId}/touches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "note",
          direction: "outbound",
          notes: `Snoozed reminder by ${hours}h`,
          next_touch_at: nextTouchAt,
          next_touch_kind: row.nextTouchKind || "followup_note",
          next_touch_note: row.nextTouchNote || "Follow up",
        }),
      });
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const previewHref = row.shortCode
    ? `https://bluejayportfolio.com/p/${row.shortCode}`
    : `/preview/${row.prospectId}`;

  return (
    <li className={`rounded-lg border px-3 py-2.5 ${tone}`}>
      <div className="flex items-start gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (onOpenLead) onOpenLead(row.prospectId);
                else window.open(`/lead/${row.prospectId}`, "_self");
              }}
              className="text-sm font-bold text-white hover:text-amber-200 text-left"
              title="Open this lead"
            >
              {row.businessName}
            </button>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border tabular-nums ${timeChipTone}`}
              title={`Scheduled: ${new Date(row.nextTouchAt).toLocaleString()}`}
            >
              {formatRelative(row.nextTouchAt, row.isOverdue)} · {formatClock(row.nextTouchAt)}
            </span>
            {row.nextTouchKind && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {row.nextTouchKind.replace(/_/g, " ")}
              </span>
            )}
            {row.byUser && (
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                by {row.byUser}
              </span>
            )}
          </div>
          {row.nextTouchNote && (
            <p className="text-xs text-slate-200 mt-1 break-words">
              {row.nextTouchNote}
            </p>
          )}
          <p className="text-[11px] text-muted leading-tight mt-1 truncate">
            {[
              row.phone,
              row.email,
              row.city && row.state ? `${row.city}, ${row.state}` : null,
              row.status,
            ]
              .filter(Boolean)
              .join(" · ") || "no contact info"}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {row.phone && (
            <a
              href={`tel:${row.phone}`}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              title={`Call ${row.phone}`}
            >
              📞 Call
            </a>
          )}
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
            title="Open preview site"
          >
            🔗 Preview
          </a>
          <button
            type="button"
            onClick={() => void snooze(1)}
            disabled={busy !== null}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-slate-500/40 text-slate-300 hover:bg-slate-500/10 disabled:opacity-40"
            title="Snooze 1 hour"
          >
            +1h
          </button>
          <button
            type="button"
            onClick={() => void snooze(24)}
            disabled={busy !== null}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-slate-500/40 text-slate-300 hover:bg-slate-500/10 disabled:opacity-40"
            title="Snooze until tomorrow"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => void markDone()}
            disabled={busy !== null}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-40"
            title="Mark this reminder done"
          >
            ✓ Done
          </button>
        </div>
      </div>
    </li>
  );
}

/* ────────────────────── Add reminder form ────────────────────── */

type ProspectLite = {
  id: string;
  businessName: string;
  city: string | null;
  state: string | null;
  phone: string | null;
};

function AddReminderForm({ onAdded }: { onAdded: () => void }) {
  // Search-as-you-type autocomplete against /api/prospects with a small
  // client-side filter. Keeps things simple — Madie has ~1500 prospects;
  // a single fetch + in-memory filter is fine.
  const [allProspects, setAllProspects] = useState<ProspectLite[]>([]);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<ProspectLite | null>(null);
  // Default reminder time = today +2 hours, rounded to the next 15min.
  const [timeInput, setTimeInput] = useState<string>(() => {
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    return d.toTimeString().slice(0, 5); // HH:MM
  });
  const [dateInput, setDateInput] = useState<string>(() => {
    // YYYY-MM-DD in local time
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [kind, setKind] = useState<
    "call" | "text" | "email" | "meeting" | "followup_note"
  >("call");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prospects", { credentials: "include" })
      .then((r) => r.json())
      .then(
        (j: {
          prospects?: Array<{
            id: string;
            businessName?: string;
            city?: string;
            state?: string;
            phone?: string;
          }>;
        }) => {
          const list: ProspectLite[] = (j.prospects || []).map((p) => ({
            id: p.id,
            businessName: p.businessName || "(no name)",
            city: p.city ?? null,
            state: p.state ?? null,
            phone: p.phone ?? null,
          }));
          setAllProspects(list);
        },
      )
      .catch(() => setAllProspects([]));
  }, []);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allProspects
      .filter((p) => p.businessName.toLowerCase().includes(q))
      .slice(0, 6);
  }, [search, allProspects]);

  const submit = async () => {
    setMsg(null);
    if (!picked) {
      setMsg("Pick a lead first.");
      return;
    }
    if (!dateInput || !timeInput) {
      setMsg("Pick a date + time.");
      return;
    }
    // Compose local-time ISO. The HTML time input is local-clock, so
    // build the ISO by concatenating and parsing as local.
    const local = new Date(`${dateInput}T${timeInput}:00`);
    if (isNaN(local.getTime())) {
      setMsg("Invalid date/time.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/touches/quick-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: picked.id,
          nextTouchAt: local.toISOString(),
          nextTouchKind: kind,
          nextTouchNote: note.trim() || undefined,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (j.ok) {
        setMsg(`✓ Reminder set for ${picked.businessName}`);
        setPicked(null);
        setSearch("");
        setNote("");
        onAdded();
        setTimeout(() => setMsg(null), 2500);
      } else {
        setMsg(j.error || "Failed to set reminder");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-amber-500/20 bg-slate-950/60 p-3">
      <p className="text-[10px] uppercase tracking-wider font-bold text-amber-300/80 mb-2">
        + Add a daily reminder
      </p>
      <div className="space-y-2">
        {/* Lead picker */}
        <div className="relative">
          <input
            type="text"
            value={picked ? picked.businessName : search}
            onChange={(e) => {
              setPicked(null);
              setSearch(e.target.value);
            }}
            placeholder="Lead name… (type 2+ letters)"
            className="w-full h-9 px-3 rounded-md bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
          />
          {suggestions.length > 0 && !picked && (
            <ul className="absolute left-0 right-0 mt-1 bg-slate-900 border border-amber-500/30 rounded-md max-h-56 overflow-y-auto z-30 shadow-xl">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(s);
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-amber-500/10 text-sm text-white"
                  >
                    <p className="font-semibold">{s.businessName}</p>
                    <p className="text-[10px] text-slate-400">
                      {[s.city && s.state ? `${s.city}, ${s.state}` : null, s.phone]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date + time + kind */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="h-9 px-2 rounded-md bg-slate-900 border border-slate-700 text-sm text-white"
          />
          <input
            type="time"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="h-9 px-2 rounded-md bg-slate-900 border border-slate-700 text-sm text-white"
          />
          <select
            value={kind}
            onChange={(e) =>
              setKind(
                e.target.value as
                  | "call"
                  | "text"
                  | "email"
                  | "meeting"
                  | "followup_note",
              )
            }
            className="h-9 px-2 rounded-md bg-slate-900 border border-slate-700 text-sm text-white"
            title="What kind of follow-up?"
          >
            <option value="call">📞 Call</option>
            <option value="text">💬 Text</option>
            <option value="email">✉️ Email</option>
            <option value="meeting">🤝 Meeting</option>
            <option value="followup_note">📝 Follow-up note</option>
          </select>
        </div>

        {/* Note */}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why? (e.g. 'call back about pricing')"
          maxLength={200}
          className="w-full h-9 px-3 rounded-md bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500"
        />

        <div className="flex items-center justify-between gap-3">
          <p className={`text-xs ${msg?.startsWith("✓") ? "text-emerald-300" : "text-amber-300"}`}>
            {msg || ""}
          </p>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || !picked}
            className="h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Saving…" : "Set reminder"}
          </button>
        </div>

        <p className="text-[10px] text-slate-500 mt-1">
          Tip: also set reminders from any lead's <Link href="/dashboard/script" className="text-amber-400 hover:underline">⏰ Later</Link> button.
        </p>
      </div>
    </div>
  );
}
