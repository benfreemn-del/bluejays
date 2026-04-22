import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProspect, updateProspect } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { alertOwner } from "@/lib/alerts";

const ONBOARDING_DIR = path.join(process.cwd(), "data", "onboarding");

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

  const body = await request.json();

  const onboardingData = {
    prospectId: id,
    businessName: prospect.businessName,
    submittedAt: new Date().toISOString(),
    ...body,
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
        form_data: {
          // Store businessName + submittedAt inside form_data so the
          // existing schema doesn't need new columns. The GET handler
          // below flattens these back out for the UI.
          businessName: prospect.businessName,
          submittedAt: onboardingData.submittedAt,
          ...body,
        },
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

  // Persist structured fields in adminNotes for quick access during finalization
  const { logoUrl, brandColors, photosNotes, tagline, changeRequests } = body as {
    logoUrl?: string; brandColors?: string; photosNotes?: string;
    tagline?: string; changeRequests?: string;
  };
  const noteLines = [
    logoUrl ? `Logo: ${logoUrl}` : null,
    brandColors ? `Brand colors: ${brandColors}` : null,
    photosNotes ? `Photos/imagery: ${photosNotes}` : null,
    tagline ? `Tagline: "${tagline}"` : null,
    changeRequests ? `Change requests:\n${changeRequests}` : null,
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
    brandColors ? `🎨 Colors: ${brandColors}` : "",
    tagline ? `💬 Tagline: "${tagline.substring(0, 60)}"` : "",
    changeRequests ? `📝 Requests: "${changeRequests.substring(0, 100)}"` : "No specific requests",
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
  const ownerLine = body?.ownerName
    ? `Submitted by: ${body.ownerName}${body?.ownerTitle ? ` (${body.ownerTitle})` : ""}`
    : "";
  const phoneLine = body?.phone ? `Phone: ${body.phone}` : "";
  const emailLine = body?.email ? `Email: ${body.email}` : "";
  const domainLine = body?.currentDomain ? `Domain: ${body.currentDomain}` : "";
  const contactPref = body?.preferredContact ? `Prefers: ${body.preferredContact}` : "";
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

  return NextResponse.json({
    message: "Onboarding data saved successfully",
    prospectId: id,
  });
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
