"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

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

type Draft = {
  name: string;
  email: string;
  role: string;
  notes: string;
  replies: Record<string, string>;
  acknowledged: boolean;
  savedAt: number;
};

function draftKey(slug: string, doc: string): string {
  return `bluejays:sign-draft:${slug}:${doc}`;
}

export default function SignForm({ slug, doc, extraQuestions }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [draftRestored, setDraftRestored] = useState<Date | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const hydratedRef = useRef(false);

  // ── Restore draft on mount ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(draftKey(slug, doc));
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        setName(d.name || "");
        setEmail(d.email || "");
        setRole(d.role || "");
        setNotes(d.notes || "");
        setReplies(d.replies || {});
        setAcknowledged(!!d.acknowledged);
        if (d.savedAt) setDraftRestored(new Date(d.savedAt));
      }
    } catch {
      // corrupt draft — ignore
    }
    hydratedRef.current = true;
  }, [slug, doc]);

  // ── Save draft on every change (after first hydrate) ──
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (typeof window === "undefined") return;
    const hasAnyInput =
      name || email || role || notes || acknowledged ||
      Object.values(replies).some((v) => v && v.trim());
    if (!hasAnyInput) {
      // Nothing entered yet — don't pollute localStorage with empties.
      return;
    }
    const draft: Draft = {
      name,
      email,
      role,
      notes,
      replies,
      acknowledged,
      savedAt: Date.now(),
    };
    try {
      window.localStorage.setItem(draftKey(slug, doc), JSON.stringify(draft));
      setDraftSavedAt(new Date(draft.savedAt));
    } catch {
      // Quota exceeded etc — fail silent, the form still works
    }
  }, [slug, doc, name, email, role, notes, replies, acknowledged]);

  function clearDraft() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(draftKey(slug, doc));
      } catch {
        /* ignore */
      }
    }
    setName("");
    setEmail("");
    setRole("");
    setNotes("");
    setReplies({});
    setAcknowledged(false);
    setDraftRestored(null);
    setDraftSavedAt(null);
  }

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
      // Success — clear the draft from localStorage
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(draftKey(slug, doc));
        } catch {
          /* ignore */
        }
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
      {draftRestored && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-sky-500/30 bg-sky-500/[0.06] px-3.5 py-2.5 text-sm">
          <p className="text-sky-200">
            Picked up where you left off — last saved{" "}
            <time>{draftRestored.toLocaleString()}</time>.
          </p>
          <button
            type="button"
            onClick={clearDraft}
            className="text-xs text-sky-300 hover:text-white underline underline-offset-2"
          >
            Start fresh
          </button>
        </div>
      )}
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

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          className="w-full sm:w-auto h-12 px-8 rounded-full bg-lime-500 text-slate-950 font-bold text-sm hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.kind === "submitting"
            ? "Submitting…"
            : "Submit & notify Ben"}
        </button>
        <p className="text-xs text-slate-500 sm:ml-2">
          {draftSavedAt
            ? `Saved automatically. Close the tab anytime — pick up here later.`
            : `No pressure to finish now. Your progress auto-saves as you type.`}
        </p>
      </div>
    </form>
  );
}
