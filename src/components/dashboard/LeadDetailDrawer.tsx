"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TouchTimeline from "@/components/dashboard/TouchTimeline";
import { getLeadOrigin } from "@/lib/lead-origin";
import type { Prospect } from "@/lib/types";

/**
 * <LeadDetailDrawer /> — right-side slide-in panel showing everything an
 * operator needs about a lead WITHOUT leaving the LeadPicker page.
 *
 * Per Ben's spec 2026-05-28: when Madie clicks a lead from the Sales
 * Portal, this drop-down should expose every note she's saved + full
 * touch history + quick contact + booking link.
 *
 * Renders nothing when `prospectId` is null. Closes on backdrop click or
 * Escape. Re-fetches notes + touches each time it opens.
 *
 * Pairs with TodaysChecklist (which calls `onOpenLead(prospectId)` →
 * setState on the LeadPicker that hydrates this drawer).
 */

type Note = {
  id: string;
  text: string;
  createdAt: string;
};

type ProspectSummary = {
  id: string;
  businessName: string;
  ownerName: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  shortCode: string | null;
  category: string | null;
  currentWebsite: string | null;
  generatedSiteUrl: string | null;
  /** ISO timestamp set when Madie 📍Saved the lead — null = not saved.
   *  Drives the Save/Unsave toggle in the drawer's quick-action bar. */
  savedAt?: string | null;
  // Origin signals — feed getLeadOrigin() for the "where did this lead
  // come from" subtitle. Optional; the helper falls back gracefully.
  source?: string | null;
  lookalikeCategory?: string | null;
  scrapedData?: Record<string, unknown> | null;
  createdAt?: string | null;
};

type Props = {
  prospectId: string | null;
  /** Optional preloaded summary so the drawer can render instantly while
   *  notes + touches stream in. */
  summary?: ProspectSummary | null;
  onClose: () => void;
  /** Bumping this triggers a re-fetch (e.g. after the parent logs a new
   *  touch elsewhere). */
  refreshKey?: number;
};

