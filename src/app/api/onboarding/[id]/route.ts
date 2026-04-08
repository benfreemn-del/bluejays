import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProspect, updateProspect } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

  // Save to Supabase if configured (production)
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("onboarding").upsert({
        prospect_id: id,
        business_name: prospect.businessName,
        submitted_at: onboardingData.submittedAt,
        data: body,
      }, { onConflict: "prospect_id" });
    } catch {
      // Table might not exist yet
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

  // Update prospect status to paid
  await updateProspect(id, { status: "paid" });

  console.log(`  ✅ Onboarding form submitted for ${prospect.businessName}`);

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

  // Read from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("onboarding")
        .select("*")
        .eq("prospect_id", id)
        .single();
      if (!error && data) {
        return NextResponse.json({
          prospectId: data.prospect_id,
          businessName: data.business_name,
          submittedAt: data.submitted_at,
          ...(data.data as object),
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
