import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";
import { sendEmail } from "@/lib/email-sender";
import { getCutMyAgencyPlanEmail } from "@/lib/email-templates";
import { deriveSourceChannel } from "@/lib/source-attribution";

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
  /** Lead-gate visual answers (added 2026-05-06 per Q3A + Q4A + Q4B):
   *  - industry: free-form whitelisted slug from the industry tile grid
   *  - timeline: this_month / 60_90_days / just_looking
   *  - goal: more_leads / lower_cost / better_tracking / own_system
   *  Persisted to top-level prospects.cma_industry/cma_timeline/cma_goal
   *  columns for dashboard filtering AND into scrapedData JSON for raw. */
  industry?: string;
  timeline?: string;
  goal?: string;
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
  // capture. For full submits, name + email + phone all required
  // (per Q2A 2026-05-06 — phone for callback only, no SMS without
  // explicit consent).
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
  if (!isPartial && (!phone || phone.length < 7)) {
    return NextResponse.json(
      { ok: false, error: "Phone is required so Ben can call you back." },
      { status: 400 },
    );
  }

  // Lead-gate visual answers — whitelist enforce so a malformed payload
  // doesn't pollute downstream dashboard filters or auto-email
  // personalization. New variant slugs land here when the calculator UI
  // adds them, NOT in the DB column type (text + partial index).
  const ALLOWED_INDUSTRIES = new Set([
    "manufacturer",
    "industrial",
    "construction",
    "trade",
    "auto",
    "agriculture",
    "hvac",
    "electrician",
    "plumber",
    "roofing",
    "sports",
    "consumer",
    "retail",
    "ecommerce",
    "apparel",
    "kids",
    "fitness",
    "food",
    "beverage",
    "beauty",
    "salon",
    "service",
    "professional",
    "medical",
    "legal",
    "real_estate",
    "restaurant",
    "other",
  ]);
  const ALLOWED_TIMELINES = new Set([
    "this_month",
    "60_90_days",
    "just_looking",
  ]);
  const ALLOWED_GOALS = new Set([
    "more_leads",
    "lower_cost",
    "better_tracking",
    "own_system",
  ]);
  const cleanSlug = (s: string | undefined, allow: Set<string>) => {
    const v = (s || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    return v && allow.has(v) ? v : null;
  };
  const industry = cleanSlug(body.industry, ALLOWED_INDUSTRIES);
  const timeline = cleanSlug(body.timeline, ALLOWED_TIMELINES);
  const goal = cleanSlug(body.goal, ALLOWED_GOALS);

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
    // Lead-gate raw (denormalized into top-level columns below for
    // dashboard filtering — kept in JSON too for redundancy + so older
    // routes that read scraped_data still see the answers).
    gate: {
      industry,
      timeline,
      goal,
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
        // Lead-gate top-level columns — only write if the new submit
        // supplied an answer (don't blank existing values on partial-2
        // re-submits).
        ...(industry ? { cma_industry: industry } : {}),
        ...(timeline ? { cma_timeline: timeline } : {}),
        ...(goal ? { cma_goal: goal } : {}),
        // Calculator leads = Ben handles personally (Q8C 2026-05-06).
        // Flip manually_managed so the auto-enroll cron + cold-email
        // funnel skip them. If they were already manually-managed,
        // this is a no-op.
        ...(!isPartial ? { manually_managed: true } : {}),
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

    // Source-channel attribution. The /cut-my-agency calculator is the
    // /agency-replacement Google Ads landing page, so 'agency-replacement-ad'
    // when UTM matches, 'cma-calculator' for direct (organic + bookmarked)
    // visits. Lets the sales-pipeline filter group calculator deals
    // distinctly from generic inbound.
    const sourceChannel = deriveSourceChannel({
      explicit: (body as { sourceChannel?: string }).sourceChannel,
      searchParams: body.utm
        ? new URLSearchParams(body.utm as Record<string, string>)
        : null,
      originPath: "/cut-my-agency",
    });

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
      source_channel: sourceChannel,
      source_channel_set_at: new Date().toISOString(),
      pricing_tier: "fullsystem",
      // Calculator leads = Ben handles personally (Q8C 2026-05-06 +
      // Rule 49). Flipped to true on full submits so the auto-enroll
      // cron skips this row. Partial saves stay false until the full
      // submit follow-up flips it (lookup-by-email merge above).
      manually_managed: !isPartial,
      cma_industry: industry,
      cma_timeline: timeline,
      cma_goal: goal,
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

  // INSTANT AUTO-EMAIL (Q9C 2026-05-06) — fires the moment the full
  // submit lands. Deterministic plan summary built from the prospect's
  // own answers. Per Rule 59 (no AI for trust-sensitive output), every
  // line interpolated from the math + gate values directly.
  //
  // Best-effort: catch + log on failure, NEVER surface the error to the
  // prospect. The next-step is "Ben emails personally within 24h" so
  // even if this fails the SLA is still met. Marked `transactional:
  // true` so the warming-cap doesn't reject the send (the prospect
  // explicitly requested a plan via form submit).
  try {
    const tmpl = getCutMyAgencyPlanEmail({
      name,
      email,
      prospectId,
      monthlyRetainer,
      monthsAsClient,
      monthlyAdSpend,
      savings: serverSavings,
      monthlySavings: serverSavings / PROJECTION_MONTHS,
      threeYearAgencyCost: serverThreeYearAgencyCost,
      industry: industry || undefined,
      timeline: timeline || undefined,
      goal: goal || undefined,
    });
    await sendEmail(
      prospectId,
      email,
      tmpl.subject,
      tmpl.body,
      tmpl.sequence,
      undefined,
      { transactional: true },
    );
  } catch (e) {
    console.warn("[cut-my-agency/submit] auto-email failed:", e);
  }

  // OWNER SMS — extended with the lead-gate answers so Ben can lead his
  // 24h personal reply with the right hook (urgent → call now, just-
  // looking → soft email primer). Best-effort.
  try {
    const baseUrl = "https://bluejayportfolio.com";
    const adminUrl = `${baseUrl}/lead/${prospectId}`;
    const urgencyEmoji =
      timeline === "this_month"
        ? "🚨 URGENT"
        : timeline === "60_90_days"
          ? "⏳ 60-90 days"
          : timeline === "just_looking"
            ? "👀 Researching"
            : null;
    const goalLabel =
      goal === "more_leads"
        ? "more leads"
        : goal === "lower_cost"
          ? "lower cost"
          : goal === "better_tracking"
            ? "better tracking"
            : goal === "own_system"
              ? "own the system"
              : null;
    const summary = [
      `🎯 Cut-My-Agency lead: ${name}`,
      `📧 ${email}`,
      phone ? `📱 ${phone}` : null,
      industry ? `🏷 ${industry}` : null,
      urgencyEmoji,
      goalLabel ? `🎯 goal: ${goalLabel}` : null,
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
