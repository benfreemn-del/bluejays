import { NextRequest, NextResponse } from "next/server";
import { diagnose, type DiagnosticInput } from "@/lib/hormozi-agent";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/dashboard/hormozi-diagnostic
 *
 * Runs a Hormozi-style diagnosis on a prospect's business and stores
 * the result. BlueJays-internal — no auth wrapper here yet, lives
 * under /dashboard/* which is owner/sales-gated upstream.
 *
 * Body:
 *   {
 *     businessText: string,         // required — free-text dump
 *     businessName?: string,
 *     category?: string,
 *     monthlyRevenue?: string,
 *     leadSources?: string,
 *     currentOffer?: string,
 *     pricing?: string,
 *     topComplaint?: string,
 *     prospectId?: string
 *   }
 *
 * GET /api/dashboard/hormozi-diagnostic?prospectId=…
 *   Returns the 10 most recent diagnoses (optionally filtered to one
 *   prospect) so the UI can show recent runs.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 3;
const MAX_BYTES_PER_FILE = 2 * 1024 * 1024; // 2MB raw → ~2.7MB base64
const MAX_TOTAL_BYTES = 4 * 1024 * 1024; // ~5.3MB base64 — under Vercel 4.5MB body cap when paired w/ Content-Encoding
const ALLOWED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export async function POST(req: NextRequest) {
  let body: Partial<DiagnosticInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.businessText || typeof body.businessText !== "string" || body.businessText.trim().length < 20) {
    return NextResponse.json(
      { ok: false, error: "businessText is required (minimum 20 chars)" },
      { status: 400 },
    );
  }

  if (Array.isArray(body.files) && body.files.length > 0) {
    if (body.files.length > MAX_FILES) {
      return NextResponse.json(
        { ok: false, error: `Max ${MAX_FILES} files per diagnosis.` },
        { status: 400 },
      );
    }
    let total = 0;
    for (const f of body.files) {
      if (!f || typeof f !== "object") {
        return NextResponse.json({ ok: false, error: "Malformed file entry." }, { status: 400 });
      }
      if (!ALLOWED_MIMES.has(f.mediaType)) {
        return NextResponse.json(
          { ok: false, error: `Unsupported file type: ${f.mediaType}. Allowed: PNG, JPG, WEBP, GIF, PDF.` },
          { status: 400 },
        );
      }
      const approxBytes = Math.floor(((f.base64 ?? "").length * 3) / 4);
      if (approxBytes > MAX_BYTES_PER_FILE) {
        return NextResponse.json(
          { ok: false, error: `File "${f.name}" exceeds 2MB.` },
          { status: 400 },
        );
      }
      total += approxBytes;
    }
    if (total > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Total attachment size exceeds 4MB." },
        { status: 400 },
      );
    }
  }

  try {
    const result = await diagnose(body as DiagnosticInput);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = (err as Error).message;
    console.error("[hormozi-diagnostic] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const prospectId = new URL(req.url).searchParams.get("prospectId");
  const sb = getSupabase();
  let q = sb
    .from("hormozi_diagnostics")
    .select("id, prospect_id, business_input, diagnosis, model, cost_usd, duration_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (prospectId) q = q.eq("prospect_id", prospectId);
  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, runs: data ?? [] });
}
