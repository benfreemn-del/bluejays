import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProspect, updateProspect } from "@/lib/store";

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

  // Save onboarding data
  if (!fs.existsSync(ONBOARDING_DIR)) {
    fs.mkdirSync(ONBOARDING_DIR, { recursive: true });
  }

  const filePath = path.join(ONBOARDING_DIR, `${id}.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        prospectId: id,
        businessName: prospect.businessName,
        submittedAt: new Date().toISOString(),
        ...body,
      },
      null,
      2
    )
  );

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
