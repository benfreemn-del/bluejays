import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();

// Pre-compute session token using Web Crypto (Edge-compatible)
// This replaces Node.js crypto.createHash which doesn't work in Edge Runtime
let SESSION_TOKEN_CACHE: string | null = null;
async function getSessionToken(): Promise<string> {
  if (SESSION_TOKEN_CACHE) return SESSION_TOKEN_CACHE;
  if (!ADMIN_PASSWORD) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(ADMIN_PASSWORD + "bluejays-session-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  SESSION_TOKEN_CACHE = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return SESSION_TOKEN_CACHE;
}

// Protected routes that require login
const PROTECTED_PATHS = [
  "/dashboard",
  "/funnel-tracker",
  "/scripts",
  "/lead",
  "/preview-device",
  "/image-mapper",
  "/image-audit",
  "/spending",
  "/analytics",
  "/videos",
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
  "/api/image-mapper",
  "/api/image-audit",
  "/api/quality-review",
  "/api/leads/manual",
  "/api/test-funnel",
  // Sensitive API routes that must require auth
  "/api/funnel",
  "/api/funnel/run",
  "/api/funnel/enroll",
  "/api/outreach/bulk",
  "/api/costs",
  "/api/costs/analytics",
  "/api/spending",
  "/api/funnel-analytics",
  "/api/notes",
  "/api/voicemail/drop",
  "/api/winback",
  "/api/pipeline-velocity",
  "/api/pipeline/batch",
  "/api/qc",
  "/api/leaderboard",
  "/api/email-stats",
  "/api/referral",
  "/api/onboarding",
  "/api/vsl/generate",
  "/api/voicemail",
  "/api/videos",
  "/api/admin",
  "/api/retarget",
  "/api/followup-scheduler",
  "/api/scout-optimizer",
  "/api/replies/process",
  "/api/email-deliverability",
  "/api/email-tracking",
  "/api/auto-scout",
  "/api/warming",
  "/funnel-tracker",
];

// Public API routes that must bypass auth (webhooks, inbound handlers)
const PUBLIC_API_PATHS = [
  "/api/webhooks/stripe",
  "/api/inbound/email",
  "/api/inbound/sms",
  "/api/inbound/vonage-sms",
  "/api/checkout/create", // Prospects need to create checkout sessions
  "/api/claim/",          // Public claim-page data (sanitized — see /api/claim/[id])
  "/api/engagement/",     // Engagement score/triggers for claim + preview pages
  "/api/generated-sites/",// Preview-page site data (public — same data prospects see rendered)
  "/api/proposals/",
  "/api/calendar/available-slots",
  "/api/call-lists", // CSV downloads are linked directly from the dashboard
  "/api/unsubscribe", // Prospects click unsubscribe link from email — no auth needed
  "/api/auth/login",
  "/api/leads/submit",
  "/api/portfolio",
  "/api/social-proof",
  "/api/track/",
  "/api/image-proxy",
  "/api/voicemail/status", // Twilio status callback
  "/api/voicemail/twiml",  // Twilio TwiML endpoint
  "/api/onboarding-reminders/process", // Vercel cron — gated by CRON_SECRET in the handler
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public API paths (webhooks, inbound handlers)
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check auth cookie (signed session token, not raw password)
  const authCookie = request.cookies.get("bluejays_auth")?.value;
  const expectedToken = await getSessionToken();
  if (authCookie === expectedToken) return NextResponse.next();

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
