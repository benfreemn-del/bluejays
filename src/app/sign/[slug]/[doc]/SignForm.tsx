"use client";

import { useState, type FormEvent } from "react";

type ExtraQuestion = { id: string; label: string; placeholder?: string };

type Props = {
  slug: string;
  doc: string;
  extraQuestions: ExtraQuestion[];
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function SignForm({ slug, doc, extraQuestions }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.kind === "submitting") return;
    if (!name.trim()) {
      setState({ kind: "error", message: "Please enter your name." });
      return;
    }
    if (!acknowledged) {
      setState({
        kind: "error",
        message: "Please confirm you've read the document.",
      });
      return;
    }
    setState({ kind: "submitting" });
    try {
      const res = await fetch(
        `/api/sign/${encodeURIComponent(slug)}/${encodeURIComponent(doc)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim() || undefined,
            role: role.trim() || undefined,
            notes: notes.trim() || undefined,
            replies,
          }),
        },
      );
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setState({
          kind: "error",
          message: json.error || `Submission failed (${res.status}).`,
        });
        return;
      }
      setState({ kind: "success" });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Submission failed.",
      });
    }
  }

  if (state.kind === "success") {
    return (
      <div className="rounded-xl border border-lime-500/30 bg-lime-500/[0.08] p-6">
        <p className="text-lime-200 font-bold text-lg mb-1">
          ✓ Got it. Ben has been notified.
        </p>
        <p className="text-slate-300 text-sm">
          You can close this tab. Ben will reach out within a business day if
          anything needs follow-up.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 " +
    "focus:outline-none focus:border-lime-500/60 focus:ring-1 focus:ring-lime-500/30";
  const labelCls =
    "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Your name <span className="text-rose-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Paul Hanson"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="paul@zenithsports.org"
          />
        </div>
      </div>

      <div>
        <label htmlFor="role" className={labelCls}>
          Your role (optional)
        </label>
        <input
          id="role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputCls}
          placeholder="Founder · CEO · Operator"
        />
      </div>

      {extraQuestions.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-lime-400 pt-2">
            Quick answers
          </p>
          {extraQuestions.map((q) => (
            <div key={q.id}>
              <label htmlFor={`q-${q.id}`} className={labelCls}>
                {q.label}
              </label>
              <input
                id={`q-${q.id}`}
                type="text"
                value={replies[q.id] ?? ""}
                onChange={(e) =>
                  setReplies((r) => ({ ...r, [q.id]: e.target.value }))
                }
                className={inputCls}
                placeholder={q.placeholder}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label htmlFor="notes" className={labelCls}>
          Questions / notes for Ben (optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputCls + " resize-y"}
          placeholder="Anything you want flagged before we proceed…"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-950 text-lime-500 focus:ring-lime-500/40"
        />
        <span>
          I&apos;ve read the document above and acknowledge receipt.
        </span>
      </label>

      {state.kind === "error" && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/[0.08] p-3 text-sm text-rose-200">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={state.kind === "submitting"}
        className="w-full sm:w-auto h-12 px-8 rounded-full bg-lime-500 text-slate-950 font-bold text-sm hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {state.kind === "submitting"
          ? "Submitting…"
          : "Submit & notify Ben"}
      </button>
    </form>
  );
}
