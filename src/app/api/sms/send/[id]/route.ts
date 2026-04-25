import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { sendSms, getSmsHistory, getInitialSms, getFollowUpSms1, getFollowUpSms2 } from "@/lib/sms";
import { getProspectVideoUrl } from "@/lib/video-generator";

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }
  if (!prospect.phone) {
    return NextResponse.json({ error: "No phone number for this prospect" }, { status: 400 });
  }
  if (!prospect.generatedSiteUrl) {
    return NextResponse.json({ error: "No preview site generated" }, { status: 400 });
  }

  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;
  const videoUrl = await getProspectVideoUrl(prospect.id);
  const history = await getSmsHistory(prospect.id);
  const lastSeq = history.length > 0 ? Math.max(...history.map((s) => s.sequence)) : 0;

  let body: string;
  if (lastSeq === 0) body = getInitialSms(prospect, previewUrl, videoUrl);
  else if (lastSeq === 1) body = getFollowUpSms1(prospect, previewUrl, videoUrl);
  else if (lastSeq === 2) body = getFollowUpSms2(prospect, previewUrl, videoUrl);
  else return NextResponse.json({ error: "All 3 SMS already sent" }, { status: 400 });

  const result = await sendSms(prospect.id, prospect.phone, body, lastSeq + 1);

  if (prospect.status !== "responded" && prospect.status !== "paid") {
    await updateProspect(prospect.id, { status: "contacted" });
  }

  return NextResponse.json({ message: `SMS sent to ${prospect.phone}`, sms: result });
}
