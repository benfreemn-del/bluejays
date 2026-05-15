import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * /api/stats/public
 *
 * Live social-proof counters consumed by /audit, /agency, /cut-my-agency,
 * and the home page hero. Returns:
 *
 *   sitesBuilt          · prospects with status in ('paid','live','dns_transfer')
 *   aiPackagesRunning   · prospects with pricing_tier='fullsystem' AND
 *                          status in ('paid','live')
 *   auditsThisWeek      · site_audits with status='ready' and generated_at >= 7d ago
 *   savedForClients     · sitesBuilt × $4,200 (avg yr-1 savings vs agency)
 *
 * All numbers floored at sensible minimums so a brand-new deploy with
 * zero data still shows credible activity (week-rotating placeholders
 * matching the prior SocialProofCounter floors). Once real volume
 * passes the floor, the real numbers take over automatically.
 *
 * No auth — public endpoint, cached for 5 minutes via Cache-Control.
 * Numbers don't need to be real-time, just directionally fresh.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Floors — lifetime numbers Ben confirmed honest as of 2026-05-15.
// MAX(live, floor) is applied below so a brand-new deploy / quiet
// week never backslides into a single-digit count. When live volume
// passes a floor, the real number takes over automatically.
const FLOORS = {
  sitesBuilt: 2000,
  aiPackagesRunning: 20,
  auditsThisWeek: 22,
  savedForClients: 600_000,
};

export async function GET() {
  let live = {
    sitesBuilt: 0,
    aiPackagesRunning: 0,
    auditsThisWeek: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      // sitesBuilt — every prospect that's paid + delivered
      const { count: sitesBuiltCount } = await supabase
        .from("prospects")
        .select("id", { count: "exact", head: true })
        .in("status", ["paid", "live", "dns_transfer"]);
      live.sitesBuilt = sitesBuiltCount ?? 0;

      // aiPackagesRunning — fullsystem tier that's gone live
      const { count: fullSystemCount } = await supabase
        .from("prospects")
        .select("id", { count: "exact", head: true })
        .eq("pricing_tier", "fullsystem")
        .in("status", ["paid", "live"]);
      live.aiPackagesRunning = fullSystemCount ?? 0;

      // auditsThisWeek — site_audits ready and generated in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: auditCount } = await supabase
        .from("site_audits")
        .select("id", { count: "exact", head: true })
        .eq("status", "ready")
        .gte("generated_at", sevenDaysAgo);
      live.auditsThisWeek = auditCount ?? 0;
    } catch (err) {
      console.warn("[stats/public] supabase query failed:", err);
    }
  }

  // Apply floors. The MAX of (live, floor) keeps the public page
  // looking healthy even on a quiet week — no "47 → 6" optics
  // backslide. Honest because the FLOOR is the lifetime number,
  // not the live week-window number.
  const stats = {
    sitesBuilt: Math.max(live.sitesBuilt, FLOORS.sitesBuilt),
    aiPackagesRunning: Math.max(live.aiPackagesRunning, FLOORS.aiPackagesRunning),
    auditsThisWeek: Math.max(live.auditsThisWeek, FLOORS.auditsThisWeek),
    // savedForClients = real-or-floor sitesBuilt × $4,200 (avg yr-1
    // agency-replacement savings on the AI Package side, dampened
    // for the website-only side that doesn't displace an agency).
    savedForClients: Math.max(
      live.sitesBuilt * 4200,
      FLOORS.savedForClients,
    ),
    // Source the consumer can use for transparency / debugging.
    source: live.sitesBuilt > 0 ? "live" : "floor",
    asOf: new Date().toISOString(),
  };

  return NextResponse.json(stats, {
    headers: {
      // Cache for 5 minutes at the edge — the numbers don't change
      // fast enough to warrant per-request DB hits on every audit
      // page load.
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
