import { NextRequest, NextResponse } from "next/server";
import { buildPostcardHtml } from "@/lib/postcard-sender";
import { getProspect } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Capture + embed the base64 image on-the-fly; budget ~30s in case of
// Browserless cold starts.
export const maxDuration = 60;

/**
 * GET /api/postcards/html/[id]/[side]
 *
 * Returns the pre-rendered HTML for one side of a prospect's postcard.
 * Lob's Postcards API lets you pass a URL instead of inline HTML for the
 * `front` / `back` fields — and remote HTML has NO size limit (the inline
 * limit is only 10,000 chars). We use that to serve our base64-embedded
 * screenshot, which would otherwise blow past the inline cap.
 *
 * Publicly accessible (no auth) so Lob's renderer can fetch it. Safe —
 * the only data exposed is the prospect's public preview image + business
 * name, both already visible on `/preview/[id]` and `/p/[code]`.
 *
 * URL shape:
 *   /api/postcards/html/{prospectId}/front   → front HTML w/ base64 JPEG
 *   /api/postcards/html/{prospectId}/back    → back HTML (note + QR + URL)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; side: string }> },
) {
  const { id, side } = await params;

  if (side !== "front" && side !== "back") {
    return NextResponse.json(
      { error: "side must be 'front' or 'back'" },
      { status: 400 }
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const html = await buildPostcardHtml(prospect, side);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Cache for 24h on Lob's side; regenerate if we bump postcard design.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
