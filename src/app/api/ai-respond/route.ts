import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { processIncomingEmail } from "@/lib/ai-responder";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectId, from, subject, emailBody } = body;

  if (!prospectId || !emailBody) {
    return NextResponse.json(
      { error: "prospectId and emailBody are required" },
      { status: 400 }
    );
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  const result = await processIncomingEmail(prospect, {
    from: from || prospect.email || "",
    subject: subject || "Re: Your new website",
    body: emailBody,
  });

  return NextResponse.json(result);
}
