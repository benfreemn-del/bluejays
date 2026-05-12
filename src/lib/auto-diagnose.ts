import type { Prospect } from "./types";
import { diagnose } from "./hormozi-agent";
import { getSupabase } from "./supabase";

/**
 * auto-diagnose — fire a Hormozi diagnosis when a prospect first
 * lands on pipeline stage 2 (Meeting scheduled / Mockup done).
 *
 * Per the chat-7 audit follow-up #2: Madie should walk into the call
 * with a diagnosis already on file rather than typing notes during
 * the call. The PATCH /api/prospects/[id] route calls this whenever
 * pipelineStage transitions from non-2 → 2.
 *
 * Idempotent: bails if a recent (<24h) diagnosis already exists for
 * the prospect.
 *
 * Best-effort: catches its own errors and logs them; never throws to
 * the caller. The PATCH that triggered it has already returned.
 */
export async function maybeAutoDiagnose(prospect: Prospect): Promise<void> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.log(
        `[auto-diagnose] skipping ${prospect.id} — ANTHROPIC_API_KEY not set`,
      );
      return;
    }

    const sb = getSupabase();

    // Dedupe — skip if we already ran one in the last 24h.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await sb
      .from("hormozi_diagnostics")
      .select("id")
      .eq("prospect_id", prospect.id)
      .gte("created_at", yesterday)
      .limit(1);
    if (recent && recent.length > 0) {
      console.log(`[auto-diagnose] ${prospect.id} already diagnosed in last 24h, skip`);
      return;
    }

    // Build a structured input from what we know about the prospect.
    // The diagnostic agent works best with concrete numbers; we feed
    // whatever's on the prospect row and let the agent reason from
    // the gaps.
    const businessText = [
      `${prospect.businessName} is a ${prospect.category ?? "service business"} in ${prospect.city ?? "an unknown city"}, ${prospect.state ?? ""}.`,
      prospect.ownerName ? `Owner: ${prospect.ownerName}.` : null,
      prospect.email ? `Email: ${prospect.email}.` : null,
      prospect.phone ? `Phone: ${prospect.phone}.` : null,
      prospect.currentWebsite ? `Current website: ${prospect.currentWebsite}.` : null,
      `They just booked a discovery call with BlueJays — auto-diagnosed by the stage-2 trigger to give the rep a starting point. The rep will refine on the live call.`,
    ]
      .filter(Boolean)
      .join("\n");

    await diagnose({
      businessText,
      businessName: prospect.businessName,
      category: prospect.category ?? undefined,
      prospectId: prospect.id,
    });
    console.log(`[auto-diagnose] generated diagnosis for ${prospect.id}`);
  } catch (e) {
    console.error(`[auto-diagnose] failed for ${prospect.id}: ${(e as Error).message}`);
  }
}
