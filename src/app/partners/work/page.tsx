import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partner-auth";
import {
  getNextProspectForPartner,
  countCallsThisSessionForPartner,
  getCallHistoryForProspect,
} from "@/lib/partner-leadpool";
import type { CallHistoryEntry } from "@/lib/partner-leadpool";
import {
  fillVars,
  HORMOZI_CALL_SCRIPT,
  HORMOZI_CALL_TIPS,
  HORMOZI_MANTRA,
  HORMOZI_INTRO_UNKNOWN_OWNER,
  HORMOZI_VOICEMAIL_UNKNOWN_OWNER,
} from "@/lib/partners-script";
import type { ScriptVars } from "@/lib/partners-script";
import { getProspectClock, getOpenStatus } from "@/lib/business-hours";
import { buildBookingUrlForCall } from "@/lib/booking";
import CallWorkspace from "./CallWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Workspace — BlueJays Partners",
  robots: { index: false, follow: false },
};

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

/**
 * /partners/work — call workspace.
 *
 * Server component:
 *   1. Auth-gates on getCurrentPartner (redirects to /partners/login)
 *   2. Gates on agreement_accepted_at (renders agreement page if missing)
 *   3. Fetches next prospect from approved pool
 *   4. Fills script merge tags server-side
 *   5. Renders CallWorkspace (client) with everything pre-resolved
 *
 * Auto-advance after Next is handled client-side: log-call POST then
 * router.refresh() which re-runs this server component → fresh prospect.
 */
