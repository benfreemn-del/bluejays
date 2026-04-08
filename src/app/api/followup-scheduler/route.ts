import { NextRequest, NextResponse } from "next/server";
import {
  getSchedulerStatus,
  runAutoResumeCheck,
  saveConfig,
  loadConfig,
  setProspectDelay,
} from "@/lib/followup-scheduler";

/**
 * GET /api/followup-scheduler
 *
 * Returns the current scheduler status including:
 * - Configuration (delay, enabled, max resumes)
 * - All tracked prospects waiting for re-engagement
 * - Stats (waiting, resumed, replied, due for resume)
 */
export async function GET() {
  try {
    const status = getSchedulerStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("[Follow-Up Scheduler] Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * POST /api/followup-scheduler
 *
 * Actions:
 * - { action: "run" }                    — Run the auto-resume check now
 * - { action: "update-config", config }   — Update scheduler configuration
 * - { action: "set-delay", prospectId, delayHours } — Set custom delay for a prospect
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "run": {
        const result = await runAutoResumeCheck();
        return NextResponse.json({
          message: `Checked ${result.checked} prospects. Resumed ${result.resumed.length}, still waiting ${result.stillWaiting}.`,
          ...result,
        });
      }

      case "update-config": {
        const { config } = body;
        if (!config) {
          return NextResponse.json({ error: "config is required" }, { status: 400 });
        }
        const updated = saveConfig(config);
        return NextResponse.json({ message: "Config updated", config: updated });
      }

      case "set-delay": {
        const { prospectId, delayHours } = body;
        if (!prospectId) {
          return NextResponse.json({ error: "prospectId is required" }, { status: 400 });
        }
        const success = setProspectDelay(prospectId, delayHours ?? null);
        if (!success) {
          return NextResponse.json({ error: "No active tracker found for this prospect" }, { status: 404 });
        }
        return NextResponse.json({ message: "Delay updated", prospectId, delayHours });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Follow-Up Scheduler] Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
