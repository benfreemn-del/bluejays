import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProspect, updateProspect } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { alertOwner, sendOwnerAlert } from "@/lib/alerts";

const ONBOARDING_DIR = path.join(process.cwd(), "data", "onboarding");

/**
 * POST /api/onboarding/[id]
 *
 * Accepts both partial saves (Step 1 + Step 2) and final submission
 * (Step 3). The 3-step form posts after each "Save & Continue" so
 * resuming after a tab close just reloads the saved state.
 *
 * Request shape:
 *   {
 *     step: "step1" | "step2" | "step3" | undefined  (undefined = legacy
 *       full submit from old single-page form),
 *     ...whatever fields were on that step
 *   }
 *
 * Persistence:
 *   - Supabase `onboarding` table: form_data jsonb merges across steps
 *     so Step 2 doesn't wipe Step 1 data
 *   - form_data._onboardingStatus tracks "step1_complete" | "step2_complete"
 *     | "completed" so the form UI knows which step to resume on
 *
 * Status side-effects:
 *   - Step 1 complete: SMS Ben that essentials arrived (he can start working)
 *   - Step 3 / final: full owner alert + adminNotes update (existing behavior)
 *
 * Backwards compatibility: a body with no `step` field is treated as the
 * legacy full submit and behaves exactly as before.
 */
type OnboardingStatus = "step1_complete" | "step2_complete" | "completed";

interface OnboardingBody {
  step?: "step1" | "step2" | "step3";
  // Legacy/full submit fields below — all optional so step-by-step works
  [key: string]: unknown;
}

