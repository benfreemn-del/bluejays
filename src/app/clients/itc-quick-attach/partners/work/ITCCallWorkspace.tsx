"use client";

/**
 * ITCCallWorkspace — fork of /partners/work/CallWorkspace.tsx tuned for
 * ITC Quick Attach partner dialing. Six audiences (dealer / TYM /
 * forester / hunter / hobbyist / community), each with its own script
 * + objections + CTA + voicemail. Multi-tenant call log writes to
 * `client_partner_calls` (client_slug='itc-quick-attach'), separate from
 * the BlueJays partner_calls table.
 *
 * Differences from the BlueJays workspace:
 *   - Audience picker tabs (top of workspace)
 *   - URL search-param persistence on selected audience
 *   - Variable inputs panel (callerFirstName, firstName, bizName,
 *     tractorBrand, acreage, city, state, configUrl) — drives merge tags
 *   - Open/closed clock ONLY on dealer audience (other audiences are
 *     personal phones — call anytime)
 *   - 9 ITC-specific outcome buttons (config sent, brochure sent, etc)
 *   - Per-call payout estimate ($50 retail / $250 dealer) shown inline
 *   - Today / This week pacing tiles (fed by API)
 *   - SEND CONFIG LINK + SEND BROCHURE (+ SEND CATALOG on dealer)
 *   - Hormozi tips right-rail with full 15-tip list (★ MUST pinned top)
 *   - Numbered + color-cycled script lines (same shape as reference)
 *   - Numbered primary tabs (1·Open / 2·Qualify / 3·Pitch / 4·Close ★)
 *     plus secondary 'if needed' row (voicemail / objections /
 *     text-link / callback)
 *   - Click-to-reveal objections accordion with caller-notes callout
 *   - Tap-to-dial big primary button
 *   - Static payout-structure sidebar card
 *   - Call history panel pulled from API
 *   - Toast banner after outcome confirmed
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ITC_SCRIPTS,
  ITC_SCRIPT_ORDER,
  fillItcVars,
  type ItcAudienceId,
  type ItcScriptVars,
  type ItcScriptSection,
  type ItcObjectionBranch,
} from "@/lib/itc-partners-script";
// NOTE: the script library is being expanded in parallel. These exports
// are referenced below: textTheLink, callbackClose on every audience;
// callerNotes on every objection; ITC_HORMOZI_TIPS_FULL (15-tip
// ItcCallTip[]); ITC_HORMOZI_MANTRA; ITC_INTRO_UNKNOWN_OWNER;
// ITC_VOICEMAIL_UNKNOWN_OWNER. All assumed available at integration time.
import {
  ITC_HORMOZI_TIPS_FULL,
  ITC_HORMOZI_MANTRA,
  type ItcCallTip,
} from "@/lib/itc-partners-script";

import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { Lightning } from "@phosphor-icons/react/dist/ssr/Lightning";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Star } from "@phosphor-icons/react/dist/ssr/Star";
import { CurrencyDollar } from "@phosphor-icons/react/dist/ssr/CurrencyDollar";
import { Megaphone } from "@phosphor-icons/react/dist/ssr/Megaphone";

// ─────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────

type Outcome =
  | "no_answer"
  | "voicemail"
  | "wrong_number"
  | "answered_call_scheduled"
  | "answered_config_sent"
  | "answered_brochure_sent"
  | "answered_callback"
  | "answered_not_interested"
  | "do_not_call";

type OutcomeMeta = {
  id: Outcome;
  label: string;
  payoutCents: number;
  /** Audiences where this outcome counts as the primary win (gets the
   *  large dealer payout etc). */
  primaryWinFor?: ItcAudienceId[];
  group: "answered" | "no_answer" | "tcpa";
  tone: "emerald" | "sky" | "amber" | "slate" | "rose";
};

const OUTCOMES: OutcomeMeta[] = [
  { id: "no_answer", label: "📞 No answer", payoutCents: 0, group: "no_answer", tone: "slate" },
  { id: "voicemail", label: "📨 Voicemail", payoutCents: 0, group: "no_answer", tone: "slate" },
  { id: "wrong_number", label: "❌ Wrong number", payoutCents: 0, group: "no_answer", tone: "slate" },
  {
    id: "answered_call_scheduled",
    label: "📅 Booked rep call",
    payoutCents: 0,
    primaryWinFor: ["dealer"],
    group: "answered",
    tone: "emerald",
  },
  { id: "answered_config_sent", label: "🔗 Config link sent", payoutCents: 5000, group: "answered", tone: "sky" },
  { id: "answered_brochure_sent", label: "📄 Brochure sent", payoutCents: 0, group: "answered", tone: "amber" },
  { id: "answered_callback", label: "🔔 Asked for callback", payoutCents: 0, group: "answered", tone: "sky" },
  { id: "answered_not_interested", label: "🚫 Not interested", payoutCents: 0, group: "answered", tone: "slate" },
  { id: "do_not_call", label: "⛔ Do not call", payoutCents: 0, group: "tcpa", tone: "rose" },
];

const OUTCOME_BY_ID: Record<Outcome, OutcomeMeta> = OUTCOMES.reduce(
  (acc, o) => {
    acc[o.id] = o;
    return acc;
  },
  {} as Record<Outcome, OutcomeMeta>,
);

/** Resolves the actual cents value for an outcome given the audience.
 *  $250 dealer signup is the only cross-audience override. */
function payoutForOutcome(outcome: Outcome, audience: ItcAudienceId): number {
  if (outcome === "answered_call_scheduled" && audience === "dealer") return 25000;
  return OUTCOME_BY_ID[outcome]?.payoutCents ?? 0;
}

type CallEntry = {
  id: string;
  audience: ItcAudienceId | null;
  outcome: Outcome;
  notes: string | null;
  estimatedPayoutCents: number;
  calledAt: string;
  prospectName?: string | null;
  prospectPhone?: string | null;
};

