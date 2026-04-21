import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/postcards/lob/[id]
 *
 * Proxy for `GET https://api.lob.com/v1/postcards/{id}` so we can pull
 * a postcard's rendered PDF URLs (front/back thumbnails + full PDF)
 * without having to paste the Lob API key into a terminal.
 *
 * Returns the full Lob postcard object, including:
 *   - `url`                  → signed URL to the rendered PDF (both sides)
 *   - `thumbnails[].small`   → signed PNG thumbnails (100x150-ish)
 *   - `thumbnails[].medium`
 *   - `thumbnails[].large`
 *
 * Auth: admin Bearer (same as other /api/postcards/* admin endpoints).
 * Middleware gates this under PROTECTED /api/postcards (everything that
 * isn't /api/postcards/html/ requires the admin cookie or Bearer header).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const LOB_API_KEY = process.env.LOB_API_KEY;
  if (!LOB_API_KEY) {
    return NextResponse.json(
      { error: "LOB_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (!id || !id.startsWith("psc_")) {
    return NextResponse.json(
      { error: "Invalid postcard ID (expected `psc_...`)" },
      { status: 400 }
    );
  }

  const authHeader =
    "Basic " + Buffer.from(`${LOB_API_KEY}:`).toString("base64");

  try {
    const res = await fetch(`https://api.lob.com/v1/postcards/${id}`, {
      method: "GET",
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          error: `Lob ${res.status}`,
          body: errText.slice(0, 500),
        },
        { status: res.status }
      );
    }

    const body = await res.json();
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Fetch failed" },
      { status: 500 }
    );
  }
}
