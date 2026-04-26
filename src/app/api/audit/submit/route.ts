import { NextRequest, NextResponse } from "next/server";
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

  // Fire-and-forget kick to the generate endpoint. We don't await — it
  // takes 3-5 min. Client polls /api/audit/[id]/status meanwhile.
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://bluejayportfolio.com";
  void fetch(`${baseUrl}/api/audit/generate/${finalAuditId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CRON_SECRET || "dev"}`,
    },
  }).catch((err) => {
    console.error("[audit/submit] kick-off failed (will need manual retry):", err);
  });

  return NextResponse.json({
    ok: true,
    auditId: finalAuditId,
    redirectUrl: `/audit/${finalAuditId}/processing`,
  });
}
