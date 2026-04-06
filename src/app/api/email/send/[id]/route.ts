import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { sendPitchEmail } from "@/lib/outreach";

export async function POST(
  _request: Request,
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

  try {
    const result = await sendPitchEmail(prospect);
    return NextResponse.json({
      message: `Email sent to ${prospect.email}`,
      email: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