type Props = {
  partner: {
    id: string;
    name: string;
    code: string;
    dailyCallGoal?: number | null;
  };
  /** Optional prospect (lead) being dialed. When absent, the workspace
   *  still works as a script viewer + variable picker — caller dials
   *  whoever they want and logs the outcome at the end. */
  prospect: {
    id: string | null;
    businessName: string | null;
    ownerName: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    state: string | null;
    /** Tractor brand the prospect runs (for TYM / hobbyist / hunter etc) */
    tractorBrand: string | null;
    /** Acreage / land context (for forester / hobbyist) */
    acreage: string | null;
    /** Build-Your-Dream-Tractor configurator URL specific to this prospect */
    configUrl: string | null;
  } | null;
  /** Initial pacing payouts (server-rendered first paint). Refetched
   *  by the workspace on every successful call log. */
  initialStats: {
    todayPayoutCents: number;
    weekPayoutCents: number;
    callsThisSession: number;
  };
  /** Optional: prefilled audience from the URL searchParam. */
  initialAudience?: ItcAudienceId;
};

// ─────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────

export default function ITCCallWorkspace({
  partner,
  prospect,
  initialStats,
  initialAudience,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Audience selection (URL-persisted via ?audience=)
  const urlAudience = (searchParams.get("audience") as ItcAudienceId | null) ?? null;
  const [audience, setAudienceState] = useState<ItcAudienceId>(
    urlAudience && ITC_SCRIPT_ORDER.includes(urlAudience)
      ? urlAudience
      : initialAudience && ITC_SCRIPT_ORDER.includes(initialAudience)
        ? initialAudience
        : "dealer",
  );

  function setAudience(next: ItcAudienceId) {
    setAudienceState(next);
    // Persist in URL so back/forward + reload keep state
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("audience", next);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  // Variable picker — drives merge tags on every script line
  const [vars, setVars] = useState<ItcScriptVars>({
    callerFirstName: partner.name.trim().split(/\s+/)[0] || "Jake",
    firstName: prospect?.ownerName?.trim().split(/\s+/)[0] || "",
    bizName: prospect?.businessName ?? "",
    tractorBrand: prospect?.tractorBrand ?? "",
    acreage: prospect?.acreage ?? "",
    city: prospect?.city ?? "",
    state: prospect?.state ?? "",
    configUrl: prospect?.configUrl ?? "itcquickattach.com/build",
  });

  // Section currently rendered in the script panel — type defined
  // module-scope below so SectionTabs can share the same union.
  const [section, setSection] = useState<SectionId>("intro");

  // Notes the rep can leave for Ben / ITC ops
  const [notes, setNotes] = useState("");

  const [busy, setBusy] = useState(false);
  const [savedOutcome, setSavedOutcome] = useState<Outcome | null>(null);
  const [showToast, setShowToast] = useState<{ outcome: Outcome; payoutCents: number } | null>(null);

  // Send-state tracking — visual confirmation that the rep fired the link
  const [configLinkSent, setConfigLinkSent] = useState(false);
  const [brochureSent, setBrochureSent] = useState(false);
  const [catalogSent, setCatalogSent] = useState(false);

  // Pacing stats (refetched on every successful call log)
  const [stats, setStats] = useState(initialStats);

  // Call history (last 20 calls today + yesterday)
  const [callHistory, setCallHistory] = useState<CallEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!showToast) return;
    const t = window.setTimeout(() => setShowToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [showToast]);

  // Pull initial recent calls
  useEffect(() => {
    let cancel = false;
    (async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch(
          "/api/clients/itc-quick-attach/partner-calls?range=recent",
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancel && Array.isArray(data.calls)) {
          setCallHistory(data.calls as CallEntry[]);
        }
      } catch {
        /* network — show empty list */
      } finally {
        if (!cancel) setHistoryLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function refetchStats() {
    try {
      const [todayRes, weekRes, recentRes] = await Promise.all([
        fetch("/api/clients/itc-quick-attach/partner-calls?range=today", {
          cache: "no-store",
        }),
        fetch("/api/clients/itc-quick-attach/partner-calls?range=week", {
          cache: "no-store",
        }),
        fetch("/api/clients/itc-quick-attach/partner-calls?range=recent", {
          cache: "no-store",
        }),
      ]);
      const todayData = todayRes.ok ? await todayRes.json() : null;
      const weekData = weekRes.ok ? await weekRes.json() : null;
      const recentData = recentRes.ok ? await recentRes.json() : null;
      const todayCents =
        todayData?.stats?.today_payout_cents ??
        todayData?.stats?.payout_cents ??
        0;
      const weekCents =
        weekData?.stats?.week_payout_cents ??
        weekData?.stats?.payout_cents ??
        0;
      setStats((s) => ({
        ...s,
        todayPayoutCents: todayCents,
        weekPayoutCents: weekCents,
        callsThisSession: (todayData?.calls?.length ?? s.callsThisSession),
      }));
      if (recentData?.calls) {
        setCallHistory(recentData.calls as CallEntry[]);
      }
    } catch {
      /* leave stale stats — failure-safe */
    }
  }

  // Outcome confirmation modal state
  const [pendingOutcome, setPendingOutcome] = useState<Outcome | null>(null);

  function requestOutcome(outcome: Outcome) {
    setPendingOutcome(outcome);
  }

  async function confirmOutcome(outcome: Outcome) {
    if (busy) return;
    setBusy(true);
    setPendingOutcome(null);
    const payoutCents = payoutForOutcome(outcome, audience);
    try {
      const res = await fetch("/api/clients/itc-quick-attach/partner-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: partner.id,
          lead_id: prospect?.id ?? null,
          audience,
          outcome,
          notes: notes.trim() || undefined,
          estimated_payout_cents: payoutCents,
          // Stamp send timestamps if relevant — server is the source of
          // truth but we send hints so the API can decide when to apply.
          config_link_sent: configLinkSent,
          brochure_sent: brochureSent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        alert(data?.error || "Couldn't log call. Try again.");
        return;
      }
      setSavedOutcome(outcome);
      setShowToast({ outcome, payoutCents });
      // Refresh pacing tiles + history
      await refetchStats();
    } catch {
      alert("Network error logging call.");
    } finally {
      setBusy(false);
    }
  }

  /** Reset workspace state for the next call. */
  function nextCall() {
    setSavedOutcome(null);
    setNotes("");
    setConfigLinkSent(false);
    setBrochureSent(false);
    setCatalogSent(false);
    setSection("intro");
    // Don't reset audience — caller usually dials within one audience batch
    // Don't reset vars — same caller name, same configUrl
  }

  async function sendConfigLink() {
    if (!prospect?.id) {
      // No prospect — open SMS deep-link so the rep can paste a number
      window.location.href = `sms:?body=${encodeURIComponent(buildConfigSmsBody())}`;
      setConfigLinkSent(true);
      return;
    }
    setConfigLinkSent(true);
    try {
      await fetch("/api/clients/itc-quick-attach/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "config",
          partner_id: partner.id,
          lead_id: prospect.id,
          audience,
          phone: prospect.phone,
          email: prospect.email,
          url: vars.configUrl || "itcquickattach.com/build",
          // Server should send SMS + email simultaneously. UI assumes
          // the actual channel handlers (Twilio, SendGrid) are wired
          // by Ben's pipeline.
        }),
      });
    } catch {
      /* surface as a toast in v2 — for now silent fail keeps UI clean */
    }
  }

  async function sendBrochure(brochureKind: "brochure" | "catalog" = "brochure") {
    if (brochureKind === "catalog") setCatalogSent(true);
    else setBrochureSent(true);
    const url =
      brochureKind === "catalog"
        ? "https://itcquickattach.com/wholesale-catalog.pdf"
        : "https://itcquickattach.com/catalog.pdf";
    if (!prospect?.id) {
      window.location.href = `sms:?body=${encodeURIComponent(`ITC Quick Attach product ${brochureKind}: ${url}`)}`;
      return;
    }
    try {
      await fetch("/api/clients/itc-quick-attach/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: brochureKind,
          partner_id: partner.id,
          lead_id: prospect.id,
          audience,
          phone: prospect.phone,
          email: prospect.email,
          url,
        }),
      });
    } catch {
      /* failure silent for now */
    }
  }

  function buildConfigSmsBody() {
    const greeting = vars.firstName ? `Hey ${vars.firstName}` : "Hey";
    const url = vars.configUrl || "itcquickattach.com/build";
    return `${greeting}, ${vars.callerFirstName} from ITC Quick Attach — here's that build-your-tractor link: ${url}`;
  }

  // Resolve the active script
  const activeScript = ITC_SCRIPTS[audience];

  // Build the section objects with merge tags applied
  const filledIntro = filledSection(activeScript.intro, vars);
  const filledQualify = filledSection(activeScript.qualify, vars);
  const filledPitch = filledSection(activeScript.pitch, vars);
  const filledCta = filledSection(activeScript.cta, vars);
  const filledVoicemail = filledSection(activeScript.voicemail, vars);
  // Optional sections — populated by the new lib exports. Use safe
  // fallbacks so we don't crash if the lib hasn't shipped them yet.
  const rawScript = activeScript as unknown as Record<string, ItcScriptSection | undefined>;
  const filledTextLink = rawScript.textTheLink
    ? filledSection(rawScript.textTheLink as ItcScriptSection, vars)
    : null;
  const filledCallback = rawScript.callbackClose
    ? filledSection(rawScript.callbackClose as ItcScriptSection, vars)
    : null;

  const filledObjections: FilledObjection[] = activeScript.objections.map((o) => ({
    id: slugify(o.trigger),
    trigger: o.trigger,
    response: o.reply.map((line) => fillItcVars(line, vars)),
    callerNotes:
      typeof (o as ItcObjectionBranch & { callerNotes?: string }).callerNotes === "string"
        ? (o as ItcObjectionBranch & { callerNotes?: string }).callerNotes
        : o.ifDoubleDown,
  }));

  // Daily goal (default 20 per rule, override via partner.dailyCallGoal)
  const dailyGoal = partner.dailyCallGoal ?? 20;
  const sessionPct = Math.min(
    100,
    Math.round((stats.callsThisSession / Math.max(1, dailyGoal)) * 100),
  );

  const showOpenClock = audience === "dealer";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ───────── HEADER ───────── */}
      <header className="border-b border-amber-500/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="font-bold text-amber-300 truncate">
              ITC · {partner.name.split(/\s+/)[0]}&apos;s workspace
            </div>
            <Link
              href="/clients/itc-quick-attach/partners"
              className="hidden sm:inline text-xs text-slate-500 hover:text-amber-200 transition-colors"
            >
              ← Partner program
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block min-w-[160px]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                <span>Today</span>
                <span className="font-mono font-bold text-white">
                  {stats.callsThisSession}
                  <span className="text-slate-500">/{dailyGoal}</span>
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
              {stats.callsThisSession}/{dailyGoal}
            </span>
          </div>
        </div>

        {/* Mantra banner — anchors after every no */}
        <div className="border-t border-amber-500/20 bg-amber-500/5">
          <div className="mx-auto max-w-7xl px-4 py-1.5 text-center">
            <p className="text-xs font-semibold text-amber-300 tracking-wide">
              <Lightning size={14} weight="fill" className="inline align-text-bottom mr-1" />
              {ITC_HORMOZI_MANTRA}
            </p>
          </div>
        </div>

        {/* Audience picker tabs */}
        <div className="border-t border-amber-500/10 bg-[#0d0d0d]">
          <div className="mx-auto max-w-7xl px-2 py-2 flex flex-wrap items-center gap-1.5">
            {ITC_SCRIPT_ORDER.map((id) => {
              const meta = ITC_SCRIPTS[id];
              const active = id === audience;
              return (
                <button
                  key={id}
                  onClick={() => setAudience(id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "bg-amber-500 text-amber-950 shadow-md shadow-amber-500/30"
                      : "bg-slate-900/60 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* ═══════════════ LEFT: prospect + script ═══════════════ */}
        <div>
          {/* Prospect / target card */}
          <ProspectCard
            prospect={prospect}
            audience={audience}
            showOpenClock={showOpenClock}
          />

          {/* Variable inputs panel */}
          <VarsPanel
            audience={audience}
            vars={vars}
            setVars={setVars}
          />

          {/* Section tabs */}
          <SectionTabs
            section={section}
            setSection={setSection}
            hasTextLink={!!filledTextLink}
            hasCallback={!!filledCallback}
          />

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 mt-4">
            {section === "intro" && <ScriptCard section={filledIntro} />}
            {section === "qualify" && <ScriptCard section={filledQualify} />}
            {section === "pitch" && <ScriptCard section={filledPitch} accent="amber" />}
            {section === "cta" && (
              <ScriptCard section={filledCta} accent="emerald" primary />
            )}
            {section === "voicemail" && <ScriptCard section={filledVoicemail} accent="slate" />}
            {section === "textTheLink" && filledTextLink && (
              <ScriptCard section={filledTextLink} accent="amber" />
            )}
            {section === "callbackClose" && filledCallback && (
              <ScriptCard section={filledCallback} accent="sky" />
            )}
            {section === "objections" && (
              <ObjectionList objections={filledObjections} />
            )}
          </div>

          {/* Notes textarea */}
          <label className="block mt-5">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Notes (optional, for ITC)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What did they actually say? Anything you want Jake / ITC to know."
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </label>

          {/* Call history panel */}
          <CallHistoryPanel entries={callHistory} loading={historyLoading} />
        </div>

        {/* ═══════════════ RIGHT: action panel ═══════════════ */}
        <aside className="space-y-4">
          {/* Pacing payout tiles */}
          <PayoutPacingTiles
            todayCents={stats.todayPayoutCents}
            weekCents={stats.weekPayoutCents}
          />

          {/* Tap-to-dial primary button */}
          {prospect?.phone ? (
            <a
              href={`tel:${prospect.phone.replace(/[^0-9+]/g, "")}`}
              className="block w-full rounded-md border-2 border-sky-500/50 bg-sky-500/10 hover:bg-sky-500/20 px-4 py-4 text-base font-mono text-center text-sky-200 hover:text-white transition-colors tabular-nums font-bold"
            >
              <Phone size={18} weight="fill" className="inline align-text-bottom mr-2" />
              Dial {formatPhone(prospect.phone)}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-md border-2 border-slate-700 bg-slate-900/40 px-4 py-4 text-base text-center text-slate-600 font-bold cursor-not-allowed"
            >
              <Phone size={18} className="inline align-text-bottom mr-2" />
              No phone on file
            </button>
          )}

          {/* Send links */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Send to {vars.firstName || "them"}
            </p>

            <SendButton
              label="Send config link"
              hint="Build-Your-Dream-Tractor — your closer"
              accent="sky"
              primary
              onClick={sendConfigLink}
              sent={configLinkSent}
            />

            <SendButton
              label="Send brochure"
              hint="Product PDF — when they want details"
              accent="amber"
              onClick={() => sendBrochure("brochure")}
              sent={brochureSent}
            />

            {audience === "dealer" && (
              <SendButton
                label="Send wholesale catalog"
                hint="Dealer-only — MAP + dealer pricing"
                accent="emerald"
                onClick={() => sendBrochure("catalog")}
                sent={catalogSent}
              />
            )}

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Both SMS + email fire at once on tap. Stamp lands on the call
              record once outcome is logged.
            </p>
          </div>

          {/* Hormozi tips card */}
          <details
            className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden"
            open
          >
            <summary className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wider text-amber-300 font-semibold hover:bg-amber-500/10 transition-colors flex items-center justify-between">
              <span>
                <Star size={14} weight="fill" className="inline align-text-bottom mr-1" />
                Before you dial — tips
              </span>
              <span className="text-slate-500 text-[10px] font-normal">tap to collapse</span>
            </summary>
            <div className="px-4 pb-3 pt-1 space-y-1.5">
              {/* ★ MUST tips first — `must` is an optional flag the
                  parallel-rewritten lib adds to a few high-priority tips. */}
              {(ITC_HORMOZI_TIPS_FULL ?? [])
                .slice()
                .sort(
                  (a, b) =>
                    Number(!!(b as ItcCallTip & { must?: boolean }).must) -
                    Number(!!(a as ItcCallTip & { must?: boolean }).must),
                )
                .map((tipRaw) => {
                  const tip = tipRaw as ItcCallTip & { must?: boolean };
                  return (
                    <details
                      key={tip.id}
                      className="rounded-md border border-amber-500/10 bg-[#0a0a0a]/40 overflow-hidden"
                    >
                      <summary
                        className={`cursor-pointer px-3 py-2 text-xs font-semibold flex items-start gap-2 hover:bg-amber-500/5 ${
                          tip.must ? "text-amber-200" : "text-amber-100/80"
                        }`}
                      >
                        <span className="text-base flex-shrink-0 leading-none">
                          {tip.emoji}
                        </span>
                        <span className="flex-1 leading-snug">
                          {tip.must && <span className="text-amber-400 mr-1">★</span>}
                          {tip.title}
                        </span>
                      </summary>
                      <p className="px-3 pb-2 text-[11px] text-slate-300 leading-relaxed pl-9">
                        {tip.body}
                      </p>
                    </details>
                  );
                })}
            </div>
          </details>

          {/* Outcomes panel */}
          <div
            id="outcome"
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 scroll-mt-24"
          >
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              How did the call go?
            </p>
            <div className="space-y-2">
              {/* Answered group — primary win first */}
              <OutcomeButton
                outcome="answered_call_scheduled"
                onClick={requestOutcome}
                busy={busy}
                primary={audience === "dealer"}
                saved={savedOutcome === "answered_call_scheduled"}
                payoutCents={payoutForOutcome("answered_call_scheduled", audience)}
              />
              <OutcomeButton
                outcome="answered_config_sent"
                onClick={requestOutcome}
                busy={busy}
                saved={savedOutcome === "answered_config_sent"}
                payoutCents={payoutForOutcome("answered_config_sent", audience)}
              />
              <OutcomeButton
                outcome="answered_brochure_sent"
                onClick={requestOutcome}
                busy={busy}
                saved={savedOutcome === "answered_brochure_sent"}
                payoutCents={payoutForOutcome("answered_brochure_sent", audience)}
              />
              <OutcomeButton
                outcome="answered_callback"
                onClick={requestOutcome}
                busy={busy}
                saved={savedOutcome === "answered_callback"}
                payoutCents={payoutForOutcome("answered_callback", audience)}
              />
              <OutcomeButton
                outcome="answered_not_interested"
                onClick={requestOutcome}
                busy={busy}
                saved={savedOutcome === "answered_not_interested"}
                payoutCents={payoutForOutcome("answered_not_interested", audience)}
              />

              {/* No-answer group */}
              <div className="border-t border-white/5 pt-2 mt-2 space-y-2">
                <OutcomeButton
                  outcome="voicemail"
                  onClick={requestOutcome}
                  busy={busy}
                  saved={savedOutcome === "voicemail"}
                  payoutCents={payoutForOutcome("voicemail", audience)}
                />
                <OutcomeButton
                  outcome="no_answer"
                  onClick={requestOutcome}
                  busy={busy}
                  saved={savedOutcome === "no_answer"}
                  payoutCents={payoutForOutcome("no_answer", audience)}
                />
                <OutcomeButton
                  outcome="wrong_number"
                  onClick={requestOutcome}
                  busy={busy}
                  saved={savedOutcome === "wrong_number"}
                  payoutCents={payoutForOutcome("wrong_number", audience)}
                />
              </div>

              {/* TCPA group */}
              <div className="border-t border-rose-500/20 pt-2 mt-2">
                <OutcomeButton
                  outcome="do_not_call"
                  onClick={requestOutcome}
                  busy={busy}
                  saved={savedOutcome === "do_not_call"}
                  payoutCents={0}
                />
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Use only if they ask to be removed. Flags them DNC permanently.
                </p>
              </div>
            </div>
          </div>

          {/* Saved-outcome banner */}
          {savedOutcome && (
            <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-500/10 p-4 space-y-2">
              <p className="text-sm font-bold text-emerald-200">
                <CheckCircle size={16} weight="fill" className="inline align-text-bottom mr-1" />
                Saved: {OUTCOME_BY_ID[savedOutcome].label}
              </p>
              <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                {savedOutcome === "voicemail"
                  ? "Now flip to the Voicemail tab and read the message. Click Next when you've hung up."
                  : "Outcome logged. Read whatever script piece you need to wrap up. Click Next call when you're ready."}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={nextCall}
            className={`block w-full rounded-md px-4 py-3 text-sm font-bold text-center transition-colors ${
              savedOutcome
                ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/25"
                : "border border-white/10 bg-slate-950 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {savedOutcome ? "Next call →" : "Reset workspace"}
          </button>

          {/* Payout structure card (static reference) */}
          <PayoutStructureCard />
        </aside>
      </div>

      {/* Mobile floating jump-to-outcome */}
      <a
        href="#outcome"
        className="fixed bottom-4 right-4 lg:hidden z-50 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-5 py-3 text-sm font-bold shadow-2xl shadow-emerald-500/30 transition-colors"
      >
        <CheckCircle size={16} weight="fill" className="inline align-text-bottom mr-1" />
        Mark outcome
      </a>

      {/* Outcome confirmation modal */}
      {pendingOutcome && (
        <OutcomeConfirmModal
          outcome={pendingOutcome}
          payoutCents={payoutForOutcome(pendingOutcome, audience)}
          onConfirm={() => confirmOutcome(pendingOutcome)}
          onCancel={() => setPendingOutcome(null)}
          busy={busy}
        />
      )}

      {/* Toast banner — 4-second auto-dismiss */}
      {showToast && (
        <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border-2 border-emerald-400 bg-emerald-950 px-5 py-3 shadow-2xl shadow-emerald-500/40 max-w-md w-[calc(100%-2rem)]">
          <p className="text-sm font-bold text-emerald-100 text-center">
            <CheckCircle size={16} weight="fill" className="inline align-text-bottom mr-1" />
            Logged: {OUTCOME_BY_ID[showToast.outcome].label}
            {showToast.payoutCents > 0 && (
              <span className="text-emerald-300 ml-2">
                · pacing +${(showToast.payoutCents / 100).toFixed(0)}
              </span>
            )}
          </p>
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────

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

function filledSection(section: ItcScriptSection, vars: ItcScriptVars): FilledSection {
  return {
    ...section,
    lines: section.lines.map((line) => fillItcVars(line, vars)),
    callerNotes: section.callerNotes
      ? section.callerNotes.map((n) => fillItcVars(n, vars))
      : undefined,
    goal: section.goal ? fillItcVars(section.goal, vars) : undefined,
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
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

// ─────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────

function ProspectCard({
  prospect,
  audience,
  showOpenClock,
}: {
  prospect: Props["prospect"];
  audience: ItcAudienceId;
  showOpenClock: boolean;
}) {
  // Open/closed clock — only on dealer audience.
  // For other audiences (hobbyist/hunter/forester/tym/community), the
  // number is a personal phone — call anytime. Show a "personal" pill.
  const hasOpenStatus = showOpenClock && prospect?.state;
  const clockData = hasOpenStatus ? buildClientClock(prospect!.state) : null;

  return (
    <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-slate-950 p-5 mb-5 shadow-lg shadow-amber-500/5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <Phone size={11} weight="fill" className="inline align-text-bottom mr-1" />
            Calling {ITC_SCRIPTS[audience].label}
            {prospect?.city ? ` · ${prospect.city}` : ""}
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1 truncate">
            {prospect?.businessName || "(no business on file)"}
          </h2>
          {prospect?.ownerName && (
            <p className="text-sm text-slate-300">
              Owner:{" "}
              <span className="font-semibold text-white">{prospect.ownerName}</span>
            </p>
          )}
          {prospect?.tractorBrand && (
            <p className="text-xs text-slate-400 mt-1">
              Runs: <span className="text-amber-200 font-semibold">{prospect.tractorBrand}</span>
              {prospect.acreage ? ` · ${prospect.acreage}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Open/closed pill OR "personal — anytime" pill */}
      {showOpenClock ? (
        clockData ? (
          <div
            className={`rounded-lg border ${
              clockData.openIsGreen
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                : "bg-rose-500/10 border-rose-500/40 text-rose-200"
            } px-3 py-2 mb-3 flex items-start gap-3`}
          >
            <span
              className={`mt-1 inline-block h-3 w-3 rounded-full shrink-0 ${
                clockData.openIsGreen
                  ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)] animate-pulse"
                  : "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">
                  {clockData.openIsGreen ? "Open now (heuristic)" : "Closed (heuristic)"}
                </span>
                <span className="text-xs opacity-70">
                  <Clock size={11} className="inline align-text-bottom mr-0.5" />
                  {clockData.display}
                </span>
              </div>
            </div>
          </div>
        ) : null
      ) : (
        <div className="rounded-lg border bg-sky-500/10 border-sky-500/40 text-sky-200 px-3 py-2 mb-3 flex items-center gap-2">
          <Phone size={14} weight="fill" className="flex-shrink-0" />
          <span className="text-sm font-semibold">personal — call anytime</span>
        </div>
      )}

      {prospect?.phone && (
        <a
          href={`tel:${prospect.phone.replace(/[^0-9+]/g, "")}`}
          className="block w-full rounded-lg border-2 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-3 text-center font-mono text-lg sm:text-xl font-bold text-amber-200 hover:text-white transition-colors mb-2 tabular-nums"
        >
          <Phone size={18} weight="fill" className="inline align-text-bottom mr-2" />
          {formatPhone(prospect.phone)}
        </a>
      )}

      {prospect?.email && (
        <p className="text-xs text-slate-500 break-all">
          <EnvelopeSimple size={11} className="inline align-text-bottom mr-1" />
          {prospect.email}
        </p>
      )}
    </div>
  );
}

/** Quick browser-side clock builder. Reference workspace uses
 *  `getProspectClock` from `@/lib/business-hours`, but that helper does
 *  TZ work that's overkill for a client component — we just want the
 *  rep to see local time for the prospect's state when on dealer calls. */
function buildClientClock(state: string | null): {
  display: string;
  openIsGreen: boolean;
} | null {
  if (!state) return null;
  const TZ_BY_STATE: Record<string, string> = {
    WA: "America/Los_Angeles",
    OR: "America/Los_Angeles",
    CA: "America/Los_Angeles",
    NV: "America/Los_Angeles",
    ID: "America/Boise",
    UT: "America/Denver",
    CO: "America/Denver",
    AZ: "America/Phoenix",
    NM: "America/Denver",
    TX: "America/Chicago",
    OK: "America/Chicago",
    KS: "America/Chicago",
    MN: "America/Chicago",
    IA: "America/Chicago",
    MO: "America/Chicago",
    AR: "America/Chicago",
    LA: "America/Chicago",
    MS: "America/Chicago",
    AL: "America/Chicago",
    TN: "America/Chicago",
    KY: "America/New_York",
    IL: "America/Chicago",
    WI: "America/Chicago",
    MI: "America/New_York",
    IN: "America/New_York",
    OH: "America/New_York",
    GA: "America/New_York",
    FL: "America/New_York",
    SC: "America/New_York",
    NC: "America/New_York",
    VA: "America/New_York",
    WV: "America/New_York",
    PA: "America/New_York",
    NY: "America/New_York",
    NJ: "America/New_York",
    CT: "America/New_York",
    RI: "America/New_York",
    MA: "America/New_York",
    VT: "America/New_York",
    NH: "America/New_York",
    ME: "America/New_York",
    DE: "America/New_York",
    MD: "America/New_York",
    DC: "America/New_York",
    MT: "America/Denver",
    WY: "America/Denver",
    SD: "America/Chicago",
    ND: "America/Chicago",
    NE: "America/Chicago",
    HI: "Pacific/Honolulu",
    AK: "America/Anchorage",
  };
  const tz = TZ_BY_STATE[state.toUpperCase()] || "America/New_York";
  let display = "";
  let hour = 12;
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    display = fmt.format(new Date());
    const hourFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    });
    hour = parseInt(hourFmt.format(new Date()), 10);
  } catch {
    return null;
  }
  // Heuristic: dealer-shop hours roughly 8am-5pm local
  const openIsGreen = hour >= 8 && hour < 17;
  return { display, openIsGreen };
}

function VarsPanel({
  audience,
  vars,
  setVars,
}: {
  audience: ItcAudienceId;
  vars: ItcScriptVars;
  setVars: (v: ItcScriptVars) => void;
}) {
  // Determine which fields are relevant for this audience
  const showBizName = audience === "dealer" || audience === "tym";
  const showTractorBrand = audience !== "dealer" && audience !== "community";
  const showAcreage = audience === "forester" || audience === "hobbyist";

  function update<K extends keyof ItcScriptVars>(key: K, value: ItcScriptVars[K]) {
    setVars({ ...vars, [key]: value });
  }

  return (
    <details className="rounded-2xl border border-white/10 bg-slate-900/30 mb-4 overflow-hidden" open>
      <summary className="cursor-pointer px-5 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold hover:bg-slate-900/60 transition-colors flex items-center justify-between">
        <span>Fill the merge tags</span>
        <span className="text-slate-600 text-[10px] font-normal">tap to collapse</span>
      </summary>
      <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <VarInput
          label="Your first name"
          value={vars.callerFirstName}
          onChange={(v) => update("callerFirstName", v)}
          placeholder="Jake"
        />
        <VarInput
          label="Their first name"
          value={vars.firstName ?? ""}
          onChange={(v) => update("firstName", v)}
          placeholder="(if known)"
        />
        {showBizName && (
          <VarInput
            label="Business name"
            value={vars.bizName ?? ""}
            onChange={(v) => update("bizName", v)}
            placeholder="Cascade Tractor Supply"
          />
        )}
        {showTractorBrand && (
          <VarInput
            label="Tractor brand"
            value={vars.tractorBrand ?? ""}
            onChange={(v) => update("tractorBrand", v)}
            placeholder="TYM, Kioti, Mahindra…"
          />
        )}
        {showAcreage && (
          <VarInput
            label="Acreage / land context"
            value={vars.acreage ?? ""}
            onChange={(v) => update("acreage", v)}
            placeholder="40 acres, half wooded"
          />
        )}
        <VarInput
          label="City"
          value={vars.city ?? ""}
          onChange={(v) => update("city", v)}
          placeholder="Spokane"
        />
        <VarInput
          label="State"
          value={vars.state ?? ""}
          onChange={(v) => update("state", v)}
          placeholder="WA"
        />
        <VarInput
          label="Configurator URL"
          value={vars.configUrl ?? ""}
          onChange={(v) => update("configUrl", v)}
          placeholder="itcquickattach.com/build"
          fullWidth
        />
      </div>
    </details>
  );
}

function VarInput({
  label,
  value,
  onChange,
  placeholder,
  fullWidth,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}) {
  return (
    <label className={`block ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
    </label>
  );
}

type SectionId =
  | "intro"
  | "qualify"
  | "pitch"
  | "cta"
  | "voicemail"
  | "textTheLink"
  | "callbackClose"
  | "objections";

function SectionTabs({
  section,
  setSection,
  hasTextLink,
  hasCallback,
}: {
  section: SectionId;
  setSection: (s: SectionId) => void;
  hasTextLink: boolean;
  hasCallback: boolean;
}) {
  const flowTabs: Array<{ id: SectionId; label: string }> = [
    { id: "intro", label: "1 · Open" },
    { id: "qualify", label: "2 · Qualify" },
    { id: "pitch", label: "3 · Pitch" },
    { id: "cta", label: "4 · Close ★" },
  ];
  const fallbackTabs: Array<{ id: SectionId; label: string }> = [
    { id: "voicemail", label: "Voicemail" },
    { id: "objections", label: "Objections" },
  ];
  if (hasTextLink) fallbackTabs.push({ id: "textTheLink", label: "Text-link" });
  if (hasCallback) fallbackTabs.push({ id: "callbackClose", label: "Callback" });

  return (
    <div className="space-y-2 mb-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {flowTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className={`flex-1 sm:flex-initial rounded-md px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
              section === t.id
                ? t.id === "cta"
                  ? "bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/30"
                  : "bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
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

// 5-color rotation for script lines
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
      <div className="flex items-center gap-2 mb-3 flex-wrap">
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
              <p className="text-base text-white leading-relaxed flex-1">{line}</p>
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
        → Tap to expand. Always end on the configurator-text or call-back offer.
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
                <div className="mt-3 pt-3 border-t border-white/5 rounded-md bg-slate-900/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Caller notes
                  </p>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    💡 {o.callerNotes}
                  </p>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function SendButton({
  label,
  hint,
  accent,
  primary,
  onClick,
  sent,
}: {
  label: string;
  hint?: string;
  accent: "sky" | "emerald" | "amber";
  primary?: boolean;
  onClick: () => void;
  sent: boolean;
}) {
  const accentMap = {
    sky: {
      activeBtn: "bg-sky-500 hover:bg-sky-400 text-sky-950 shadow-md shadow-sky-500/20",
      ghostBtn: "bg-sky-500/10 border border-sky-500/40 text-sky-200 hover:bg-sky-500/20",
      sentBtn: "bg-sky-500/20 border border-sky-500/50 text-sky-200",
      label: "text-sky-300",
    },
    emerald: {
      activeBtn: "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-500/20",
      ghostBtn: "bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20",
      sentBtn: "bg-emerald-500/20 border border-emerald-500/50 text-emerald-200",
      label: "text-emerald-300",
    },
    amber: {
      activeBtn: "bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-md shadow-amber-500/20",
      ghostBtn: "bg-amber-500/10 border border-amber-500/40 text-amber-200 hover:bg-amber-500/20",
      sentBtn: "bg-amber-500/20 border border-amber-500/50 text-amber-200",
      label: "text-amber-300",
    },
  } as const;
  const a = accentMap[accent];
  const baseBtnCls = primary ? a.activeBtn : a.ghostBtn;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-[11px] uppercase tracking-wider font-bold ${a.label}`}>
          {label}
        </p>
        {hint && <p className="text-[10px] text-slate-500 italic truncate">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-md px-3 py-2.5 text-xs font-bold text-center transition-colors ${
          sent ? a.sentBtn : baseBtnCls
        }`}
      >
        {sent ? (
          <>
            <CheckCircle size={13} weight="fill" className="inline align-text-bottom mr-1" />
            Sent
          </>
        ) : (
          <>
            <Megaphone size={13} weight="fill" className="inline align-text-bottom mr-1" />
            Fire SMS + email
          </>
        )}
      </button>
    </div>
  );
}

function OutcomeButton({
  outcome,
  onClick,
  busy,
  primary,
  saved,
  payoutCents,
}: {
  outcome: Outcome;
  onClick: (o: Outcome) => void;
  busy: boolean;
  primary?: boolean;
  saved?: boolean;
  payoutCents: number;
}) {
  const meta = OUTCOME_BY_ID[outcome];
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
  const savedCls =
    "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-100 font-semibold ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/20";
  const payoutSuffix =
    payoutCents > 0 ? ` · +$${(payoutCents / 100).toFixed(0)}` : "";
  return (
    <button
      onClick={() => onClick(outcome)}
      disabled={busy}
      className={`w-full rounded-md px-3 py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left ${
        saved ? savedCls : baseCls
      }`}
    >
      {saved ? `✓ ${meta.label} — saved${payoutSuffix}` : `${meta.label}${payoutSuffix}`}
    </button>
  );
}

function OutcomeConfirmModal({
  outcome,
  payoutCents,
  onConfirm,
  onCancel,
  busy,
}: {
  outcome: Outcome;
  payoutCents: number;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const meta = OUTCOME_BY_ID[outcome];
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-amber-500/40 bg-slate-950 p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-2">
          Confirm outcome
        </p>
        <h3 className="text-2xl font-extrabold text-white mb-3">{meta.label}</h3>
        {payoutCents > 0 ? (
          <p className="text-sm text-emerald-300 mb-5 leading-relaxed">
            <CurrencyDollar size={14} weight="fill" className="inline align-text-bottom mr-1" />
            Pacing payout: <span className="font-bold">+${(payoutCents / 100).toFixed(0)}</span>
            <span className="text-slate-400">
              {" "}
              · pays out only when conversion clears.
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            No payout for this outcome — but tracking it tightens your pipeline.
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-md border border-white/10 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-4 py-2.5 text-sm font-bold text-amber-950 transition-colors"
          >
            {busy ? "Logging…" : "Log outcome →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PayoutPacingTiles({
  todayCents,
  weekCents,
}: {
  todayCents: number;
  weekCents: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
        <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold mb-0.5">
          Today
        </p>
        <p className="text-2xl font-extrabold text-emerald-200 tabular-nums">
          ${(todayCents / 100).toFixed(0)}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">pacing payout</p>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
        <p className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-0.5">
          This week
        </p>
        <p className="text-2xl font-extrabold text-amber-200 tabular-nums">
          ${(weekCents / 100).toFixed(0)}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">pacing payout</p>
      </div>
    </div>
  );
}

function PayoutStructureCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
        <CurrencyDollar size={12} weight="fill" className="inline align-text-bottom mr-1" />
        Payout structure
      </p>
      <div className="space-y-3 text-xs leading-relaxed">
        <div>
          <p className="font-bold text-emerald-300 mb-0.5">$50 retail referral</p>
          <p className="text-slate-400">
            → when a config link sent to hobbyist / hunter / TYM / forester converts to a purchase
          </p>
        </div>
        <div>
          <p className="font-bold text-amber-300 mb-0.5">$250 dealer referral</p>
          <p className="text-slate-400">
            → when a dealer call lands a wholesale signup
          </p>
        </div>
        <p className="text-[10px] text-slate-500 italic pt-2 border-t border-white/5">
          Paid via Venmo or Zelle within 7 days of conversion.
        </p>
      </div>
    </div>
  );
}

function CallHistoryPanel({
  entries,
  loading,
}: {
  entries: CallEntry[];
  loading: boolean;
}) {
  // Group calls by day-bucket: today / yesterday
  const buckets = useMemo(() => groupByDayBucket(entries), [entries]);
  return (
    <details
      className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-900/40 overflow-hidden"
      open
    >
      <summary className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wider text-slate-300 font-semibold hover:bg-slate-800/40 transition-colors flex items-center justify-between">
        <span>📋 Recent calls</span>
        <span className="text-slate-500 text-[10px] font-normal">
          {loading ? "loading…" : `${entries.length} entries`}
        </span>
      </summary>
      {loading ? (
        <p className="px-4 pb-4 text-xs text-slate-500">Loading recent calls…</p>
      ) : entries.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-slate-500 leading-relaxed">
          No calls logged yet. Make some dials.
        </p>
      ) : (
        <div className="border-t border-slate-800/60 max-h-[500px] overflow-y-auto">
          {buckets.map((b) => (
            <div key={b.label}>
              <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-950/50 sticky top-0">
                {b.label}
              </p>
              <ul className="divide-y divide-slate-800/60">
                {b.entries.map((e) => (
                  <li key={e.id} className="px-4 py-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-semibold ${outcomeColorFor(e.outcome)}`}
                          >
                            {OUTCOME_BY_ID[e.outcome]?.label ?? e.outcome}
                          </span>
                          {e.audience && (
                            <span className="text-[9px] uppercase tracking-wider text-amber-300/80 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
                              {e.audience}
                            </span>
                          )}
                          {e.estimatedPayoutCents > 0 && (
                            <span className="text-[10px] font-bold text-emerald-400">
                              +${(e.estimatedPayoutCents / 100).toFixed(0)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 mt-0.5 leading-snug truncate">
                          {e.prospectName ?? e.prospectPhone ?? "(no name)"}
                        </p>
                      </div>
                      <span className="text-slate-500 flex-shrink-0 tabular-nums">
                        {relativeTime(e.calledAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </details>
  );
}

function outcomeColorFor(outcome: Outcome): string {
  const meta = OUTCOME_BY_ID[outcome];
  if (!meta) return "text-slate-400";
  switch (meta.tone) {
    case "emerald":
      return "text-emerald-400";
    case "sky":
      return "text-sky-400";
    case "amber":
      return "text-amber-400";
    case "rose":
      return "text-rose-400";
    default:
      return "text-slate-400";
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function groupByDayBucket(
  entries: CallEntry[],
): Array<{ label: string; entries: CallEntry[] }> {
  const today: CallEntry[] = [];
  const yesterday: CallEntry[] = [];
  const older: CallEntry[] = [];
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  for (const e of entries) {
    const t = new Date(e.calledAt).getTime();
    if (t >= startOfToday) today.push(e);
    else if (t >= startOfYesterday) yesterday.push(e);
    else older.push(e);
  }
  const buckets: Array<{ label: string; entries: CallEntry[] }> = [];
  if (today.length) buckets.push({ label: "Today", entries: today });
  if (yesterday.length) buckets.push({ label: "Yesterday", entries: yesterday });
  if (older.length) buckets.push({ label: "Older", entries: older });
  return buckets;
}
