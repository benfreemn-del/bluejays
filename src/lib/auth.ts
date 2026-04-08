// Simple auth for protecting the software/dashboard portion
// Portfolio pages (/, /templates/*, /preview/*) are public
// Dashboard, scripts, API routes require auth

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "bluejay2026").trim();

export function isProtectedRoute(pathname: string): boolean {
  const publicPrefixes = [
    "/",
    "/templates",
    "/preview",
    "/claim",
    "/proposal",
    "/book",
    "/onboarding",
    "/welcome",
    "/edit",
    "/api/portfolio",
    "/api/proposals/",
    "/api/calendar/available-slots",
    "/api/prospects/", // individual prospect lookups for preview pages
    "/_next",
    "/favicon",
  ];

  // Exact match for homepage
  if (pathname === "/") return false;

  // Check if starts with any public prefix
  for (const prefix of publicPrefixes) {
    if (prefix === "/" && pathname !== "/") continue;
    if (pathname.startsWith(prefix)) return false;
  }

  return true;
}

export function validateAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  // Support both Bearer token and Basic auth
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7) === ADMIN_PASSWORD;
  }
  if (authHeader.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
    const [, password] = decoded.split(":");
    return password === ADMIN_PASSWORD;
  }
  return false;
}

export function checkSessionCookie(cookieValue: string | undefined): boolean {
  return cookieValue === ADMIN_PASSWORD;
}
