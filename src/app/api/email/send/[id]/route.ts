import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProspect } from "@/lib/store";
import { sendPitchEmail } from "@/lib/outreach";
import { logTouch } from "@/lib/prospect-touches";

/**
 * POST /api/email/send/[id]
 *
 * Fires the next pitch email in the prospect's sequence. Detects the
 * caller via `bj_role` cookie so Madie's sends:
 *   - Go FROM madie@bluejayportfolio.com (senderOverride in outreach.ts
 *     when the sales flag is set — added 2026-05-29)
 *   - Get logged to prospect_touches as a 'madie' touch so the drawer +
 *     workspace timeline reflect her send
 *
 * Ben's sends use the default rotation sender + ben attribution.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 },
    );
  }

  // Caller identity — drives both the From-line override and the
  // by_user attribution on the touch log.
  const cookieStore = await cookies();
  const role = cookieStore.get("bj_role")?.value;
  const byUser = role === "sales" ? "madie" : "ben";

  try {
    const result = await sendPitchEmail(prospect, {
      sender: role === "sales" ? "madie" : undefined,
    });

    void logTouch({
      prospectId: prospect.id,
      kind: "email",
      direction: "outbound",
      by_user: byUser,
      notes: `Pitch email sent (${result.subject || "sequence email"})`,
    }).catch((err) =>
      console.error("[email-send] touch log failed:", err),
    );

    return NextResponse.json({
      message: `Email sent to ${prospect.email}`,
      email: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
