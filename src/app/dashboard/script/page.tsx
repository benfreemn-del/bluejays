import Link from "next/link";
import { cookies } from "next/headers";
import { getProspect } from "@/lib/store";
import LeadPicker from "./LeadPicker.client";
import {
  fillVars,
  HORMOZI_CALL_SCRIPT,
  HORMOZI_CALL_TIPS,
  HORMOZI_MANTRA,
  HORMOZI_INTRO_UNKNOWN_OWNER,
  HORMOZI_VOICEMAIL_UNKNOWN_OWNER,
  PARTNER_CALL_SCRIPT,
  PARTNER_CALL_TIPS,
  PARTNER_MANTRA,
  VERTICAL_PITCH,
  VERTICAL_OBJECTIONS,
  type ScriptSection,
  type ScriptVars,
} from "@/lib/partners-script";
import { buildBookingUrlForCall } from "@/lib/booking";
import { getProspectClock, getOpenStatus } from "@/lib/business-hours";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getInteractionHistoryForProspect } from "@/lib/partner-leadpool";
import type { Prospect } from "@/lib/types";
import CallWorkspace from "@/app/partners/work/CallWorkspace";

/**
 * /dashboard/script — Ben's personal call workspace.
 *
 * As of 2026-05-01, uses the SAME CallWorkspace component partners use
 * (in admin mode) so Ben gets full functionality: send-preview-link,
 * send-booking-link, send-audit-link, mark outcome, prospect card with
 * open/closed indicator + local time, full Hormozi script + objections.
 *
 * Differences from /partners/work:
 *   - Admin auth (middleware /dashboard/* gate, not partner cookie)
 *   - Queue-driven (Prev/Next from URL ?ids=…&i=…), not pool-driven
 *   - No partner_calls writes — outcomes save as notes on the prospect
 *   - "Ben's workspace" branding instead of partner name
 *   - Back-to-dashboard instead of logout
 */

export const dynamic = "force-dynamic";

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

type SearchParams = { ids?: string; i?: string; mode?: string };

