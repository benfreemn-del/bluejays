import { NextRequest, NextResponse } from "next/server";

/**
 * AMD status callback — Twilio calls this with the result of
 * Answering Machine Detection.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const dropId = request.nextUrl.searchParams.get("dropId");
  const answeredBy = formData.get("AnsweredBy") as string;
  const callSid = formData.get("CallSid") as string;

  console.log(`  📞 AMD Result for drop ${dropId}: ${answeredBy} (call: ${callSid})`);

  // Log the result
  if (answeredBy === "human") {
    console.log(`  👤 Human answered — call was hung up (voicemail only)`);
  } else if (answeredBy === "machine_end_beep" || answeredBy === "machine_end_silence") {
    console.log(`  📬 Voicemail detected — message is being played`);
  } else {
    console.log(`  ❓ Unknown AMD result: ${answeredBy}`);
  }

  return NextResponse.json({ received: true });
}
