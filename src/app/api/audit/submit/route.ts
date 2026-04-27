import { NextRequest, NextResponse, after } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/audit/submit
 *
 * Public endpoint — Hormozi salty-pretzel lead-magnet entry point.
 * Body: { url, email, businessCategory, businessName?, ownerName? }
 *
 * Flow:
 *  1. Validate input + rate-limit (5 submissions/IP/hour)
 *  2. Look up existing prospect by email — if exists, attach audit to them
 *  3. Otherwise create a new prospect with status='audit_lead' and source='inbound'
 *  4. Insert site_audits row with status='pending'
 *  5. Fire-and-forget call to /api/audit/generate/[auditId] to kick off
 *     the actual AI audit (takes ~3-5 min — we don't wait)
 *  6. Return 200 immediately with { auditId, redirectUrl: '/audit/[id]/processing' }
 *  7. Client redirects to a "your audit is generating" page that polls
 *     the status endpoint
 */

const ALLOWED_CATEGORIES = new Set([
  "dental", "electrician", "plumber", "hvac", "roofing", "auto-repair",
  "law-firm", "salon", "fitness", "real-estate", "veterinary", "photography",
  "landscaping", "cleaning", "chiropractic", "accounting", "insurance",
  "interior-design", "moving", "pest-control", "florist", "daycare",
  "tattoo", "martial-arts", "physical-therapy", "tutoring", "pool-spa",
  "general-contractor", "catering", "pet-services", "church",
  "med-spa", "carpet-cleaning", "junk-removal", "tree-service",
  "pressure-washing", "garage-door", "locksmith", "towing",
  "construction", "appliance-repair", "event-planning", "general",
]);

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const e = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  if (/\.(webp|png|jpg|jpeg|svg|gif)$/.test(e)) return false;
  const host = e.split("@")[1];
  if (["domain.com", "example.com", "test.com", "yoursite.com"].includes(host)) return false;
  return true;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`audit-submit:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many audit requests. Please try again in an hour." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not available. Please email bluejaycontactme@gmail.com." },
      { status: 503 },
    );
  }

  let body: {
    url?: string;
    email?: string;
    businessCategory?: string;
    businessName?: string;
    ownerName?: string;
    utm?: Record<string, string>;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Normalize URL — accept missing protocol
  let targetUrl = (body.url || "").trim();
  if (targetUrl && !targetUrl.match(/^https?:\/\//i)) {
    targetUrl = `https://${targetUrl}`;
  }

  if (!isValidUrl(targetUrl)) {
    return NextResponse.json(
      { error: "Please enter a valid website URL (e.g., yourbusiness.com)" },
      { status: 400 },
    );
  }
  if (!isValidEmail(body.email || "")) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
    );
  }
  const businessCategory = (body.businessCategory || "general").toLowerCase().trim();
  if (!ALLOWED_CATEGORIES.has(businessCategory)) {
    return NextResponse.json(
      { error: "Pick a business category from the list" },
      { status: 400 },
    );
  }

  const email = body.email!.toLowerCase().trim();
  const businessName =
    (body.businessName || "").trim() ||
    (() => {
      try {
        return new URL(targetUrl).hostname.replace(/^www\./, "").split(".")[0];
      } catch {
        return "Business";
      }
    })();
  const ownerName = (body.ownerName || "").trim() || null;

  // Look up existing prospect by email
  const { data: existingProspect } = await supabase
    .from("prospects")
    .select("id, business_name, email, status, manually_managed")
    .eq("email", email)
    .maybeSingle();

  let prospectId: string;
  if (existingProspect) {
    prospectId = existingProspect.id as string;
  } else {
    // Create a new prospect — inbound source means SMS gating in CLAUDE.md
    // Rule from "SMS A2P 10DLC Compliance Rules" applies (source='inbound'
    // can be SMS'd post-A2P-approval per express consent on /get-started,
    // but the audit form itself doesn't ask for phone or SMS consent yet
    // so we leave source='inbound' for the email funnel only).
    const newProspectId = uuidv4();
    const { error: createErr } = await supabase.from("prospects").insert({
      id: newProspectId,
      business_name: businessName,
      owner_name: ownerName,
      email,
      address: "Unknown — submitted via /audit",
      city: "Unknown",
      state: "Unknown",
      category: businessCategory,
      status: "audit_lead",
      source: "inbound",
      pricing_tier: "standard",
      manually_managed: false,
      scraped_data: { source: "audit_form", submittedUrl: targetUrl, ...(body.utm || {}) },
    });
    if (createErr) {
      console.error("[audit/submit] Prospect insert failed:", createErr);
      return NextResponse.json(
        { error: "Couldn't create your record. Please email bluejaycontactme@gmail.com." },
        { status: 500 },
      );
    }
    prospectId = newProspectId;
  }

  // Insert audit row (idempotent on (prospect_id, target_url) — re-submitting
  // the same URL just bumps the existing row back to 'pending')
  const auditId = uuidv4();
  const { error: insertErr } = await supabase.from("site_audits").upsert(
    {
      id: auditId,
      prospect_id: prospectId,
      target_url: targetUrl,
      business_category: businessCategory,
      status: "pending",
      metadata: { submittedFrom: "audit_form", ...(body.utm || {}) },
    },
    { onConflict: "prospect_id,target_url", ignoreDuplicates: false },
  );

  if (insertErr) {
    console.error("[audit/submit] Audit insert failed:", insertErr);
    return NextResponse.json(
      { error: "Couldn't queue your audit. Please email bluejaycontactme@gmail.com." },
      { status: 500 },
    );
  }

  // The upsert may have returned an existing row if the (prospect_id, target_url)
  // pair already existed. Re-fetch to get the correct ID.
  const { data: auditRow } = await supabase
    .from("site_audits")
    .select("id")
    .eq("prospect_id", prospectId)
    .eq("target_url", targetUrl)
    .maybeSingle();

  const finalAuditId = (auditRow?.id as string) || auditId;

  // Kick the generate endpoint AFTER the response is sent (so the user
  // sees "submitted" immediately) but inside `after()` so the kick
  // actually completes. Plain `void fetch(...)` after a NextResponse
  // return is unreliable on Vercel — once the Lambda invocation returns
  // its response, the runtime is free to freeze/tear-down before the
  // unawaited fetch's TCP handshake completes. `after()` (Next 16) is
  // the documented primitive for "schedule work to run after response
  // is finished" — it uses Vercel's `waitUntil` under the hood to
  // extend the invocation lifetime until the callback resolves. This
  // is the root-cause fix for the audits-stranded-in-pending bug class
  // (forensics: `OVERNIGHT_REVIEW_D.md`, audit `0f82f25c-fa9b…`).
  //
  // CRITICAL: hardcode the production URL per CLAUDE.md Rule 16. Using
  // process.env.VERCEL_URL points at the per-deployment preview URL
  // (bluejays-xyz.vercel.app) which is gated by Vercel Deployment
  // Protection — server-to-self fetches get a 401 redirect to a Vercel
  // SSO login. The audit silently never kicks off and the customer
  // sees the wait-page forever. Same fix pattern as FROM_EMAIL and
  // stripe.ts baseUrl.
  //
  // We don't await the *full* generate call (it takes 3–5 min and the
  // generate route has its own 300s maxDuration). We do `await` long
  // enough that the request reaches Vercel's edge router and is routed
  // to a fresh generate Lambda invocation. An 8-second AbortSignal
  // bounds the wait so the submit Lambda doesn't pin itself alive any
  // longer than necessary. After that, the generate Lambda runs
  // independently on its own 300s budget. If the kick fails (network,
  // 401, edge router blip, etc.) the audit row stays `pending` and
  // the polling-page 90s auto-retry safety net (status route) fires
  // a second kick on the next poll.
  const baseUrl = "https://bluejayportfolio.com";
  after(async () => {
    try {
      const kickRes = await fetch(`${baseUrl}/api/audit/generate/${finalAuditId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET || "dev"}`,
        },
        // Bound the wait — once the generate route ACKs (or 8s passes)
        // we stop blocking the submit Lambda. Generate continues async.
        signal: AbortSignal.timeout(8000),
      });
      // Don't read the body — generate takes minutes to respond. We
      // only care that the request was DELIVERED and accepted by the
      // edge router (which routes it to a separate Lambda invocation).
      // A non-ok status here indicates the kick itself was rejected
      // (auth, route missing). Stamp failed_reason so the operator
      // dashboard surfaces it, instead of letting the row sit `pending`
      // forever.
      if (!kickRes.ok && kickRes.status !== 408) {
        const detail = await kickRes.text().catch(() => "");
        console.error(
          `[audit/submit] kick HTTP ${kickRes.status} for audit ${finalAuditId}: ${detail.slice(0, 200)}`,
        );
        await supabase
          .from("site_audits")
          .update({
            status: "failed",
            failed_reason: `kick_failed_http_${kickRes.status}`,
          })
          .eq("id", finalAuditId)
          .eq("status", "pending"); // only flip if still pending — don't clobber a generating/ready audit
      }
    } catch (err) {
      // Timeout (8s AbortSignal) is the EXPECTED happy path here — it
      // means the request reached the edge and the generate Lambda is
      // taking its time to respond. Don't treat that as a failure.
      const isTimeout = err instanceof Error && err.name === "TimeoutError";
      if (!isTimeout) {
        console.error(
          `[audit/submit] kick threw for audit ${finalAuditId} (will need manual retry):`,
          err,
        );
        try {
          await supabase
            .from("site_audits")
            .update({
              status: "failed",
              failed_reason: `kick_threw:${err instanceof Error ? err.message : String(err)}`.slice(0, 240),
            })
            .eq("id", finalAuditId)
            .eq("status", "pending");
        } catch {
          // best-effort — DB unreachable means we have bigger problems
        }
      }
    }
  });

  return NextResponse.json({
    ok: true,
    auditId: finalAuditId,
    redirectUrl: `/audit/${finalAuditId}/processing`,
  });
}
