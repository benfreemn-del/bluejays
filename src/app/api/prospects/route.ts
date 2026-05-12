import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, filterProspects } from "@/lib/store";
import { currentUserFromCookies } from "@/lib/bluejays-auth";

/**
 * GET /api/prospects
 *
 * When the caller's `bj_role` cookie === "sales" AND `bj_user_id` is
 * present, the result is scoped to prospects assigned to that user
 * plus unassigned (claimable) prospects. Owner role sees everything.
 *
 * Optional `?assignedTo=USER_ID|unassigned|all` query param lets the
 * owner UI slice the same data per rep without setting them as sales.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const city = searchParams.get("city") || undefined;
  const assignedToParam = searchParams.get("assignedTo");

  let prospects =
    category || status || city
      ? await filterProspects({ category, status, city })
      : await getAllProspects();

  const role = request.cookies.get("bj_role")?.value;
  const user = await currentUserFromCookies(request.cookies);

  // Sales role: scope to mine + unassigned. (If the cookie is missing
  // — i.e. the user is on the legacy env-password Madie flow — leave
  // unscoped; we don't yet know who they are.)
  if (role === "sales" && user) {
    prospects = prospects.filter(
      (p) => !p.assignedToUserId || p.assignedToUserId === user.id,
    );
  }

  // Owner-side explicit slice via query param.
  if (assignedToParam && role !== "sales") {
    if (assignedToParam === "unassigned") {
      prospects = prospects.filter((p) => !p.assignedToUserId);
    } else if (assignedToParam !== "all") {
      prospects = prospects.filter((p) => p.assignedToUserId === assignedToParam);
    }
  }

  return NextResponse.json({ prospects, total: prospects.length });
}
