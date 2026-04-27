import { NextRequest, NextResponse } from "next/server";
import { processQueuedReplies } from "@/lib/delayed-replies";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/replies/process
 * 
 * Cron-triggered endpoint to process the delayed AI reply queue.
 * This should be called every 1-2 minutes to ensure timely delivery.
 */
export async function GET(request: NextRequest) {
  // Check for cron secret if configured
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processQueuedReplies();
    await logHeartbeat("replies_process", { ...result });
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error("[Queue Process] Error:", err);
    return NextResponse.json({
      success: false,
      error: (err as Error).message
    }, { status: 500 });
  }
}

// Support POST as well for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
