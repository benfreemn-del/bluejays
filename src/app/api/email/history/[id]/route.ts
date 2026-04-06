import { NextResponse } from "next/server";
import { getEmailHistory } from "@/lib/email-sender";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const emails = getEmailHistory(id);
  return NextResponse.json({ emails });
}
