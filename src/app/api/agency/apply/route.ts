import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert, sendOwnerEmail } from "@/lib/alerts";

/**
 * POST /api/agency/apply
 *
 * Receives the 8-question application from /agency/apply,
 * stores it in agency_applications, runs auto-qualifying
 * logic, and routes the applicant to one of three responses:
 *
 *   - "qualified"  → return Calendly URL, status=qualified, alert Ben
 *   - "review"     → status=new, Ben reviews manually within 1 day
 *   - "declined"   → status=dnq, gentle redirect to $997 audit product
 *
 * The qualifying logic is intentionally lenient — we'd rather have
 * Ben review a borderline case than auto-decline someone who could
 * be a real customer. Hard auto-declines only fire on clear
 * disqualifiers (no budget, AVG <$500, sub-$3K monthly revenue).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Calendly link for the 30-min AI Marketing System strategy call. If
// Ben has a dedicated link, drop it in env. Falls back to the generic
// 30-min link.
const CALENDLY_URL =
  process.env.AGENCY_CALENDLY_URL ||
  process.env.GROWTH_ENGINE_CALENDLY_URL || // legacy fallback
  "https://calendly.com/benfreeman-bluejayportfolio/30min";

type ApplyBody = {
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  what_they_sell?: string;
  avg_customer_value_cents?: string | number;
  monthly_revenue_cents?: string | number;
  current_close_rate_per_month?: string | number;
  ideal_customer?: string;
  current_marketing?: string;
  budget_confirmed?: boolean;
  success_criteria?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_referrer?: string;
  /**
   * Wizard sends this true after Step 1 so the server records a draft
   * row (status='draft') we can email-recover from. Drafts skip
   * qualifying logic + skip alerting Ben (otherwise he'd get pinged
   * for every visitor who started a form).
   */
  _draft?: boolean;
};

