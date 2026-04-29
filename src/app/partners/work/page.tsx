import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partner-auth";
import {
  getNextProspectForPartner,
  countCallsTodayForPartner,
} from "@/lib/partner-leadpool";
import { fillVars, HORMOZI_CALL_SCRIPT } from "@/lib/partners-script";
import type { ScriptVars } from "@/lib/partners-script";
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

  const callsToday = await countCallsTodayForPartner(partner.id);
  const goal = partner.daily_call_goal || 10;

  const { prospect, remainingCount } = await getNextProspectForPartner();

  // Resolve merge tags. Use the partner's first name for "this is X"
  // self-intro — pulled from partner.name, first token only.
  const partnerFirstName =
    (partner.name || "").trim().split(/\s+/)[0] || "the team";

  // Try to derive prospect's first name from owner_name; fall back to "there"
  const ownerFirstName = prospect?.owner_name
    ? prospect.owner_name.trim().split(/\s+/)[0]
    : "there";

  const auditUrl = prospect?.latestAuditId
    ? `${SITE_ORIGIN}/audit/${prospect.latestAuditId}?ref=${partner.code}`
    : `${SITE_ORIGIN}/audit?ref=${partner.code}`;

  const scheduleUrl = prospect
    ? `${SITE_ORIGIN}/schedule/${prospect.id}?ref=${partner.code}&source=partner-call`
    : `${SITE_ORIGIN}/schedule?ref=${partner.code}`;

  const vars: ScriptVars = {
    bizName: prospect?.business_name || "your business",
    firstName: ownerFirstName,
    category: (prospect?.category || "service").replace(/-/g, " "),
    city: prospect?.city || "your area",
    url:
      (prospect?.scraped_data?.submittedUrl as string | undefined) ||
      (prospect?.scraped_data?.website as string | undefined) ||
      `${prospect?.business_name || "the site"}'s website`,
    partnerFirstName,
    auditUrl,
    scheduleUrl,
  };

  // Pre-fill script lines + objections so the client doesn't need to
  // do regex work per render.
  const filledScript = {
    intro: filledSection(HORMOZI_CALL_SCRIPT.intro, vars),
    qualify: filledSection(HORMOZI_CALL_SCRIPT.qualify, vars),
    pitch: filledSection(HORMOZI_CALL_SCRIPT.pitch, vars),
    bookTheCall: filledSection(HORMOZI_CALL_SCRIPT.bookTheCall, vars),
    textTheLink: filledSection(HORMOZI_CALL_SCRIPT.textTheLink, vars),
    callbackClose: filledSection(HORMOZI_CALL_SCRIPT.callbackClose, vars),
    voicemail: filledSection(HORMOZI_CALL_SCRIPT.voicemail, vars),
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
          ? {
              id: prospect.id,
              businessName: prospect.business_name,
              ownerName: prospect.owner_name,
              phone: prospect.phone,
              email: prospect.email,
              city: prospect.city,
              state: prospect.state,
              category: prospect.category,
              status: prospect.status,
              hasCompletedAudit: prospect.hasCompletedAudit,
              websiteUrl:
                (prospect.scraped_data?.submittedUrl as string | undefined) ||
                (prospect.scraped_data?.website as string | undefined) ||
                null,
            }
          : null
      }
      counters={{
        callsToday,
        goal,
        remainingPool: remainingCount,
      }}
      links={{
        auditUrl,
        scheduleUrl,
      }}
      script={filledScript}
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
