import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  generateUniqueSlug,
  slugifyBusinessName,
} from "@/lib/case-studies";

/**
 * POST /api/audits/[id]/publish
 *
 * Body: { unpublish?: boolean, customSlug?: string }
 *
 * Toggles an audit's case-study publication state.
 *   - publish:    looks up the audit + prospect, generates a unique
 *                 slug from prospect.business_name (or uses customSlug),
 *                 stamps published_at = now, returns the public URL.
 *   - unpublish:  clears published_at (slug stays so re-publishing
 *                 keeps the same URL — no broken links if Ben flips
 *                 it back on).
 *
 * Auth: lives behind /dashboard URL-as-secret. Tighten later.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing audit id" }, { status: 400 });

  let body: { unpublish?: boolean; customSlug?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body OK — defaults to publish
  }

  // Look up audit + prospect business name
  const { data: auditRow } = await supabase
    .from("site_audits")
    .select("id, prospect_id, status, audit_content, case_study_slug")
    .eq("id", id)
    .maybeSingle();
  if (!auditRow) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

  const audit = auditRow as {
    id: string;
    prospect_id: string;
    status: string;
    audit_content: unknown;
    case_study_slug: string | null;
  };

  // Unpublish path
  if (body.unpublish) {
    const { error } = await supabase
      .from("site_audits")
      .update({ published_at: null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, published: false });
  }

  // Publish path — require ready audit + content
  if (audit.status !== "ready" || !audit.audit_content) {
    return NextResponse.json(
      {
        error:
          "Audit isn't ready yet — can only publish completed audits with content.",
      },
      { status: 400 },
    );
  }

  // Reuse existing slug if previously published; else generate
  let slug = audit.case_study_slug;
  if (!slug) {
    const { data: prospectRow } = await supabase
      .from("prospects")
      .select("business_name")
      .eq("id", audit.prospect_id)
      .maybeSingle();
    const businessName =
      ((prospectRow as { business_name?: string } | null)?.business_name ||
        "Local Business").trim();
    slug = body.customSlug
      ? slugifyBusinessName(body.customSlug)
      : await generateUniqueSlug(businessName);
  }

  const { error } = await supabase
    .from("site_audits")
    .update({
      case_study_slug: slug,
      published_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    published: true,
    slug,
    url: `https://bluejayportfolio.com/case-studies/${slug}`,
  });
}