export default function LeadDetailDrawer({
  prospectId,
  summary,
  onClose,
  refreshKey = 0,
}: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [touchBump, setTouchBump] = useState(0);
  const [fetchedSummary, setFetchedSummary] = useState<ProspectSummary | null>(
    null,
  );
  // Local mirror of saved_at so the 📍Save toggle flips instantly. Resets
  // whenever the underlying summary changes (parent passed a fresher row,
  // or the drawer just re-fetched).
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [savingFlag, setSavingFlag] = useState(false);
  // Tab inside the History section — "notes" = Madie's freeform notes,
  // "touches" = the structured prospect_touches timeline (calls, texts,
  // emails, DMs). Sits in the same section so she sees one history
  // surface but can pick which slice to view. Defaults to Notes since
  // that's what she edits most often.
  const [historyTab, setHistoryTab] = useState<"notes" | "touches">("notes");

  // Reload notes + (optionally) prospect summary when the drawer opens or
  // the parent bumps refreshKey.
  useEffect(() => {
    if (!prospectId) return;
    let cancelled = false;

    setLoadingNotes(true);
    void fetch(`/api/notes/${prospectId}`)
      .then((r) => r.json())
      .then((j: { notes?: Note[] }) => {
        if (cancelled) return;
        setNotes(
          (j.notes || []).sort((a, b) =>
            (b.createdAt || "").localeCompare(a.createdAt || ""),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingNotes(false);
      });

    // If the parent didn't pass a summary, fetch it. Cheap one-row read.
    if (!summary) {
      void fetch(`/api/prospects/${prospectId}`)
        .then((r) => r.json())
        .then((p: Record<string, unknown>) => {
          if (cancelled || !p || p.error) return;
          setFetchedSummary({
            id: p.id as string,
            businessName: (p.businessName as string) || "(no name)",
            ownerName: (p.ownerName as string) ?? null,
            phone: (p.phone as string) ?? null,
            email: (p.email as string) ?? null,
            city: (p.city as string) ?? null,
            state: (p.state as string) ?? null,
            status: (p.status as string) ?? null,
            shortCode:
              ((p as { shortCode?: string; short_code?: string }).shortCode ||
                (p as { shortCode?: string; short_code?: string }).short_code) ??
              null,
            category: (p.category as string) ?? null,
            currentWebsite: (p.currentWebsite as string) ?? null,
            generatedSiteUrl: (p.generatedSiteUrl as string) ?? null,
            savedAt: (p.savedAt as string | null) ?? null,
            source: (p.source as string) ?? null,
            lookalikeCategory: (p.lookalikeCategory as string) ?? null,
            scrapedData:
              (p.scrapedData as Record<string, unknown>) ?? null,
            createdAt: (p.createdAt as string) ?? null,
          });
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [prospectId, summary, refreshKey]);

  // Close on Escape so the drawer feels like a modal.
  useEffect(() => {
    if (!prospectId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prospectId, onClose]);

  // Reseed local savedAt mirror whenever the resolved summary changes.
  useEffect(() => {
    const resolved = summary || fetchedSummary;
    setSavedAt(resolved?.savedAt ?? null);
  }, [summary, fetchedSummary]);

  if (!prospectId) return null;
  const p = summary || fetchedSummary;

  const toggleSave = async () => {
    if (!prospectId || savingFlag) return;
    setSavingFlag(true);
    const prev = savedAt;
    const optimistic = prev ? null : new Date().toISOString();
    setSavedAt(optimistic);
    try {
      const r = await fetch(`/api/prospects/${prospectId}/save`, {
        method: "POST",
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        savedAt?: string | null;
      };
      if (j.ok) {
        setSavedAt(j.savedAt ?? null);
        setTouchBump((k) => k + 1); // refresh touch timeline (we logged one)
      } else {
        setSavedAt(prev);
      }
    } catch {
      setSavedAt(prev);
    } finally {
      setSavingFlag(false);
    }
  };

  const addNote = async () => {
    const text = newNote.trim();
    if (!text || !prospectId) return;
    setSavingNote(true);
    // Optimistic insert at the top
    const optimistic: Note = {
      id: `tmp-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [optimistic, ...prev]);
    setNewNote("");
    try {
      const r = await fetch(`/api/notes/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const j = (await r.json()) as { note?: Note };
      if (j.note) {
        setNotes((prev) =>
          prev.map((n) => (n.id === optimistic.id ? j.note as Note : n)),
        );
      }
      // Also log a touch so it shows on the unified timeline. Note-as-
      // touch is the same data shape used by TouchButtons.
      await fetch(`/api/prospects/${prospectId}/touches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "note",
          direction: "outbound",
          notes: text,
        }),
      });
      setTouchBump((k) => k + 1);
    } catch {
      // rollback
      setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
    } finally {
      setSavingNote(false);
    }
  };

  const previewHref = p?.shortCode
    ? `https://bluejayportfolio.com/p/${p.shortCode}`
    : `/preview/${prospectId}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Lead detail"
        className="fixed top-0 right-0 z-50 h-screen w-full max-w-[520px] bg-slate-950 border-l border-amber-500/30 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-amber-300/70 font-bold">
              Lead detail
            </p>
            <h2 className="text-xl font-black tracking-tight text-white truncate">
              {p?.businessName || "Loading…"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {[
                p?.ownerName,
                p?.city && p?.state ? `${p.city}, ${p.state}` : null,
                p?.category?.replace(/-/g, " "),
                p?.status,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {/* Lead-origin sentence — "Submitted /audit form 4d ago" etc.
                Sourced from the same getLeadOrigin() helper as the
                LeadPicker row so the context is consistent everywhere. */}
            {p && (
              <p
                className="text-[11px] text-amber-300/80 mt-1 leading-snug"
                title={getLeadOrigin(p as unknown as Prospect).long}
              >
                {getLeadOrigin(p as unknown as Prospect).long}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-white text-2xl leading-none px-2"
            aria-label="Close drawer"
            title="Close (Esc)"
          >
            ×
          </button>
        </header>

        {/* Quick-action bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center gap-2">
          {p?.phone && (
            <a
              href={`tel:${p.phone}`}
              className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
              title={`Call ${p.phone}`}
            >
              📞 Call
            </a>
          )}
          {p?.email && (
            <a
              href={`mailto:${p.email}`}
              className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-sky-500/40 text-sky-300 hover:bg-sky-500/10"
              title={`Email ${p.email}`}
            >
              ✉️ Email
            </a>
          )}
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
            title="Open the preview site for this lead"
          >
            🔗 Preview
          </a>
          <a
            href="https://bluejayportfolio.com/book-ben"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-violet-500/40 text-violet-300 hover:bg-violet-500/10"
            title="Open Ben's booking calendar"
          >
            📅 Book Ben
          </a>
          {/* 📍 Save toggle — flips prospects.saved_at so the lead is
              exempt from the 14-day auto-sweep. Active = filled rose
              pill; inactive = outlined. */}
          <button
            type="button"
            onClick={toggleSave}
            disabled={savingFlag}
            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border transition-colors ${
              savedAt
                ? "border-rose-400/60 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                : "border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
            } ${savingFlag ? "opacity-60 cursor-wait" : ""}`}
            title={
              savedAt
                ? "Saved — exempt from the 14-day auto-sweep. Click to unsave."
                : "Mark as Saved — keeps this lead out of the auto-sweep no matter how long it sits"
            }
          >
            {savingFlag ? "…" : savedAt ? "✓📍 Saved" : "📍 Save"}
          </button>
          <Link
            href={`/lead/${prospectId}`}
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border border-slate-500/40 text-slate-300 hover:bg-slate-500/10 ml-auto"
            title="Open the full lead page"
          >
            Full page ↗
          </Link>
        </div>

        {/* Body — single History section with Notes | Touch tabs */}
        <div className="px-5 py-4">
          {/* Always-visible "Add a note" composer above the tabs. Lets
              Madie capture a thought without first switching tabs. The
              note also logs a touch so it appears in BOTH the Notes
              tab AND the Touch tab. */}
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-amber-300/80 mb-1.5">
              📝 New note
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void addNote();
                  }
                }}
                placeholder="Add a quick note about this lead…"
                className="flex-1 h-9 px-3 rounded-md bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
              />
              <button
                type="button"
                onClick={() => void addNote()}
                disabled={savingNote || !newNote.trim()}
                className="h-9 px-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-40"
              >
                {savingNote ? "…" : "Add"}
              </button>
            </div>
          </div>

          {/* Tab toggle — Notes vs Touch history. Both render the same
              section's history pane below. */}
          <div className="flex items-center gap-1 mb-3 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setHistoryTab("notes")}
              className={`text-[11px] uppercase tracking-wider font-bold px-3 py-2 -mb-px border-b-2 transition-colors ${
                historyTab === "notes"
                  ? "border-amber-400 text-amber-200"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              📝 Notes{notes.length > 0 ? ` (${notes.length})` : ""}
            </button>
            <button
              type="button"
              onClick={() => setHistoryTab("touches")}
              className={`text-[11px] uppercase tracking-wider font-bold px-3 py-2 -mb-px border-b-2 transition-colors ${
                historyTab === "touches"
                  ? "border-sky-400 text-sky-200"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              📜 Touch history
            </button>
          </div>

          {/* History pane — picks one of the two views. */}
          {historyTab === "notes" ? (
            <div>
              {loadingNotes ? (
                <p className="text-xs text-slate-500 italic px-2 py-3">
                  Loading notes…
                </p>
              ) : notes.length === 0 ? (
                <p className="text-xs text-slate-500 italic px-2 py-3">
                  No notes yet. Add the first one above ↑
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {notes.map((n) => (
                    <li
                      key={n.id}
                      className="rounded-md border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2"
                    >
                      <p className="text-xs text-slate-100 whitespace-pre-wrap break-words">
                        {n.text}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 tabular-nums">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div>
              <TouchTimeline
                prospectId={prospectId}
                limit={100}
                refreshKey={touchBump + refreshKey}
                pollMs={0}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
