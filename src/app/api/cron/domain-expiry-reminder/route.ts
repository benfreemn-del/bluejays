/**
 * GET /api/cron/domain-expiry-reminder
 *
 * Weekly (Mon 15:00 UTC). Finds every managed domain expiring within 60 days
 * (or already expired) and emails + SMSes Ben a single digest so nothing lapses
 * while he's heads-down on another business.
 *
 * This is the COMMAND-CENTER reminder — distinct from
 * /api/billing/check-domain-renewals, which is the prospect-funnel auto-renew /
 * Stripe-charge flow. This one only NOTIFIES Ben; it never charges or renews.
 *
 * Auth: gated by CRON_SECRET (Vercel Cron attaches the Bearer header). Public
 * in middleware by virtue of not being in PROTECTED_PATHS.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getManagedDomainsExpiringWithin,
  daysUntilExpiry,
  expiryBucket,
} from "@/lib/managed-domains";
import { sendOwnerEmail, sendOwnerAlert } from "@/lib/alerts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRON_SECRET = process.env.CRON_SECRET;
const WINDOW_DAYS = 60;

function fmtDate(iso: string | null): string {
  if (!iso) return "unknown";
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "unknown";
}

export async function GET(request: NextRequest) {
  if (CRON_SECRET) {
    const authz = request.headers.get("authorization") || "";
    if (authz !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  let due;
  try {
    due = await getManagedDomainsExpiringWithin(WINDOW_DAYS);
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }

  if (due.length === 0) {
    return NextResponse.json({ ok: true, due: 0, sent: false, message: "Nothing expiring within 60 days." });
  }

  // Soonest first (already ordered by the query, but be explicit).
  due.sort((a, b) => (a.expiresAt || "").localeCompare(b.expiresAt || ""));

  const lines = due.map((d) => {
    const days = daysUntilExpiry(d.expiresAt);
    const bucket = expiryBucket(d.expiresAt);
    const flag = bucket === "expired" ? "⛔ EXPIRED" : bucket === "red" ? "🔴" : "🟠";
    const when =
      days === null ? "unknown" : days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`;
    const managed = d.autoManaged ? "auto-renews (Namecheap)" : "manual renewal — YOU renew this";
    return `${flag} ${d.domain} — ${d.ownerLabel} · expires ${fmtDate(d.expiresAt)} (${when}) · ${managed}`;
  });

  const expiredCount = due.filter((d) => expiryBucket(d.expiresAt) === "expired").length;
  const redCount = due.filter((d) => expiryBucket(d.expiresAt) === "red").length;

  const subject =
    expiredCount > 0
      ? `⛔ ${expiredCount} domain(s) EXPIRED + ${due.length - expiredCount} expiring soon`
      : `🔔 ${due.length} domain(s) expiring within 60 days`;

  const body = [
    `Domain expiry watch — ${due.length} need attention (≤60 days):`,
    "",
    ...lines,
    "",
    "Manage them all → https://bluejayportfolio.com/dashboard/command",
    "",
    "Domains marked 'manual renewal' are NOT on our Namecheap auto-renew — renew those with the registrar before the date above.",
  ].join("\n");

  const emailOk = await sendOwnerEmail({ subject, body });

  // Short SMS nudge with the most-urgent line so Ben sees it on his phone.
  const smsHead = due
    .slice(0, 3)
    .map((d) => {
      const days = daysUntilExpiry(d.expiresAt);
      const when = days === null ? "?" : days < 0 ? "EXPIRED" : `${days}d`;
      return `${d.domain} (${when})`;
    })
    .join(", ");
  await sendOwnerAlert(
    `🔔 ${due.length} domain(s) expiring ≤60d: ${smsHead}${due.length > 3 ? " …" : ""}. See /dashboard/command`
  );

  return NextResponse.json({
    ok: true,
    due: due.length,
    expired: expiredCount,
    red: redCount,
    emailSent: emailOk,
    sent: true,
  });
}
