import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "ben@bluejayportfolio.com";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectId, rating, feedback } = body as {
    prospectId: string;
    rating: number;
    feedback?: string;
  };

  if (!prospectId || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const reviewRecord = {
    id: uuidv4(),
    prospect_id: prospectId,
    business_name: prospect.businessName,
    rating,
    feedback: feedback || null,
    submitted_at: new Date().toISOString(),
  };

  // Save to Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("client_reviews").insert(reviewRecord);
    } catch {
      // Table may not exist yet — best effort
    }
  }

  // For negative reviews (1-4 stars), email the business owner
  if (rating < 5 && prospect.email && SENDGRID_API_KEY) {
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const emailBody = [
      `You received a ${rating}-star review for ${prospect.businessName}`,
      `Rating: ${stars}`,
      "",
      feedback ? `Customer feedback:\n"${feedback}"` : "No written feedback provided.",
      "",
      "This review was submitted privately through your review funnel and was NOT posted to Google.",
      "Use this as an opportunity to reach out and make it right.",
      "",
      `— BlueJays Review System`,
    ].join("\n");

    try {
      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: prospect.email }] }],
          from: { email: FROM_EMAIL, name: "BlueJays Reviews" },
          subject: `New ${rating}-star feedback for ${prospect.businessName}`,
          content: [{ type: "text/plain", value: emailBody }],
        }),
      });
    } catch {
      // Non-blocking — review is saved, email is best-effort
    }
  }

  return NextResponse.json({ success: true, rating });
}
