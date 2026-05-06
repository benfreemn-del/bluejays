"use client";

import { useEffect, useState } from "react";
import { leadInSeason, type LeadForSeason } from "@/lib/season-calculator";

/**
 * LeadContextEditor — modal that lets the owner manually tag a lead's
 * competition tier, age group, gender, state, and (optional) in-season
 * override. Per Philip+Paul's spec: requires explicit Save click,
 * confirms saved, surfaces the live-computed in-season preview so the
 * user knows what the calculator says BEFORE they decide to override.
 *
 * Tested manually:
 *   · Open modal → fields prefill from lead → preview computes
 *   · Edit → preview updates live
 *   · Click Save → PATCH /api/client-portal/leads/[id] with all 5 fields
 *   · Confirmation chip → "✓ Saved" for ~1.5s
 *   · Reopen modal → fields reflect persisted values
 */

const TIERS = [
  { id: "", label: "Unknown / not set" },
  { id: "mls-next", label: "MLS NEXT" },
  { id: "ecnl", label: "ECNL" },
  { id: "rcl-select", label: "RCL Select" },
  { id: "rec-youth", label: "Rec · Youth" },
  { id: "rec-adult", label: "Rec · Adult" },
  { id: "high-school", label: "High School" },
  { id: "college", label: "College" },
  { id: "pro", label: "Pro / semi-pro" },
];

const AGE_GROUPS = [
  { id: "", label: "Unknown" },
  { id: "U8", label: "U8" },
  { id: "U10", label: "U10" },
  { id: "U12", label: "U12" },
  { id: "U14", label: "U14" },
  { id: "U16", label: "U16" },
  { id: "U17", label: "U17" },
  { id: "U19", label: "U19" },
  { id: "high-school", label: "High School (general)" },
  { id: "college", label: "College" },
  { id: "adult", label: "Adult" },
];

const GENDERS = [
  { id: "", label: "Unknown / mixed" },
  { id: "boys", label: "Boys" },
  { id: "girls", label: "Girls" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "mixed", label: "Co-ed / mixed" },
];

const SEASON_OVERRIDES = [
  { id: "", label: "Use calculator (auto)" },
  { id: "in-season", label: "Force IN season" },
  { id: "off-season", label: "Force OFF season" },
];

export type LeadContextDraft = {
  competition_tier: string;
  age_group: string;
  gender: string;
  state_override: string;
  in_season_override: string;
};

export default function LeadContextEditor({
  isOpen,
  onClose,
  leadId,
  initial,
  rawPayloadState,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  initial: LeadContextDraft;
  /** Falls back here when state_override isn't set — usually from raw_payload. */
  rawPayloadState?: string | null;
  /** Called with the fresh lead row after save. Parent re-renders. */
  onSaved: (updated: Record<string, unknown>) => void;
}) {
  const [draft, setDraft] = useState<LeadContextDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Re-sync local state when modal reopens for a different lead.
  useEffect(() => {
    if (isOpen) {
      setDraft(initial);
      setSavedFlash(false);
      setErr(null);
    }
  }, [isOpen, initial]);

  // Lock body scroll + ESC to close.
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

  // Compute the season preview from the current draft (not the persisted
  // values) so the owner sees the calculator output as they edit.
  const preview = leadInSeason({
    competition_tier: draft.competition_tier || null,
    age_group: draft.age_group || null,
    gender: draft.gender || null,
    state_override: draft.state_override || null,
    in_season_override: draft.in_season_override || null,
    raw_payload: rawPayloadState ? { state: rawPayloadState } : null,
  } as LeadForSeason);

  const isDirty =
    draft.competition_tier !== initial.competition_tier ||
    draft.age_group !== initial.age_group ||
    draft.gender !== initial.gender ||
    draft.state_override !== initial.state_override ||
    draft.in_season_override !== initial.in_season_override;

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const r = await fetch(`/api/client-portal/leads/${leadId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        lead?: Record<string, unknown>;
        error?: string;
      };
      if (!j.ok || !j.lead) {
        throw new Error(j.error ?? "Save failed");
      }
      onSaved(j.lead);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-6 mx-4 w-full max-w-md rounded-2xl border border-violet-500/25 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-baseline justify-between p-5 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-bold text-violet-200">
              ⚙️ Edit lead context
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed max-w-xs">
              Sets the tags that drive in-season calculation, audience
              filters, and per-tier reporting. Save to commit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-3">
          <FieldSelect
            label="Competition tier"
            value={draft.competition_tier}
            onChange={(v) =>
              setDraft((p) => ({ ...p, competition_tier: v }))
            }
            options={TIERS}
          />

          <div className="grid grid-cols-2 gap-3">
            <FieldSelect
              label="Age group"
              value={draft.age_group}
              onChange={(v) => setDraft((p) => ({ ...p, age_group: v }))}
              options={AGE_GROUPS}
            />
            <FieldSelect
              label="Gender"
              value={draft.gender}
              onChange={(v) => setDraft((p) => ({ ...p, gender: v }))}
              options={GENDERS}
            />
          </div>

          <FieldInput
            label="State override (2-letter)"
            value={draft.state_override}
            onChange={(v) =>
              setDraft((p) => ({ ...p, state_override: v.toUpperCase().slice(0, 2) }))
            }
            placeholder={
              rawPayloadState
                ? `Default: ${rawPayloadState.toUpperCase()}`
                : "WA"
            }
            help="Leave empty to use the lead's scouted state."
          />

          <FieldSelect
            label="In-season override"
            value={draft.in_season_override}
            onChange={(v) =>
              setDraft((p) => ({ ...p, in_season_override: v }))
            }
            options={SEASON_OVERRIDES}
          />

          {/* Preview */}
          <div
            className={`mt-2 rounded-lg border p-3 ${
              preview.inSeason
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-slate-500/30 bg-slate-500/10"
            }`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Preview · in-season calculator
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                  preview.inSeason
                    ? "bg-emerald-500 text-emerald-950"
                    : "bg-slate-600 text-slate-100"
                }`}
              >
                {preview.inSeason ? "✓ In season" : "Off season"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {preview.reason}{" "}
              <span className="text-slate-500 italic">
                · {preview.confidence} confidence
                {preview.override ? " · manual override" : ""}
              </span>
            </p>
          </div>

          {err && (
            <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
              {err}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-5 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider px-3 py-2.5 rounded-md border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={save}
            disabled={!isDirty || saving}
            className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md transition-colors ${
              savedFlash
                ? "bg-emerald-500 text-emerald-950"
                : isDirty && !saving
                  ? "bg-violet-500 hover:bg-violet-400 text-white"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {savedFlash ? "✓ Saved" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950/80 text-sm text-white px-3 py-2 focus:outline-none focus:border-violet-500/60"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-950/80 text-sm text-white px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60"
      />
      {help && (
        <p className="text-[10px] text-slate-500 italic mt-1 leading-tight">
          {help}
        </p>
      )}
    </label>
  );
}
