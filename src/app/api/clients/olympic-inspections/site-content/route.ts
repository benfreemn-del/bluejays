import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getFileFromGithub, isGithubConfigured } from "@/lib/github-commit";

/**
 * GET /api/clients/olympic-inspections/site-content
 *
 * Owner-only. Returns the current index.html for Luke's static site,
 * sourced from git (NOT the runtime filesystem — Vercel is read-only).
 * Returned alongside the git blob sha so a subsequent publish can pin
 * to this exact base and detect concurrent edits.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";
const SITE_FILE = "public/sites/olympic-inspections/index.html";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  if (!isGithubConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GitHub editing is not configured yet. Ben needs to set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN on Vercel before this feature works.",
      },
      { status: 503 },
    );
  }
  try {
    const file = await getFileFromGithub(SITE_FILE);
    return NextResponse.json({
      ok: true,
      content: file.content,
      sha: file.sha,
      path: SITE_FILE,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
