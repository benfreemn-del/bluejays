import { NextRequest, NextResponse } from "next/server";
import { enrollInFunnel } from "@/lib/funnel-manager";

// POST: Enroll one or many prospects into the auto-funnel
// Body: { prospectIds: string[] }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectIds } = body as { prospectIds: string[] };

  if (!prospectIds || prospectIds.length === 0) {
    return NextResponse.json({ error: "prospectIds required" }, { status: 400 });
  }

  const results: { id: string; success: boolean; message: string }[] = [];

  for (const id of prospectIds) {
    const result = await enrollInFunnel(id);
    results.push({ id, ...result });
  }

  const succeeded = results.filter((r) => r.success).length;

  return NextResponse.json({
    message: `${succeeded}/${results.length} prospects enrolled in auto-funnel`,
    results,
  });
}
