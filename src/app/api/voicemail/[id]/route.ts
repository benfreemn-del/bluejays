import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const VOICEMAIL_DIR = path.join(process.cwd(), "data", "voicemails");

// POST: Queue a voicemail drop for a prospect
// In production, this would integrate with a ringless voicemail API
// (like Drop Cowboy, Slybroadcast, or Stratics Networks)
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
    return NextResponse.json({ error: "No phone number" }, { status: 400 });
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;
  const name = prospect.ownerName?.split(" ")[0] || "there";

  // Voicemail script
  const script = `Hey ${name}, this is BlueJays. I came across ${prospect.businessName} and was really impressed. I actually went ahead and built you a brand new website — completely free. Check it out at ${previewUrl}. If you love it, just give us a call back. Have a great day!`;

  // Log the voicemail (mock for now)
  if (!fs.existsSync(VOICEMAIL_DIR)) fs.mkdirSync(VOICEMAIL_DIR, { recursive: true });
  const filePath = path.join(VOICEMAIL_DIR, `${id}.json`);
  let vms: object[] = [];
  if (fs.existsSync(filePath)) vms = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  vms.push({
    id: uuidv4(),
    to: prospect.phone,
    script,
    status: "queued",
    createdAt: new Date().toISOString(),
  });
  fs.writeFileSync(filePath, JSON.stringify(vms, null, 2));

  await updateProspect(id, { status: "contacted" });

  console.log(`  📞 [MOCK] Voicemail queued for ${prospect.businessName}: ${prospect.phone}`);

  return NextResponse.json({
    message: `Voicemail queued for ${prospect.businessName}`,
    script,
    phone: prospect.phone,
  });
}
