import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const TRACKING_DIR = path.join(process.cwd(), "data", "tracking");

function ensureDir() {
  if (!fs.existsSync(TRACKING_DIR)) fs.mkdirSync(TRACKING_DIR, { recursive: true });
}

interface Visit {
  timestamp: string;
  userAgent: string;
  referrer: string;
  duration?: number;
}

// POST: Log a visit to a preview site
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const visit: Visit = {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "unknown",
    referrer: request.headers.get("referer") || "direct",
    duration: (body as { duration?: number }).duration,
  };

  let totalViews = 0;

  // Log to Supabase if configured (production)
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("preview_visits").insert({
        prospect_id: id,
        timestamp: visit.timestamp,
        user_agent: visit.userAgent,
        referrer: visit.referrer,
        duration: visit.duration || null,
      });

      const { count } = await supabase
        .from("preview_visits")
        .select("*", { count: "exact", head: true })
        .eq("prospect_id", id);

      totalViews = count || 1;
    } catch {
      // Table might not exist yet
      totalViews = 1;
    }
  } else if (process.env.VERCEL) {
    // Vercel without Supabase — log to console only
    console.log(`  👁️ Preview viewed: ${id} (file write skipped on Vercel)`);
    totalViews = 1;
  } else {
    // Local development — use filesystem
    ensureDir();
    const filePath = path.join(TRACKING_DIR, `${id}.json`);

    let visits: Visit[] = [];
    if (fs.existsSync(filePath)) {
      visits = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    visits.push(visit);
    fs.writeFileSync(filePath, JSON.stringify(visits, null, 2));
    totalViews = visits.length;
  }

  console.log(`  👁️ Preview viewed: ${id} (${totalViews} total views)`);

  // Update prospect status to "link_clicked" on first visit (if they were just "contacted")
  if (totalViews === 1) {
    try {
      const { getProspect, updateProspect } = await import("@/lib/store");
      const prospect = await getProspect(id);
      if (prospect && prospect.status === "contacted") {
        await updateProspect(id, { status: "link_clicked" as never });
        console.log(`  ✅ Status updated: ${prospect.businessName} → link_clicked`);
      }
    } catch { /* don't break tracking */ }
  }

  // Hot Lead Alert: text Ben when prospect views 3+, 5+, 10+ times
  if (totalViews === 3 || totalViews === 5 || totalViews === 10) {
    try {
      const { getProspect } = await import("@/lib/store");
      const { alertOwner } = await import("@/lib/alerts");
      const prospect = await getProspect(id);
      if (prospect) {
        await alertOwner({
          type: "high-value-lead",
          message: `🔥 HOT LEAD: ${prospect.businessName} viewed their site ${totalViews} times! CALL NOW.\nPhone: ${prospect.phone || "N/A"}`,
          prospect,
          timestamp: new Date().toISOString(),
        });
      }
    } catch { /* don't break tracking */ }
  }

  return NextResponse.json({ views: totalViews });
}

// GET: Get visit data for a prospect
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Read from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("preview_visits")
        .select("*")
        .eq("prospect_id", id)
        .order("timestamp", { ascending: false })
        .limit(20);

      if (!error && data) {
        const visits = data.map((row: Record<string, unknown>) => ({
          timestamp: row.timestamp as string,
          userAgent: row.user_agent as string,
          referrer: row.referrer as string,
          duration: row.duration as number | undefined,
        }));

        const { count } = await supabase
          .from("preview_visits")
          .select("*", { count: "exact", head: true })
          .eq("prospect_id", id);

        return NextResponse.json({
          visits,
          totalViews: count || visits.length,
          lastViewed: visits.length > 0 ? visits[0].timestamp : null,
        });
      }
    } catch {
      // Table might not exist yet
    }
  }

  // Skip file reads on Vercel if no Supabase
  if (process.env.VERCEL) {
    return NextResponse.json({ visits: [], totalViews: 0 });
  }

  ensureDir();
  const filePath = path.join(TRACKING_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ visits: [], totalViews: 0 });
  }

  const visits: Visit[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return NextResponse.json({
    visits: visits.slice(-20), // last 20 visits
    totalViews: visits.length,
    lastViewed: visits.length > 0 ? visits[visits.length - 1].timestamp : null,
  });
}
