"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BookingTimeModal from "@/components/clients/BookingTimeModal";

type FilledSection = {
  id: string;
  title: string;
  goal?: string;
  lines: string[];
  callerNotes?: string[];
};

type FilledObjection = {
  id: string;
  trigger: string;
  response: string[];
  callerNotes?: string;
};

type CallTip = {
  id: string;
  emoji: string;
  title: string;
  body: string;
};

type CallHistoryEntry = {
  id: string;
  calledAt: string;
  outcome: string;
  notes: string | null;
  auditLinkSent: boolean;
  partnerName: string;
  partnerCode: string;
};

type Props = {
  /**
   * "partner" (default) — used by /partners/work. Partner cookie auth,
   *   pulls next prospect from approved pool, logs to partner_calls,
   *   shows agreement gate + logout.
   * "admin" — used by /dashboard/script. Admin middleware auth, queue-
   *   driven (Prev/Next from URL params), no agreement gate, no
   *   partner_calls write, "Ben's workspace" branding. Pass
   *   adminQueueNav for the queue navigation.
   */
  mode?: "partner" | "admin";
  /** Required when mode='admin' — drives Prev/Next + queue position. */
  adminQueueNav?: {
    prevHref: string | null;
    nextHref: string | null;
    index: number; // 0-based
    total: number;
    /** Where to send Ben when he's done (defaults to /dashboard) */
    doneHref?: string;
  };
  partner: {
    id: string;
    name: string;
    code: string;
    agreementAccepted: boolean;
  };
  prospect: {
    id: string;
    businessName: string;
    ownerName: string | null;
    ownerKnown: boolean;
    phone: string;
    email: string | null;
    city: string | null;
    state: string | null;
    category: string | null;
    status: string | null;
    hasCompletedAudit: boolean;
    latestAuditId: string | null;
    websiteUrl: string | null;
    googleSearchUrl: string;
    // Hours / open-status (always computed; "precise" flag tells us
    // whether real hours were parsed or we're heuristic-guessing).
    rawHours: string | null;
    clockDisplay: string;
    clockIsFallbackTz: boolean;
    openState: "open" | "closed";
    openLabel: string;
    openPrecise: boolean;
    openHint: string | null;
    // Research links — opened in new tabs so caller can scan before
    // dialing without losing the workspace state.
    previewUrl: string;          // /preview/[id]
    auditViewUrl: string | null; // /audit/[audit-id] if hasCompletedAudit
    categoryTemplateUrl: string; // /v2/[category]
  } | null;
  counters: {
    callsThisSession: number;
    goal: number;
    remainingPool: number;
  };
  links: {
    previewUrl: string;
    auditUrl: string;
    scheduleUrl: string;
  };
  script: {
    intro: FilledSection;
    qualify: FilledSection;
    pitch: FilledSection;
    bookTheCall: FilledSection;
    textTheLink: FilledSection;
    callbackClose: FilledSection;
    voicemail: FilledSection;
    objections: FilledObjection[];
  };
  tips: CallTip[];
  mantra: string;
  callHistory: CallHistoryEntry[];
};

type Outcome =
  | "no_answer"
  | "voicemail"
  | "wrong_number"
  | "answered_not_interested"
  | "answered_call_scheduled"
  | "answered_preview_sent"
  | "answered_audit_sent"
  | "answered_callback"
  | "do_not_call";

const OUTCOME_META: Record<
  Outcome,
  { label: string; group: "answered" | "no_answer" | "tcpa"; tone: string }
> = {
  no_answer: { label: "Didn't answer", group: "no_answer", tone: "slate" },
  voicemail: { label: "Left voicemail", group: "no_answer", tone: "slate" },
  wrong_number: { label: "Wrong number", group: "no_answer", tone: "slate" },
  answered_call_scheduled: {
    label: "✓ Booked Ben's call",
    group: "answered",
    tone: "emerald",
  },
  answered_preview_sent: {
    label: "Sent preview link (didn't book)",
    group: "answered",
    tone: "sky",
  },
  answered_audit_sent: {
    label: "Sent audit (didn't book)",
    group: "answered",
    tone: "amber",
  },
  answered_callback: {
    label: "Asked to call back",
    group: "answered",
    tone: "sky",
  },
  answered_not_interested: {
    label: "Not interested",
    group: "answered",
    tone: "slate",
  },
  do_not_call: { label: "Take me off the list", group: "tcpa", tone: "rose" },
};

