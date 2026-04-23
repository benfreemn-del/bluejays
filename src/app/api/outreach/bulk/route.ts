import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { sendPitchEmail } from "@/lib/outreach";
import { sendSms, getSmsHistory, getInitialSms, getFollowUpSms1, getFollowUpSms2 } from "@/lib/sms";
import { getProspectVideoUrl } from "@/lib/video-generator";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectIds, channels } = body as {
    prospectIds: string[];
    channels: ("email" | "sms")[];
  };

  if (!prospectIds || prospectIds.length === 0) {
    return NextResponse.json({ error: "No prospects selected" }, { status: 400 });
  }

  const results: { id: string; name: string; email?: string; sms?: string; error?: string }[] = [];

  for (const id of prospectIds) {
    const prospect = await getProspect(id);
    if (!prospect) {
      results.push({ id, name: "Unknown", error: "Not found" });
      continue;
    }

    const result: { id: string; name: string; email?: string; sms?: string; error?: string } = {
      id,
      name: prospect.businessName,
    };

    // Send email
    if (channels.includes("email") && prospect.email && prospect.generatedSiteUrl) {
      try {
        await sendPitchEmail(prospect);
        result.email = "sent";
      } catch (err) {
        result.email = `failed: ${(err as Error).message}`;
      }
    }

    // Send SMS
    if (channels.includes("sms") && prospect.phone && prospect.generatedSiteUrl) {
      try {
        const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;
        const videoUrl = await getProspectVideoUrl(prospect.id);
        const history = await getSmsHistory(prospect.id);
        const lastSeq = history.length > 0 ? Math.max(...history.map((s) => s.sequence)) : 0;
        let smsBody: string;
        if (lastSeq === 0) smsBody = getInitialSms(prospect, previewUrl, videoUrl);
        else if (lastSeq === 1) smsBody = getFollowUpSms1(prospect, previewUrl, videoUrl);
        else if (lastSeq === 2) smsBody = getFollowUpSms2(prospect, previewUrl, videoUrl);
        else { result.sms = "all 3 sent already"; continue; }
        await sendSms(prospect.id, prospect.phone, smsBody, lastSeq + 1);
        result.sms = "sent";
      } catch (err) {
        result.sms = `failed: ${(err as Error).message}`;
      }
    }

    results.push(result);
  }

  return NextResponse.json({
    message: `Outreach sent to ${results.length} prospects`,
    results,
  });
}
