"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

type Props = {
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
    phone: string;
    email: string | null;
    city: string | null;
    state: string | null;
    category: string | null;
    status: string | null;
    hasCompletedAudit: boolean;
    websiteUrl: string | null;
  } | null;
  counters: {
    callsThisSession: number;
    goal: number;
    remainingPool: number;
  };
  links: {
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
};

type Outcome =
  | "no_answer"
  | "voicemail"
  | "wrong_number"
  | "answered_not_interested"
  | "answered_call_scheduled"
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
  const { partner, prospect, counters, links, script, tips, mantra } = props;
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [auditLinkSent, setAuditLinkSent] = useState(false);
  const [bookingLinkSent, setBookingLinkSent] = useState(false);
  const [showAgreement, setShowAgreement] = useState(!partner.agreementAccepted);
  const [section, setSection] = useState<SectionId>("intro");

  async function logCall(outcome: Outcome) {
    if (!prospect || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/partners/work/log-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: prospect.id,
          outcome,
          notes: notes.trim() || undefined,
          auditLinkSent,
          bookingLinkSent,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Couldn't log call.");
        setBusy(false);
        return;
      }
      // Reset card state and pull next prospect
      setNotes("");
      setAuditLinkSent(false);
      setBookingLinkSent(false);
      setSection("intro");
      router.refresh();
    } catch {
      alert("Network error.");
    } finally {
      setBusy(false);
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

  function smsBody(kind: "audit" | "booking") {
    const firstName = prospect?.ownerName?.trim().split(/\s+/)[0] || "there";
    if (kind === "booking") {
      return `Hey ${firstName}, this is ${partner.name.split(/\s+/)[0]} with BlueJays — pick a 15-min slot for the walkthrough with Ben here: ${links.scheduleUrl}`;
    }
    return `Hey ${firstName}, this is ${partner.name.split(/\s+/)[0]} with BlueJays — here's that free 60-second audit of your site: ${links.auditUrl}`;
  }

  function smsHref(kind: "audit" | "booking"): string {
    if (!prospect) return "#";
    const body = encodeURIComponent(smsBody(kind));
    // sms: deep-link with body. Phone number first so messages app
    // pre-selects the recipient. Format works on iOS/Android.
    return `sms:${prospect.phone.replace(/[^0-9+]/g, "")}?&body=${body}`;
  }

  if (showAgreement) {
    return <AgreementGate onAccept={acceptAgreement} busy={busy} />;
  }

  if (!prospect) {
    return <EmptyPool partnerName={partner.name} onLogout={logout} />;
  }

  const sessionPct = Math.min(
    100,
    Math.round((counters.callsThisSession / Math.max(1, counters.goal)) * 100),
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top bar — counter + logout */}
      <header className="border-b border-white/5 bg-slate-950/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="font-bold text-amber-300 truncate">
              {partner.name.split(/\s+/)[0]}&apos;s workspace
            </div>
            <span className="hidden sm:inline text-xs text-slate-500">
              · pool: {counters.remainingPool}
            </span>
          </div>
          <div className="flex items-center gap-3">
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
              href={smsHref("booking")}
              onClick={() => setBookingLinkSent(true)}
              className={`block w-full rounded-md px-4 py-3 text-sm font-bold text-center transition-colors ${
                bookingLinkSent
                  ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-200"
                  : "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {bookingLinkSent
                ? "✓ Booking link sent"
                : "📞 Send booking link (PRIMARY)"}
            </a>

            <a
              href={smsHref("audit")}
              onClick={() => setAuditLinkSent(true)}
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
              Tap booking/audit to open your messages app pre-filled.
              Send from your phone, then mark the outcome below.
            </p>
          </div>

          {/* Hormozi cheat sheet — pinned ALWAYS visible during call.
              The reps that close are the ones reading these between
              every dial, not just on day one. */}
          <details
            open
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
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              How did the call go?
            </p>
            <div className="space-y-2">
              <OutcomeButton
                outcome="answered_call_scheduled"
                onClick={logCall}
                busy={busy}
                primary
              />
              <OutcomeButton outcome="answered_audit_sent" onClick={logCall} busy={busy} />
              <OutcomeButton outcome="answered_callback" onClick={logCall} busy={busy} />
              <OutcomeButton
                outcome="answered_not_interested"
                onClick={logCall}
                busy={busy}
              />
              <div className="border-t border-white/5 pt-2 mt-2">
                <OutcomeButton outcome="voicemail" onClick={logCall} busy={busy} />
                <OutcomeButton outcome="no_answer" onClick={logCall} busy={busy} />
                <OutcomeButton outcome="wrong_number" onClick={logCall} busy={busy} />
              </div>
              <div className="border-t border-rose-500/20 pt-2 mt-2">
                <OutcomeButton outcome="do_not_call" onClick={logCall} busy={busy} />
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Use only if they ask to be removed. Flags them DNC permanently.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/partners/work"
            prefetch={false}
            className="block w-full rounded-md border border-white/10 bg-slate-950 hover:border-white/20 px-4 py-2.5 text-xs text-center text-slate-400 hover:text-white transition-colors"
          >
            ⤼ Skip this prospect
          </Link>
        </aside>
      </div>
    </main>
  );
}

function ProspectCard({
  prospect,
}: {
  prospect: NonNullable<Props["prospect"]>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 p-5 mb-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
            Calling {prospect.category?.replace(/-/g, " ") || "business"}
            {prospect.city ? ` in ${prospect.city}` : ""}
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1 truncate">
            {prospect.businessName}
          </h2>
          {prospect.ownerName && (
            <p className="text-sm text-slate-300">
              Owner:{" "}
              <span className="font-semibold text-white">
                {prospect.ownerName}
              </span>
            </p>
          )}
        </div>
        {prospect.hasCompletedAudit && (
          <span className="shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
            ✓ Audit ready
          </span>
        )}
      </div>
      {prospect.websiteUrl && (
        <a
          href={
            prospect.websiteUrl.startsWith("http")
              ? prospect.websiteUrl
              : `https://${prospect.websiteUrl}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-400 hover:underline inline-block break-all"
        >
          🔗 {prospect.websiteUrl}
        </a>
      )}
      {prospect.email && (
        <p className="text-xs text-slate-500 mt-1 break-all">
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
  const tabs: Array<{ id: SectionId; label: string }> = [
    { id: "intro", label: "1 · Open" },
    { id: "qualify", label: "2 · Qualify" },
    { id: "pitch", label: "3 · Pitch" },
    { id: "bookTheCall", label: "4 · Book ★" },
    { id: "textTheLink", label: "Audit fallback" },
    { id: "callbackClose", label: "Callback" },
    { id: "voicemail", label: "Voicemail" },
    { id: "objections", label: "Objections" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setSection(t.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            section === t.id
              ? t.id === "bookTheCall"
                ? "bg-emerald-500 text-emerald-950"
                : "bg-amber-500/20 border border-amber-500/40 text-amber-200"
              : "bg-slate-900/40 border border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

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
      <ul className="space-y-3">
        {section.lines.map((line, i) => (
          <li
            key={i}
            className="text-base text-white leading-relaxed pl-4 border-l-2 border-amber-500/40"
          >
            {line}
          </li>
        ))}
      </ul>
      {section.callerNotes && section.callerNotes.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Caller notes
          </p>
          <ul className="space-y-1.5">
            {section.callerNotes.map((note, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed">
                • {note}
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
                {o.response.map((line, i) => (
                  <li
                    key={i}
                    className="text-sm text-white leading-relaxed pl-3 border-l-2 border-amber-500/40"
                  >
                    {line}
                  </li>
                ))}
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
}: {
  outcome: Outcome;
  onClick: (o: Outcome) => void;
  busy: boolean;
  primary?: boolean;
}) {
  const meta = OUTCOME_META[outcome];
  const tone = primary ? "emerald" : meta.tone;
  const cls =
    tone === "emerald"
      ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold shadow-lg shadow-emerald-500/20"
      : tone === "amber"
        ? "bg-amber-500/15 border border-amber-500/40 text-amber-200 hover:bg-amber-500/25 font-semibold"
        : tone === "sky"
          ? "bg-sky-500/15 border border-sky-500/40 text-sky-200 hover:bg-sky-500/25"
          : tone === "rose"
            ? "bg-rose-500/15 border border-rose-500/40 text-rose-200 hover:bg-rose-500/25"
            : "bg-slate-800/50 border border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white";
  return (
    <button
      onClick={() => onClick(outcome)}
      disabled={busy}
      className={`w-full rounded-md px-3 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left ${cls}`}
    >
      {meta.label}
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