export default async function DashboardScriptPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const idsParam = (params.ids || "").trim();
  // Caller mode — the caller is the primary sales-portal user (uses Ben's
  // login). Defaults to the caller's flow. ?mode=ben is the escape hatch if
  // Ben ever wants to run his original cold-call Hormozi script.
  const mode: "ben" | "partner" = params.mode === "ben" ? "ben" : "partner";

  // No queue param → render the Sales Portal lead picker so Ben can browse
  // prospects, build a queue, and start the call workflow. Replaces the
  // old redirect-to-dashboard fallback.
  if (!idsParam) {
    return <LeadPicker />;
  }

  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    return <LeadPicker />;
  }

  const indexParam = parseInt(params.i || "0", 10);
  const index = Number.isFinite(indexParam) && indexParam >= 0 && indexParam < ids.length ? indexParam : 0;

  const currentId = ids[index];
  const prospect = await getProspect(currentId);

  // Build queue navigation URLs that the workspace uses for Prev/Next
  // and for "Skip" / "Mark outcome → advance"
  // the caller is the default — only carry the mode flag through nav
  // when Ben has explicitly switched to his original script.
  const baseQS =
    `ids=${encodeURIComponent(ids.join(","))}` +
    (mode === "ben" ? "&mode=ben" : "");
  const prevHref = index > 0 ? `/dashboard/script?${baseQS}&i=${index - 1}` : null;
  const nextHref = index < ids.length - 1 ? `/dashboard/script?${baseQS}&i=${index + 1}` : null;

  if (!prospect) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3">Lead not found</h1>
          <p className="text-slate-400 mb-6">
            The prospect at queue position {index + 1} doesn&apos;t exist anymore. Skip ahead or head back.
          </p>
          <div className="flex items-center justify-center gap-3">
            {nextHref && (
              <Link
                href={nextHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-electric text-white font-semibold"
              >
                Next →
              </Link>
            )}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-white/15 text-slate-300"
            >
              ← Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Build script vars + filled sections ─────────────────────────
  const ownerFirstNameRaw = prospect.ownerName
    ? prospect.ownerName.trim().split(/\s+/)[0]
    : "";
  const ownerKnown = !!ownerFirstNameRaw;
  const ownerFirstName = ownerFirstNameRaw || "the owner";

  // Read role + derive caller identity. When Madie is logged in the
  // bj_role cookie reads 'sales' — every link she texts (audit,
  // booking, audit-view) gets ?ref=madie / partnerCode=madie so her
  // commissions actually attribute back to her instead of crediting
  // Ben for everything she closes.
  const cookieStore = await cookies();
  const role: "owner" | "sales" =
    cookieStore.get("bj_role")?.value === "sales" ? "sales" : "owner";
  const callerCode = role === "sales" ? "madie" : "ben";
  const callerName = role === "sales" ? "Madie" : "Ben";

  const previewUrl = prospect.pricingTier === "custom" && prospect.customSiteUrl
    ? prospect.customSiteUrl
    : `${SITE_ORIGIN}/preview/${prospect.id}`;
  const auditUrl = `${SITE_ORIGIN}/audit?ref=${callerCode}`;
  const scheduleUrl = buildBookingUrlForCall({
    prospectId: prospect.id,
    partnerCode: callerCode,
  });

  const vars: ScriptVars & { ownerOrThem: string } = {
    bizName: prospect.businessName,
    firstName: ownerFirstName,
    category: (prospect.category || "service").replace(/-/g, " "),
    city: prospect.city || "your area",
    url:
      prospect.currentWebsite ||
      `${prospect.businessName}'s website`,
    // Caller's first name (used by script merge tags). Drives the
    // "this is X calling" intro line. Always the logged-in user.
    partnerFirstName: callerName,
    previewUrl,
    auditUrl,
    scheduleUrl,
    ownerOrThem: ownerKnown ? ownerFirstName : "they",
  };

  const introSection = ownerKnown
    ? HORMOZI_CALL_SCRIPT.intro
    : HORMOZI_INTRO_UNKNOWN_OWNER;
  const voicemailSection = ownerKnown
    ? HORMOZI_CALL_SCRIPT.voicemail
    : HORMOZI_VOICEMAIL_UNKNOWN_OWNER;

  const fillSec = (s: ScriptSection): ScriptSection => ({
    ...s,
    lines: s.lines.map((line) => fillVars(line, vars)),
    callerNotes: s.callerNotes ? s.callerNotes.map((n) => fillVars(n, vars)) : undefined,
    goal: s.goal ? fillVars(s.goal, vars) : undefined,
  });

  // Merge two ScriptSections into one — used to fold partner-parallel
  // sections into the same 8-slot CallWorkspace shape without losing
  // any content. Lines stack with a divider; callerNotes concatenate.
  const mergeSections = (
    primary: ScriptSection,
    secondary: ScriptSection,
    dividerLabel: string,
  ): ScriptSection => ({
    id: primary.id,
    title: primary.title,
    goal: primary.goal,
    lines: [
      ...primary.lines,
      `[${dividerLabel}]`,
      ...secondary.lines,
    ],
    callerNotes: [
      ...(primary.callerNotes ?? []),
      `── ${dividerLabel} ──`,
      ...(secondary.callerNotes ?? []),
    ],
  });

  // Build the partner-filled script — maps the caller's 12-section flow onto the
  // 8-slot CallWorkspace shape:
  //   intro       = opener + identityFrame
  //   qualify     = previewFrame + discovery (the keystone 2 questions)
  //   pitch       = websitePitch (default — backend pitches live in objections)
  //   bookTheCall = bookTheCall + scarcityClose (drop scarcity if hesitating)
  //   Otthe caller's slots map 1:1.
  const buildPartnerScript = () => {
    const m = PARTNER_CALL_SCRIPT;
    return {
      intro: fillSec(mergeSections(m.opener, m.identityFrame, "THEN — set the identity")),
      qualify: fillSec(
        mergeSections(m.previewFrame, m.discovery, "THEN — discovery questions"),
      ),
      // Default pitch is the website angle. Backend variants
      // (backendPivot, backendPitch) live as objection branches that
      // surface when the prospect signals "have a website" or
      // "have an agency" — matches the real call flow.
      pitch: fillSec(m.websitePitch),
      bookTheCall: fillSec(
        mergeSections(m.bookTheCall, m.scarcityClose, "IF HESITATING — drop scarcity ONCE"),
      ),
      textTheLink: fillSec(m.textTheLink),
      callbackClose: fillSec(m.callbackClose),
      voicemail: fillSec(m.voicemail),
      // Objection list = partner-branches FIRST, then the caller's two
      // backend pitches surfaced as named objection branches so the
      // CallWorkspace's objection-jump UI can route the caller into
      // the high-ticket path mid-call.
      objections: [
        // The two backend pitches as accessible branches:
        {
          id: "BACKEND_PIVOT",
          trigger: "★ HARD-WEBSITE-REJECT — pivot to backend ($1k commission)",
          response: m.backendPivot.lines,
          callerNotes: m.backendPivot.callerNotes?.join("\n"),
        },
        {
          id: "BACKEND_LEAD",
          trigger: "★ THEY HAVE AN AGENCY — lead with backend (skip site)",
          response: m.backendPitch.lines,
          callerNotes: m.backendPitch.callerNotes?.join("\n"),
        },
        ...m.objections,
      ].map((o) => ({
        ...o,
        response: o.response.map((line) => fillVars(line, vars)),
        callerNotes: o.callerNotes ? fillVars(o.callerNotes, vars) : undefined,
      })),
    };
  };

  const baseScript =
    mode === "partner"
      ? buildPartnerScript()
      : {
          intro: fillSec(introSection),
          qualify: fillSec(HORMOZI_CALL_SCRIPT.qualify),
          pitch: fillSec(HORMOZI_CALL_SCRIPT.pitch),
          bookTheCall: fillSec(HORMOZI_CALL_SCRIPT.bookTheCall),
          textTheLink: fillSec(HORMOZI_CALL_SCRIPT.textTheLink),
          callbackClose: fillSec(HORMOZI_CALL_SCRIPT.callbackClose),
          voicemail: fillSec(voicemailSection),
          objections: HORMOZI_CALL_SCRIPT.objections.map((o) => ({
            ...o,
            response: o.response.map((line) => fillVars(line, vars)),
            callerNotes: o.callerNotes ? fillVars(o.callerNotes, vars) : undefined,
          })),
        };

  // ─── Vertical override (Phase 4 niche-down 2026-05-14) ────────────
  // When the prospect is a manufacturer or indie author, replace the
  // generic pitch with the vertical-specific one and PREPEND the
  // vertical-specific objections to the existing objection list. The
  // partner intro (which assumes the prospect already received the
  // preview email) stays unchanged — it's the right shape for the
  // warm-after-email flow regardless of vertical.
  //
  // Detection: mfg-* lookalikeCategory → manufacturer; category ===
  // 'indie-author' → author. Service/unknown → no override (baseScript
  // unchanged). Mirrors getVerticalContext() in email-templates.ts.
  const verticalKey: "manufacturer" | "author" | null =
    (prospect.lookalikeCategory ?? "").toString().startsWith("mfg-")
      ? "manufacturer"
      : prospect.category === "indie-author"
        ? "author"
        : null;

  const filledScript = verticalKey
    ? {
        ...baseScript,
        pitch: fillSec(VERTICAL_PITCH[verticalKey]),
        objections: [
          ...VERTICAL_OBJECTIONS[verticalKey].map((o) => ({
            ...o,
            response: o.response.map((line) => fillVars(line, vars)),
            callerNotes: o.callerNotes ? fillVars(o.callerNotes, vars) : undefined,
          })),
          ...baseScript.objections,
        ],
      }
    : baseScript;

  // ─── Prospect clock + open-status ────────────────────────────────
  const clock = getProspectClock(prospect.state);
  const rawHours =
    typeof prospect.scrapedData?.hours === "string" ? prospect.scrapedData.hours : null;
  const openStatus = getOpenStatus(clock, rawHours);

  // ─── Latest audit (any status) + call history ────────────────────
  // Pull the latest audit row regardless of status so the workspace
  // can show "Audit generating…" / "Audit failed" instead of just
  // hiding the View-audit button. Ben needs to know WHY it's not
  // available, not just that it isn't.
  let latestAuditId: string | null = null;
  let latestAuditStatus: string | null = null;
  let hasCompletedAudit = false;
  if (isSupabaseConfigured()) {
    try {
      const { data: auditRow } = await supabase
        .from("site_audits")
        .select("id, status")
        .eq("prospect_id", prospect.id)
        .order("generated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (auditRow) {
        const row = auditRow as { id: string; status: string };
        latestAuditId = row.id;
        latestAuditStatus = row.status;
        hasCompletedAudit = row.status === "ready";
      }
    } catch {
      // ignore — workspace renders fine without audit ID
    }
  }

  const callHistory = await getInteractionHistoryForProspect(prospect.id);

  return (
    <CallWorkspace
      mode="admin"
      adminQueueNav={{
        prevHref,
        nextHref,
        index,
        total: ids.length,
        doneHref: "/dashboard",
      }}
      partner={{
        // Identity is driven by ROLE (cookie), not by the mode flag.
        // mode controls which SCRIPT flavor renders (Hormozi vs the
        // partner/setter script) but the caller identity that
        // attaches to merge tags + booking ?ref= is always the
        // logged-in person. Madie ⇒ 'madie' / 'Madie', Ben ⇒ 'ben'
        // / 'Ben'. Generic "the caller" is removed.
        id: role === "sales" ? "madie-admin" : "ben-admin",
        name: callerName,
        code: callerCode,
        agreementAccepted: true,
      }}
      prospect={{
        id: prospect.id,
        businessName: prospect.businessName,
        ownerName: prospect.ownerName ?? null,
        ownerKnown,
        phone: prospect.phone || "",
        email: prospect.email ?? null,
        city: prospect.city ?? null,
        state: prospect.state ?? null,
        category: prospect.category ?? null,
        status: prospect.status ?? null,
        hasCompletedAudit,
        latestAuditId,
        latestAuditStatus,
        previewUrl,
        auditViewUrl: hasCompletedAudit && latestAuditId
          ? `${SITE_ORIGIN}/audit/${latestAuditId}?ref=${callerCode}`
          : null,
        categoryTemplateUrl: `${SITE_ORIGIN}/v2/${prospect.category || "general"}`,
        pipelineStage: prospect.pipelineStage,
        websiteUrl: prospect.currentWebsite ?? null,
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(
          `${prospect.businessName} ${prospect.city || ""} ${(prospect.category || "").replace(/-/g, " ")}`.trim(),
        )}`,
        rawHours,
        clockDisplay: clock.display,
        clockIsFallbackTz: clock.isFallbackTz,
        openState: openStatus.state,
        openLabel: openStatus.label,
        openPrecise: openStatus.precise,
        openHint: openStatus.hint ?? null,
      }}
      counters={{
        // Counters are partner-mode-only UI; admin mode uses adminQueueNav
        // for its progress display so these are placeholders.
        callsThisSession: index,
        goal: ids.length,
        remainingPool: ids.length - index,
      }}
      links={{ previewUrl, auditUrl, scheduleUrl }}
      script={filledScript}
      tips={mode === "partner" ? PARTNER_CALL_TIPS : HORMOZI_CALL_TIPS}
      mantra={mode === "partner" ? PARTNER_MANTRA : HORMOZI_MANTRA}
      callHistory={callHistory}
      recentActivity={[]}
    />
  );
}
