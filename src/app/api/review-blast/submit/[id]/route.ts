import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  normalizePhoneList,
  createSubmission,
  MAX_PHONES_PER_SUBMISSION,
} from "@/lib/review-blast";
import type { TemplateKey } from "@/lib/review-blast-templates";
import { TEMPLATES } from "@/lib/review-blast-templates";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/review-blast/submit/[id]
 *
 * Body: { phones: string, templateKey: TemplateKey }
 *
 * Public route — gated by knowledge of the upsell UUID. Same security
 * model as /review-blast/[id] (URL-as-secret, not in PROTECTED_PATHS).
 *
 * Verifies:
 *  - upsell row exists, sku === 'review_blast', status in (paid, fulfilled)
 *  - templateKey is one of the allowed values
 *  - at least one valid phone number after normalization
 *  - rate-limited at 3 submissions per IP per minute (anti-abuse)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: upsellId } = await params;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`review-blast-submit:${ip}`, 3, 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submission attempts. Please try again later." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not available — please email bluejaycontactme@gmail.com." },
      { status: 503 },
    );
  }

  let body: { phones?: string; templateKey?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { phones, templateKey } = body;
  if (!phones || typeof phones !== "string") {
    return NextResponse.json(
      { error: "phones field is required" },
      { status: 400 },
    );
  }

  // Validate templateKey is a known template (don't trust the client).
  const validKeys = TEMPLATES.map((t) => t.key);
  if (!templateKey || !validKeys.includes(templateKey as TemplateKey)) {
    return NextResponse.json(
      { error: "Invalid template selection" },
      { status: 400 },
    );
  }

  // Look up + verify the upsell.
  const { data: upsell } = await supabase
    .from("upsells")
    .select("id, prospect_id, sku, status")
    .eq("id", upsellId)
    .maybeSingle();

  if (!upsell || upsell.sku !== "review_blast") {
    return NextResponse.json({ error: "Upsell not found" }, { status: 404 });
  }
  if (upsell.status !== "paid" && upsell.status !== "fulfilled") {
    return NextResponse.json(
      { error: "This Review Blast hasn't been paid for yet." },
      { status: 403 },
    );
  }

  // Normalize phones — surface the invalid list so we can return a
  // clear error if NOTHING is valid.
  const { valid, invalid } = normalizePhoneList(phones);
  if (valid.length === 0) {
    return NextResponse.json(
      {
        error:
          "No valid phone numbers found. Make sure each line has 10+ digits in any format.",
        invalid,
      },
      { status: 400 },
    );
  }

  const result = await createSubmission({
    upsellId,
    prospectId: upsell.prospect_id as string,
    phoneNumbers: valid,
    templateKey: templateKey as TemplateKey,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Submission failed" },
      { status: 500 },
    );
  }

  // SMS Ben so he knows to expect the dispatch on the next cron tick
  // (or just for awareness while A2P approval is pending). Best-effort —
  // failure to alert never blocks the submission.
  if (!result.alreadySubmitted) {
    try {
      await sendOwnerAlert(
        `Review Blast submitted: ${valid.length} phones, template=${templateKey}, upsell=${upsellId.slice(0, 8)}`,
      );
    } catch {
      /* ignore — owner alert is best-effort */
    }
  }

  return NextResponse.json({
    ok: true,
    submissionId: result.submissionId,
    alreadySubmitted: !!result.alreadySubmitted,
    accepted: valid.length,
    invalid: invalid.length,
    capped: phones.split(/[\n,;]+/g).filter((l) => l.trim()).length > MAX_PHONES_PER_SUBMISSION,
  });
}
