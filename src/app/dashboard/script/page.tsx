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
import type { Prospect } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import ScriptQueueClient from "./ScriptQueueClient";

/**
 * /dashboard/script — Ben's personal call workspace.
 *
 * Flow:
 *   1. Ben multi-selects leads on /dashboard
 *   2. Hits "Use Script (N)" — opens this page with ?ids=id1,id2,id3
 *   3. Page renders the same Hormozi call script that partners use,
 *      but pre-filled with each lead's info
 *   4. Prev/Next buttons step through the queue without page reloads
 *      (queue lives in URL state so refreshing or sharing preserves it)
 *
 * Why a separate page instead of /partners/work: that route is
 * partner-cookie-gated and pulls from the partner-approved pool.
 * This is admin-gated (via middleware on /dashboard/*) and pulls
 * exactly the leads Ben selected. No partner_calls logging — Ben
 * can take notes via the existing /lead/[id] note system.
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

  if (!prospect) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-4 mb-2">Lead not found</h1>
          <p className="text-slate-400">The prospect at queue position {index + 1} doesn&apos;t exist anymore.</p>
        </div>
      </main>
    );
  }

  const filled = buildFilledScript(prospect);

  // Pull the latest completed audit so the call workspace shows the
  // score + a one-click link into the audit page. Same query the
  // /api/prospects/:id/latest-audit endpoint uses, but server-side
  // here so the client doesn't fan out an extra request.
  let latestAudit: { id: string; score: number | null; url: string } | null = null;
  if (isSupabaseConfigured()) {
    try {
      const { data: auditRow } = await supabase
        .from("site_audits")
        .select("id, audit_content")
        .eq("prospect_id", currentId)
        .eq("status", "ready")
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (auditRow) {
        const r = auditRow as { id: string; audit_content: { overallScore?: number } | null };
        const score = r.audit_content?.overallScore ?? null;
        latestAudit = { id: r.id, score, url: `${SITE_ORIGIN}/audit/${r.id}` };
      }
    } catch (err) {
      console.error("[/dashboard/script] audit lookup failed:", err);
    }
  }

  return (
    <ScriptQueueClient
      ids={ids}
      index={index}
      prospect={{
        id: prospect.id,
        businessName: prospect.businessName,
        ownerName: prospect.ownerName || null,
        phone: prospect.phone || null,
        email: prospect.email || null,
        city: prospect.city,
        state: prospect.state,
        category: prospect.category,
        currentWebsite: prospect.currentWebsite || null,
        previewUrl: `${SITE_ORIGIN}/preview/${prospect.id}`,
        leadDetailUrl: `/lead/${prospect.id}`,
        latestAudit,
      }}
      script={filled.script}
      tips={HORMOZI_CALL_TIPS}
      mantra={HORMOZI_MANTRA}
      links={filled.links}
    />
  );
}

// ─── Script-fill helpers ────────────────────────────────────────────

function buildFilledScript(prospect: Prospect) {
  const ownerFirstNameRaw = prospect.ownerName
    ? prospect.ownerName.trim().split(/\s+/)[0]
    : "";
  const ownerKnown = !!ownerFirstNameRaw;
  const ownerFirstName = ownerFirstNameRaw || "the owner";

  const previewUrl = `${SITE_ORIGIN}/preview/${prospect.id}`;
  const auditUrl = `${SITE_ORIGIN}/audit?ref=ben`;
  const scheduleUrl = buildBookingUrlForCall({
    prospectId: prospect.id,
    partnerCode: "ben",
  });

  const vars: ScriptVars = {
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

  return {
    script: {
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
    },
    links: { previewUrl, auditUrl, scheduleUrl },
  };
}
