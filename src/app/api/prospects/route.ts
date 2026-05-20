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

  // Sales role requires an identified user. The legacy env-password
  // flow (ADMIN_PASSWORD_MADIE) sets bj_role=sales but no bj_user_id,
  // which previously fell through to returning the FULL prospect pool
  // — leaking every rep's + Ben's unscoped data. Fail closed so this
  // can't silently regress if the env var ever comes back.
  if (role === "sales" && !user) {
    return NextResponse.json(
      {
        prospects: [],
        total: 0,
        error:
          "log in with email + password — legacy password flow no longer supports prospect access",
      },
      { status: 403 },
    );
  }

  // Sales role: scope to mine + unassigned.
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
