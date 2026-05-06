import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyReport } from "@/lib/client-reports";
import { sendOwnerEmail, sendEmailTo } from "@/lib/alerts";
import { listOwnersWithPrefsForClient } from "@/lib/client-owner-preferences";

/**
 * GET  /api/client-reports?client=zenith-sports
 *      Generate the live weekly report. Renders in the dashboard.
 *
 * POST /api/client-reports?client=zenith-sports[&email=1]
 *      Same data, optionally emails to Ben (and the client_lead "owner"
 *      address for that slug). Used by the weekly cron.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  const cookie = req.cookies.get("bluejays-session")?.value;
  if (cookie) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  try {
    const report = await generateWeeklyReport(client);
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  try {
    const report = await generateWeeklyReport(client);
    if (searchParams.get("email") === "1") {
      const subject = `📊 ${client} weekly report — ${report.leads.new_this_week} new leads`;
      const lines = [
        `${client} — week ending ${new Date(report.period.end).toDateString()}`,
        "",
        `LEADS`,
        `  Total: ${report.leads.total}`,
        `  New this week: ${report.leads.new_this_week} (Δ ${report.leads.delta_vs_prior_week >= 0 ? "+" : ""}${report.leads.delta_vs_prior_week})`,
        `  By audience: ${Object.entries(report.leads.byAudience).map(([k, v]) => `${k}=${v}`).join(", ")}`,
        "",
        `FUNNEL`,
        `  Enrolled: ${report.funnel.enrolled}`,
        `  Responded: ${report.funnel.responded} (${report.funnel.response_rate_pct.toFixed(1)}%)`,
        `  Converted: ${report.funnel.converted} (${report.funnel.conversion_rate_pct.toFixed(1)}%)`,
        `  Completed cadence: ${report.funnel.completed}`,
        "",
        `MESSAGES (this week)`,
        `  Sent: ${report.messages.sent} | Failed: ${report.messages.failed} | Skipped: ${report.messages.skipped}`,
        `  By channel: ${Object.entries(report.messages.by_channel).map(([k, v]) => `${k}=${v}`).join(", ") || "—"}`,
        "",
      ];
      // Money block — only included when there's something to say.
      // Lifetime revenue + costs + net + ROI%, plus this-week revenue.
      if (
        report.money.revenue_cents_total > 0 ||
        report.money.cost_cents_total > 0
      ) {
        const m = report.money;
        const fmt = (c: number) => `$${(c / 100).toLocaleString()}`;
        lines.push(
          `MONEY`,
          `  Revenue this week: ${fmt(m.revenue_cents_this_week)}`,
          `  Revenue lifetime: ${fmt(m.revenue_cents_total)} | Cost: ${fmt(m.cost_cents_total)}`,
          `  Net: ${m.net_cents >= 0 ? "" : "-"}${fmt(Math.abs(m.net_cents))}${
            m.roi_pct !== null
              ? ` (ROI ${m.roi_pct >= 0 ? "+" : ""}${m.roi_pct.toFixed(0)}%)`
              : ""
          }`,
          "",
        );
      }
      // Drill of the Week reminder for zenith-sports
      if (report.drill_of_week) {
        lines.push(
          `DRILL OF THE WEEK (W${report.drill_of_week.week_num})`,
          `  ${report.drill_of_week.name} · ${report.drill_of_week.tier}`,
          "",
        );
      }
      if (report.ads) {
        lines.push(
          `ADS`,
          `  Live: ${report.ads.live} | Draft: ${report.ads.draft}`,
          `  Impressions: ${report.ads.impressions.toLocaleString()} | Clicks: ${report.ads.clicks.toLocaleString()} | CTR: ${report.ads.ctr_pct.toFixed(2)}%`,
          `  Spend: $${(report.ads.spend_cents / 100).toFixed(2)}`,
          "",
        );
      }
      if (report.affiliates) {
        lines.push(
          `AFFILIATES`,
          `  Total: ${report.affiliates.total}`,
          `  Contacted this week: ${report.affiliates.contacted_this_week}`,
          `  Onboarded this week: ${report.affiliates.onboarded_this_week}`,
          "",
        );
      }
      if (report.highlights.length > 0) {
        lines.push(`HIGHLIGHTS`);
        for (const h of report.highlights) lines.push(`  • ${h}`);
        lines.push("");
      }
      if (report.next_actions.length > 0) {
        lines.push(`SUGGESTED NEXT ACTIONS`);
        for (const a of report.next_actions) lines.push(`  → ${a}`);
        lines.push("");
      }
      lines.push(
        `View live: https://bluejayportfolio.com/dashboard/clients/${client}/reports`,
      );
      const body = lines.join("\n");
      // Always copy Ben (the owner-of-the-platform) on every digest.
      await sendOwnerEmail({ subject, body, clientSlug: client });

      // Also fan out to client owners who opted into digest emails.
      // Per-client owners (Philip, etc.) are tracked in client_owners +
      // their notification prefs default to instant for new-lead, but we
      // use the same opt-in surface for the weekly digest. Anyone whose
      // new_lead_email is NOT 'off' gets the weekly roll-up too.
      try {
        const owners = await listOwnersWithPrefsForClient(client);
        for (const o of owners) {
          if (o.prefs.new_lead_email === "off") continue;
          try {
            await sendEmailTo({
              to: o.email,
              subject,
              body,
              fromName: `${client} weekly digest`,
              clientSlug: client,
            });
          } catch (err) {
            console.error(
              `[client-reports] digest send failed for ${o.email}:`,
              err,
            );
          }
        }
      } catch (err) {
        console.error("[client-reports] owner fan-out failed:", err);
      }
    }
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
