import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * /api/clients/zenith-sports/stats
 *
 * Owner-facing analytics feed for the password-gated stats page at
 * /clients/zenith-sports/stats. POST { password } — verified here
 * server-side so the data never ships to an unauthenticated browser.
 *
 * Returns:
 *   - pages: per-URL view counts (all-time / 30d / 7d / last view)
 *     via the client_page_view_stats() SQL function
 *   - leads: every email collected for zenith-sports (camp signups,
 *     inquiries, drill-of-week subscribers) from client_leads
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "zenith-sports";
const STATS_PASSWORD = "bluejay26";

type PageStat = {
  path: string;
  total_views: number;
  views_30d: number;
  views_7d: number;
  last_view: string | null;
};

export async function POST(req: NextRequest) {
  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    /* fall through to auth failure */
  }

  if (password !== STATS_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, pages: [], leads: [], note: "no-db" });
  }

  const supabase = getSupabase();

  let pages: PageStat[] = [];
  try {
    const { data, error } = await supabase.rpc("client_page_view_stats", {
      p_slug: SLUG,
    });
    if (!error && Array.isArray(data)) pages = data as PageStat[];
  } catch (err) {
    console.error("[zenith stats] page stats failed:", err);
  }

  // "Emails collected" = real captures from the site (camp signups,
  // contact forms, email captures). Rows with no email are almost all
  // Ben's internal partner-scout records — those must never surface on
  // the client-facing stats page.
  let leads: Record<string, unknown>[] = [];
  try {
    const { data, error } = await supabase
      .from("client_leads")
      .select("name, email, phone, audience_segment, funnel_status, source, created_at")
      .eq("client_slug", SLUG)
      .not("email", "is", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && Array.isArray(data)) {
      leads = (data as Record<string, unknown>[]).filter((l) => {
        const email = String(l.email || "");
        const name = String(l.name || "");
        if (/scout/i.test(String(l.source || ""))) return false;
        if (/scout/i.test(String(l.audience_segment || ""))) return false;
        // BlueJays-internal test submissions — never client-facing
        if (/@[^@]*\.example$/i.test(email)) return false;
        if (/@example\.(com|org|net)$/i.test(email)) return false;
        if (/@bluejayportfolio\.com$/i.test(email)) return false;
        if (/^tester?$/i.test(name.trim())) return false;
        if (/\btest\b.*\bignore\b|\bignore\b.*\btest\b/i.test(name)) return false;
        return true;
      });
    }
  } catch (err) {
    console.error("[zenith stats] leads fetch failed:", err);
  }

  const totalViews = pages.reduce((s, p) => s + Number(p.total_views || 0), 0);
  const views30d = pages.reduce((s, p) => s + Number(p.views_30d || 0), 0);
  const views7d = pages.reduce((s, p) => s + Number(p.views_7d || 0), 0);
  const uniqueEmails = new Set(
    leads.map((l) => String(l.email || "").toLowerCase()).filter(Boolean),
  ).size;

  return NextResponse.json({
    ok: true,
    totals: { totalViews, views30d, views7d, uniqueEmails, leadCount: leads.length },
    pages,
    leads,
  });
}
