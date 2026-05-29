import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, filterProspects } from "@/lib/store";
import { currentUserFromCookies } from "@/lib/bluejays-auth";
import { touchCountsByProspect } from "@/lib/prospect-touches";
import { DEAD_STATUSES } from "@/lib/lead-origin";

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
  // Madie's LeadPicker hides status='nurturing' by default to keep the
  // dialing queue tight. Pass ?includeNurturing=1 (or set status filter
  // explicitly to 'nurturing') to reveal them via the "Show nurturing"
  // filter chip.
  const includeNurturing =
    searchParams.get("includeNurturing") === "1" || status === "nurturing";

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

  // Sales role: drop dead-for-sales statuses (dismissed / unsubscribed
  // / do_not_call / audit_marketing). Defense-in-depth — the LeadPicker
  // also filters these client-side, but enforcing at the API layer means
  // no surface (drawer, checklist, scout suggestions, future mobile)
  // can ever accidentally pitch a killed lead. Owner role still sees
  // them so Ben can manage the graveyard.
  if (role === "sales") {
    prospects = prospects.filter(
      (p) => !p.status || !DEAD_STATUSES.has(String(p.status).toLowerCase()),
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

  // Default-hide nurturing prospects so Madie's LeadPicker stays focused.
  // Skipped when the caller explicitly opted in via ?includeNurturing=1
  // OR when they filtered status='nurturing' directly.
  // NOTE: status='following_up' is NOT hidden — those are actively-pursued
  // leads that must stay visible (they surface under the Following Up chip).
  if (!includeNurturing) {
    prospects = prospects.filter((p) => p.status !== "nurturing");
  }

  // Enrich each prospect with its outreach-touch count for the "N/3"
  // cadence badge. One grouped read; best-effort (never blocks the list).
  try {
    const counts = await touchCountsByProspect();
    prospects = prospects.map((p) => ({ ...p, touchCount: counts[p.id] || 0 }));
  } catch (err) {
    console.error("[/api/prospects] touch-count enrich failed:", err);
  }

  return NextResponse.json({ prospects, total: prospects.length });
}
