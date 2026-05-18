/**
 * GET /api/touches/overdue
 *
 * Returns leads whose `next_touch_at` has passed and no newer touch
 * exists. Powers the <NextTouchBadge /> red flag + /dashboard/queue
 * "what's overdue" view.
 *
 * Operator-only — protected by middleware.
 */

import { NextResponse } from "next/server";
import { overdueNextTouches } from "@/lib/prospect-touches";

export async function GET() {
  const touches = await overdueNextTouches();
  return NextResponse.json({ ok: true, touches });
}
