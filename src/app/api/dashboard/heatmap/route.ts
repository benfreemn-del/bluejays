import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/heatmap?site=<key>&days=<1-3>
 *
 * Powers /dashboard/heatmap. Pulls aggregate friction signals from the
 * Microsoft Clarity Data Export API (free, already wired up via
 * ClarityScript on bluejayportfolio.com — same project ID feeds this).
 *
 * Why Clarity vs rolling our own click logger:
 *   - Heat maps + dead clicks + rage clicks + scroll depth are already
 *     being captured by the Clarity tag we ship on every site.
 *   - Their Data Export API returns aggregate friction counts (no PII,
 *     no per-user data) that we can paint as "leakage zones" on top
 *     of the live site in an iframe.
 *
 * Per-site config:
 *   - "bluejays" → uses CLARITY_API_TOKEN (Ben's main project wkot1apu92,
 *     already serving bluejayportfolio.com via ClarityScript).
 *   - "zenith-sports" / any client slug → uses
 *     <SLUG_UPPER>_CLARITY_API_TOKEN (matches the existing
 *     <SLUG_UPPER>_CLARITY_ID convention in src/lib/client-tracking.ts).
 *
 * When no token is configured for the selected site we return
 * configured:false plus a clearly-labeled sample dataset so the page
 * still renders something useful — Ben can wire the token later
 * without breaking the UI.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeakageSeverity = "engagement" | "warm" | "friction" | "leak";

interface LeakageZone {
  /** Vertical position as a 0-1 fraction of the viewport iframe height. */
  top: number;
  /** Horizontal position as a 0-1 fraction of the iframe width. */
  left: number;
  /** Width as a 0-1 fraction. */
  width: number;
  /** Height as a 0-1 fraction. */
  height: number;
  label: string;
  /** Plain-English explanation rendered in the tooltip. */
  detail: string;
  severity: LeakageSeverity;
  /** Raw metric value used to derive the severity. */
  value: number | null;
}

interface HeatmapResponse {
  ok: boolean;
  configured: boolean;
  /** True when leakageZones come from real Clarity data; false when stub. */
  live: boolean;
  site: string;
  iframeUrl: string;
  fetchedAt: string;
  totals: {
    sessions: number | null;
    deadClickRate: number | null;
    rageClickRate: number | null;
    quickBackRate: number | null;
    avgScrollDepth: number | null;
  };
  leakageZones: LeakageZone[];
  topFrictionPages: { url: string; deadClicks: number; rageClicks: number }[];
  message?: string;
  error?: string;
}

const SITES: Record<
  string,
  { label: string; iframeUrl: string; envToken: string; envProject: string }
> = {
  bluejays: {
    label: "BlueJays · bluejayportfolio.com",
    iframeUrl: "/?embed=1",
    envToken: "CLARITY_API_TOKEN",
    envProject: "NEXT_PUBLIC_CLARITY_PROJECT_ID",
  },
  "zenith-sports": {
    label: "Tekky / Zenith Sports",
    iframeUrl: "/clients/zenith-sports?embed=1",
    envToken: "ZENITH_SPORTS_CLARITY_API_TOKEN",
    envProject: "ZENITH_SPORTS_CLARITY_ID",
  },
};

function severityFor(rate: number, leakAt: number, frictionAt: number): LeakageSeverity {
  if (rate >= leakAt) return "leak";
  if (rate >= frictionAt) return "friction";
  if (rate >= frictionAt / 2) return "warm";
  return "engagement";
}

function stubZones(): LeakageZone[] {
  return [
    {
      top: 0.05,
      left: 0.62,
      width: 0.32,
      height: 0.08,
      label: "Nav CTA cold",
      detail: "Sample data — wire CLARITY_API_TOKEN to see real numbers. Header CTAs often see <2% click rate even when visible.",
      severity: "warm",
      value: null,
    },
    {
      top: 0.32,
      left: 0.08,
      width: 0.5,
      height: 0.12,
      label: "Hero rage clicks",
      detail: "Sample data — users clicking the hero image expecting a CTA, getting nothing back.",
      severity: "friction",
      value: null,
    },
    {
      top: 0.55,
      left: 0.36,
      width: 0.28,
      height: 0.09,
      label: "Mid-page dead click",
      detail: "Sample data — text that looks like a link but isn't (common leakage pattern).",
      severity: "leak",
      value: null,
    },
    {
      top: 0.78,
      left: 0.04,
      width: 0.92,
      height: 0.06,
      label: "Scroll cliff (78%)",
      detail: "Sample data — most users never reach this depth. Move important content above.",
      severity: "leak",
      value: null,
    },
  ];
}

