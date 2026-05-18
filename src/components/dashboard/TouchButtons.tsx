"use client";

import { useState, useRef, useEffect } from "react";

/**
 * <TouchButtons /> — one-tap mobile-first lead interaction logger.
 *
 * Five buttons: 📞 Called, 💬 Texted, ✉️ Emailed, 📝 Note, 🎤 Voice memo.
 * Each opens a tiny popover: outcome dropdown + 1-line note + next-touch
 * scheduling (BAM-FAM forcing function). Submitting POSTs to
 * /api/prospects/[id]/touches and (if provided) calls onLogged() so the
 * parent timeline can refetch.
 *
 * Per CLAUDE.md Lead Interaction System Phase 1 + master plan.
 */

type Kind = "call" | "text" | "email" | "note" | "voicemail";

type Outcome =
  | "connected"
  | "no_answer"
  | "left_voicemail"
  | "declined"
  | "replied"
  | "no_reply"
  | "sent"
  | "received"
  | "meeting_booked"
  | "meeting_held"
  | "meeting_no_show";

const OUTCOMES_BY_KIND: Record<Kind, Outcome[]> = {
  call: ["connected", "no_answer", "left_voicemail", "declined"],
  voicemail: ["left_voicemail"],
  text: ["sent", "replied", "no_reply"],
  email: ["sent", "replied", "no_reply"],
  note: [],
};

const KIND_META: Record<Kind, { emoji: string; label: string; color: string }> = {
  call: { emoji: "📞", label: "Called", color: "bg-emerald-500 hover:bg-emerald-400" },
  text: { emoji: "💬", label: "Texted", color: "bg-sky-500 hover:bg-sky-400" },
  email: { emoji: "✉️", label: "Emailed", color: "bg-violet-500 hover:bg-violet-400" },
  note: { emoji: "📝", label: "Note", color: "bg-slate-500 hover:bg-slate-400" },
  voicemail: { emoji: "🎙️", label: "VM", color: "bg-amber-500 hover:bg-amber-400" },
};

interface Props {
  prospectId: string;
  byUser?: string;
  size?: "sm" | "md";
  onLogged?: () => void;
  /** When set, hides the voice-memo button (e.g., in places where audio
   *  capture isn't supported or appropriate). */
  hideVoiceMemo?: boolean;
}

