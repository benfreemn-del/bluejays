import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getFileFromGithub, isGithubConfigured } from "@/lib/github-commit";
import { logCost } from "@/lib/cost-logger";

/**
 * POST /api/clients/olympic-inspections/site-edit
 *
 * Owner-only. Luke types a plain-English instruction like
 * "change the hero subtitle to X" or "add a service called Y". We
 * fetch the current HTML from git, hand it to Claude with strict rules
 * about what NOT to touch (head links, script tags, asset paths), and
 * return the proposed new HTML alongside the sha so a follow-up
 * publish call can verify nothing has shifted underneath.
 *
 * No git commit happens here — that's site-publish's job. This route
 * is read-only against git and side-effect-free against the live site.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SLUG = "olympic-inspections";
const SITE_FILE = "public/sites/olympic-inspections/index.html";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.SITE_EDITOR_MODEL || "claude-sonnet-4-6";
const MAX_INSTRUCTION_LEN = 2000;
const MAX_HTML_LEN = 200_000;

type ClaudeContentBlock = { type?: string; text?: string };
type ClaudeResponse = {
  content?: ClaudeContentBlock[];
  usage?: { input_tokens?: number; output_tokens?: number };
};

function getAnthropicApiKey(): string | null {
  return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || null;
}

function buildSystemPrompt(): string {
  return [
    "You are editing a static marketing website for Olympic Inspections & Testing, an environmental inspection company on the Olympic Peninsula owned by Luke. The owner has given you a plain-English change request. Apply ONLY that change.",
    "",
    "STRICT RULES:",
    "1. Return the COMPLETE updated HTML file — not a diff, not a snippet. Start at <!DOCTYPE html> and end at </html>.",
    "2. Preserve every <link>, <script>, <meta>, and <title> tag exactly. Asset paths like /sites/olympic-inspections/css/styles.css MUST stay byte-identical.",
    "3. Do NOT change classes, ids, or data-* attributes that the existing JS or CSS depends on. If a class name appears on a section being modified, keep it.",
    "4. Do NOT add or remove sections unless the owner explicitly asked for it. Edit the EXISTING markup in place.",
    "5. Do NOT change the booking form's action, method, or input names — that's wired to a live API.",
    "6. Do NOT touch the footer credit linking to bluejayportfolio.com/audit. That's a network-effect link the owner agreed to keep.",
    "7. Keep the visual tone (deep forest greens, cream backgrounds, Merriweather + sans-serif). Inline styles already on elements stay unless the owner asks to change a color or size.",
    "8. If the owner's request is ambiguous or could break the page, return the original HTML unchanged and add a short HTML comment at the very top: <!-- AI-EDIT: could not apply because {reason} -->",
    "9. No commentary outside the HTML. No markdown fences. Raw HTML only.",
  ].join("\n");
}

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
          "GitHub editing is not configured yet. Ben needs to set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN on Vercel.",
      },
      { status: 503 },
    );
  }
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ANTHROPIC_API_KEY is not configured. Set it on Vercel before the site editor can run.",
      },
      { status: 503 },
    );
  }

  let body: { instruction?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const instruction = (body.instruction || "").trim();
  if (!instruction) {
    return NextResponse.json(
      { ok: false, error: "Tell me what you'd like to change." },
      { status: 400 },
    );
  }
  if (instruction.length > MAX_INSTRUCTION_LEN) {
    return NextResponse.json(
      {
        ok: false,
        error: `Edit instruction is too long (${instruction.length} chars). Keep it under ${MAX_INSTRUCTION_LEN}.`,
      },
      { status: 400 },
    );
  }

  let baseFile;
  try {
    baseFile = await getFileFromGithub(SITE_FILE);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Could not read current site from GitHub: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 },
    );
  }
  if (baseFile.content.length > MAX_HTML_LEN) {
    return NextResponse.json(
      {
        ok: false,
        error: `Site HTML is too large for one-shot editing (${baseFile.content.length} chars). Ben needs to chunk this differently.`,
      },
      { status: 413 },
    );
  }

  const userPrompt = [
    "Owner's change request:",
    instruction,
    "",
    "Current HTML (return the FULL updated file with the change applied):",
    "",
    baseFile.content,
  ].join("\n");

  let claudeRes: Response;
  try {
    claudeRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        temperature: 0.1,
        system: buildSystemPrompt(),
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Anthropic request failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 },
    );
  }

  if (!claudeRes.ok) {
    const text = await claudeRes.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        error: `Anthropic returned ${claudeRes.status}: ${text || claudeRes.statusText}`,
      },
      { status: 502 },
    );
  }
  const claudeJson = (await claudeRes.json()) as ClaudeResponse;
  const proposed = (claudeJson.content || [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text || "")
    .join("\n")
    .trim();

  if (!proposed || !proposed.includes("<!DOCTYPE html") && !proposed.includes("<!doctype html")) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Claude returned something that doesn't look like a complete HTML file. Try rephrasing your change.",
        debug: proposed.slice(0, 400),
      },
      { status: 500 },
    );
  }

  const inputTokens = claudeJson.usage?.input_tokens ?? 0;
  const outputTokens = claudeJson.usage?.output_tokens ?? 0;
  // Sonnet 4.6 pricing: $3/MTok in, $15/MTok out.
  const costUsd =
    (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
  try {
    await logCost({
      service: "anthropic",
      action: "site_editor",
      clientSlug: SLUG,
      costUsd,
      metadata: {
        model: MODEL,
        inputTokens,
        outputTokens,
        ownerId: owner.id,
      },
    });
  } catch {
    // Cost logging is best-effort.
  }

  return NextResponse.json({
    ok: true,
    proposedHtml: proposed,
    baseSha: baseFile.sha,
    baseLength: baseFile.content.length,
    proposedLength: proposed.length,
    inputTokens,
    outputTokens,
    costUsd,
  });
}
