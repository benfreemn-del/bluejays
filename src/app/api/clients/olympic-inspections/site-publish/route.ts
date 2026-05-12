import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { commitFile, isGithubConfigured } from "@/lib/github-commit";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/clients/olympic-inspections/site-publish
 *
 * Owner-only. Commits the approved HTML back to the bluejays repo,
 * which triggers a Vercel redeploy. The owner sees their edit go live
 * in roughly 60-90 seconds.
 *
 * Body: { html: string, baseSha: string, summary?: string }
 *  - html: the proposed HTML returned by /site-edit and reviewed by
 *    the owner.
 *  - baseSha: the git blob sha the proposal was based on. The commit
 *    uses this to detect concurrent edits (another tab edited in
 *    the meantime). If the sha no longer matches HEAD, the commit
 *    fails and the UI prompts the owner to re-fetch + re-apply.
 *  - summary: optional owner-supplied description of the change,
 *    folded into the commit message for the audit trail.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";
const SITE_FILE = "public/sites/olympic-inspections/index.html";
const MAX_HTML_LEN = 250_000;

export async function POST(req: NextRequest) {
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
          "GitHub publishing is not configured yet. Ben needs to set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN on Vercel.",
      },
      { status: 503 },
    );
  }

  let body: { html?: string; baseSha?: string; summary?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const html = (body.html || "").trim();
  const baseSha = (body.baseSha || "").trim();
  const summary = (body.summary || "").trim().slice(0, 200);

  if (!html) {
    return NextResponse.json(
      { ok: false, error: "No HTML provided to publish" },
      { status: 400 },
    );
  }
  if (!baseSha) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing baseSha — propose an edit first, then publish from that proposal.",
      },
      { status: 400 },
    );
  }
  if (html.length > MAX_HTML_LEN) {
    return NextResponse.json(
      {
        ok: false,
        error: `HTML too large to commit (${html.length} chars). Something looks wrong — try a smaller edit.`,
      },
      { status: 413 },
    );
  }
  if (!html.toLowerCase().startsWith("<!doctype html")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Refusing to publish: the file must start with <!DOCTYPE html>. Re-run the edit step.",
      },
      { status: 400 },
    );
  }

  const message = [
    `[OIT owner edit] ${summary || "Site edit from owner portal"}`,
    "",
    `Author: ${owner.email}`,
    `Owner ID: ${owner.id}`,
    "",
    "Edited via the in-portal Claude editor at /clients/olympic-inspections/admin.",
  ].join("\n");

  const result = await commitFile({
    path: SITE_FILE,
    newContent: html,
    message,
    authorName: owner.name || "OIT Owner",
    authorEmail: owner.email,
    expectedSha: baseSha,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
      },
      { status: 502 },
    );
  }

  // Tell Ben in case the edit needs a sanity-check.
  try {
    await sendOwnerAlert(
      `OIT site edited by ${owner.email}: "${summary || "(no summary)"}" — commit ${result.commitSha.slice(0, 7)}`,
    );
  } catch {
    // Alert failures don't block the response — the commit is the source of truth.
  }

  return NextResponse.json({
    ok: true,
    commitSha: result.commitSha,
    commitUrl: result.commitUrl,
    deployEtaSeconds: 90,
    message:
      "Saved. Your site will update in about 60-90 seconds — refresh olympicinspect.com to see the change.",
  });
}
