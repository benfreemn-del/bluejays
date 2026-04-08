import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { dropVoicemail } from "@/lib/voicemail";

/**
 * Drop a voicemail to a specific prospect.
 * POST /api/voicemail/drop/[id]
 */
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

  try {
    const result = await dropVoicemail(prospect.id, prospect.phone, prospect.businessName);
    return NextResponse.json({
      message: `Voicemail ${result.status} for ${prospect.businessName}`,
      drop: result,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
