import { redirect } from "next/navigation";
import Link from "next/link";
import { getProspect } from "@/lib/store";
import {
  fillVars,
  HORMOZI_CALL_SCRIPT,
  HORMOZI_CALL_TIPS,
  HORMOZI_MANTRA,
  HORMOZI_INTRO_UNKNOWN_OWNER,
  HORMOZI_VOICEMAIL_UNKNOWN_OWNER,
  type ScriptSection,
  type ScriptVars,
} from "@/lib/partners-script";
import { buildBookingUrlForCall } from "@/lib/booking";
import { getProspectClock, getOpenStatus } from "@/lib/business-hours";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCallHistoryForProspect } from "@/lib/partner-leadpool";
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

type SearchParams = { ids?: string; i?: string };

export default async function DashboardScriptPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const idsParam = (params.ids || "").trim();
  if (!idsParam) {
    redirect("/dashboard");
  }

  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    redirect("/dashboard");
  }

  const indexParam = parseInt(params.i || "0", 10);
  const index = Number.isFinite(indexParam) && indexParam >= 0 && indexParam < ids.length ? indexParam : 0;

  const currentId = ids[index];
  const prospect = await getProspect(currentId);

  // Build queue navigation URLs that the workspace uses for Prev/Next
  // and for "Skip" / "Mark outcome → advance"
  const baseQS = `ids=${encodeURIComponent(ids.join(","))}`;
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

  const previewUrl = prospect.pricingTier === "custom" && prospect.customSiteUrl
    ? prospect.customSiteUrl
    : `${SITE_ORIGIN}/preview/${prospect.id}`;
  const auditUrl = `${SITE_ORIGIN}/audit?ref=ben`;
  const scheduleUrl = buildBookingUrlForCall({
    prospectId: prospect.id,
    partnerCode: "ben",
  });

  const vars: ScriptVars & { ownerOrThem: string } = {
    bizName: prospect.businessName,
    firstName: ownerFirstName,
    category: (prospect.category || "service").replace(/-/g, " "),
    city: prospect.city || "your area",
    url:
      prospect.currentWebsite ||
      `${prospect.businessName}'s website`,
    partnerFirstName: "Ben",
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

  const filledScript = {
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

  // ─── Prospect clock + open-status ────────────────────────────────
  const clock = getProspectClock(prospect.state);
  const rawHours =
    typeof prospect.scrapedData?.hours === "string" ? prospect.scrapedData.hours : null;
  const openStatus = getOpenStatus(clock, rawHours);

  // ─── Latest audit + call history ─────────────────────────────────
  let latestAuditId: string | null = null;
  let hasCompletedAudit = false;
  if (isSupabaseConfigured()) {
    try {
      const { data: auditRow } = await supabase
        .from("site_audits")
        .select("id")
        .eq("prospect_id", prospect.id)
        .eq("status", "ready")
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (auditRow) {
        latestAuditId = (auditRow as { id: string }).id;
        hasCompletedAudit = true;
      }
    } catch {
      // ignore — workspace renders fine without audit ID
    }
  }

  const callHistory = await getCallHistoryForProspect(prospect.id);

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
        id: "ben-admin",
        name: "Ben",
        code: "ben",
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
        previewUrl,
        auditViewUrl: latestAuditId ? `${SITE_ORIGIN}/audit/${latestAuditId}?ref=ben` : null,
        categoryTemplateUrl: `${SITE_ORIGIN}/v2/${prospect.category || "general"}`,
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
      tips={HORMOZI_CALL_TIPS}
      mantra={HORMOZI_MANTRA}
      callHistory={callHistory}
    />
  );
}
