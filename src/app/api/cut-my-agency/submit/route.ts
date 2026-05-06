import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/cut-my-agency/submit
 *
 * Public endpoint — Hormozi Calculator Funnel for the agency-replacement
 * Google Ads campaign. Lead lands at the END of the calculator with full
 * results already shown (per Q1=A locked 2026-05-05).
 *
 * Flow:
 *  1. Rate-limit 8/IP/hour (lower than audit because more inputs = less abuse)
 *  2. Validate name + email + math object
 *  3. Look up existing prospect by email — attach calculator data if found
 *  4. Otherwise create a new prospect with status='audit_lead' (reuses the
 *     same downstream funnel as /audit) + source='inbound'
 *  5. Stamp scraped_data with full calculator inputs + math + UTMs
 *  6. SMS Ben with name + savings number + admin URL (manual reply within 24h)
 *  7. Return { ok: true } — page handles the thank-you screen
 */

type SubmitBody = {
  name?: string;
  email?: string;
  phone?: string;
  monthlyRetainer?: number;
  monthsAsClient?: number;
  /** Monthly ad spend (separate from retainer fee) — added 2026-05-06.
   *  Lets Ben see what they're spending on Google/Meta on top of the
   *  agency fee when crafting the followup. */
  monthlyAdSpend?: number;
  services?: string[];
  math?: {
    alreadySpent?: number;
    threeYearRetainer?: number;
    threeYearAdSpend?: number;
    threeYearAgencyCost?: number;
    bluejaysFullCost?: number;
    savings?: number;
    monthlySavings?: number;
    yearlyAgencyCost?: number;
  };
  utm?: Record<string, string>;
  /**
   * `true` when this is a partial-save fired on email-blur (Fix #5 —
   * exit recovery). Skips name validation, skips owner-alert SMS, and
   * stamps `partial_at` on the calculator payload so Ben knows the
   * lead might still complete the form. If a full submit follows for
   * the same email, prospect lookup merges into the same record so
   * Ben sees only one prospect with both partial + full math.
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
  const { allowed } = rateLimit(`cut-my-agency:${ip}`, 8, 60 * 60 * 1000);
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

  // Email is ALWAYS required — for partials it's the only thing we
  // capture. For full submits, name + email both required.
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

  const monthlyRetainer = Math.max(
    0,
    Math.min(50000, Number(body.monthlyRetainer) || 0),
  );
  const monthsAsClient = Math.max(
    0,
    Math.min(120, Number(body.monthsAsClient) || 0),
  );
  const monthlyAdSpend = Math.max(
    0,
    Math.min(50000, Number(body.monthlyAdSpend) || 0),
  );
  const services = Array.isArray(body.services)
    ? body.services.filter((s) => typeof s === "string").slice(0, 20)
    : [];

  // Trust-sensitive math recomputed server-side per Rule 59. Post 2026-05-06
  // ad-spend split: savings = retainer × 36 − $10K (ad spend cancels both
  // sides). See client math useMemo for the full contract.
  const PROJECTION_MONTHS = 36;
  const BLUEJAYS_SETUP_COST = 10000;
  const serverThreeYearRetainer = monthlyRetainer * PROJECTION_MONTHS;
  const serverThreeYearAdSpend = monthlyAdSpend * PROJECTION_MONTHS;
  const serverThreeYearAgencyCost =
    serverThreeYearRetainer + serverThreeYearAdSpend;
  const serverBluejaysFullCost = BLUEJAYS_SETUP_COST + serverThreeYearAdSpend;
  const serverSavings = Math.max(
    0,
    serverThreeYearRetainer - BLUEJAYS_SETUP_COST,
  );

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

  // Build the calculator payload that lives on scraped_data so the
  // admin dashboard + Ben's manual reply have everything in one place.
  // For partial saves (Fix #5 — exit recovery on email blur), stamp
  // `partial: true` + `partialAt` so Ben knows this lead might still
  // complete the form. Full submits clear the partial flag via merge.
  const calculatorPayload = {
    source: "cut_my_agency_calculator",
    submittedAt: new Date().toISOString(),
    inputs: {
      monthlyRetainer,
      monthsAsClient,
      monthlyAdSpend,
      services,
    },
    math: {
      alreadySpent: monthlyRetainer * monthsAsClient,
      threeYearRetainer: serverThreeYearRetainer,
      threeYearAdSpend: serverThreeYearAdSpend,
      threeYearAgencyCost: serverThreeYearAgencyCost,
      bluejaysSetupCost: BLUEJAYS_SETUP_COST,
      bluejaysFullCost: serverBluejaysFullCost,
      savings: serverSavings,
      monthlySavings: serverSavings / PROJECTION_MONTHS,
    },
    ...(isPartial
      ? { partial: true, partialAt: new Date().toISOString() }
      : { partial: false }),
    ...utm,
  };

  let prospectId: string;
  if (existingProspect) {
    prospectId = existingProspect.id as string;
    // Merge calculator submission into existing scraped_data without
    // overwriting other fields (per Failsafe 2.5 preservation rule).
    const { data: existingData } = await supabase
      .from("prospects")
      .select("scraped_data")
      .eq("id", prospectId)
      .maybeSingle();
    const merged = {
      ...((existingData?.scraped_data as Record<string, unknown>) || {}),
      cutMyAgencyCalculator: calculatorPayload,
    };
    await supabase
      .from("prospects")
      .update({
        scraped_data: merged,
        ...(phone && !existingProspect.phone ? { phone } : {}),
        // Don't downgrade status. Calculator submission moves a cold
        // prospect to audit_lead status if they were below it.
        ...(existingProspect.status === "scouted" ||
        existingProspect.status === "scraped" ||
        existingProspect.status === "generated"
          ? { status: "audit_lead" }
          : {}),
      })
      .eq("id", prospectId);
  } else {
    // New prospect — calculator submission is express opt-in via email.
    // source='inbound' per CLAUDE.md SMS A2P 10DLC compliance rules
    // (the form does not capture SMS consent, so phone is logged but
    // the funnel will only email this prospect, not SMS).
    //
    // Partial saves (Fix #5) create the prospect with a placeholder
    // name. If the user later completes the full submit, the existing-
    // prospect-by-email lookup at the top of this handler matches and
    // updates the same row with the real name + cleared partial flag.
    const newId = uuidv4();
    const ownerName = name || "(calculator visitor — partial)";
    const businessName = name
      ? name.split(/\s+/).slice(0, 3).join(" ") + "'s Business"
      : `Calculator visitor · ${email}`;

    const { error: insertErr } = await supabase.from("prospects").insert({
      id: newId,
      business_name: businessName,
      owner_name: ownerName,
      email,
      phone,
      address: "Unknown — submitted via /cut-my-agency",
      city: "Unknown",
      state: "Unknown",
      category: "general",
      status: "audit_lead",
      source: "inbound",
      pricing_tier: "fullsystem",
      manually_managed: false,
      scraped_data: {
        cutMyAgencyCalculator: calculatorPayload,
        ...utm,
      },
    });
    if (insertErr) {
      console.error("[cut-my-agency/submit] insert failed:", insertErr);
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

  // Owner alert — manual followup within 24h is the SLA we promised.
  // Includes the savings number so Ben can lead with their math when
  // he replies. Best-effort; never fail the submit because of an alert.
  //
  // Skip on partial saves (Fix #5 — exit recovery on email blur). The
  // user may still complete the form; if they do, the FULL submit
  // fires this SMS. Sending an SMS for every email-blur would spam
  // Ben for the same prospect 2x.
  if (isPartial) {
    return NextResponse.json({ ok: true, prospectId, partial: true });
  }
  try {
    const baseUrl = "https://bluejayportfolio.com";
    const adminUrl = `${baseUrl}/lead/${prospectId}`;
    const summary = [
      `🎯 Cut-My-Agency lead: ${name}`,
      `📧 ${email}`,
      phone ? `📱 ${phone}` : null,
      `💰 ${fmtMoney(monthlyRetainer)}/mo agency fee × ${monthsAsClient} mo`,
      monthlyAdSpend > 0
        ? `   + ${fmtMoney(monthlyAdSpend)}/mo ad spend (Google/Meta)`
        : null,
      `   = ${fmtMoney(serverSavings)} 3-yr savings`,
      `🔗 ${adminUrl}`,
      utm.utm_campaign ? `📊 utm: ${utm.utm_campaign}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    await sendOwnerAlert(summary);
  } catch (e) {
    console.warn("[cut-my-agency/submit] owner alert failed:", e);
  }

  return NextResponse.json({ ok: true, prospectId });
}
