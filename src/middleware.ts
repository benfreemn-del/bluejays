import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "bluejay2026").trim();

// Protected routes that require login
const PROTECTED_PATHS = [
  "/dashboard",
  "/scripts",
  "/lead",
  "/preview-device",
  "/spending",
  "/v2",
  "/api/scout",
  "/api/prospects",
  "/api/email",
  "/api/sms",
  "/api/instagram",
  "/api/generate",
  "/api/checkout",
  "/api/ai-respond",
  "/api/comms",
  "/api/call-lists",
  "/api/export",
  "/api/edit",
  "/api/quality-review",
  "/api/leads/manual",
  "/api/test-funnel",
  // Sensitive API routes that must require auth
  "/api/funnel/run",
  "/api/funnel/enroll",
  "/api/outreach/bulk",
  "/api/costs",
  "/api/costs/analytics",
  "/api/notes",
  "/api/voicemail/drop",
  "/api/winback",
  "/api/pipeline-velocity",
  "/api/pipeline/batch",
  "/api/leaderboard",
  "/api/email-stats",
  "/api/referral",
  "/api/onboarding",
];

// Public API routes that must bypass auth (webhooks, inbound handlers)
const PUBLIC_API_PATHS = [
  "/api/webhooks/stripe",
  "/api/inbound/email",
  "/api/inbound/sms",
  "/api/checkout/create", // Prospects need to create checkout sessions
  "/api/proposals/",
  "/api/calendar/available-slots",
  "/api/call-lists", // CSV downloads are linked directly from the dashboard
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public API paths (webhooks, inbound handlers)
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check auth cookie
  const authCookie = request.cookies.get("bluejays_auth")?.value;
  if (authCookie === ADMIN_PASSWORD) return NextResponse.next();

  // Check Authorization header (for API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    if (authHeader.startsWith("Bearer ") && authHeader.slice(7) === ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  }

  // Not authenticated — redirect to login for pages, 401 for API
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scripts/:path*",
    "/api/scout/:path*",
    "/api/prospects/:path*",
    "/api/email/:path*",
    "/api/sms/:path*",
    "/api/instagram/:path*",
    "/api/generate/:path*",
    "/api/checkout/:path*",
    "/api/ai-respond/:path*",
    "/api/comms/:path*",
    "/api/call-lists/:path*",
    "/api/export/:path*",
    "/api/edit/:path*",
    "/api/quality-review/:path*",
    "/api/notes/:path*",
    "/api/webhooks/:path*",
    "/api/inbound/:path*",
    "/api/leads/manual/:path*",
    "/api/test-funnel/:path*",
    "/lead/:path*",
    "/spending",
    // Newly protected sensitive routes
    "/api/funnel/run/:path*",
    "/api/funnel/enroll/:path*",
    "/api/outreach/bulk/:path*",
    "/api/costs/:path*",
    "/api/voicemail/drop/:path*",
    "/api/winback/:path*",
    "/api/pipeline-velocity/:path*",
    "/api/pipeline/batch/:path*",
    "/api/leaderboard/:path*",
    "/api/email-stats/:path*",
    "/api/referral/:path*",
    "/api/onboarding/:path*",
  ],
};
