import { NextRequest, NextResponse } from "next/server";
import {
  ALL_DRILLS,
  buildDrillOfWeekEmail,
  isoWeekNumber,
  pickDrillForWeek,
  type Drill,
} from "@/data/zenith-drills";
import { listClientLeads } from "@/lib/client-leads";
import { sendEmailTo } from "@/lib/alerts";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET  /api/zenith/drill-of-week — preview which drill is up for this
 *   week + the rendered email body. Used by the admin page.
 *
 * POST /api/zenith/drill-of-week — fan out the drill email to every
 *   active coach lead for zenith-sports. Body:
 *     { dryRun?: boolean — return the recipient list without sending,
 *       weekOverride?: number — pick a specific week's drill,
 *       audience?: "coach" | "parent" | "player" — default "coach" }
 *
 * Auth: protected by /dashboard middleware on the admin route that
 * calls this. The endpoint itself relies on the dashboard prefix not
 * being publicly callable; if exposing more broadly later, add a
 * shared-secret check.
 */

function pickDrill(weekOverride?: number): {
  weekNum: number;
  drill: Drill;
  email: { subject: string; body: string };
} {
  const weekNum = weekOverride ?? isoWeekNumber();
  const drill = pickDrillForWeek(weekNum);
  const email = buildDrillOfWeekEmail(drill);
  return { weekNum, drill, email };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const weekOverride = url.searchParams.get("week");
  const week = weekOverride ? parseInt(weekOverride, 10) : undefined;
  const { weekNum, drill, email } = pickDrill(week);
  // Walk through the next 4 weeks too so the admin page can preview the
  // upcoming rotation at a glance.
  const upcoming = Array.from({ length: 4 }, (_, i) => {
    const w = weekNum + i;
    return { weekNum: w, drill: pickDrillForWeek(w) };
  });
  return NextResponse.json({
    ok: true,
    weekNum,
    drill,
    email,
    upcoming,
    totalDrills: ALL_DRILLS.length,
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    /* empty body OK */
  }
  const dryRun = body.dryRun === true;
  const weekOverride =
    typeof body.weekOverride === "number" ? body.weekOverride : undefined;
  const audience = (body.audience as string) || "coach";

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const { weekNum, drill, email } = pickDrill(weekOverride);

  // Pull every active lead in the chosen audience that hasn't bounced /
  // unsubscribed (we treat 'paused' as opt-out for broadcasts).
  // Variable substitution that the funnel runner normally provides —
  // duplicate the small set we use here so a one-shot broadcast doesn't
  // need to round-trip through the runner's enroll/step machinery.
  const SUBS: Record<string, string> = {
    coachGuideUrl:
      "https://bluejayportfolio.com/clients/zenith-sports/training-guide",
    builderUrl:
      "https://bluejayportfolio.com/clients/zenith-sports/build-your-player",
  };

  const leads = await listClientLeads("zenith-sports", {
    audience: audience as "coach" | "parent" | "player",
    limit: 500,
  });
  const recipients = leads.filter(
    (l) =>
      l.email &&
      l.funnel_status !== "paused" &&
      l.funnel_status !== "completed",
  );

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      weekNum,
      drill,
      email,
      recipientCount: recipients.length,
      recipients: recipients.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        funnel_status: l.funnel_status,
      })),
    });
  }

  // Real send — substitute {{firstName}} per-lead and pipe through
  // sendEmailTo so each message is tagged with the client_slug for
  // the spending dashboard.
  const fillTemplate = (
    s: string,
    vars: Record<string, string>,
  ): string => s.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");

  let sent = 0;
  let errors = 0;
  for (const l of recipients) {
    if (!l.email) continue;
    const firstName =
      (l.name?.trim().split(/\s+/)[0] || "Coach").replace(/[<>]/g, "");
    const vars = { ...SUBS, firstName };
    try {
      await sendEmailTo({
        to: l.email,
        subject: fillTemplate(email.subject, vars),
        body: fillTemplate(email.body, vars),
        fromName: "Philip @ TEKKY",
        clientSlug: "zenith-sports",
      });
      sent += 1;
    } catch (err) {
      errors += 1;
      console.error(
        `[drill-of-week] send failed for ${l.email}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    weekNum,
    drillName: drill.name,
    sent,
    errors,
    recipientCount: recipients.length,
  });
}
