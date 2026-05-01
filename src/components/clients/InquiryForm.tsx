"use client";

import { useState } from "react";

/**
 * Shared inquiry form for the custom-tier client showcase pages
 * (/clients/[slug] and /v2/consulting).
 *
 * Each calling page passes:
 *   - slug: identifies which client this form is for. The API uses
 *     the slug to set the right "from" framing in Ben's alert email.
 *   - accentColor + textColor: per-brand styling so the form matches
 *     the page's palette (rose for Reiki, teal for Heale, etc.)
 *   - fields: ordered list of form fields with type + label + options.
 *     We only support text/email/tel/textarea/select/radio here —
 *     anything more complex should be its own component.
 *   - successCopy: what to show after a successful submit (varies per
 *     business: "Pratima will reach out within 1 business day" vs
 *     "Bob will get back to you about catering shortly")
 *
 * On submit, POSTs to /api/clients/inquire with { slug, ...fieldValues }.
 * The API sends Ben SMS + email with all the field values listed.
 */

export type InquiryField =
  | { type: "text" | "email" | "tel"; name: string; label: string; placeholder?: string; required?: boolean; full?: boolean }
  | { type: "textarea"; name: string; label: string; placeholder?: string; required?: boolean; rows?: number; full?: boolean }
  | { type: "select"; name: string; label: string; required?: boolean; options: Array<{ value: string; label: string }>; full?: boolean }
  | { type: "radio"; name: string; label: string; required?: boolean; options: Array<{ value: string; label: string; description?: string }>; full?: boolean };

export type InquiryFormProps = {
  slug: string;
  fields: InquiryField[];
  submitLabel: string;
  successHeading: string;
  successBody: string;
  /** Hex color for buttons + focus rings. */
  accent: string;
  /** Hex color for accent text (e.g. labels). Defaults to the same as accent. */
  accentDeep?: string;
  /** Background color of the card. Defaults to white. */
  panelBg?: string;
  /** Text color for the form. Defaults to dark slate. */
  ink?: string;
  /** Soft text color for descriptions. */
  inkSoft?: string;
  /** Optional pre-filled values (e.g. from URL params). */
  initialValues?: Record<string, string>;
  /** Optional font family for headings (e.g. "Georgia, serif"). */
  serif?: string;
};

export default function InquiryForm({
  slug,
  fields,
  submitLabel,
  successHeading,
  successBody,
  accent,
  accentDeep,
  panelBg = "#ffffff",
  ink = "#1a2e2c",
  inkSoft = "#5d6f6c",
  initialValues = {},
  serif,
}: InquiryFormProps) {
  const accentText = accentDeep || accent;
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) {
      init[f.name] = initialValues[f.name] || "";
    }
    return init;
  });
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  function update(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    // Required-field check (run client-side so users see issues fast;
    // server validates name+email regardless).
    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) {
        setStatus({ kind: "error", message: `${f.label.replace(/\s*\*$/, "")} is required.` });
        return;
      }
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...values }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setStatus({
          kind: "error",
          message: json.error || `Submission failed (${res.status}). Try again or call directly.`,
        });
        return;
      }
      setStatus({ kind: "ok" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error — try again.",
      });
    }
  }

  // ─── Success state ────────────────────────────────────────────
  if (status.kind === "ok") {
    return (
      <div
        className="rounded-3xl p-8 md:p-10 border-2"
        style={{
          background: panelBg,
          borderColor: accent,
          boxShadow: `0 8px 30px ${accent}20`,
        }}
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{ background: `${accent}20`, color: accentText }}
        >
          ✓ Sent
        </div>
        <h3
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: ink, fontFamily: serif }}
        >
          {successHeading}
        </h3>
        <p className="text-base leading-relaxed" style={{ color: inkSoft }}>
          {successBody}
        </p>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────
  const submitting = status.kind === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl p-6 md:p-8 border space-y-5"
      style={{
        background: panelBg,
        borderColor: `${accent}30`,
        boxShadow: `0 4px 16px ${accent}12`,
      }}
    >
      <div className="grid md:grid-cols-2 gap-5">
        {fields.map((f) => (
          <div key={f.name} className={f.full || f.type === "textarea" || f.type === "radio" ? "md:col-span-2" : ""}>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: inkSoft }}
            >
              {f.label}
            </label>

            {f.type === "textarea" ? (
              <textarea
                value={values[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder}
                rows={f.rows ?? 3}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors resize-y"
                style={{
                  background: "#fff",
                  borderColor: `${accent}30`,
                  color: ink,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = `${accent}30`)}
              />
            ) : f.type === "select" ? (
              <select
                value={values[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ background: "#fff", borderColor: `${accent}30`, color: ink }}
              >
                <option value="">— Select —</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "radio" ? (
              <div className="grid sm:grid-cols-2 gap-2">
                {f.options.map((o) => {
                  const active = values[f.name] === o.value;
                  return (
                    <label
                      key={o.value}
                      className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                      style={{
                        background: active ? `${accent}10` : "#fff",
                        borderColor: active ? accent : `${accent}25`,
                      }}
                    >
                      <input
                        type="radio"
                        name={f.name}
                        value={o.value}
                        checked={active}
                        onChange={(e) => update(f.name, e.target.value)}
                        className="mt-0.5 flex-shrink-0"
                        style={{ accentColor: accent }}
                      />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: ink }}>
                          {o.label}
                        </div>
                        {o.description && (
                          <div className="text-xs mt-0.5" style={{ color: inkSoft }}>
                            {o.description}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <input
                type={f.type}
                value={values[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ background: "#fff", borderColor: `${accent}30`, color: ink }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = `${accent}30`)}
              />
            )}
          </div>
        ))}
      </div>

      {status.kind === "error" && (
        <div
          className="rounded-xl px-4 py-3 text-sm border"
          style={{
            background: "#fee2e2",
            borderColor: "#fca5a5",
            color: "#991b1b",
          }}
        >
          {status.message}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <p className="text-xs" style={{ color: inkSoft }}>
          We respond within 1 business day. Your info stays private.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{
            background: accent,
            color: "#fff",
            boxShadow: `0 4px 16px ${accent}40`,
          }}
        >
          {submitting ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
