import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

  ensureDir();
  const filePath = path.join(TRACKING_DIR, `${id}.json`);

  let visits: Visit[] = [];
  if (fs.existsSync(filePath)) {
    visits = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  visits.push({
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "unknown",
    referrer: request.headers.get("referer") || "direct",
    duration: (body as { duration?: number }).duration,
  });

  fs.writeFileSync(filePath, JSON.stringify(visits, null, 2));

  console.log(`  👁️ Preview viewed: ${id} (${visits.length} total views)`);

  // Hot Lead Alert: text Ben when prospect views 3+, 5+, 10+ times
  if (visits.length === 3 || visits.length === 5 || visits.length === 10) {
    try {
      const { getProspect } = await import("@/lib/store");
      const { alertOwner } = await import("@/lib/alerts");
      const prospect = await getProspect(id);
      if (prospect) {
        await alertOwner({
          type: "high-value-lead",
          message: `🔥 HOT LEAD: ${prospect.businessName} viewed their site ${visits.length} times! CALL NOW.\nPhone: ${prospect.phone || "N/A"}`,
          prospect,
          timestamp: new Date().toISOString(),
        });
      }
    } catch { /* don't break tracking */ }
  }

  return NextResponse.json({ views: visits.length });
}

// GET: Get visit data for a prospect
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
