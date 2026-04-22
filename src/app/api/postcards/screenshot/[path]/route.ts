import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/postcards/screenshot/[path]
 *
 * Utility endpoint: Browserless-captures any internal page at
 * `/[path]` and returns the JPEG bytes. Used for admin QA captures
 * (e.g., screenshotting /get-started for TCR resubmission evidence)
 * without needing to provision external screenshot tools.
 *
 * Admin-gated via middleware (/api/postcards/* protected except /html/).
 *
 * Path supports nested paths via dot encoding:
 *   /api/postcards/screenshot/get-started          → /get-started
 *   /api/postcards/screenshot/privacy              → /privacy
 *   /api/postcards/screenshot/dashboard.customers  → /dashboard/customers
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path: encodedPath } = await params;
  const browserlessKey = process.env.BROWSERLESS_API_KEY;
  if (!browserlessKey) {
    return NextResponse.json({ error: "BROWSERLESS_API_KEY missing" }, { status: 500 });
  }

  // Dots in the URL path map to slashes for the real target (so
  // `/dashboard/customers` can be expressed without nested [[...]] routes).
  const realPath = "/" + encodedPath.replace(/\./g, "/");
  const target = `https://bluejayportfolio.com${realPath}`;

  const browserlessUrl =
    `https://production-sfo.browserless.io/screenshot?token=${encodeURIComponent(browserlessKey)}&stealth=true`;

  const payload = {
    url: target,
    options: {
      type: "jpeg",
      quality: 90,
      fullPage: true,
    },
    viewport: { width: 1400, height: 900, deviceScaleFactor: 1 },
    gotoOptions: { waitUntil: "networkidle2", timeout: 30000 },
  };

  try {
    const res = await fetch(browserlessUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Browserless ${res.status}: ${body.slice(0, 300)}` },
        { status: 502 }
      );
    }
    const jpeg = Buffer.from(await res.arrayBuffer());
    return new NextResponse(jpeg, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `inline; filename="${encodedPath}.jpg"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
