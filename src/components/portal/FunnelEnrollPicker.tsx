"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * FunnelEnrollPicker — universal modal for selecting which funnel(s) to
 * enroll a lead into. Locked 2026-05-10 per Ben spec:
 *
 *   "When you mark a lead to send to funnel, it should prompt a list of
 *    funnels if there are multiple, and you should be able to choose
 *    multiple. On all backends, now and forever."
 *
 * Behavior:
 *   - 0 funnels available → modal is a no-op; caller should disable the
 *     enroll button entirely (universal shape: no funnels = no enroll).
 *   - 1 funnel available  → caller may skip the modal and enroll directly.
 *   - 2+ funnels          → renders checkboxes with audience emoji + name +
 *     pitch line. Owner picks any combination, hits Enroll. The order
 *     of selection is preserved — first-checked is treated as the
 *     PRIMARY funnel by the API (writes to audience_segment).
 *
 * The "all-funnels" pre-checked default is opinionated: most owners
 * want every funnel running at once for high-intent leads. Easy to
 * uncheck whatever doesn't fit.
 */

export type FunnelOption = {
  /** Funnel segment ID — matches client_leads.audience_segment + the
   *  funnel runner's lookup key. */
  segment: string;
  /** Display label (e.g. "Family rec", "Coach / pro"). */
  label: string;
  /** One-line pitch describing what the funnel does — shown under the
   *  label so the owner knows what they're enrolling into. */
  pitch?: string;
  emoji?: string;
  /** Optional Tailwind text-color class for the segment accent
   *  (e.g. "text-amber-300"). When omitted, defaults to slate. */
  accent?: string;
  /** Whether this funnel is currently the lead's audience_segment. */
  isCurrentSegment?: boolean;
};

export default function FunnelEnrollPicker({
  isOpen,
  onClose,
  funnels,
  leadName,
  defaultSelected,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  funnels: FunnelOption[];
  /** Optional lead identifier (name/email) shown in the header. */
  leadName?: string | null;
  /** Initial selected segments. Defaults to the current segment if
   *  set, otherwise all funnels. */
  defaultSelected?: string[];
  /** Async callback fired on confirm — receives the ordered list of
   *  selected segments (first-clicked first). Caller is responsible
   *  for the actual API call. Throwing rejects the picker; the modal
   *  surfaces the error inline. */
  onConfirm: (selectedSegments: string[]) => Promise<void>;
}) {
  // Order matters — we preserve the order in which segments were
  // toggled on so the API can pick the "primary" one (first entry)
  // for backward-compat with single-audience callers.
  const initialSelection = useMemo(() => {
    if (defaultSelected && defaultSelected.length > 0) {
      return defaultSelected.filter((s) =>
        funnels.some((f) => f.segment === s),
      );
    }
    const current = funnels.find((f) => f.isCurrentSegment);
    if (current) return [current.segment];
    // Default: all funnels pre-checked (the opinionated default —
    // owners most often want every funnel running for a hot lead).
    return funnels.map((f) => f.segment);
  }, [funnels, defaultSelected]);

  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open so reopening a stale modal doesn't carry old state.
  useEffect(() => {
    if (!isOpen) return;
    setSelected(initialSelection);
    setSubmitting(false);
    setError(null);
  }, [isOpen, initialSelection]);

  // Lock body scroll + close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function toggle(segment: string) {
    setSelected((prev) =>
      prev.includes(segment)
        ? prev.filter((s) => s !== segment)
        : [...prev, segment],
    );
  }

  function selectAll() {
    setSelected(funnels.map((f) => f.segment));
  }

  function clearAll() {
    setSelected([]);
  }

  async function handleConfirm() {
    if (selected.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(selected);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setSubmitting(false);
    }
  }

  const allSelected = selected.length === funnels.length && funnels.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative my-6 w-full max-w-md rounded-2xl border border-blue-500/40 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">▶</span>
              <h2 className="text-base font-bold text-white">
                Start funnel
              </h2>
            </div>
            {leadName && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Enrolling{" "}
                <span className="text-slate-200 font-medium">{leadName}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Top-line + select-all */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5">
          <p className="text-xs text-slate-400">
            {funnels.length === 1
              ? "Pick the funnel to enroll into."
              : "Pick one or more funnels — they'll all run concurrently."}
          </p>
          {funnels.length > 1 && (
            <button
              type="button"
              onClick={allSelected ? clearAll : selectAll}
              className="text-[10px] uppercase tracking-wider font-bold text-blue-300 hover:text-blue-200 transition-colors"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          )}
        </div>

        {/* Funnel list */}
        <div className="px-3 py-2 max-h-[60vh] overflow-y-auto">
          {funnels.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-6 px-4">
              No funnels configured for this client yet. Set them up in
              <code className="text-slate-300 mx-1">
                src/lib/client-funnels/
              </code>
              first.
            </div>
          ) : (
            <ul className="space-y-1.5 py-1">
              {funnels.map((f) => {
                const isOn = selected.includes(f.segment);
                return (
                  <li key={f.segment}>
                    <label
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                        isOn
                          ? "border-blue-500/60 bg-blue-500/[0.08]"
                          : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => toggle(f.segment)}
                        disabled={submitting}
                        className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {f.emoji && (
                            <span className="text-base leading-none">
                              {f.emoji}
                            </span>
                          )}
                          <span
                            className={`font-semibold text-sm ${
                              f.accent ?? "text-slate-200"
                            }`}
                          >
                            {f.label}
                          </span>
                          {f.isCurrentSegment && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded px-1.5 py-0.5">
                              ✓ tagged audience
                            </span>
                          )}
                        </div>
                        {f.pitch && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {f.pitch}
                          </p>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-5 mb-2 rounded border border-rose-700/50 bg-rose-900/20 text-rose-200 text-xs px-3 py-2">
            {error}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/5">
          <span className="text-[11px] text-slate-500">
            {selected.length === 0
              ? "Pick at least one funnel"
              : selected.length === 1
                ? "1 funnel selected"
                : `${selected.length} funnels selected`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || selected.length === 0}
              className="text-xs font-black uppercase tracking-wider rounded-lg bg-blue-500 hover:bg-blue-400 text-white px-4 py-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Enrolling…"
                : selected.length > 1
                  ? `▶ Enroll · ${selected.length}`
                  : "▶ Enroll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