async function fetchClarityLive(
  token: string,
  days: number,
): Promise<{ raw: unknown; totals: HeatmapResponse["totals"]; topFrictionPages: HeatmapResponse["topFrictionPages"] }> {
  // Clarity Data Export API — POST not required for live insights; GET works.
  // numOfDays: 1, 2, or 3.
  const url =
    `https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=${days}` +
    `&dimension1=URL`;
  const r = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Clarity API ${r.status}: ${body.slice(0, 200)}`);
  }
  const raw = (await r.json()) as Array<{
    metricName?: string;
    information?: Array<Record<string, string | number>>;
  }>;

  // The API returns an array; each entry is one metric block with an
  // `information` array of dimension-broken rows. We pluck the headline
  // totals + the top-friction URL list.
  let sessions: number | null = null;
  let deadClickRate: number | null = null;
  let rageClickRate: number | null = null;
  let quickBackRate: number | null = null;
  let avgScrollDepth: number | null = null;
  const frictionByUrl: Record<string, { dead: number; rage: number }> = {};

  for (const block of raw) {
    const name = (block?.metricName || "").toString();
    const info = block?.information || [];

    if (name === "Traffic") {
      const total = info.reduce(
        (s, row) => s + Number(row.totalSessionCount ?? row.sessionCount ?? 0),
        0,
      );
      if (Number.isFinite(total) && total > 0) sessions = total;
    }
    if (name === "DeadClickCount") {
      const total = info.reduce((s, row) => s + Number(row.subTotal ?? 0), 0);
      if (sessions && sessions > 0) deadClickRate = total / sessions;
      for (const row of info) {
        const u = String(row.Url ?? row.URL ?? row.url ?? "");
        if (!u) continue;
        frictionByUrl[u] = frictionByUrl[u] ?? { dead: 0, rage: 0 };
        frictionByUrl[u].dead += Number(row.subTotal ?? 0);
      }
    }
    if (name === "RageClickCount") {
      const total = info.reduce((s, row) => s + Number(row.subTotal ?? 0), 0);
      if (sessions && sessions > 0) rageClickRate = total / sessions;
      for (const row of info) {
        const u = String(row.Url ?? row.URL ?? row.url ?? "");
        if (!u) continue;
        frictionByUrl[u] = frictionByUrl[u] ?? { dead: 0, rage: 0 };
        frictionByUrl[u].rage += Number(row.subTotal ?? 0);
      }
    }
    if (name === "QuickbackClick") {
      const total = info.reduce((s, row) => s + Number(row.subTotal ?? 0), 0);
      if (sessions && sessions > 0) quickBackRate = total / sessions;
    }
    if (name === "ScrollDepth") {
      const depths = info
        .map((row) => Number(row.averageScrollDepth ?? row.scrollDepth ?? 0))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (depths.length > 0) {
        avgScrollDepth = depths.reduce((s, n) => s + n, 0) / depths.length;
      }
    }
  }

  const topFrictionPages = Object.entries(frictionByUrl)
    .map(([url, v]) => ({ url, deadClicks: v.dead, rageClicks: v.rage }))
    .sort((a, b) => b.deadClicks + b.rageClicks - (a.deadClicks + a.rageClicks))
    .slice(0, 10);

  return {
    raw,
    totals: { sessions, deadClickRate, rageClickRate, quickBackRate, avgScrollDepth },
    topFrictionPages,
  };
}

function buildLeakageZones(
  totals: HeatmapResponse["totals"],
): LeakageZone[] {
  // Convert aggregate Clarity metrics into 4 page-region overlay zones.
  // We can't know the exact pixel coordinates of every dead-click without
  // the per-element heatmap (which Clarity only exposes via their UI),
  // so we paint by region: header / hero / mid-page / scroll cliff.
  // Severity comes from the actual metric values; copy explains what
  // the operator is looking at.
  const dead = totals.deadClickRate ?? 0;
  const rage = totals.rageClickRate ?? 0;
  const quick = totals.quickBackRate ?? 0;
  const scroll = totals.avgScrollDepth ?? 0;

  return [
    {
      top: 0.02,
      left: 0.55,
      width: 0.42,
      height: 0.08,
      label: "Header / Nav",
      detail:
        dead > 0
          ? `${Math.round(dead * 1000) / 10} dead clicks per 100 sessions in this region. ` +
            `Means people clicked things that look interactive but aren't (logo, sub-text, decorative icons).`
          : "No dead-click signal in the nav region yet.",
      severity: severityFor(dead, 0.5, 0.2),
      value: dead,
    },
    {
      top: 0.18,
      left: 0.04,
      width: 0.92,
      height: 0.18,
      label: "Hero & primary CTA",
      detail:
        rage > 0
          ? `${Math.round(rage * 1000) / 10} rage clicks per 100 sessions. ` +
            `Visitors clicked the hero CTA repeatedly in frustration — most common cause: slow response, broken link, or modal that doesn't open.`
          : "Hero is clean — no rage-click signal.",
      severity: severityFor(rage, 0.3, 0.1),
      value: rage,
    },
    {
      top: 0.45,
      left: 0.04,
      width: 0.92,
      height: 0.18,
      label: "Mid-page friction",
      detail:
        quick > 0
          ? `${Math.round(quick * 1000) / 10} quick-backs per 100 sessions — visitor clicked through and bounced back inside a few seconds. Mid-page links over-promise vs the next page.`
          : "Mid-page section is holding attention.",
      severity: severityFor(quick, 0.4, 0.15),
      value: quick,
    },
    {
      top: 0.7,
      left: 0.04,
      width: 0.92,
      height: 0.08,
      label: scroll > 0 ? `Scroll cliff (avg ${Math.round(scroll * 100)}% reached)` : "Scroll cliff",
      detail:
        scroll > 0
          ? `Average visitor only scrolls ${Math.round(scroll * 100)}% of the page. Anything below this line is invisible to most traffic — move it up or kill it.`
          : "No scroll-depth signal yet.",
      // Lower scroll depth = bigger leak.
      severity:
        scroll === 0
          ? "warm"
          : scroll < 0.4
            ? "leak"
            : scroll < 0.6
              ? "friction"
              : scroll < 0.8
                ? "warm"
                : "engagement",
      value: scroll,
    },
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const site = (searchParams.get("site") || "bluejays").trim();
  const daysRaw = parseInt(searchParams.get("days") || "1", 10);
  const days = Math.min(3, Math.max(1, Number.isFinite(daysRaw) ? daysRaw : 1));

  const cfg = SITES[site];
  if (!cfg) {
    const body: HeatmapResponse = {
      ok: false,
      configured: false,
      live: false,
      site,
      iframeUrl: "",
      fetchedAt: new Date().toISOString(),
      totals: {
        sessions: null,
        deadClickRate: null,
        rageClickRate: null,
        quickBackRate: null,
        avgScrollDepth: null,
      },
      leakageZones: [],
      topFrictionPages: [],
      error: `Unknown site "${site}". Add it to SITES in src/app/api/dashboard/heatmap/route.ts.`,
    };
    return NextResponse.json(body, { status: 400 });
  }

  const token = (process.env[cfg.envToken] || "").trim();

  if (!token) {
    const body: HeatmapResponse = {
      ok: true,
      configured: false,
      live: false,
      site,
      iframeUrl: cfg.iframeUrl,
      fetchedAt: new Date().toISOString(),
      totals: {
        sessions: null,
        deadClickRate: null,
        rageClickRate: null,
        quickBackRate: null,
        avgScrollDepth: null,
      },
      leakageZones: stubZones(),
      topFrictionPages: [],
      message:
        `No ${cfg.envToken} env var set — showing sample zones. ` +
        `Generate a Clarity Data Export API token at clarity.microsoft.com → Settings → Data Export, then add it to Vercel env vars.`,
    };
    return NextResponse.json(body);
  }

  try {
    const { totals, topFrictionPages } = await fetchClarityLive(token, days);
    const body: HeatmapResponse = {
      ok: true,
      configured: true,
      live: true,
      site,
      iframeUrl: cfg.iframeUrl,
      fetchedAt: new Date().toISOString(),
      totals,
      leakageZones: buildLeakageZones(totals),
      topFrictionPages,
    };
    return NextResponse.json(body);
  } catch (e) {
    const body: HeatmapResponse = {
      ok: true,
      configured: true,
      live: false,
      site,
      iframeUrl: cfg.iframeUrl,
      fetchedAt: new Date().toISOString(),
      totals: {
        sessions: null,
        deadClickRate: null,
        rageClickRate: null,
        quickBackRate: null,
        avgScrollDepth: null,
      },
      leakageZones: stubZones(),
      topFrictionPages: [],
      error: (e as Error).message,
      message:
        "Clarity API call failed — showing sample zones. Common causes: token expired, project ID mismatch, or Clarity hasn't collected data in the last 24h.",
    };
    return NextResponse.json(body);
  }
}
