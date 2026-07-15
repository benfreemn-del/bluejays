import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { listManagedDomains } from "@/lib/managed-domains";

/**
 * /api/clients/meyer-electric/stats
 *
 * Owner-facing analytics feed for Kyle's password-gated stats page at
 * /clients/meyer-electric/stats. POST { password } — verified here
 * server-side so no data ships to an unauthenticated browser.
 *
 * Returns:
 *   - pages: per-hostname/path view counts (all-time / 30d / 7d / last
 *     view) via the client_page_view_stats() SQL function
 *   - referrers: top traffic sources over the last 30 days, aggregated
 *     from client_page_views (bot rows never land — filtered at the
 *     track route)
 *   - leads: every quote request from the showcase contact form
 *     (contact_form_submissions, keyed by Meyer's prospect id)
 *   - domains: Kyle's managed domains (registrar, expiry, status) from
 *     managed_domains
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "meyer-electric";
const PROSPECT_ID = "063c4d4a-81e1-4cae-bbf1-3ce615e1c6f7";
// Repo is PUBLIC — the gate password must NEVER be hardcoded here.
// Set MEYER_STATS_PASSWORD on Vercel (all environments) + .env.local.
// Fails closed (401 for every request) when unset.
const STATS_PASSWORD = process.env.MEYER_STATS_PASSWORD || "";
const MEYER_DOMAIN_RE = /sequimelectric/i;

type PageStat = {
  path: string;
  total_views: number;
  views_30d: number;
  views_7d: number;
  last_view: string | null;
};

function referrerSource(raw: string): string {
  try {
    const host = new URL(raw).hostname.replace(/^www\.|^m\.|^l\./, "");
    return host || "direct";
  } catch {
    return "direct";
  }
}

export async function POST(req: NextRequest) {
  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    /* fall through to auth failure */
  }

  if (!STATS_PASSWORD || password !== STATS_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      totals: { totalViews: 0, views30d: 0, views7d: 0, leadCount: 0 },
      pages: [],
      referrers: [],
      leads: [],
      domains: [],
      note: "no-db",
    });
  }

  const supabase = getSupabase();

  let pages: PageStat[] = [];
  try {
    const { data, error } = await supabase.rpc("client_page_view_stats", {
      p_slug: SLUG,
    });
    if (!error && Array.isArray(data)) pages = data as PageStat[];
  } catch (err) {
    console.error("[meyer stats] page stats failed:", err);
  }

  // Top referrers, last 30 days. supabase-js has no GROUP BY — volume
  // is low (hundreds/month), so pull the window and aggregate here.
  let referrers: Array<{ source: string; count: number }> = [];
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("client_page_views")
      .select("referrer")
      .eq("client_slug", SLUG)
      .gte("created_at", since)
      .limit(5000);
    if (!error && Array.isArray(data)) {
      const counts = new Map<string, number>();
      for (const row of data as Array<{ referrer: string | null }>) {
        const source = row.referrer ? referrerSource(row.referrer) : "direct";
        // Self-referrals (in-site navigation) count as direct.
        const key = MEYER_DOMAIN_RE.test(source) || source === "bluejayportfolio.com" ? "direct" : source;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      referrers = Array.from(counts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    }
  } catch (err) {
    console.error("[meyer stats] referrer fetch failed:", err);
  }

  // Quote requests — every contact-form submission from the showcase.
  // Internal test submissions never surface on the client-facing page.
  let leads: Record<string, unknown>[] = [];
  try {
    const { data, error } = await supabase
      .from("contact_form_submissions")
      .select(
        "customer_name, customer_phone, customer_email, service_requested, message, submitted_at",
      )
      .eq("prospect_id", PROSPECT_ID)
      .order("submitted_at", { ascending: false })
      .limit(500);
    if (!error && Array.isArray(data)) {
      leads = (data as Record<string, unknown>[]).filter((l) => {
        const email = String(l.customer_email || "");
        const name = String(l.customer_name || "").trim();
        const message = String(l.message || "").trim();
        if (/@example\.(com|org|net)$/i.test(email)) return false;
        if (/@[^@]*\.example$/i.test(email)) return false;
        if (/@bluejayportfolio\.com$/i.test(email)) return false;
        // Ben's own form tests (launch-era QA submissions)
        if (/^shamowzow37b@gmail\.com$/i.test(email)) return false;
        if (/^tester?$/i.test(name) || /^bens?test$/i.test(name)) return false;
        if (/\btest\b.*\bignore\b|\bignore\b.*\btest\b/i.test(name)) return false;
        // Bare "test" messages (Ben's + Kyle's launch checks)
        if (/^test\.?$/i.test(message)) return false;
        if (/^service address:[^]*?\btest\.?$/i.test(message) && message.length < 60) return false;
        // Bot gibberish — long single-token mixed-case name, no spaces
        if (/^[a-zA-Z]{16,}$/.test(name) && /[a-z]/.test(name) && /[A-Z]/.test(name.slice(1))) return false;
        return true;
      });
    }
  } catch (err) {
    console.error("[meyer stats] leads fetch failed:", err);
  }

  // Kyle's domains — registrar / expiry / status from managed_domains.
  let domains: Array<{
    domain: string;
    registrar: string | null;
    status: string;
    expiresAt: string | null;
    autoManaged: boolean;
  }> = [];
  try {
    const all = await listManagedDomains();
    domains = all
      .filter((d) => d.clientSlug === SLUG || MEYER_DOMAIN_RE.test(d.domain))
      .map((d) => ({
        domain: d.domain,
        registrar: d.registrar,
        status: d.status,
        expiresAt: d.expiresAt,
        autoManaged: d.autoManaged,
      }));
  } catch (err) {
    console.error("[meyer stats] domains fetch failed:", err);
  }

  const totalViews = pages.reduce((s, p) => s + Number(p.total_views || 0), 0);
  const views30d = pages.reduce((s, p) => s + Number(p.views_30d || 0), 0);
  const views7d = pages.reduce((s, p) => s + Number(p.views_7d || 0), 0);

  return NextResponse.json({
    ok: true,
    totals: { totalViews, views30d, views7d, leadCount: leads.length },
    pages,
    referrers,
    leads,
    domains,
  });
}
