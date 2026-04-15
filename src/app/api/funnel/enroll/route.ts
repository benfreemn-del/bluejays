import { NextRequest, NextResponse } from "next/server";
import { enrollInFunnel } from "@/lib/funnel-manager";

// POST: Enroll one or many prospects into the auto-funnel
// Body: { prospectIds: string[] }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectIds, emailOnly } = body as { prospectIds: string[]; emailOnly?: boolean };

  if (!prospectIds || prospectIds.length === 0) {
    return NextResponse.json({ error: "prospectIds required" }, { status: 400 });
  }

  const results: { id: string; success: boolean; message: string }[] = [];

  for (const id of prospectIds) {
    // Tag as email-only if SMS isn't available yet
    if (emailOnly) {
      const { updateProspect } = await import("@/lib/store");
      await updateProspect(id, { outreachChannel: "email-only", needsSmsFollowup: true } as Partial<import("@/lib/types").Prospect>);
    }
    const result = await enrollInFunnel(id);
    results.push({ id, ...result });
  }

  const succeeded = results.filter((r) => r.success).length;

  return NextResponse.json({
    message: `${succeeded}/${results.length} prospects enrolled in auto-funnel`,
    results,
  });
}
