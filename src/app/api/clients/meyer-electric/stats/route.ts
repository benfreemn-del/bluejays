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

// Vendor solicitations posing as quote requests — never show these to
// Kyle. Domain list covers known spam operations; the message heuristics
// catch the pitch language (guest-post pitchers, virtual-assistant
// sellers, estimation vendors, business brokers) including senders on
// personal mailboxes, which must never be hardcoded here (public repo).
// Display-level filter only; rows stay in contact_form_submissions.
const SPAM_SENDER_RE =
  /housingsecrets\.net|safetykid\.info|parallelaid\.com|homesafetyhub\.org|tidylifetoday\.com|vas4hire\.com|lightlaunch\.ai|sendproud\.com/i;
const SPAM_MESSAGE_RE =
  /guest post|article (proposal|submission)|your readers|virtual assistant|calendly\.com\/|reply stop to unsubscribe|backlink|complimentary valuation|estimation services|lead generation|book(ed)? meetings|user sign ?ups|volume discounts|vendor,? not a customer/i;

type PageStat = {
  path: string;
  total_views: number;
  views_30d: number;
  views_7d: number;
  last_view: string | null;
};

// Hostnames that are OURS, not Kyle's. The showcase is reachable at
// bluejayportfolio.com/clients/meyer-electric, so our own portfolio
// traffic (Ben demoing the build, sales prospects clicking through
// from the portfolio, crawlers) lands in the same client_page_views
// rows as real sequimelectrician.com visitors.
//
// Kyle's backend must report HIS traffic only. Removed 2026-08-17 at
// Ben's request. Filtered SERVER-SIDE on purpose — hiding these rows
// in the client would still ship our internal numbers to his browser,
// and totals are derived from `pages`, so dropping them here corrects
// the headline counts as well.
const INTERNAL_HOSTS = new Set(["bluejayportfolio.com"]);

/** Stored paths are "<host><path>", e.g. "sequimelectrician.com/". */
function hostOf(path: string): string {
  return (path.split("/")[0] || path).replace(/^www\./, "").toLowerCase();
}

/**
 * Drop our own hostnames, then roll the surviving rows up BY DOMAIN.
 *
 * The table is titled "Views by domain" but the RPC returns one row per
 * PATH, and the client only ever renders the host portion. Any site
 * with more than one tracked path therefore rendered as several
 * identical-looking rows — Kyle was seeing "sequimelectrician.com"
 * twice (1,422 and 6) with no way to tell them apart. Aggregating here
 * makes the table match its own heading.
 */
function domainStats(rows: PageStat[]): PageStat[] {
  const byHost = new Map<string, PageStat>();
  for (const row of rows) {
    const host = hostOf(row.path);
    if (!host || INTERNAL_HOSTS.has(host)) continue;
    const acc = byHost.get(host);
    if (!acc) {
      byHost.set(host, {
        path: host,
        total_views: Number(row.total_views || 0),
        views_30d: Number(row.views_30d || 0),
        views_7d: Number(row.views_7d || 0),
        last_view: row.last_view,
      });
      continue;
    }
    acc.total_views += Number(row.total_views || 0);
    acc.views_30d += Number(row.views_30d || 0);
    acc.views_7d += Number(row.views_7d || 0);
    // Keep the most recent visit across the merged paths.
    if (row.last_view && (!acc.last_view || row.last_view > acc.last_view)) {
      acc.last_view = row.last_view;
    }
  }
  return [...byHost.values()].sort((a, b) => b.total_views - a.total_views);
}

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
    // domainStats() strips our own hostnames and rolls the rest up per
    // domain. Everything downstream (the table AND the headline totals)
    // reads from `pages`, so this is the single chokepoint.
    if (!error && Array.isArray(data)) pages = domainStats(data as PageStat[]);
  } catch (err) {
    console.error("[meyer stats] page stats failed:", err);
  }

  // Daily view counts (PT days) for the day/week/month breakdown. No
  // GROUP BY in supabase-js — page through created_at values and bucket
  // here. Volume is low (~500/mo); the 30-page cap covers years.
  let daily: Array<{ day: string; views: number }> = [];
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const counts = new Map<string, number>();
    const PAGE = 1000;
    for (let page = 0; page < 30; page++) {
      // `path` is selected purely so our own hostnames can be excluded
      // here too — otherwise the "Views over time" chart would keep
      // counting bluejayportfolio.com hits and visibly disagree with
      // the corrected headline totals above.
      const { data, error } = await supabase
        .from("client_page_views")
        .select("created_at, path")
        .eq("client_slug", SLUG)
        .order("created_at", { ascending: true })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      if (error || !Array.isArray(data) || data.length === 0) break;
      for (const row of data as Array<{ created_at: string; path: string | null }>) {
        if (row.path && INTERNAL_HOSTS.has(hostOf(row.path))) continue;
        const key = fmt.format(new Date(row.created_at));
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      if (data.length < PAGE) break;
    }
    daily = Array.from(counts.entries())
      .map(([day, views]) => ({ day, views }))
      .sort((a, b) => a.day.localeCompare(b.day));
  } catch (err) {
    console.error("[meyer stats] daily fetch failed:", err);
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
        // Vendor solicitations — not quote requests
        if (SPAM_SENDER_RE.test(email)) return false;
        if (SPAM_MESSAGE_RE.test(message)) return false;
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
    daily,
    referrers,
    leads,
    domains,
  });
}
