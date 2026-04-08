import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * AMD status callback — Twilio calls this with the result of
 * Answering Machine Detection.
 *
 * Updates the voicemail_drops table in Supabase with the actual
 * delivery status based on AMD result.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const dropId = request.nextUrl.searchParams.get("dropId");
  const answeredBy = formData.get("AnsweredBy") as string;
  const callSid = formData.get("CallSid") as string;

  console.log(`  📞 AMD Result for drop ${dropId}: ${answeredBy} (call: ${callSid})`);

  // Determine the status to persist based on AMD result
  let newStatus: string;
  if (answeredBy === "human") {
    console.log(`  👤 Human answered — call was hung up (voicemail only)`);
    newStatus = "human-answered";
  } else if (answeredBy === "machine_end_beep" || answeredBy === "machine_end_silence") {
    console.log(`  📬 Voicemail detected — message is being played`);
    newStatus = "delivered";
  } else {
    console.log(`  ❓ Unknown AMD result: ${answeredBy}`);
    newStatus = "failed";
  }

  // Update the voicemail drop status in Supabase
  if (dropId && isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("voicemail_drops")
        .update({
          status: newStatus,
          amd_result: answeredBy,
          call_sid: callSid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dropId);

      if (error) {
        console.error(`  ❌ Failed to update voicemail drop ${dropId} in Supabase:`, error.message);
      } else {
        console.log(`  ✅ Voicemail drop ${dropId} status updated to: ${newStatus}`);
      }
    } catch (err) {
      console.error(`  ❌ Supabase update error for voicemail drop ${dropId}:`, (err as Error).message);
    }
  } else if (!isSupabaseConfigured()) {
    console.log(`  ⚠️ Supabase not configured — voicemail status not persisted`);
  }

  return NextResponse.json({ received: true, status: newStatus });
}
