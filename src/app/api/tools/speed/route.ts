import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/tools/speed?url=https%3A%2F%2Fexample.com&strategy=mobile
 *
 * Server-side proxy to Google's PageSpeed Insights v5 API.
 * Returns only the metrics we display so the response stays small +
 * the API key (if set) never reaches the client.
 *
 * No key required for low-volume use (Google's anonymous quota is
 * 25k/day per IP). Set PAGESPEED_API_KEY in env to bump that ceiling.
 */

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

type PSIResponse = {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number };
      accessibility?: { score: number };
      "best-practices"?: { score: number };
      seo?: { score: number };
    };
    audits?: Record<
      string,
      { displayValue?: string; numericValue?: number; score?: number | null }
    >;
  };
  error?: { message?: string };
};

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`tools-speed:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checks from this IP. Try again in an hour." },
      { status: 429 },
    );
  }

  const sp = request.nextUrl.searchParams;
  let target = (sp.get("url") || "").trim();
  const strategy = (sp.get("strategy") || "mobile") === "desktop" ? "desktop" : "mobile";

  if (!target) {
    return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  }
  // Add https:// if user didn't type a protocol
  if (!/^https?:\/\//i.test(target)) {
    target = `https://${target}`;
  }
  if (!isValidHttpUrl(target)) {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  // Build the PSI request URL
  const psiUrl = new URL(PSI_ENDPOINT);
  psiUrl.searchParams.set("url", target);
  psiUrl.searchParams.set("strategy", strategy);
  ["performance", "accessibility", "best-practices", "seo"].forEach((cat) => {
    psiUrl.searchParams.append("category", cat);
  });
  if (process.env.PAGESPEED_API_KEY) {
    psiUrl.searchParams.set("key", process.env.PAGESPEED_API_KEY);
  }

  // PSI takes 10–30s for a real fetch. Use a generous fetch timeout.
  let psiData: PSIResponse | null = null;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 60_000);
    const res = await fetch(psiUrl.toString(), {
      signal: ctrl.signal,
      // No-store: each user submission gets a fresh result
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text();
      console.error("[tools/speed] PSI failed:", res.status, text.slice(0, 300));
      return NextResponse.json(
        { error: `Google PageSpeed couldn't fetch that URL. Try a different one.` },
        { status: 502 },
      );
    }
    psiData = (await res.json()) as PSIResponse;
  } catch (err) {
    console.error("[tools/speed] fetch error:", err);
    return NextResponse.json(
      { error: "Took too long to check. Try a smaller / faster site, or try again." },
      { status: 504 },
    );
  }

  if (psiData.error) {
    return NextResponse.json(
      { error: psiData.error.message || "PageSpeed couldn't analyze that URL." },
      { status: 400 },
    );
  }

  const cats = psiData.lighthouseResult?.categories || {};
  const audits = psiData.lighthouseResult?.audits || {};

  // Score scale 0-100. PSI returns 0-1.
  const round = (s: number | undefined) =>
    typeof s === "number" ? Math.round(s * 100) : null;

  // Pick out the Core Web Vitals + a couple of "what costs the most"
  // diagnostics so the result page can show specifics, not just numbers.
  function audit(key: string) {
    const a = audits[key];
    if (!a) return null;
    return {
      display: a.displayValue || null,
      numeric: typeof a.numericValue === "number" ? a.numericValue : null,
      score: typeof a.score === "number" ? a.score : null,
    };
  }

  return NextResponse.json({
    ok: true,
    url: target,
    strategy,
    scores: {
      performance: round(cats.performance?.score),
      accessibility: round(cats.accessibility?.score),
      bestPractices: round(cats["best-practices"]?.score),
      seo: round(cats.seo?.score),
    },
    metrics: {
      lcp: audit("largest-contentful-paint"),
      cls: audit("cumulative-layout-shift"),
      tbt: audit("total-blocking-time"),
      fcp: audit("first-contentful-paint"),
      speedIndex: audit("speed-index"),
      tti: audit("interactive"),
    },
    // Top 3 opportunities (most-impactful fixes)
    opportunities: Object.entries(audits)
      .filter(
        ([, a]) =>
          typeof a.score === "number" && a.score < 0.9 && a.numericValue && a.displayValue,
      )
      .map(([key, a]) => ({
        key,
        display: a.displayValue,
        score: typeof a.score === "number" ? Math.round(a.score * 100) : null,
      }))
      .slice(0, 5),
  });
}
