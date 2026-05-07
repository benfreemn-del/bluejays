import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/partners/[code]/upload-w9
 *
 * Multipart form upload for a partner's IRS Form W-9. Used by Madie
 * (and every future partner) to deliver their W-9 PDF without email
 * attachments.
 *
 * URL-as-secret pattern matches /partners/[code] dashboard — the code
 * IS the credential. No login form. The file is stored as base64 in
 * Postgres (partner_documents) so we don't have to provision a Supabase
 * Storage bucket today; volume is tiny (one PDF per partner).
 *
 * Validation:
 *   - MIME must be application/pdf
 *   - Size ≤ 5 MB
 *   - Rate-limit: 5 uploads / partner-code / hour (lets a partner re-try
 *     a botched scan without spamming Ben)
 *
 * Side effects:
 *   - Inserts partner_documents row (kind='w9')
 *   - Stamps partners.w9_received_at = now()
 *   - Sends Ben an SMS alert with the partner name
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["application/pdf"]);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await context.params;
  const code = (rawCode || "").trim().toLowerCase();

  if (!code) {
    return NextResponse.json({ error: "Missing partner code." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`w9-upload:${code}:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Try again in an hour or email ben@bluejayportfolio.com." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not available. Email your W-9 to ben@bluejayportfolio.com." },
      { status: 503 },
    );
  }

  // Look up the partner by code.
  const { data: partnerRow, error: lookupErr } = await supabase
    .from("partners")
    .select("id, name, email, status")
    .eq("code", code)
    .maybeSingle();
  if (lookupErr) {
    console.error("[upload-w9] partner lookup failed:", lookupErr);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
  if (!partnerRow) {
    return NextResponse.json({ error: "Partner code not found." }, { status: 404 });
  }
  const partner = partnerRow as { id: string; name: string; email: string; status: string };

  // Parse the multipart form.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "W-9 must be a PDF (application/pdf)." },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.round(MAX_BYTES / 1024 / 1024)} MB.` },
      { status: 413 },
    );
  }

  // Sanitize filename — keep the original for Ben's download UI but strip
  // any path separators / quirky chars.
  const rawName = file.name || "w9.pdf";
  const safeName = rawName
    .replace(/[/\\]/g, "_")
    .replace(/[^a-zA-Z0-9._\- ]/g, "")
    .slice(0, 120) || "w9.pdf";

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentBase64 = buffer.toString("base64");

  const { error: insertErr } = await supabase.from("partner_documents").insert({
    partner_id: partner.id,
    kind: "w9",
    filename: safeName,
    mime_type: file.type,
    size_bytes: buffer.length,
    content_base64: contentBase64,
  });

  if (insertErr) {
    console.error("[upload-w9] insert failed:", insertErr);
    return NextResponse.json(
      { error: "Couldn't save the upload. Email ben@bluejayportfolio.com." },
      { status: 500 },
    );
  }

  // Stamp the partner row so the admin dashboard renders the green check
  // without joining partner_documents on every page load.
  await supabase
    .from("partners")
    .update({ w9_received_at: new Date().toISOString() })
    .eq("id", partner.id);

  // Best-effort owner alert. Don't fail the response if SMS errors.
  try {
    await sendOwnerAlert(
      [
        `📝 W-9 received — ${partner.name}`,
        `Email: ${partner.email}`,
        `File: ${safeName} (${Math.round(buffer.length / 1024)} KB)`,
        `Review: /dashboard/partners`,
      ].join("\n"),
    );
  } catch (err) {
    console.warn("[upload-w9] owner alert failed:", err);
  }

  return NextResponse.json({ ok: true });
}