// Convert a dollar-string from the form into integer cents for storage.
// Form sends "3500" meaning $3,500 → store 350000 cents.
function dollarsToCents(input: string | number | undefined): number | null {
  if (input === undefined || input === null || input === "") return null;
  const num = typeof input === "number" ? input : Number(String(input).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

function toInt(input: string | number | undefined): number | null {
  if (input === undefined || input === null || input === "") return null;
  const num = typeof input === "number" ? input : parseInt(String(input).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(num) ? num : null;
}

type Decision =
  | { kind: "qualified" }
  | { kind: "review"; flags: string[] }
  | { kind: "declined"; reason: string };

function qualify(args: {
  budget_confirmed: boolean;
  avg_customer_value_cents: number | null;
  monthly_revenue_cents: number | null;
  current_close_rate_per_month: number | null;
}): Decision {
  // Hard declines — these are kindness, not gatekeeping. The system
  // genuinely won't pay back at these levels.
  if (!args.budget_confirmed) {
    return {
      kind: "declined",
      reason:
        "$9,700 isn't liquid right now — totally fair. The system only pencils out when the budget is firm. Come back when it is.",
    };
  }
  if (
    args.avg_customer_value_cents !== null &&
    args.avg_customer_value_cents < 50000 // <$500 LTV
  ) {
    return {
      kind: "declined",
      reason:
        "Average customer value under $500 means cold outreach math doesn't work — you'd need 100+ closes just to break even. A higher-volume / lower-cost channel (SEO, ads, referrals) will serve you better.",
    };
  }
  if (
    args.monthly_revenue_cents !== null &&
    args.monthly_revenue_cents < 300000 // <$3K/mo
  ) {
    return {
      kind: "declined",
      reason:
        "Under $3K/mo in revenue suggests you're still finding product-market fit. Throwing $9,700 at a marketing system before the offer is dialed is how good money gets burned. Get the offer working at small scale first.",
    };
  }

  // Soft flags — submit for Ben's manual review rather than auto-qualify.
  const flags: string[] = [];
  if (args.avg_customer_value_cents !== null && args.avg_customer_value_cents < 100000) {
    flags.push("AVG between $500–$1,000 — borderline ROI math");
  }
  if (args.current_close_rate_per_month !== null && args.current_close_rate_per_month < 2) {
    flags.push("Closing fewer than 2 customers/mo currently — sales process maturity unclear");
  }
  if (
    args.monthly_revenue_cents !== null &&
    args.monthly_revenue_cents >= 300000 &&
    args.monthly_revenue_cents < 500000
  ) {
    flags.push("Revenue $3K–$5K/mo — small but workable");
  }

  if (flags.length > 0) {
    return { kind: "review", flags };
  }
  return { kind: "qualified" };
}

export async function POST(request: NextRequest) {
  let body: ApplyBody;
  try {
    body = (await request.json()) as ApplyBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // ─── Validate required fields ───────────────────────────────────
  const businessName = (body.business_name || "").trim();
  const contactName = (body.contact_name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  if (!businessName || !contactName || !email) {
    return NextResponse.json(
      { ok: false, error: "Business name, contact name, and email are all required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email doesn't look right — double-check it." },
      { status: 400 },
    );
  }

  // ─── Normalize numbers ──────────────────────────────────────────
  const avg_customer_value_cents = dollarsToCents(body.avg_customer_value_cents);
  const monthly_revenue_cents = dollarsToCents(body.monthly_revenue_cents);
  const current_close_rate_per_month = toInt(body.current_close_rate_per_month);

  // ─── Draft path ─────────────────────────────────────────────────
  // Wizard fires _draft=true after Step 1 so we can email-recover
  // applicants who abandon Step 2/3. Drafts skip qualifying + alerts.
  // If a draft row already exists (matched by email+business_name),
  // upsert in place so refreshing/restarting doesn't multiply rows.
  if (body._draft) {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, draft: true, applicationId: null });
    }
    try {
      const ipFromHeader =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "";
      const userAgent = request.headers.get("user-agent") || "";

      // Look for an existing draft for this email/business so we don't
      // create duplicates on each Step 1→2 transition.
      const { data: existing } = await supabase
        .from("agency_applications")
        .select("id")
        .eq("email", email)
        .eq("business_name", businessName)
        .eq("status", "draft")
        .order("applied_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const draftPayload = {
        business_name: businessName,
        contact_name: contactName,
        email,
        phone: (body.phone || "").trim() || null,
        website: (body.website || "").trim() || null,
        industry: (body.industry || "").trim() || null,
        what_they_sell: (body.what_they_sell || "").trim() || null,
        avg_customer_value_cents,
        monthly_revenue_cents,
        current_close_rate_per_month,
        ideal_customer: (body.ideal_customer || "").trim() || null,
        current_marketing: (body.current_marketing || "").trim() || null,
        budget_confirmed: !!body.budget_confirmed,
        success_criteria: (body.success_criteria || "").trim() || null,
        status: "draft",
        utm_source: (body.utm_source || "").trim() || null,
        utm_medium: (body.utm_medium || "").trim() || null,
        utm_campaign: (body.utm_campaign || "").trim() || null,
        utm_referrer: (body.utm_referrer || "").trim() || null,
        user_agent: userAgent || null,
        ip: ipFromHeader || null,
      };

      if (existing) {
        await supabase.from("agency_applications").update(draftPayload).eq("id", (existing as { id: string }).id);
        return NextResponse.json({ ok: true, draft: true, applicationId: (existing as { id: string }).id });
      } else {
        const { data: inserted } = await supabase
          .from("agency_applications")
          .insert(draftPayload)
          .select("id")
          .single();
        return NextResponse.json({
          ok: true,
          draft: true,
          applicationId: inserted ? (inserted as { id: string }).id : null,
        });
      }
    } catch (err) {
      console.error("[agency-apply] draft persist failed:", err);
      return NextResponse.json({ ok: true, draft: true, applicationId: null });
    }
  }

  // ─── Qualify ────────────────────────────────────────────────────
  const decision = qualify({
    budget_confirmed: !!body.budget_confirmed,
    avg_customer_value_cents,
    monthly_revenue_cents,
    current_close_rate_per_month,
  });

  const status =
    decision.kind === "qualified" ? "qualified" :
    decision.kind === "declined" ? "dnq" :
    "new";

  // ─── Persist (best-effort — don't block UX on DB) ───────────────
  let applicationId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const ipFromHeader =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "";
      const userAgent = request.headers.get("user-agent") || "";

      // If a draft row already exists for this email+business, promote
      // it to the real status instead of inserting a new row. Without
      // this, every wizard completion would create two rows (one draft
      // from Step 1, one real from Step 3 submit).
      const { data: existingDraft } = await supabase
        .from("agency_applications")
        .select("id")
        .eq("email", email)
        .eq("business_name", businessName)
        .eq("status", "draft")
        .order("applied_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const payload = {
          business_name: businessName,
          contact_name: contactName,
          email,
          phone: (body.phone || "").trim() || null,
          website: (body.website || "").trim() || null,
          industry: (body.industry || "").trim() || null,
          what_they_sell: (body.what_they_sell || "").trim() || null,
          avg_customer_value_cents,
          monthly_revenue_cents,
          current_close_rate_per_month,
          ideal_customer: (body.ideal_customer || "").trim() || null,
          current_marketing: (body.current_marketing || "").trim() || null,
          budget_confirmed: !!body.budget_confirmed,
          success_criteria: (body.success_criteria || "").trim() || null,
          status,
          // Schedule the first nurture email for declined applicants —
          // 24 hours out so they have a beat before the audit pitch
          // arrives. Migration 20260430_agency_nurture adds these
          // columns. If the column doesn't exist yet, Supabase ignores
          // unknown fields silently (verify by checking inserted row).
          ...(decision.kind === "declined"
            ? {
                nurture_step: 0,
                nurture_next_send_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              }
            : {}),
          utm_source: (body.utm_source || "").trim() || null,
          utm_medium: (body.utm_medium || "").trim() || null,
          utm_campaign: (body.utm_campaign || "").trim() || null,
          utm_referrer: (body.utm_referrer || "").trim() || null,
          user_agent: userAgent || null,
          ip: ipFromHeader || null,
        };

      const { data, error } = existingDraft
        ? await supabase
            .from("agency_applications")
            .update(payload)
            .eq("id", (existingDraft as { id: string }).id)
            .select("id")
            .single()
        : await supabase
            .from("agency_applications")
            .insert(payload)
            .select("id")
            .single();

      if (error) {
        console.error("[agency-apply] insert/update failed:", error);
      } else if (data) {
        applicationId = (data as { id: string }).id;
      }
    } catch (err) {
      console.error("[agency-apply] insert exception:", err);
    }
  }

  // ─── Alert Ben ──────────────────────────────────────────────────
  // Always fires, regardless of qualification outcome — Ben wants to
  // see every application that comes through, decline reasons included,
  // so he can spot patterns (e.g. lots of declines = funnel needs tightening).
  const decisionLabel =
    decision.kind === "qualified" ? "✅ AUTO-QUALIFIED" :
    decision.kind === "declined" ? "❌ AUTO-DECLINED" :
    "⏳ NEEDS REVIEW";
  const flagLines = decision.kind === "review" ? decision.flags.map((f) => `  • ${f}`).join("\n") : "";
  const declineLine = decision.kind === "declined" ? `Reason: ${decision.reason}` : "";

  const summaryLines = [
    `🚀 AI Marketing System application: ${decisionLabel}`,
    "",
    `Business: ${businessName}`,
    `Contact: ${contactName} <${email}>`,
    body.phone ? `Phone: ${body.phone}` : "",
    body.website ? `Website: ${body.website}` : "",
    `Industry: ${body.industry || "—"}`,
    "",
    `AVG customer: ${avg_customer_value_cents !== null ? `$${(avg_customer_value_cents / 100).toLocaleString()}` : "—"}`,
    `Monthly revenue: ${monthly_revenue_cents !== null ? `$${(monthly_revenue_cents / 100).toLocaleString()}` : "—"}`,
    `Closes/mo: ${current_close_rate_per_month ?? "—"}`,
    `Budget confirmed: ${body.budget_confirmed ? "yes" : "no"}`,
    "",
    body.ideal_customer ? `ICP: ${body.ideal_customer}` : "",
    body.current_marketing ? `Now doing: ${body.current_marketing}` : "",
    body.success_criteria ? `Day-90 win: ${body.success_criteria}` : "",
    "",
    flagLines ? `Review flags:\n${flagLines}` : "",
    declineLine,
    "",
    applicationId ? `App ID: ${applicationId}` : "",
  ].filter(Boolean);

  const fullMessage = summaryLines.join("\n");

  // SMS body — short, scannable. Email gets the full detail.
  const smsMessage =
    `🚀 Agency app: ${decisionLabel}\n${businessName} — ${contactName}\n` +
    `AVG $${avg_customer_value_cents !== null ? (avg_customer_value_cents / 100).toLocaleString() : "?"} ` +
    `· Rev $${monthly_revenue_cents !== null ? (monthly_revenue_cents / 100).toLocaleString() : "?"}/mo\n` +
    `${email}`;

  await Promise.allSettled([
    sendOwnerAlert(smsMessage).catch((err) =>
      console.error("[agency-apply] sendOwnerAlert failed:", err),
    ),
    sendOwnerEmail({
      subject: `${decisionLabel} — AI Marketing System application from ${businessName}`,
      body: fullMessage,
    }).catch((err) =>
      console.error("[agency-apply] sendOwnerEmail failed:", err),
    ),
  ]);

  // ─── Respond ────────────────────────────────────────────────────
  if (decision.kind === "qualified") {
    return NextResponse.json({
      ok: true,
      decision: "qualified",
      calendlyUrl: CALENDLY_URL,
      applicationId,
    });
  }
  if (decision.kind === "declined") {
    return NextResponse.json({
      ok: true,
      decision: "declined",
      reason: decision.reason,
      applicationId,
    });
  }
  return NextResponse.json({
    ok: true,
    decision: "review",
    applicationId,
  });
}