export default function TouchButtons({
  prospectId,
  byUser = "ben",
  size = "md",
  onLogged,
  hideVoiceMemo = false,
}: Props) {
  const [openKind, setOpenKind] = useState<Kind | null>(null);
  const [outcome, setOutcome] = useState<Outcome | "">("");
  const [notes, setNotes] = useState("");
  const [nextDays, setNextDays] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice-memo capture state
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup mic stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function openPopover(kind: Kind) {
    setOpenKind(kind);
    setOutcome(OUTCOMES_BY_KIND[kind][0] || "");
    setNotes("");
    setNextDays(null);
    setError(null);
  }

  function closePopover() {
    setOpenKind(null);
    setOutcome("");
    setNotes("");
    setNextDays(null);
    setError(null);
  }

  async function submitTouch() {
    if (!openKind) return;
    setSubmitting(true);
    setError(null);
    try {
      const nextTouchAt =
        nextDays && nextDays > 0
          ? new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined;
      const r = await fetch(`/api/prospects/${prospectId}/touches`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: openKind,
          direction: "outbound",
          outcome: outcome || undefined,
          notes: notes.trim() || undefined,
          by_user: byUser,
          next_touch_kind: nextTouchAt ? "followup_note" : undefined,
          next_touch_at: nextTouchAt,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!j.ok) {
        setError(j.error || "Failed to log touch");
        setSubmitting(false);
        return;
      }
      closePopover();
      setSubmitting(false);
      onLogged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setSubmitting(false);
    }
  }

  // ── Voice memo flow ──────────────────────────────────────────────

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        await transcribeAndFill(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      // Auto-stop at 60 seconds as a safety cap
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, 60000);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Mic error: ${e.message}`
          : "Microphone access denied",
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  async function transcribeAndFill(blob: Blob) {
    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "memo.webm");
      const r = await fetch("/api/touches/voice-transcribe", {
        method: "POST",
        body: fd,
      });
      const j = (await r.json()) as { ok?: boolean; text?: string; error?: string };
      if (j.ok && j.text) {
        // Auto-open the 'note' popover with the transcript pre-filled
        setOpenKind("note");
        setOutcome("");
        setNotes(j.text);
        setNextDays(null);
      } else {
        setError(j.error || "Transcription failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcribe network error");
    } finally {
      setTranscribing(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  const btnBase =
    size === "sm"
      ? "text-xs font-bold uppercase tracking-wide px-2 py-1 rounded text-white transition-colors"
      : "text-sm font-bold uppercase tracking-wide px-3 py-1.5 rounded-md text-white transition-colors";

  const kinds: Kind[] = hideVoiceMemo
    ? ["call", "text", "email", "note"]
    : ["call", "text", "email", "note"];

  return (
    <div className="relative inline-flex flex-wrap gap-1.5 items-center">
      {kinds.map((k) => {
        const meta = KIND_META[k];
        return (
          <button
            key={k}
            type="button"
            onClick={() => openPopover(k)}
            className={`${btnBase} ${meta.color}`}
            title={`Log a ${meta.label.toLowerCase()}`}
          >
            <span aria-hidden>{meta.emoji}</span>
            <span className="ml-1 hidden sm:inline">{meta.label}</span>
          </button>
        );
      })}

      {!hideVoiceMemo && (
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={transcribing}
          className={`${btnBase} ${recording ? "bg-rose-600 animate-pulse" : "bg-fuchsia-500 hover:bg-fuchsia-400"} disabled:opacity-50`}
          title={recording ? "Stop recording (auto-stops at 60 sec)" : "Voice memo — talk to log"}
        >
          <span aria-hidden>{recording ? "⏹️" : transcribing ? "⏳" : "🎤"}</span>
          <span className="ml-1 hidden sm:inline">
            {recording ? "Stop" : transcribing ? "..." : "Voice"}
          </span>
        </button>
      )}

      {/* Popover */}
      {openKind && (
        <div
          role="dialog"
          aria-label={`Log ${KIND_META[openKind].label.toLowerCase()}`}
          className="absolute left-0 top-full mt-2 z-30 w-80 max-w-[95vw] rounded-lg border border-slate-700 bg-slate-900 shadow-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span aria-hidden>{KIND_META[openKind].emoji}</span>
              <span>{KIND_META[openKind].label}</span>
            </div>
            <button
              type="button"
              onClick={closePopover}
              className="text-slate-400 hover:text-white text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {OUTCOMES_BY_KIND[openKind].length > 0 && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as Outcome)}
                className="w-full text-sm bg-slate-800 text-white border border-slate-700 rounded px-2 py-1.5"
              >
                <option value="">— pick one —</option>
                {OUTCOMES_BY_KIND[openKind].map((o) => (
                  <option key={o} value={o}>
                    {o.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Note (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full text-sm bg-slate-800 text-white border border-slate-700 rounded px-2 py-1.5"
              placeholder={
                openKind === "call"
                  ? "Asked about pricing, sending preview…"
                  : openKind === "text"
                    ? "Sent the audit link"
                    : "What happened"
              }
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Next touch in
            </label>
            <div className="flex gap-1">
              {[1, 3, 7, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNextDays(nextDays === d ? null : d)}
                  className={`text-xs px-2 py-1 rounded border ${
                    nextDays === d
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {d}d
                </button>
              ))}
              <button
                type="button"
                onClick={() => setNextDays(null)}
                className={`text-xs px-2 py-1 rounded border ${
                  nextDays === null
                    ? "bg-slate-700 border-slate-600 text-slate-200"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                None
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={submitTouch}
              disabled={submitting}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-bold uppercase tracking-wide px-3 py-1.5 rounded"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={closePopover}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
