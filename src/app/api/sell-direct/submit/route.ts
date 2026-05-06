import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/sell-direct/submit
 *
 * Public endpoint — Hormozi Calculator Funnel for the manufacturer-DTC
 * Google Ads campaign (Action 3 of the 2026-05-05 $10k validation play).
 *
 * Twin to /api/cut-my-agency/submit. Different inputs, same shape:
 *   1. Rate-limit 8/IP/hour
 *   2. Validate name + email + math object
 *   3. Look up existing prospect by email — attach calculator data if found
 *   4. Otherwise create a new prospect with status='audit_lead' +
 *      source='inbound' + pricing_tier='fullsystem'
 *   5. Stamp scraped_data.sellDirectCalculator with full inputs + math + UTMs
 *   6. SMS Ben with name + recovered $ + admin URL
 *   7. Return { ok: true } — page handles the thank-you screen
 */

type SubmitBody = {
  name?: string;
  email?: string;
  phone?: string;
  productName?: string;
  avgPrice?: number;
  unitsPerMonth?: number;
  distributorMargin?: number; // percent (0-80)
  captureRatePct?: number;    // percent (10-70)
  math?: {
    monthlyDistributorRevenue?: number;
    monthlyMarginLost?: number;
    yearlyMarginLost?: number;
    threeYearMarginLost?: number;
    monthlyRecovered?: number;
    yearlyRecovered?: number;
    threeYearRecovered?: number;
    threeYearProfit?: number;
    paybackMonths?: number;
  };
  utm?: Record<string, string>;
  /**
   * `true` when this is a partial-save fired on email-blur (Fix #5 —
   * exit recovery). Skips name validation, skips owner-alert SMS, and
   * stamps `partial: true` on the calculator payload.
   */
  partial?: boolean;
};

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const e = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  if (/\.(webp|png|jpg|jpeg|svg|gif)$/.test(e)) return false;
  const host = e.split("@")[1];
  if (
    [
      "domain.com",
      "example.com",
      "test.com",
      "yoursite.com",
      "yourdomain.com",
    ].includes(host)
  )
    return false;
  return true;
}

