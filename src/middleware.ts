import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bluejay2026";

// Protected routes that require login
const PROTECTED_PATHS = [
  "/dashboard",
  "/scripts",
  "/lead",
  "/spending",
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
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    "/lead/:path*",
    "/spending",
  ],
};
