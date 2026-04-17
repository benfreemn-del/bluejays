import { NextResponse } from "next/server";
import { THEME_LIBRARY } from "@/lib/image-mapper-library";

/**
 * GET /api/image-audit/library
 *
 * Returns the full THEME_LIBRARY for the /image-audit page to render.
 * Protected by the standard middleware auth (only Ben / admin should
 * use the audit tool).
 */
export async function GET() {
  return NextResponse.json(THEME_LIBRARY);
}