function fmtMoney(n: number | undefined | null): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(v / 50) * 50);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`sell-direct:${ip}`, 8, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Try again in an hour." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Database temporarily unavailable. Email bluejaycontactme@gmail.com and Ben will reply directly.",
      },
      { status: 503 },
    );
  }

  let body: SubmitBody = {};
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const isPartial = body.partial === true;
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const phone = (body.phone || "").trim() || null;
  const productName = (body.productName || "").trim() || null;

  // Email always required. Name only required on full submits.
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 },
    );
  }
  if (!isPartial && name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Name is required." },
      { status: 400 },
    );
  }

  const avgPrice = Math.max(0, Math.min(50000, Number(body.avgPrice) || 0));
  const unitsPerMonth = Math.max(
    0,
    Math.min(200000, Number(body.unitsPerMonth) || 0),
  );
  const distributorMargin = Math.max(
    0,
    Math.min(95, Number(body.distributorMargin) || 0),
  );
  const captureRatePct = Math.max(
    0,
    Math.min(95, Number(body.captureRatePct) || 30),
  );

  // Recompute server-side per Rule 59 (client values can be tampered)
  const PROJECTION_MONTHS = 36;
  const BLUEJAYS_3YR_TOTAL = 10000 + 200 * PROJECTION_MONTHS;
  const marginPct = distributorMargin / 100;
  const capturePct = captureRatePct / 100;

  const monthlyDistributorRevenue = avgPrice * unitsPerMonth;
  const monthlyMarginLost = monthlyDistributorRevenue * marginPct;
  const monthlyRecovered = avgPrice * unitsPerMonth * capturePct * marginPct;
  const threeYearRecovered = monthlyRecovered * 36;
  const threeYearProfit = threeYearRecovered - BLUEJAYS_3YR_TOTAL;
  const paybackMonths =
    monthlyRecovered > 0
      ? BLUEJAYS_3YR_TOTAL / monthlyRecovered
      : null;

  const utm =
    body.utm && typeof body.utm === "object"
      ? Object.fromEntries(
          Object.entries(body.utm)
            .filter(
              ([k, v]) =>
                typeof k === "string" &&
                typeof v === "string" &&
                k.length < 32 &&
                v.length < 200,
            )
            .slice(0, 10),
        )
      : {};

  // Look up existing prospect by email
  const { data: existingProspect } = await supabase
    .from("prospects")
    .select("id, business_name, email, status, manually_managed, phone")
    .eq("email", email)
    .maybeSingle();

  // Calculator payload — single source of truth on the prospect record.
  // Partial saves (Fix #5) stamp `partial: true` so Ben knows the lead
  // might still complete the form. Full submits clear the flag via merge.
  const calculatorPayload = {
    source: "sell_direct_calculator",
    submittedAt: new Date().toISOString(),
    inputs: {
      avgPrice,
      unitsPerMonth,
      distributorMargin,
      captureRatePct,
      productName,
    },
    math: {
      monthlyDistributorRevenue,
      monthlyMarginLost,
      monthlyRecovered,
      threeYearRecovered,
      bluejaysThreeYearCost: BLUEJAYS_3YR_TOTAL,
      threeYearProfit,
      paybackMonths,
    },
    ...(isPartial
      ? { partial: true, partialAt: new Date().toISOString() }
      : { partial: false }),
    ...utm,
  };

  let prospectId: string;
  if (existingProspect) {
    prospectId = existingProspect.id as string;
    // Merge into existing scraped_data (Failsafe 2.5 preservation)
    const { data: existingData } = await supabase
      .from("prospects")
      .select("scraped_data")
      .eq("id", prospectId)
      .maybeSingle();
    const merged = {
      ...((existingData?.scraped_data as Record<string, unknown>) || {}),
      sellDirectCalculator: calculatorPayload,
    };
    await supabase
      .from("prospects")
      .update({
        scraped_data: merged,
        ...(phone && !existingProspect.phone ? { phone } : {}),
        ...(existingProspect.status === "scouted" ||
        existingProspect.status === "scraped" ||
        existingProspect.status === "generated"
          ? { status: "audit_lead" }
          : {}),
      })
      .eq("id", prospectId);
  } else {
    // New prospect — express opt-in via email + product info.
    // Partial saves (Fix #5) use placeholder name; full submit later
    // updates the same prospect via email lookup at the top.
    const newId = uuidv4();
    const ownerName = name || "(calculator visitor — partial)";
    const businessName = name
      ? productName
        ? `${name.split(/\s+/)[0]} (${productName})`
        : name.split(/\s+/).slice(0, 3).join(" ") + "'s Business"
      : `Calculator visitor · ${email}`;

    const { error: insertErr } = await supabase.from("prospects").insert({
      id: newId,
      business_name: businessName,
      owner_name: ownerName,
      email,
      phone,
      address: "Unknown — submitted via /sell-direct",
      city: "Unknown",
      state: "Unknown",
      // Generic category — manufacturer V2 templates aren't built yet
      // (tracked in docs/MANUFACTURER_BACKLOG.md). Promote to a specific
      // mfg-* slug once those templates ship.
      category: "general",
      status: "audit_lead",
      source: "inbound",
      pricing_tier: "fullsystem",
      manually_managed: false,
      scraped_data: {
        sellDirectCalculator: calculatorPayload,
        productName,
        ...utm,
      },
    });
    if (insertErr) {
      console.error("[sell-direct/submit] insert failed:", insertErr);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Couldn't save your record. Email bluejaycontactme@gmail.com and Ben will reply.",
        },
        { status: 500 },
      );
    }
    prospectId = newId;
  }

  // Owner alert SMS — skip on partial saves (Fix #5) to avoid 2x SMS
  // for the same prospect when they later complete the full form.
  if (isPartial) {
    return NextResponse.json({ ok: true, prospectId, partial: true });
  }
  try {
    const baseUrl = "https://bluejayportfolio.com";
    const adminUrl = `${baseUrl}/lead/${prospectId}`;
    const summary = [
      `🎯 Sell-Direct lead: ${name}`,
      productName ? `🏭 ${productName}` : null,
      `📧 ${email}`,
      phone ? `📱 ${phone}` : null,
      `💰 ${fmtMoney(avgPrice)}/unit × ${unitsPerMonth}/mo`,
      `   = ${fmtMoney(monthlyMarginLost)}/mo lost to distributor`,
      `🚀 ${fmtMoney(monthlyRecovered)}/mo recoverable @ ${captureRatePct}% capture`,
      paybackMonths
        ? `⏱ Payback: ~${Math.ceil(paybackMonths)} months`
        : null,
      `🔗 ${adminUrl}`,
      utm.utm_campaign ? `📊 utm: ${utm.utm_campaign}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    await sendOwnerAlert(summary);
  } catch (e) {
    console.warn("[sell-direct/submit] owner alert failed:", e);
  }

  return NextResponse.json({ ok: true, prospectId });
}
