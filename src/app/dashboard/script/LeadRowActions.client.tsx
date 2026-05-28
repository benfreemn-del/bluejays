"use client";

import { useState, useEffect } from "react";
import type { Prospect } from "@/lib/types";

/**
 * LeadRowActions — quick-action bar attached to each LeadPicker row.
 *
 * Built 2026-05-27 in response to Madie's 14-note feedback. Surfaces
 * the call-workspace tools (notes, send-booking, send-audit, reminders,
 * nurture) directly on the prospect row so she doesn't have to click
 * Start on a 1-person queue just to leave a note or text a booking link.
 *
 * Buttons:
 *   📝 Notes    — append a freeform note to /api/notes/[id]
 *   📅 Book     — modal: SMS (sms: deeplink) OR email (POST /send-booking)
 *   🔍 Audit    — modal: SMS (sms: deeplink) OR email (POST /send-audit)
 *   ⏰ Remind   — modal: date+time + reason → POST /reminder (creates a
 *                 prospect_touches row with next_touch_at set)
 *   🌱 Nurture  — modal: optional reason → POST /nurture (status flip)
 *
 * All buttons stopPropagation so clicking them doesn't toggle the row's
 * queue-selection state.
 */

type ModalKind = null | "notes" | "book" | "audit" | "remind" | "nurture";

export default function LeadRowActions({
  prospect,
  onMutate,
  onNurtured,
}: {
  prospect: Prospect;
  /** Called after any mutation that should refresh the list (note added,
   *  reminder set, booking/audit email sent). */
  onMutate?: () => void;
  /** Called after a successful nurture flip so the parent can locally
   *  remove the row without waiting for a refetch. */
  onNurtured?: (id: string) => void;
}) {
  const [open, setOpen] = useState<ModalKind>(null);
  const [copied, setCopied] = useState(false);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  // Short preview URL — /p/[code] (~40 chars), the link Madie pastes
  // into SMS / email / DM. Uses the persisted short_code; the /p/ route
  // resolves it to the full preview. NEVER copy /preview/[uuid] (85+
  // chars) — CLAUDE.md Short URL Rule.
  const shortCode = prospect.short_code;
  const previewLink = shortCode
    ? `https://bluejayportfolio.com/p/${shortCode}`
    : null;

  const copyLink = async () => {
    if (!previewLink) return;
    try {
      await navigator.clipboard.writeText(previewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API can fail on insecure origins / old browsers —
      // fall back to a hidden textarea + execCommand.
      try {
        const ta = document.createElement("textarea");
        ta.value = previewLink;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } catch {
        // give up silently — the View site button is the fallback
      }
    }
  };

  return (
    <>
      {/* Quick-action bar — labeled pills grouped in a subtle container
          so they read as one unit. Each button is icon + short word so
          Madie doesn't have to memorize emoji meanings. */}
      <div
        className="flex items-center gap-0.5 ml-1 rounded-lg border border-white/10 bg-slate-950/40 p-0.5"
        onClick={stop}
      >
        {previewLink && (
          <ActionBtn
            icon={copied ? "✓" : "🔗"}
            label={copied ? "Copied" : "Link"}
            tone="cyan"
            title="Copy the short preview link to paste into a text or email"
            onClick={copyLink}
          />
        )}
        <ActionBtn
          icon="📝"
          label="Note"
          tone="slate"
          title="Add a quick note to this prospect"
          onClick={() => setOpen("notes")}
        />
        {prospect.email && (
          <ActionBtn
            icon="📅"
            label="Book"
            tone="violet"
            title="Send Ben's booking link (SMS or email)"
            onClick={() => setOpen("book")}
          />
        )}
        {(prospect.email || prospect.phone) && (
          <ActionBtn
            icon="🔍"
            label="Audit"
            tone="sky"
            title="Send the site audit link"
            onClick={() => setOpen("audit")}
          />
        )}
        <ActionBtn
          icon="⏰"
          label="Later"
          tone="amber"
          title="Set a callback reminder"
          onClick={() => setOpen("remind")}
        />
        <ActionBtn
          icon="🌱"
          label="Nurture"
          tone="emerald"
          title="Move to nurture — hides from default view, doesn't delete"
          onClick={() => setOpen("nurture")}
        />
      </div>

      {open === "notes" && (
        <NotesModal
          prospect={prospect}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null);
            onMutate?.();
          }}
        />
      )}
      {open === "book" && (
        <SendModal
          kind="book"
          prospect={prospect}
          onClose={() => setOpen(null)}
          onSent={() => {
            setOpen(null);
            onMutate?.();
          }}
        />
      )}
      {open === "audit" && (
        <SendModal
          kind="audit"
          prospect={prospect}
          onClose={() => setOpen(null)}
          onSent={() => {
            setOpen(null);
            onMutate?.();
          }}
        />
      )}
      {open === "remind" && (
        <RemindModal
          prospect={prospect}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null);
            onMutate?.();
          }}
        />
      )}
      {open === "nurture" && (
        <NurtureModal
          prospect={prospect}
          onClose={() => setOpen(null)}
          onDone={() => {
            setOpen(null);
            onNurtured?.(prospect.id);
          }}
        />
      )}
    </>
  );
}

