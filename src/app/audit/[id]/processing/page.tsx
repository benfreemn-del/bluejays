import ProcessingClient from "./ProcessingClient";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Generating your audit — BlueJays",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Wait page played while the audit is being generated (~60-120s).
 *
 * Two mutually exclusive video slots:
 *   1. NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_URL set → real recorded
 *      Loom / YouTube / mp4 plays (Ben's pre-frame walkthrough).
 *   2. Env unset → AuditVSLAuto auto-plays an animated 30-sec VSL,
 *      personalized with the prospect's business name + category +
 *      first name when available. Loops if the audit takes longer.
 *
 * The animated fallback was added 2026-05-07 per Ben — TOP-priority
 * conversion lever, since the wait page being blank/visual-only had
 * been costing pre-audit attention.
 */
export default async function AuditProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const fallbackEnabled = process.env.NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_FALLBACK === "1";
  const videoUrl =
    process.env.NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_URL ||
    (fallbackEnabled ? "/processing-intro.mp4" : null);

  // Best-effort prospect fetch for VSL personalization. The audit row
  // carries prospect_id; the prospect row carries business_name +
  // owner_name + category. None of these are required — VSL falls
  // back to generic copy if any field is missing.
  let businessName: string | undefined;
  let category: string | undefined;
  let firstName: string | undefined;

  try {
    const { data: audit } = await supabase
      .from("site_audits")
      .select("prospect_id, business_category")
      .eq("id", id)
      .maybeSingle();
    const prospectId = (audit as { prospect_id?: string } | null)?.prospect_id;
    category = (audit as { business_category?: string } | null)?.business_category;

    if (prospectId) {
      const { data: prospect } = await supabase
        .from("prospects")
        .select("business_name, owner_name, category")
        .eq("id", prospectId)
        .maybeSingle();
      const p = prospect as
        | { business_name?: string; owner_name?: string; category?: string }
        | null;
      businessName = p?.business_name;
      // Fall back to the prospect's category if the audit didn't carry one.
      category = category || p?.category;
      // Pull just the first token of owner_name as the first-name greet.
      firstName = (p?.owner_name || "").trim().split(/\s+/)[0] || undefined;
    }
  } catch {
    // Personalization is a nice-to-have, never block the page on it.
  }

  return (
    <ProcessingClient
      auditId={id}
      videoUrl={videoUrl}
      businessName={businessName}
      category={category}
      firstName={firstName}
    />
  );
}
