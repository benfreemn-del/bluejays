import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { discoverBusinessOwner, suggestLinkedInNote } from "@/lib/apollo";
import { getShortPreviewUrl } from "@/lib/short-urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/prospects/[id]/linkedin-discover
 *
 * Runs Apollo's People Search on the given prospect's business and
 * stores the top-ranked owner/executive contact in scrapedData.apolloContact.
 * Also returns a pre-drafted LinkedIn connection note for Ben to
 * copy-paste into LinkedIn.
 *
 * Auth: admin-gated via middleware.
 *
 * Behaviour:
 *   - Re-uses existing `scrapedData.apolloContact` if the cached result
 *     is fresh (< 30 days) to avoid burning credits on re-runs
 *   - Returns 200 with { apolloContact: null, reason: "no_api_key" }
 *     when APOLLO_API_KEY is missing (dev / pre-provisioning)
 *   - Never fails the request on Apollo errors — the scout pipeline
 *     needs this to be non-blocking
 */

const CACHE_TTL_MS = 30 * 86_400_000; // 30 days

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  if (!process.env.APOLLO_API_KEY) {
    return NextResponse.json({
      ok: true,
      apolloContact: null,
      reason: "no_api_key",
      message: "Set APOLLO_API_KEY on Vercel to enable LinkedIn discovery.",
    });
  }

  // Short-circuit on cached result
  const existing = prospect.scrapedData?.apolloContact;
  if (existing?.discoveredAt) {
    const age = Date.now() - new Date(existing.discoveredAt).getTime();
    if (age < CACHE_TTL_MS) {
      const previewUrl = getShortPreviewUrl(prospect);
      return NextResponse.json({
        ok: true,
        apolloContact: existing,
        cached: true,
        suggestedNote: suggestLinkedInNote(
          existing,
          prospect.businessName,
          prospect.city,
          previewUrl
        ),
      });
    }
  }

  // Extract a clean domain from the prospect's website. We intentionally
  // ignore subdomains (www, blog, etc.) to match Apollo's org index.
  let domain: string | undefined;
  if (prospect.currentWebsite) {
    try {
      domain = new URL(prospect.currentWebsite).hostname.replace(/^www\./, "");
    } catch {
      /* ignore bad URLs */
    }
  }

  const contact = await discoverBusinessOwner(prospect.businessName, domain);
  if (!contact) {
    return NextResponse.json({
      ok: true,
      apolloContact: null,
      reason: "no_match",
    });
  }

  // Persist in scrapedData.apolloContact. Merge to preserve other scraped fields.
  await updateProspect(prospect.id, {
    scrapedData: {
      ...(prospect.scrapedData || {
        businessName: prospect.businessName,
      }),
      apolloContact: contact,
    },
  });

  const previewUrl = getShortPreviewUrl(prospect);
  return NextResponse.json({
    ok: true,
    apolloContact: contact,
    cached: false,
    suggestedNote: suggestLinkedInNote(
      contact,
      prospect.businessName,
      prospect.city,
      previewUrl
    ),
  });
}