// ─── Shared button ─────────────────────────────────────────────────

type ActionTone = "slate" | "violet" | "sky" | "amber" | "emerald" | "cyan";

const TONE_STYLES: Record<ActionTone, string> = {
  cyan:
    "text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-100 border-transparent hover:border-cyan-500/30",
  slate:
    "text-slate-300 hover:bg-slate-500/15 hover:text-slate-100 border-transparent hover:border-slate-500/30",
  violet:
    "text-violet-300 hover:bg-violet-500/15 hover:text-violet-100 border-transparent hover:border-violet-500/30",
  sky:
    "text-sky-300 hover:bg-sky-500/15 hover:text-sky-100 border-transparent hover:border-sky-500/30",
  amber:
    "text-amber-300 hover:bg-amber-500/15 hover:text-amber-100 border-transparent hover:border-amber-500/30",
  emerald:
    "text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-100 border-transparent hover:border-emerald-500/30",
};

function ActionBtn({
  icon,
  label,
  tone,
  title,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  tone: ActionTone;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md border text-[10px] uppercase tracking-wider font-bold leading-none transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${TONE_STYLES[tone]}`}
    >
      <span className="text-[11px] leading-none">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Modal scaffold ────────────────────────────────────────────────

function ModalScaffold({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lra-modal-title"
    >
      <div
        className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h2
              id="lra-modal-title"
              className="text-base font-bold text-foreground"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-muted hover:text-foreground text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Notes ─────────────────────────────────────────────────────────

function NotesModal({
  prospect,
  onClose,
  onSaved,
}: {
  prospect: Prospect;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/notes/${prospect.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Couldn't save note");
      }
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalScaffold
      title="Add note"
      subtitle={prospect.businessName ?? prospect.id.slice(0, 8)}
      onClose={onClose}
    >
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Spoke to owner — interested but waiting on partner's OK. Said call back Thursday after 2pm."
        rows={5}
        className="w-full rounded-lg bg-slate-950 border border-white/10 text-foreground text-sm p-3 placeholder:text-muted/60 focus:outline-none focus:border-pink-500/60"
      />
      {err && <p className="text-rose-400 text-xs mt-2">{err}</p>}
      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] uppercase tracking-wider font-bold text-muted hover:text-foreground px-3 py-1.5 rounded-md"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy || !text.trim()}
          className="text-[12px] uppercase tracking-wider font-bold rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save note"}
        </button>
      </div>
    </ModalScaffold>
  );
}

// ─── Send (booking or audit) ───────────────────────────────────────

function SendModal({
  kind,
  prospect,
  onClose,
  onSent,
}: {
  kind: "book" | "audit";
  prospect: Prospect;
  onClose: () => void;
  onSent: () => void;
}) {
  const apiPath =
    kind === "book"
      ? `/api/prospects/${prospect.id}/send-booking`
      : `/api/prospects/${prospect.id}/send-audit`;

  const firstName = prospect.ownerName?.trim().split(/\s+/)[0] || "there";
  const biz = prospect.businessName || "your business";

  // Default SMS copy. Madie can edit before tapping Send.
  const defaultSms =
    kind === "book"
      ? `Hey ${firstName}, Madie with BlueJays — as promised, here's Ben's calendar to grab a 15-min walkthrough of the site we built for ${biz}: https://bluejayportfolio.com/book-ben`
      : `Hey ${firstName}, Madie with BlueJays — here's that 60-second audit of ${biz}'s site I mentioned. Shows the issues + the $ you're losing/mo: https://bluejayportfolio.com/audit`;

  const [smsBody, setSmsBody] = useState(defaultSms);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [smsClicked, setSmsClicked] = useState(false);

  const sendEmail = async () => {
    setEmailBusy(true);
    setEmailErr(null);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callerFirstName: "Madie" }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!j.ok) throw new Error(j.error || "Email send failed");
      setEmailSent(true);
      // Auto-close + refresh after the success state shows briefly.
      setTimeout(onSent, 900);
    } catch (e) {
      setEmailErr((e as Error).message);
    } finally {
      setEmailBusy(false);
    }
  };

  const smsHref = prospect.phone
    ? `sms:${prospect.phone}?&body=${encodeURIComponent(smsBody)}`
    : null;

  return (
    <ModalScaffold
      title={kind === "book" ? "Send booking link" : "Send audit link"}
      subtitle={prospect.businessName ?? prospect.id.slice(0, 8)}
      onClose={onClose}
    >
      {/* SMS section — only if we have a phone */}
      {prospect.phone ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-muted">
              SMS to {prospect.phone}
            </label>
            <span className="text-[10px] text-muted/70">
              Opens your phone's text app
            </span>
          </div>
          <textarea
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg bg-slate-950 border border-white/10 text-foreground text-xs p-2.5 focus:outline-none focus:border-pink-500/60"
          />
          <a
            href={smsHref ?? "#"}
            onClick={() => {
              setSmsClicked(true);
              // Don't auto-close on SMS click — let her come back and
              // also send the email if she wants both channels.
            }}
            className="mt-2 block text-center text-[12px] uppercase tracking-wider font-bold rounded-md bg-pink-500/20 border border-pink-500/40 text-pink-200 hover:bg-pink-500/30 px-3 py-2 transition-colors"
          >
            {smsClicked ? "📱 SMS app opened — send it" : "📱 Open SMS app"}
          </a>
        </div>
      ) : (
        <p className="mb-4 text-[12px] text-muted bg-slate-950 border border-white/10 rounded-lg p-3">
          No phone saved for this lead — you can&apos;t text them.
        </p>
      )}

      {/* Email section — only if we have an email */}
      {prospect.email ? (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-muted">
              Email to {prospect.email}
            </label>
            <span className="text-[10px] text-muted/70">
              Sent via BlueJays inbox
            </span>
          </div>
          <p className="text-[12px] text-muted mb-2">
            Sends the {kind === "book" ? "booking" : "audit"} link in a
            clean email from BlueJays. They&apos;ll get it in about 30
            seconds.
          </p>
          {emailErr && (
            <p className="text-rose-400 text-xs mb-2">{emailErr}</p>
          )}
          <button
            type="button"
            onClick={sendEmail}
            disabled={emailBusy || emailSent}
            className={`w-full text-[12px] uppercase tracking-wider font-bold rounded-md px-3 py-2 transition-colors ${
              emailSent
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200"
                : "bg-sky-500/20 border border-sky-500/40 text-sky-200 hover:bg-sky-500/30 disabled:opacity-40"
            }`}
          >
            {emailSent
              ? "✓ Email sent"
              : emailBusy
                ? "Sending…"
                : "✉ Send email"}
          </button>
        </div>
      ) : (
        <p className="border-t border-white/10 pt-4 text-[12px] text-muted">
          No email saved for this lead — text them instead.
        </p>
      )}
    </ModalScaffold>
  );
}