async function readExistingFormData(prospectId: string): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data, error } = await supabase
      .from("onboarding")
      .select("form_data")
      .eq("prospect_id", prospectId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return {};
    return ((data as { form_data?: Record<string, unknown> }).form_data || {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  const body = (await request.json()) as OnboardingBody;
  const step = body.step;
  const isFinalSubmit = !step || step === "step3";

  // Determine the new onboarding-status marker
  const newStatus: OnboardingStatus =
    step === "step1"
      ? "step1_complete"
      : step === "step2"
        ? "step2_complete"
        : "completed";

  // Merge with any existing form_data so step 2 doesn't wipe step 1
  const previous = await readExistingFormData(id);
  const previousStatus = previous._onboardingStatus as OnboardingStatus | undefined;

  const mergedFormData: Record<string, unknown> = {
    ...previous,
    businessName: prospect.businessName,
    ...body,
    // submittedAt is the LAST update timestamp
    submittedAt: new Date().toISOString(),
    // Don't downgrade status — if they're editing step 1 after completing step 2,
    // keep them at step2_complete. Only allow forward progression.
    _onboardingStatus: rankStatus(previousStatus) > rankStatus(newStatus) ? previousStatus : newStatus,
  };
  // Strip the `step` field from saved data — it's a control flag, not content
  delete mergedFormData.step;

  const onboardingData = {
    prospectId: id,
    businessName: prospect.businessName,
    submittedAt: mergedFormData.submittedAt,
    ...mergedFormData,
  };

  // Save to Supabase if configured (production).
  //
  // Schema reality check: the `onboarding` table was originally defined in
  // supabase-schema.sql with { id UUID PK, prospect_id UUID FK, form_data
  // JSONB, submitted_at TIMESTAMPTZ }. It does NOT have prospect_id as a
  // primary/unique key, so a plain upsert with onConflict:"prospect_id"
  // will fail. Delete-then-insert the prospect's existing row so repeat
  // submissions overwrite cleanly.
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("onboarding").delete().eq("prospect_id", id);
      const { error: insertErr } = await supabase.from("onboarding").insert({
        prospect_id: id,
        form_data: mergedFormData,
      });
      if (insertErr) {
        console.error("[Onboarding] Insert failed:", insertErr);
      }
    } catch (err) {
      console.error("[Onboarding] Supabase write failed:", err);
    }
  } else if (!process.env.VERCEL) {
    // Local development only — use filesystem
    if (!fs.existsSync(ONBOARDING_DIR)) {
      fs.mkdirSync(ONBOARDING_DIR, { recursive: true });
    }
    const filePath = path.join(ONBOARDING_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(onboardingData, null, 2));
  } else {
    console.log(`[Onboarding] Skipped file write on Vercel`);
  }

  // ── Step 1 partial save: light SMS so Ben knows essentials are in ────
  if (step === "step1") {
    const logoLine = mergedFormData.logoUrl ? "🎨 Logo uploaded" : "❌ No logo yet";
    const colorLine = mergedFormData.primaryColor
      ? `🎨 Primary: ${mergedFormData.primaryColor}`
      : "";
    const accentLine = mergedFormData.accentColor
      ? `🎨 Accent: ${mergedFormData.accentColor}`
      : "";
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
    const msg = [
      `🚀 ${prospect.businessName} finished onboarding step 1 — you can start!`,
      logoLine,
      colorLine,
      accentLine,
      `📋 ${BASE_URL}/lead/${id}`,
    ].filter(Boolean).join("\n");
    sendOwnerAlert(msg).catch(() => {});
    return NextResponse.json({
      message: "Step 1 saved",
      prospectId: id,
      status: mergedFormData._onboardingStatus,
    });
  }

  // ── Step 2 partial save: just persist, no SMS spam ────────────────────
  if (step === "step2") {
    return NextResponse.json({
      message: "Step 2 saved",
      prospectId: id,
      status: mergedFormData._onboardingStatus,
    });
  }

  // ── Step 3 / legacy full submit: full owner alert + adminNotes ────────
  if (isFinalSubmit) {
    // Persist structured fields in adminNotes for quick access during finalization
    const {
      logoUrl,
      brandColors,
      primaryColor,
      accentColor,
      photosNotes,
      tagline,
      changeRequests,
      specialRequests,
    } = mergedFormData as {
      logoUrl?: string;
      brandColors?: string;
      primaryColor?: string;
      accentColor?: string;
      photosNotes?: string;
      tagline?: string;
      changeRequests?: string;
      specialRequests?: string;
    };
    const colorLine = brandColors
      ? `Brand colors: ${brandColors}`
      : (primaryColor || accentColor)
        ? `Brand colors: primary=${primaryColor || "n/a"} accent=${accentColor || "n/a"}`
        : null;
    const noteLines = [
      logoUrl ? `Logo: ${logoUrl}` : null,
      colorLine,
      photosNotes ? `Photos/imagery: ${photosNotes}` : null,
      tagline ? `Tagline: "${tagline}"` : null,
      changeRequests
        ? `Change requests:\n${changeRequests}`
        : specialRequests
          ? `Special requests:\n${specialRequests}`
          : null,
    ].filter(Boolean).join("\n");

    if (noteLines) {
      const existing = prospect.adminNotes || "";
      const block = (existing ? "\n\n---\n" : "") + `Onboarding form (${new Date().toLocaleDateString()}):\n${noteLines}`;
      await updateProspect(id, {
        adminNotes: existing + block,
        adminNotesUpdatedAt: new Date().toISOString(),
      });
    }

    // Alert Ben via SMS
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
    const alertMsg = [
      `📋 ${prospect.businessName} submitted their onboarding form!`,
      logoUrl ? `🎨 Logo provided` : "❌ No logo",
      colorLine || "",
      tagline ? `💬 Tagline: "${String(tagline).substring(0, 60)}"` : "",
      changeRequests
        ? `📝 Requests: "${String(changeRequests).substring(0, 100)}"`
        : specialRequests
          ? `📝 Requests: "${String(specialRequests).substring(0, 100)}"`
          : "No specific requests",
      `📋 Dashboard: ${BASE_URL}/dashboard`,
    ].filter(Boolean).join("\n");
    await sendOwnerAlert(alertMsg).catch(() => {});

    // Only update status if the prospect has already paid via Stripe.
    // The Stripe webhook handles the paid transition; onboarding form
    // submission alone should not grant paid status.
    if (prospect.status === "paid" || prospect.paidAt) {
      // Already paid — no status change needed
    } else {
      // If they somehow reach onboarding without paying, mark as claimed
      await updateProspect(id, { status: "claimed" });
    }

    console.log(`  ✅ Onboarding form submitted for ${prospect.businessName}`);

    // Alert Ben — this is the signal to start the custom build. Non-critical
    // (alertOwner already swallows errors internally) so we don't await.
    const ownerLine = (mergedFormData.ownerName as string | undefined)
      ? `Submitted by: ${mergedFormData.ownerName}${(mergedFormData.ownerTitle as string | undefined) ? ` (${mergedFormData.ownerTitle})` : ""}`
      : "";
    const phoneLine = mergedFormData.phone ? `Phone: ${mergedFormData.phone}` : "";
    const emailLine = mergedFormData.email ? `Email: ${mergedFormData.email}` : "";
    const domainLine = (mergedFormData.domainPreference as string | undefined)
      ? `Domain: ${mergedFormData.domainPreference}`
      : (mergedFormData.currentDomain as string | undefined)
        ? `Domain: ${mergedFormData.currentDomain}`
        : "";
    const contactPref = mergedFormData.preferredContact ? `Prefers: ${mergedFormData.preferredContact}` : "";
    const details = [ownerLine, phoneLine, emailLine, domainLine, contactPref]
      .filter(Boolean)
      .join("\n");

    alertOwner({
      type: "custom-request",
      message: `${prospect.businessName} just submitted onboarding! Time to build.\n${details}\n\nOpen: https://bluejayportfolio.com/lead/${id}`,
      prospect,
      timestamp: new Date().toISOString(),
    }).catch((err) => {
      console.error(`[Onboarding] Failed to alert owner for ${id}:`, err);
    });
  }

  return NextResponse.json({
    message: "Onboarding data saved successfully",
    prospectId: id,
    status: mergedFormData._onboardingStatus,
  });
}

/** Compare onboarding-statuses for monotonic forward progression. */
function rankStatus(s: OnboardingStatus | undefined): number {
  if (s === "completed") return 3;
  if (s === "step2_complete") return 2;
  if (s === "step1_complete") return 1;
  return 0;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Read from Supabase if configured. The table stores everything inside
  // form_data (legacy schema) — businessName + submittedAt live there too.
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("onboarding")
        .select("*")
        .eq("prospect_id", id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        const formData = (data.form_data as Record<string, unknown>) || {};
        return NextResponse.json({
          prospectId: data.prospect_id,
          businessName:
            (formData.businessName as string | undefined) ||
            (data.business_name as string | undefined),
          submittedAt:
            (formData.submittedAt as string | undefined) ||
            (data.submitted_at as string | undefined),
          ...formData,
        });
      }
    } catch {
      // Table might not exist yet
    }
  }

  // Skip file reads on Vercel if no Supabase
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "No onboarding data found" },
      { status: 404 }
    );
  }

  const filePath = path.join(ONBOARDING_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "No onboarding data found" },
      { status: 404 }
    );
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json(data);
}
