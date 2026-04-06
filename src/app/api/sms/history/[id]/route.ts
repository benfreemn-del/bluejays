import { NextResponse } from "next/server";
import { getSmsHistory } from "@/lib/sms";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = await getSmsHistory(id);
  return NextResponse.json({ messages });
}