// ─── Reminder ──────────────────────────────────────────────────────

function RemindModal({
  prospect,
  onClose,
  onSaved,
}: {
  prospect: Prospect;
  onClose: () => void;
  onSaved: () => void;
}) {
  // Default = tomorrow at 10am local
  const defaultWhen = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    // Format as local datetime-local input
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  const [when, setWhen] = useState(defaultWhen);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (!when) return;
    setBusy(true);
    setErr(null);
    try {
      const iso = new Date(when).toISOString();
      const res = await fetch(`/api/prospects/${prospect.id}/reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          next_touch_at: iso,
          note: note.trim() || undefined,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!j.ok) throw new Error(j.error || "Couldn't save reminder");
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Quick-pick chips for common follow-up windows
  const quickPicks: { label: string; daysFromNow: number; hour: number }[] = [
    { label: "Tomorrow 10am", daysFromNow: 1, hour: 10 },
    { label: "Thursday 2pm", daysFromNow: nextWeekdayOffset(4), hour: 14 },
    { label: "Next Monday 9am", daysFromNow: nextWeekdayOffset(1), hour: 9 },
    { label: "In 1 week", daysFromNow: 7, hour: 10 },
  ];

  const applyQuickPick = (daysFromNow: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    setWhen(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
    );
  };

  return (
    <ModalScaffold
      title="Set reminder"
      subtitle={prospect.businessName ?? prospect.id.slice(0, 8)}
      onClose={onClose}
    >
      <div className="mb-3">
        <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
          Quick pick
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {quickPicks.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => applyQuickPick(q.daysFromNow, q.hour)}
              className="text-[11px] font-bold uppercase tracking-wider rounded-md px-2.5 py-1.5 border border-white/10 bg-slate-950 text-muted hover:text-foreground hover:border-pink-500/40 transition-colors"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
          When
        </label>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full rounded-lg bg-slate-950 border border-white/10 text-foreground text-sm p-2.5 focus:outline-none focus:border-pink-500/60"
        />
      </div>

      <div className="mb-1">
        <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Owner said call back after partner meeting on Wed"
          className="w-full rounded-lg bg-slate-950 border border-white/10 text-foreground text-sm p-2.5 placeholder:text-muted/60 focus:outline-none focus:border-pink-500/60"
        />
      </div>

      {err && <p className="text-rose-400 text-xs mt-2">{err}</p>}
      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] uppercase tracking-wider font-bold text-muted hover:text-foreground px-3 py-1.5 rounded-md"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy || !when}
          className="text-[12px] uppercase tracking-wider font-bold rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? "Saving…" : "⏰ Set reminder"}
        </button>
      </div>
    </ModalScaffold>
  );
}

// Calculates the offset in days from today to the next occurrence of
// the given weekday (1=Mon, 2=Tue, ..., 7=Sun). Returns 7 if today
// is already that weekday (jumps to NEXT one, not today).
function nextWeekdayOffset(weekday: number): number {
  const today = new Date().getDay(); // 0=Sun, 1=Mon, ... 6=Sat
  const target = weekday === 7 ? 0 : weekday;
  let diff = target - today;
  if (diff <= 0) diff += 7;
  return diff;
}

// ─── Nurture ───────────────────────────────────────────────────────

function NurtureModal({
  prospect,
  onClose,
  onDone,
}: {
  prospect: Prospect;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reasons = [
    "Not interested right now",
    "No budget",
    "Already has a site builder",
    "Bad fit",
    "Said call back in months",
  ];

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/nurture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!j.ok) throw new Error(j.error || "Couldn't move to nurture");
      onDone();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalScaffold
      title="Move to nurture"
      subtitle={prospect.businessName ?? prospect.id.slice(0, 8)}
      onClose={onClose}
    >
      <p className="text-[12px] text-muted mb-3 leading-relaxed">
        Hides this prospect from your default list so you can focus on
        real callable leads. They&apos;re NOT deleted — you can reveal
        them anytime by clicking the &quot;Show nurturing&quot; chip at
        the top of the list.
      </p>

      <div className="mb-3">
        <label className="block text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5">
          Reason (optional)
        </label>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r === reason ? "" : r)}
              className={`text-[11px] font-bold rounded-md px-2.5 py-1.5 border transition-colors ${
                reason === r
                  ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-slate-950 text-muted hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={reasons.includes(reason) ? "" : reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Or type your own…"
          className="w-full rounded-lg bg-slate-950 border border-white/10 text-foreground text-sm p-2.5 placeholder:text-muted/60 focus:outline-none focus:border-emerald-500/60"
        />
      </div>

      {err && <p className="text-rose-400 text-xs mt-2">{err}</p>}
      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] uppercase tracking-wider font-bold text-muted hover:text-foreground px-3 py-1.5 rounded-md"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="text-[12px] uppercase tracking-wider font-bold rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? "Saving…" : "🌱 Move to nurture"}
        </button>
      </div>
    </ModalScaffold>
  );
}
