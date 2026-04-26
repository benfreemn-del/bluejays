"use client";

import { useMemo, useState } from "react";
import type { Template, TemplateKey } from "@/lib/review-blast-templates";

const PLACEHOLDER = `(206) 555-1234
2065551235
+12065551236
…`;

export default function ReviewBlastForm({
  upsellId,
  businessName,
  defaultTemplateKey,
  templates,
}: {
  upsellId: string;
  businessName: string;
  defaultTemplateKey: TemplateKey;
  templates: Template[];
}) {
  const [phones, setPhones] = useState("");
  const [templateKey, setTemplateKey] = useState<TemplateKey>(defaultTemplateKey);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.key === templateKey) ?? templates[0],
    [templates, templateKey],
  );

  const previewBody = useMemo(() => {
    const reviewLink = `https://bluejayportfolio.com/review/...`;
    return selectedTemplate.body
      .replace(/\{businessName\}/g, businessName)
      .replace(/\{reviewLink\}/g, reviewLink);
  }, [selectedTemplate, businessName]);

  const phoneCount = useMemo(() => {
    return phones
      .split(/[\n,;]+/g)
      .map((l) => l.trim())
      .filter((l) => l.length > 0).length;
  }, [phones]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/review-blast/submit/${upsellId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones, templateKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-700 bg-emerald-900/40 p-6">
        <h2 className="text-lg font-semibold mb-2">✓ List submitted</h2>
        <p className="text-sm text-slate-300 mb-4">
          We received {phoneCount} phone number{phoneCount === 1 ? "" : "s"}.
          Once carrier approval (A2P 10DLC) clears, the SMS batch will
          dispatch within an hour. You&apos;ll see the status update on this
          page — bookmark it to check back.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-sky-400 hover:underline"
        >
          Refresh status
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">
          Customer phone numbers
        </label>
        <p className="text-xs text-slate-400 mb-2">
          One per line. Up to 50. Any format works — we&apos;ll clean them
          up automatically. Leave it blank for now and come back later
          if you&apos;re still gathering them.
        </p>
        <textarea
          value={phones}
          onChange={(e) => setPhones(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={12}
          className="w-full rounded-md bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-600"
          disabled={submitting}
        />
        <p className="text-xs text-slate-500 mt-1">
          {phoneCount} number{phoneCount === 1 ? "" : "s"} entered
          {phoneCount > 50 && (
            <span className="text-amber-400"> — first 50 will be used</span>
          )}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Message template
        </label>
        <p className="text-xs text-slate-400 mb-2">
          We pre-selected one based on your business category. Pick a
          different template if you want — preview updates below.
        </p>
        <select
          value={templateKey}
          onChange={(e) => setTemplateKey(e.target.value as TemplateKey)}
          disabled={submitting}
          className="w-full rounded-md bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-600"
        >
          {templates.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md bg-slate-900/60 border border-slate-800 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
          Preview — what your customers will receive
        </p>
        <p className="text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
          {previewBody}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-rose-900/40 border border-rose-700 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || phoneCount === 0}
        className="w-full rounded-md bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-3 text-sm font-semibold transition-colors"
      >
        {submitting ? "Submitting…" : `Submit ${Math.min(phoneCount, 50)} number${phoneCount === 1 ? "" : "s"}`}
      </button>

      <p className="text-xs text-slate-500 text-center">
        You can come back to this page anytime — submission is optional
        and there&apos;s no rush.
      </p>
    </form>
  );
}