export default async function PartnerWorkPage() {
  const partner = await getCurrentPartner();
  if (!partner) redirect("/partners/login");

  // Session counter resets on each login. Goal is /100 per session
  // (per Ben spec) — long enough for real flow state, achievable in
  // a focused 2-3 hour block.
  const callsThisSession = await countCallsThisSessionForPartner(
    partner.id,
    partner.last_login_at ?? null,
  );
  const goal = 100;

  const [{ prospect, remainingCount }, ] = await Promise.all([
    getNextProspectForPartner(),
  ]);

  const callHistory: CallHistoryEntry[] = prospect
    ? await getCallHistoryForProspect(prospect.id)
    : [];

  // Resolve merge tags. Use the partner's first name for "this is X"
  // self-intro — pulled from partner.name, first token only.
  const partnerFirstName =
    (partner.name || "").trim().split(/\s+/)[0] || "the team";

  // Try to derive prospect's first name from owner_name. When we can't,
  // we DON'T fall back to "Hi there" — that sounds like spam. Instead
  // we swap the intro + voicemail script to the gatekeeper variant
  // (asks for whoever handles the website by role).
  const ownerFirstNameRaw = prospect?.owner_name
    ? prospect.owner_name.trim().split(/\s+/)[0]
    : "";
  const ownerKnown = !!ownerFirstNameRaw;
  const ownerFirstName = ownerFirstNameRaw || "the owner";

  const auditUrl = prospect?.latestAuditId
    ? `${SITE_ORIGIN}/audit/${prospect.latestAuditId}?ref=${partner.code}`
    : `${SITE_ORIGIN}/audit?ref=${partner.code}`;

  // Booking URL points to BEN's Calendly (env var BEN_BOOKING_URL),
  // which syncs natively to his Google Calendar. Calendly preserves the
  // utm_source / utm_campaign / utm_medium params on the booking link
  // so /api/webhooks/calendly can match the booking back to the
  // partner + prospect that brought it (and auto-mark the partner_call
  // outcome as 'answered_call_scheduled' on Ben's behalf).
  const scheduleUrl = buildBookingUrlForCall({
    prospectId: prospect?.id,
    partnerCode: partner.code,
  });

  // Short preview URL — the finished site they can see before paying.
  // /p/[code] resolves via the short_code column; fall back to full UUID path.
  const previewUrl = prospect
    ? `${SITE_ORIGIN}/preview/${prospect.id}`
    : SITE_ORIGIN;

  const vars: ScriptVars & { ownerOrThem: string } = {
    bizName: prospect?.business_name || "your business",
    firstName: ownerFirstName,
    category: (prospect?.category || "service").replace(/-/g, " "),
    city: prospect?.city || "your area",
    url:
      (prospect?.scraped_data?.submittedUrl as string | undefined) ||
      (prospect?.scraped_data?.website as string | undefined) ||
      `${prospect?.business_name || "the site"}'s website`,
    partnerFirstName,
    previewUrl,
    auditUrl,
    scheduleUrl,
    // Used in the unknown-owner intro: "is {ownerOrThem} around?" —
    // becomes "they" or the actual name once gatekeeper says it.
    ownerOrThem: ownerKnown ? ownerFirstName : "they",
  };

  // Pre-fill script lines + objections so the client doesn't need to
  // do regex work per render. When ownerKnown=false, swap intro +
  // voicemail to the gatekeeper-style variants.
  const introSection = ownerKnown
    ? HORMOZI_CALL_SCRIPT.intro
    : HORMOZI_INTRO_UNKNOWN_OWNER;
  const voicemailSection = ownerKnown
    ? HORMOZI_CALL_SCRIPT.voicemail
    : HORMOZI_VOICEMAIL_UNKNOWN_OWNER;

  const filledScript = {
    intro: filledSection(introSection, vars),
    qualify: filledSection(HORMOZI_CALL_SCRIPT.qualify, vars),
    pitch: filledSection(HORMOZI_CALL_SCRIPT.pitch, vars),
    bookTheCall: filledSection(HORMOZI_CALL_SCRIPT.bookTheCall, vars),
    textTheLink: filledSection(HORMOZI_CALL_SCRIPT.textTheLink, vars),
    callbackClose: filledSection(HORMOZI_CALL_SCRIPT.callbackClose, vars),
    voicemail: filledSection(voicemailSection, vars),
    objections: HORMOZI_CALL_SCRIPT.objections.map((o) => ({
      ...o,
      response: o.response.map((line) => fillVars(line, vars)),
      callerNotes: o.callerNotes ? fillVars(o.callerNotes, vars) : undefined,
    })),
  };

  return (
    <CallWorkspace
      partner={{
        id: partner.id,
        name: partner.name,
        code: partner.code,
        agreementAccepted: !!partner.agreement_accepted_at,
      }}
      prospect={
        prospect
          ? (() => {
              // Local-time + open/closed for the prospect's state. Always
              // computed; falls back to heuristic when scraped_data.hours
              // isn't parseable.
              const clock = getProspectClock(prospect.state);
              const rawHours =
                (prospect.scraped_data?.hours as string | undefined) ?? null;
              const openStatus = getOpenStatus(clock, rawHours);
              return {
                id: prospect.id,
                businessName: prospect.business_name,
                ownerName: prospect.owner_name,
                ownerKnown,
                phone: prospect.phone,
                email: prospect.email,
                city: prospect.city,
                state: prospect.state,
                category: prospect.category,
                status: prospect.status,
                hasCompletedAudit: prospect.hasCompletedAudit,
                latestAuditId: prospect.latestAuditId,
                // Partner-leadpool only loads ready-status audits, so
                // if latestAuditId is set we know it's a ready one.
                latestAuditStatus: prospect.latestAuditId ? "ready" : null,
                previewUrl: `${SITE_ORIGIN}/preview/${prospect.id}?ref=${partner.code}`,
                auditViewUrl: prospect.hasCompletedAudit && prospect.latestAuditId
                  ? `${SITE_ORIGIN}/audit/${prospect.latestAuditId}?ref=${partner.code}`
                  : null,
                categoryTemplateUrl: `${SITE_ORIGIN}/v2/${prospect.category || "general"}`,
                websiteUrl:
                  (prospect.scraped_data?.submittedUrl as string | undefined) ||
                  (prospect.scraped_data?.website as string | undefined) ||
                  null,
                googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(
                  `${prospect.business_name} ${prospect.city || ""} ${(prospect.category || "").replace(/-/g, " ")}`.trim(),
                )}`,
                rawHours,
                clockDisplay: clock.display,
                clockIsFallbackTz: clock.isFallbackTz,
                openState: openStatus.state,
                openLabel: openStatus.label,
                openPrecise: openStatus.precise,
                openHint: openStatus.hint ?? null,
              };
            })()
          : null
      }
      counters={{
        callsThisSession,
        goal,
        remainingPool: remainingCount,
      }}
      links={{
        previewUrl,
        auditUrl,
        scheduleUrl,
      }}
      script={filledScript}
      tips={HORMOZI_CALL_TIPS}
      mantra={HORMOZI_MANTRA}
      callHistory={callHistory}
    />
  );
}

function filledSection(
  section: import("@/lib/partners-script").ScriptSection,
  vars: ScriptVars,
) {
  return {
    ...section,
    lines: section.lines.map((line) => fillVars(line, vars)),
    callerNotes: section.callerNotes
      ? section.callerNotes.map((n) => fillVars(n, vars))
      : undefined,
    goal: section.goal ? fillVars(section.goal, vars) : undefined,
  };
}