export default function CallWorkspace(props: Props) {
  const { partner, prospect, counters, links, script, tips, mantra, callHistory } = props;
  const mode = props.mode ?? "partner";
  const isAdmin = mode === "admin";
  const adminQueueNav = props.adminQueueNav;
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [previewLinkSent, setPreviewLinkSent] = useState(false);
  const [auditLinkSent, setAuditLinkSent] = useState(false);
  const [bookingLinkSent, setBookingLinkSent] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSpoken, setBookingSpoken] = useState<string | null>(null);
  // Email-preview-link button state — fires the SendGrid pipeline so
  // the prospect gets the same preview link from ben@bluejayportfolio.com
  // that's already wired up for cold outreach + transactional sends.
  const [emailPreviewSending, setEmailPreviewSending] = useState(false);
  const [emailPreviewSent, setEmailPreviewSent] = useState(false);
  const [emailPreviewError, setEmailPreviewError] = useState<string | null>(null);
  const [sentText, setSentText] = useState(false);
  // Admin (Ben) bypasses the partner-agreement gate entirely — he doesn't
  // need to accept his own contractor terms.
  const [showAgreement, setShowAgreement] = useState(
    isAdmin ? false : !partner.agreementAccepted,
  );
  const [section, setSection] = useState<SectionId>("intro");
  // Tracks the outcome the rep just marked. Saved silently, lets them
  // keep reading the script (e.g. flip to the Voicemail tab AFTER
  // marking 'Left voicemail' and read the actual VM script). Click
  // "Next prospect →" when truly done with this lead.
  const [savedOutcome, setSavedOutcome] = useState<Outcome | null>(null);

  async function logCall(outcome: Outcome) {
    if (!prospect || busy) return;
    setBusy(true);
    try {
      // Admin mode: skip /api/partners/work/log-call (writes to
      // partner_calls with the partner_id, not relevant for Ben).
      // Instead, post a note to the prospect via the existing notes
      // system. Ben reviews outcomes via the /lead/[id] timeline.
      //
      // IMPORTANT: don't auto-advance. Rep needs to stay on this page
      // to read the voicemail / objection script after marking the
      // outcome. They click "Next prospect →" when ready.
      if (isAdmin) {
        try {
          await fetch(`/api/notes/${prospect.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              body: `Call outcome: ${outcome.replace(/_/g, " ")}${notes.trim() ? `\n\n${notes.trim()}` : ""}`,
            }),
          });
        } catch {
          // Note save failed — non-blocking. Outcome still tracked
          // locally so the rep sees their selection persist.
        }
        setSavedOutcome(outcome);
        setBusy(false);
        return;
      }

      const res = await fetch("/api/partners/work/log-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: prospect.id,
          outcome,
          notes: notes.trim() || undefined,
          auditLinkSent,
          bookingLinkSent,
          textSent: sentText,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Couldn't log call.");
        setBusy(false);
        return;
      }
      // Mark outcome saved — rep stays on the page to finish reading
      // the script (e.g. voicemail message). They click "Next →" when
      // truly ready to move on.
      setSavedOutcome(outcome);
    } catch {
      alert("Network error.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Explicit advance — fires when rep clicks "Next prospect →" /
   * "Done with queue" after marking the outcome and finishing the
   * voicemail / wrap-up. Resets card state and either pushes to the
   * next queue entry (admin) or refreshes to pull next from the pool
   * (partner).
   */
  function advanceQueue() {
    setNotes("");
    setPreviewLinkSent(false);
    setAuditLinkSent(false);
    setBookingLinkSent(false);
    setBookingSpoken(null);
    setSentText(false);
    setEmailPreviewSent(false);
    setEmailPreviewError(null);
    setSection("intro");
    setSavedOutcome(null);

    if (isAdmin) {
      const next = adminQueueNav?.nextHref;
      router.push(next || adminQueueNav?.doneHref || "/dashboard");
    } else {
      router.refresh();
    }
  }

  async function acceptAgreement() {
    setBusy(true);
    try {
      await fetch("/api/partners/work/agreement", { method: "POST" });
      setShowAgreement(false);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/partners/logout", { method: "POST" });
    window.location.href = "/partners/login";
  }

  function smsBody(kind: "preview" | "audit" | "booking") {
    const firstName = prospect?.ownerName?.trim().split(/\s+/)[0] || "there";
    const callerFirst = partner.name.split(/\s+/)[0];
    if (kind === "preview") {
      return `Hey ${firstName}, ${callerFirst} with BlueJays — here's that website we built for ${prospect?.businessName || "your business"}: ${links.previewUrl}`;
    }
    if (kind === "booking") {
      return `Hey ${firstName}, ${callerFirst} with BlueJays — pick a 15-min slot for the walkthrough with Ben here: ${links.scheduleUrl}`;
    }
    return `Hey ${firstName}, ${callerFirst} with BlueJays — here's that free 60-second audit of your site: ${links.auditUrl}`;
  }

  function smsHref(kind: "preview" | "audit" | "booking"): string {
    if (!prospect) return "#";
    const body = encodeURIComponent(smsBody(kind));
    // sms: deep-link with body. Phone number first so messages app
    // pre-selects the recipient. Format works on iOS/Android.
    return `sms:${prospect.phone.replace(/[^0-9+]/g, "")}?&body=${body}`;
  }

  async function emailPreviewLink() {
    if (!prospect || emailPreviewSending) return;
    setEmailPreviewSending(true);
    setEmailPreviewError(null);
    try {
      const res = await fetch(
        `/api/partners/work/send-preview-email/${prospect.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            previewUrl: links.previewUrl,
            callerFirstName: partner.name.split(/\s+/)[0],
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEmailPreviewError(data.error || "Email send failed");
        return;
      }
      setEmailPreviewSent(true);
      setSentText(true); // counts as a "link sent" for outcome panel context
    } catch {
      setEmailPreviewError("Network error");
    } finally {
      setEmailPreviewSending(false);
    }
  }

  if (showAgreement) {
    return <AgreementGate onAccept={acceptAgreement} busy={busy} />;
  }

  if (!prospect) {
    if (isAdmin) {
      return (
        <main className="min-h-screen bg-slate-950 text-white grid place-items-center px-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-3">Queue empty</h1>
            <p className="text-slate-400 mb-6">
              That lead isn&apos;t accessible — it may have been dismissed or merged. Head back and pick another.
            </p>
            <Link
              href={adminQueueNav?.doneHref || "/dashboard"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-electric text-white font-semibold hover:bg-blue-electric/90"
            >
              ← Back to dashboard
            </Link>
          </div>
        </main>
      );
    }
    return <EmptyPool partnerName={partner.name} onLogout={logout} />;
  }

  const sessionPct = Math.min(
    100,
    Math.round((counters.callsThisSession / Math.max(1, counters.goal)) * 100),
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top bar — counter + logout (or back-to-dashboard for admin) */}
      <header className="border-b border-white/5 bg-slate-950/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="font-bold text-amber-300 truncate">
              {isAdmin ? "Ben's workspace" : `${partner.name.split(/\s+/)[0]}'s workspace`}
            </div>
            <span className="hidden sm:inline text-xs text-slate-500">
              {isAdmin && adminQueueNav
                ? `· lead ${adminQueueNav.index + 1} of ${adminQueueNav.total}`
                : `· pool: ${counters.remainingPool}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && adminQueueNav ? (
              <>
                <div className="hidden md:block min-w-[160px]">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                    <span>Queue progress</span>
                    <span className="font-mono font-bold text-white">
                      {adminQueueNav.index + 1}<span className="text-slate-500">/{adminQueueNav.total}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-electric to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.round(((adminQueueNav.index + 1) / Math.max(1, adminQueueNav.total)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="md:hidden text-sm font-bold text-blue-electric tabular-nums">
                  {adminQueueNav.index + 1}/{adminQueueNav.total}
                </span>
                <Link
                  href={adminQueueNav.doneHref || "/dashboard"}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  ← Dashboard
                </Link>
              </>
            ) : (
              <>
                <div className="hidden md:block min-w-[160px]">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                    <span>This session</span>
                    <span className="font-mono font-bold text-white">
                      {counters.callsThisSession}<span className="text-slate-500">/{counters.goal}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${sessionPct}%` }}
                    />
                  </div>
                </div>
                <span className="md:hidden text-sm font-bold text-amber-300 tabular-nums">
                  {counters.callsThisSession}/{counters.goal}
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
        {/* Mantra banner — anchors after every no */}
        <div className="border-t border-amber-500/20 bg-amber-500/5">
          <div className="mx-auto max-w-7xl px-4 py-1.5 text-center">
            <p className="text-xs font-semibold text-amber-300 tracking-wide">
              🔥 {mantra}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: Prospect card + script */}
        <div>
          <ProspectCard prospect={prospect} />

          <SectionTabs section={section} setSection={setSection} />

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 mt-4">
            {section === "intro" && (
              <ScriptCard section={script.intro} />
            )}
            {section === "qualify" && (
              <ScriptCard section={script.qualify} />
            )}
            {section === "pitch" && (
              <ScriptCard section={script.pitch} accent="amber" />
            )}
            {section === "bookTheCall" && (
              <ScriptCard
                section={script.bookTheCall}
                accent="emerald"
                primary
              />
            )}
            {section === "textTheLink" && (
              <ScriptCard section={script.textTheLink} accent="amber" />
            )}
            {section === "callbackClose" && (
              <ScriptCard section={script.callbackClose} accent="sky" />
            )}
            {section === "voicemail" && (
              <ScriptCard section={script.voicemail} accent="slate" />
            )}
            {section === "objections" && (
              <ObjectionList objections={script.objections} />
            )}
          </div>

          {/* Notes */}
          <label className="block mt-5">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Notes (optional, for Ben)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything you want Ben to know about this prospect"
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </label>
        </div>

        {/* RIGHT: action panel — link send + outcomes */}
        <aside className="space-y-4">
          {/* Send links */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Send to {prospect.ownerName?.split(/\s+/)[0] || "them"}
            </p>

            <a
              href={smsHref("preview")}
              onClick={() => { setPreviewLinkSent(true); setSentText(true); }}
              className={`block w-full rounded-md px-4 py-3 text-sm font-bold text-center transition-colors ${
                previewLinkSent
                  ? "bg-sky-500/20 border border-sky-500/50 text-sky-200"
                  : "bg-sky-500 hover:bg-sky-400 text-sky-950 shadow-lg shadow-sky-500/25"
              }`}
            >
              {previewLinkSent ? "✓ Preview text sent" : "📱 Text preview link (START HERE)"}
            </a>

            {/* Email preview link — fires the same preview URL via
                SendGrid from ben@bluejayportfolio.com. Useful when the
                prospect prefers email, or when you want them to have
                BOTH (text for the now-moment, email for tonight when
                they're actually at a desk). */}
            {prospect.email && (
              <button
                type="button"
                onClick={emailPreviewLink}
                disabled={emailPreviewSending || emailPreviewSent}
                className={`block w-full rounded-md px-4 py-3 text-sm font-bold text-center transition-colors disabled:cursor-not-allowed ${
                  emailPreviewSent
                    ? "bg-sky-500/20 border border-sky-500/50 text-sky-200"
                    : emailPreviewSending
                      ? "bg-sky-500/40 text-sky-100"
                      : "bg-sky-500/15 border border-sky-500/40 text-sky-200 hover:bg-sky-500/25"
                }`}
              >
                {emailPreviewSent
                  ? `✓ Preview emailed to ${prospect.email}`
                  : emailPreviewSending
                    ? "Sending email..."
                    : `📧 Email preview link (${prospect.email})`}
              </button>
            )}
            {emailPreviewError && (
              <p className="text-[11px] text-rose-300 leading-relaxed">
                ⚠ {emailPreviewError}
              </p>
            )}

            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className={`block w-full rounded-md px-4 py-3 text-sm font-bold text-center transition-colors ${
                bookingLinkSent
                  ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-200"
                  : "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {bookingLinkSent
                ? `✓ Booking link sent${bookingSpoken ? ` (${bookingSpoken})` : ""}`
                : "📞 Send booking link (pick a time)"}
            </button>

            <a
              href={smsHref("audit")}
              onClick={() => { setAuditLinkSent(true); setSentText(true); }}
              className={`block w-full rounded-md px-4 py-3 text-sm font-semibold text-center transition-colors ${
                auditLinkSent
                  ? "bg-amber-500/20 border border-amber-500/50 text-amber-200"
                  : "bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              {auditLinkSent ? "✓ Audit link sent" : "📄 Send audit link (fallback)"}
            </a>

            <a
              href={`tel:${prospect.phone.replace(/[^0-9+]/g, "")}`}
              className="block w-full rounded-md border border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/15 px-4 py-3 text-base font-mono text-center text-sky-200 hover:text-white transition-colors tabular-nums font-semibold"
            >
              📲 Tap to dial · {formatPhone(prospect.phone)}
            </a>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Tap a button to open your messages app pre-filled.
              Lead with the preview, follow up with booking.
            </p>
          </div>

          {/* Hormozi cheat sheet — pinned ALWAYS visible during call.
              The reps that close are the ones reading these between
              every dial, not just on day one. */}
          <details
            className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden"
          >
            <summary className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wider text-amber-300 font-semibold hover:bg-amber-500/10 transition-colors flex items-center justify-between">
              <span>⭐ Before you dial — Hormozi tips</span>
              <span className="text-slate-500 text-[10px] font-normal">tap to collapse</span>
            </summary>
            <div className="px-4 pb-4 space-y-3">
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className="flex gap-3 pt-3 first:pt-1 border-t border-amber-500/10 first:border-t-0"
                >
                  <span className="text-lg flex-shrink-0 leading-none mt-0.5">
                    {tip.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-200 leading-tight mb-0.5">
                      {tip.title}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {tip.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </details>

          {/* Outcomes */}
          <div id="outcome" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 scroll-mt-24">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              How did the call go?
            </p>
            <div className="space-y-2">
              <OutcomeButton
                outcome="answered_call_scheduled"
                onClick={logCall}
                busy={busy}
                primary
                saved={savedOutcome === "answered_call_scheduled"}
              />
              <OutcomeButton outcome="answered_preview_sent" onClick={logCall} busy={busy} saved={savedOutcome === "answered_preview_sent"} />
              <OutcomeButton outcome="answered_audit_sent" onClick={logCall} busy={busy} saved={savedOutcome === "answered_audit_sent"} />
              <OutcomeButton outcome="answered_callback" onClick={logCall} busy={busy} saved={savedOutcome === "answered_callback"} />
              <OutcomeButton
                outcome="answered_not_interested"
                onClick={logCall}
                busy={busy}
                saved={savedOutcome === "answered_not_interested"}
              />
              <div className="border-t border-white/5 pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSentText((v) => !v)}
                  className={`w-full rounded-md px-3 py-2.5 text-sm font-semibold text-left transition-colors mb-2 ${
                    sentText
                      ? "bg-sky-500/20 border border-sky-500/50 text-sky-200"
                      : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:border-white/20"
                  }`}
                >
                  {sentText ? "✓ Also sent a text" : "📱 Also sent a text"}
                </button>
                <OutcomeButton outcome="voicemail" onClick={logCall} busy={busy} saved={savedOutcome === "voicemail"} />
                <OutcomeButton outcome="no_answer" onClick={logCall} busy={busy} saved={savedOutcome === "no_answer"} />
                <OutcomeButton outcome="wrong_number" onClick={logCall} busy={busy} saved={savedOutcome === "wrong_number"} />
              </div>
              <div className="border-t border-rose-500/20 pt-2 mt-2">
                <OutcomeButton outcome="do_not_call" onClick={logCall} busy={busy} saved={savedOutcome === "do_not_call"} />
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Use only if they ask to be removed. Flags them DNC permanently.
                </p>
              </div>
            </div>
          </div>

          {/* Saved-outcome banner — appears after marking outcome.
              Reassures the rep their selection was saved AND tells them
              they're free to keep reading the script (e.g. flip to the
              Voicemail tab and read the actual VM message) before
              moving on. Clicking an outcome again replaces the saved
              one. */}
          {savedOutcome && (
            <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-500/10 p-4 space-y-2">
              <p className="text-sm font-bold text-emerald-200">
                ✓ Saved: {OUTCOME_META[savedOutcome].label}
              </p>
              <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                {savedOutcome === "voicemail"
                  ? "Now flip to the Voicemail tab and read the message. Click Next when you've hung up."
                  : "Outcome logged. Take your time wrapping up — click an outcome again to change it, or Next when you're ready."}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={advanceQueue}
            className={`block w-full rounded-md px-4 py-3 text-sm font-bold text-center transition-colors ${
              savedOutcome
                ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/25"
                : "border border-white/10 bg-slate-950 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {savedOutcome
              ? (isAdmin
                  ? (adminQueueNav?.nextHref ? "Next prospect →" : "Done with queue ✓")
                  : "Next prospect →")
              : (isAdmin
                  ? (adminQueueNav?.nextHref ? "⤼ Skip — next in queue" : "⤼ Done with queue")
                  : "⤼ Skip this prospect")}
          </button>

          {/* Past calls with this prospect — shown right under the
              advance button so the rep can scan history before moving
              on (or reference it mid-call). */}
          {callHistory.length > 0 && (
            <CallHistoryPanel entries={callHistory} />
          )}
        </aside>
      </div>

      {/* Floating "jump to outcome" — appears on long script pages so
          the caller can mark outcome fast after hanging up without
          scrolling. Hidden on lg+ where the outcomes panel is visible
          in the right rail anyway. */}
      <a
        href="#outcome"
        className="fixed bottom-4 right-4 lg:hidden z-50 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-3 text-sm font-bold shadow-2xl shadow-emerald-500/30 transition-colors"
      >
        ✓ Mark call outcome
      </a>

      <BookingTimeModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onConfirm={(slot, smsHref) => {
          setBookingLinkSent(true);
          setSentText(true);
          setBookingSpoken(slot.spoken);
          setBookingModalOpen(false);
          // Open the partner's messages app pre-filled with the
          // slot-specific SMS body. window.location works for sms:
          // links across iOS/Android/desktop.
          window.location.href = smsHref;
        }}
        prospectFirstName={prospect.ownerName?.trim().split(/\s+/)[0] || "there"}
        prospectPhone={prospect.phone || ""}
        callerFirstName={partner.name.split(/\s+/)[0]}
        bookingUrl={links.scheduleUrl}
      />
    </main>
  );
}

function ProspectCard({
  prospect,
}: {
  prospect: NonNullable<Props["prospect"]>;
}) {
  const openIsGreen = prospect.openState === "open";
  const dotCls = openIsGreen
    ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
    : "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]";
  const badgeCls = openIsGreen
    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
    : "bg-rose-500/10 border-rose-500/40 text-rose-200";

  return (
    <div className="rounded-2xl border-2 border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-slate-900/80 to-slate-950 p-5 mb-5 shadow-lg shadow-sky-500/5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-1">
            📞 Calling {prospect.category?.replace(/-/g, " ") || "business"}
            {prospect.city ? ` in ${prospect.city}` : ""}
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 truncate">
            {prospect.businessName}
          </h2>

          {/* Owner row — known name OR explicit "unknown" guidance */}
          {prospect.ownerKnown && prospect.ownerName ? (
            <p className="text-sm text-slate-300">
              Owner:{" "}
              <span className="font-semibold text-white">
                {prospect.ownerName}
              </span>
            </p>
          ) : (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-200">
              ⚠️ <span className="font-semibold">Owner name not on file</span>
              {" — "}ask: <em className="text-amber-100">&quot;Who handles
              the website over there?&quot;</em>
            </div>
          )}
        </div>
        {prospect.hasCompletedAudit && (
          <span className="shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
            ✓ Audit ready
          </span>
        )}
      </div>

      {/* Open/closed indicator + local time. Always shown. The dot is
          green when "open" / red when "closed" — the LABEL clarifies
          whether it's a confident verdict (parsed hours) or a likely-
          guess (heuristic). */}
      <div className={`rounded-lg border ${badgeCls} px-3 py-2 mb-3 flex items-start gap-3`}>
        <span className={`mt-1 inline-block h-3 w-3 rounded-full shrink-0 ${dotCls} ${openIsGreen ? "animate-pulse" : ""}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{prospect.openLabel}</span>
            <span className="text-xs opacity-70">
              · 🕐 {prospect.clockDisplay}
            </span>
            {!prospect.openPrecise && (
              <span className="text-[10px] uppercase tracking-wider opacity-60">
                heuristic
              </span>
            )}
            {prospect.clockIsFallbackTz && (
              <span className="text-[10px] uppercase tracking-wider opacity-60">
                tz unknown · using ET
              </span>
            )}
          </div>
          {prospect.openHint && (
            <p className="text-xs opacity-80 mt-0.5 leading-snug">
              {prospect.openHint}
            </p>
          )}
          {prospect.rawHours && prospect.openPrecise && (
            <p className="text-[10px] opacity-50 mt-1 truncate">
              Listed: {prospect.rawHours.split(/\n/)[0].slice(0, 80)}
            </p>
          )}
        </div>
      </div>

      {/* Pre-call research toolkit — opens in new tabs so the caller
          can skim before dialing without losing workspace state.
          Most useful is the personalized preview ("the site WE'd build
          for them") — that's the heart of the pitch. */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 mb-3">
        <p className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-2">
          🔬 Research before you dial
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={prospect.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1.5 text-xs font-bold transition-colors"
            title="Open the site BlueJays has built for this prospect (or would build)"
          >
            🔍 Preview their site
          </a>
          {prospect.auditViewUrl && (
            <a
              href={prospect.auditViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 px-3 py-1.5 text-xs font-semibold transition-colors"
              title="View the completed audit so you know what the prospect will see when you text the link"
            >
              📋 View audit
            </a>
          )}
          {prospect.websiteUrl ? (
            <a
              href={
                prospect.websiteUrl.startsWith("http")
                  ? prospect.websiteUrl
                  : `https://${prospect.websiteUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 hover:border-sky-500/40 bg-slate-900/60 hover:bg-sky-500/10 text-slate-300 hover:text-sky-200 px-3 py-1.5 text-xs transition-colors"
              title="Their actual current website"
            >
              🌐 Their site
            </a>
          ) : (
            <a
              href={prospect.googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 hover:border-sky-500/40 bg-slate-900/60 hover:bg-sky-500/10 text-slate-300 hover:text-sky-200 px-3 py-1.5 text-xs transition-colors"
              title="Google them to verify they're real + find the website"
            >
              🔎 Google them
            </a>
          )}
          <a
            href={prospect.categoryTemplateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 underline decoration-dotted underline-offset-4 px-1"
            title="Generic BlueJays template for this category — useful when no personalized preview exists yet"
          >
            template
          </a>
        </div>
      </div>

      {/* Phone — prominent on the card itself, not just on the rail.
          Caller's eyes never leave the prospect block. */}
      <a
        href={`tel:${prospect.phone.replace(/[^0-9+]/g, "")}`}
        className="block w-full rounded-lg border-2 border-sky-500/50 bg-sky-500/10 hover:bg-sky-500/20 px-4 py-3 text-center font-mono text-lg sm:text-xl font-bold text-sky-200 hover:text-white transition-colors mb-3 tabular-nums"
      >
        📲 {formatPhone(prospect.phone)}
      </a>

      {/* Email below phone — small, slate, just for reference */}
      {prospect.email && (
        <p className="text-xs text-slate-500 break-all">
          ✉ {prospect.email}
        </p>
      )}
    </div>
  );
}

type SectionId =
  | "intro"
  | "qualify"
  | "pitch"
  | "bookTheCall"
  | "textTheLink"
  | "callbackClose"
  | "voicemail"
  | "objections";

function SectionTabs({
  section,
  setSection,
}: {
  section: SectionId;
  setSection: (s: SectionId) => void;
}) {
  // Numbered flow tabs = the goal path (Open → Qualify → Pitch → Book).
  // Visually loud, full color when active, numbered.
  const flowTabs: Array<{ id: SectionId; label: string }> = [
    { id: "intro", label: "1 · Open" },
    { id: "qualify", label: "2 · Qualify" },
    { id: "pitch", label: "3 · Pitch" },
    { id: "bookTheCall", label: "4 · Book ★" },
  ];
  // Escape-hatch tabs = used only when the goal path fails. Muted,
  // smaller, set off visually so the caller's eye lands on the flow.
  const fallbackTabs: Array<{ id: SectionId; label: string }> = [
    { id: "textTheLink", label: "Audit fallback" },
    { id: "callbackClose", label: "Callback" },
    { id: "voicemail", label: "Voicemail" },
    { id: "objections", label: "Objections" },
  ];
  return (
    <div className="space-y-2 mb-1">
      {/* Flow row — bold, full-width segmented look */}
      <div className="flex flex-wrap items-center gap-1.5">
        {flowTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className={`flex-1 sm:flex-initial rounded-md px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
              section === t.id
                ? t.id === "bookTheCall"
                  ? "bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/30"
                  : "bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Escape-hatch row — smaller, tinted, "use only if needed" */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
        <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold pr-2">
          if needed →
        </span>
        {fallbackTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              section === t.id
                ? "bg-slate-700/70 border border-white/20 text-white"
                : "bg-transparent border border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/15"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Color-cycle for script lines so each line is visually distinct.
// Caller's eye can re-orient mid-sentence ("which line was I on?").
// Tailwind classes literal (not template) so JIT picks them up.
const LINE_COLORS = [
  {
    border: "border-amber-400",
    bg: "bg-amber-500/[0.06]",
    badge: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    border: "border-sky-400",
    bg: "bg-sky-500/[0.06]",
    badge: "bg-sky-500/20 text-sky-200 border-sky-500/30",
  },
  {
    border: "border-emerald-400",
    bg: "bg-emerald-500/[0.06]",
    badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
  {
    border: "border-fuchsia-400",
    bg: "bg-fuchsia-500/[0.06]",
    badge: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30",
  },
  {
    border: "border-rose-400",
    bg: "bg-rose-500/[0.06]",
    badge: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

function ScriptCard({
  section,
  accent,
  primary,
}: {
  section: FilledSection;
  accent?: "amber" | "emerald" | "sky" | "slate";
  primary?: boolean;
}) {
  const accentCls =
    accent === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : accent === "sky"
        ? "border-sky-500/30 bg-sky-500/5"
        : accent === "amber"
          ? "border-amber-500/30 bg-amber-500/5"
          : "";
  return (
    <div className={`rounded-xl ${accentCls ? "border " + accentCls + " p-4" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-bold text-white">{section.title}</h3>
        {primary && (
          <span className="rounded-full bg-emerald-500 text-emerald-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Primary win
          </span>
        )}
      </div>
      {section.goal && (
        <p className="text-xs text-slate-400 italic mb-4">→ {section.goal}</p>
      )}
      <ul className="space-y-2.5">
        {section.lines.map((line, i) => {
          const c = LINE_COLORS[i % LINE_COLORS.length];
          return (
            <li
              key={i}
              className={`flex gap-3 rounded-lg ${c.bg} border-l-4 ${c.border} pl-3 pr-4 py-3`}
            >
              <span
                className={`shrink-0 rounded-full border ${c.badge} h-6 w-6 inline-flex items-center justify-center text-[11px] font-bold tabular-nums`}
              >
                {i + 1}
              </span>
              <p className="text-base text-white leading-relaxed flex-1">
                {line}
              </p>
            </li>
          );
        })}
      </ul>
      {section.callerNotes && section.callerNotes.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Caller notes (don&apos;t read aloud)
          </p>
          <ul className="space-y-1.5">
            {section.callerNotes.map((note, i) => (
              <li
                key={i}
                className="text-xs text-slate-400 leading-relaxed pl-3 border-l border-slate-700"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ObjectionList({ objections }: { objections: FilledObjection[] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-3">Objection responses</h3>
      <p className="text-xs text-slate-400 italic mb-4">
        → Tap to expand. Always end on the audit-text or booking offer.
      </p>
      <div className="space-y-2">
        {objections.map((o) => (
          <details
            key={o.id}
            className="rounded-lg border border-white/10 bg-slate-950/50 overflow-hidden"
          >
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/5">
              &quot;{o.trigger}&quot;
            </summary>
            <div className="px-4 pb-4 pt-1">
              <ul className="space-y-2 mb-3">
                {o.response.map((line, i) => {
                  const c = LINE_COLORS[i % LINE_COLORS.length];
                  return (
                    <li
                      key={i}
                      className={`flex gap-2.5 rounded-md ${c.bg} border-l-4 ${c.border} pl-3 pr-3 py-2`}
                    >
                      <span
                        className={`shrink-0 rounded-full border ${c.badge} h-5 w-5 inline-flex items-center justify-center text-[10px] font-bold tabular-nums`}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm text-white leading-relaxed flex-1">
                        {line}
                      </p>
                    </li>
                  );
                })}
              </ul>
              {o.callerNotes && (
                <p className="text-xs text-slate-400 italic mt-3 pt-3 border-t border-white/5">
                  💡 {o.callerNotes}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function OutcomeButton({
  outcome,
  onClick,
  busy,
  primary,
  saved,
}: {
  outcome: Outcome;
  onClick: (o: Outcome) => void;
  busy: boolean;
  primary?: boolean;
  /** True if this outcome is the currently-saved one for this call. */
  saved?: boolean;
}) {
  const meta = OUTCOME_META[outcome];
  const tone = primary ? "emerald" : meta.tone;
  const baseCls =
    tone === "emerald"
      ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold shadow-lg shadow-emerald-500/20"
      : tone === "amber"
        ? "bg-amber-500/15 border border-amber-500/40 text-amber-200 hover:bg-amber-500/25 font-semibold"
        : tone === "sky"
          ? "bg-sky-500/15 border border-sky-500/40 text-sky-200 hover:bg-sky-500/25"
          : tone === "rose"
            ? "bg-rose-500/15 border border-rose-500/40 text-rose-200 hover:bg-rose-500/25"
            : "bg-slate-800/50 border border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white";
  // Saved state — solid ring + check, regardless of tone, so the rep
  // sees at a glance which outcome is logged for this call.
  const savedCls =
    "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-100 font-semibold ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/20";
  return (
    <button
      onClick={() => onClick(outcome)}
      disabled={busy}
      className={`w-full rounded-md px-3 py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left ${saved ? savedCls : baseCls}`}
    >
      {saved ? `✓ ${meta.label} — saved` : meta.label}
    </button>
  );
}

function AgreementGate({
  onAccept,
  busy,
}: {
  onAccept: () => void;
  busy: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-slate-900/60 p-8">
        <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
          1099 Contractor Agreement
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-5">
          Read this before you call.
        </h1>
        <ol className="space-y-4 text-sm text-slate-200 leading-relaxed mb-8 list-decimal list-inside">
          <li>
            <strong>You are an independent contractor</strong>, not an
            employee of BlueJays. You set your own hours, use your own
            phone, work where you want.
          </li>
          <li>
            <strong>Honor &quot;take me off the list.&quot;</strong> If
            anyone asks not to be called, mark them DNC immediately. We
            never call them again. This is not negotiable.
          </li>
          <li>
            <strong>Don&apos;t lie.</strong> Don&apos;t spoof caller ID,
            claim to be the owner, or promise things BlueJays
            doesn&apos;t deliver. Stick to the script. The script works.
          </li>
          <li>
            <strong>You earn $200 per closed BlueJays site you bring
            in.</strong> Paid Venmo or Zelle within 7 days of the
            client&apos;s payment clearing. Refunds void the payout.
          </li>
          <li>
            <strong>You don&apos;t represent BlueJays exclusively</strong>{" "}
            — you can call yourself &quot;part of the team&quot; on
            calls, but you&apos;re a contractor. Not an employee.
          </li>
          <li>
            <strong>Confidentiality.</strong> Prospect names, phone
            numbers, audit data — don&apos;t share outside this
            workspace. Don&apos;t screenshot or export the lead list.
          </li>
          <li>
            <strong>Ben can revoke access anytime.</strong> No reason
            required. You keep any payouts already earned.
          </li>
        </ol>
        <button
          onClick={onAccept}
          disabled={busy}
          className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 text-base font-bold text-amber-950 shadow-lg transition-colors"
        >
          {busy ? "Saving…" : "I agree — let me work →"}
        </button>
        <p className="text-[10px] text-slate-500 mt-3 text-center">
          Acceptance is logged with timestamp + your account ID.
        </p>
      </div>
    </main>
  );
}

function EmptyPool({
  partnerName,
  onLogout,
}: {
  partnerName: string;
  onLogout: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-7 h-7 text-emerald-300"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3">
          Pool&apos;s empty, {partnerName.split(/\s+/)[0]}.
        </h1>
        <p className="text-slate-400 leading-relaxed mb-6">
          Every callable prospect has been called in the last 30 days.
          Check back tomorrow — Ben&apos;s scout pipeline runs nightly.
        </p>
        <button
          onClick={onLogout}
          className="rounded-md border border-white/10 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          Log out
        </button>
      </div>
    </main>
  );
}

const OUTCOME_LABEL: Record<string, string> = {
  no_answer: "No answer",
  voicemail: "Left voicemail",
  wrong_number: "Wrong number",
  answered_not_interested: "Not interested",
  answered_call_scheduled: "Booked Ben's call",
  answered_preview_sent: "Sent preview link",
  answered_audit_sent: "Sent audit link",
  answered_callback: "Call back requested",
  do_not_call: "DNC — removed from list",
};

const OUTCOME_COLOR: Record<string, string> = {
  no_answer: "text-slate-400",
  voicemail: "text-slate-400",
  wrong_number: "text-slate-500",
  answered_not_interested: "text-slate-400",
  answered_call_scheduled: "text-emerald-400",
  answered_preview_sent: "text-sky-400",
  answered_audit_sent: "text-amber-400",
  answered_callback: "text-sky-400",
  do_not_call: "text-rose-400",
};

function CallHistoryPanel({ entries }: { entries: CallHistoryEntry[] }) {
  const [open, setOpen] = useState(false);
  const preview = entries[0];

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
      {/* Collapsed header — always shows the most recent call */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Contact history
          </span>
          <span className="text-xs text-slate-600">·</span>
          <span className={`text-xs font-medium truncate ${OUTCOME_COLOR[preview.outcome] ?? "text-slate-400"}`}>
            {OUTCOME_LABEL[preview.outcome] ?? preview.outcome}
          </span>
          <span className="text-xs text-slate-600 flex-shrink-0">
            {relativeTime(preview.calledAt)} by {preview.partnerName.split(/\s+/)[0]}
          </span>
        </div>
        <span className="text-slate-500 flex-shrink-0 ml-2">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-slate-800/60 border-t border-slate-800/60">
          {entries.map((e) => (
            <li key={e.id} className="px-4 py-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className={`font-semibold ${OUTCOME_COLOR[e.outcome] ?? "text-slate-300"}`}>
                    {OUTCOME_LABEL[e.outcome] ?? e.outcome}
                  </span>
                  {e.auditLinkSent && (
                    <span className="ml-2 text-amber-400/80">[audit sent]</span>
                  )}
                  {e.notes && (
                    <p className="text-slate-400 mt-0.5 leading-snug whitespace-pre-wrap">{e.notes}</p>
                  )}
                </div>
                <div className="text-slate-500 flex-shrink-0 text-right">
                  <div>{relativeTime(e.calledAt)}</div>
                  <div className="text-slate-600">{e.partnerName.split(/\s+/)[0]}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatPhone(p: string): string {
  const d = p.replace(/[^0-9]/g, "");
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (d.length === 11 && d.startsWith("1")) {
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  return p;
}
