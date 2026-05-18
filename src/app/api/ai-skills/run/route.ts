/**
 * POST /api/ai-skills/run
 *
 * Single entry point for invoking any bj ai skill. Used by:
 *   - The bj.mjs CLI (manual triggers, dev iteration, Ben from terminal)
 *   - Vercel crons (cron entries point at this path with ?skill=<name>)
 *   - Signal handlers (e.g. audit_completed fires qualify)
 *
 * Auth:
 *   - Vercel cron requests bear an `authorization: Bearer <CRON_SECRET>` header
 *   - Manual + signal calls bear an `authorization: Bearer <ADMIN_TOKEN>` header
 *   - One of them must match. No public exposure.
 *
 * Body:
 *   {
 *     skill: string,
 *     triggeredBy: "cron" | "manual" | "signal",
 *     args?: Record<string, unknown>
 *   }
 *
 * Returns the SkillResult shape from runner.ts. Always 200 unless
 * auth failed — skill-level failures land in the JSON body with
 * ok=false + error so the caller can decide what to do.
 *
 * IMPORTANT: this route is NOT in PUBLIC_API_PATHS — the middleware
 * auth gate covers it. The Bearer-token check below is defense in
 * depth in case the middleware ever drops the prefix.
 */

import { NextRequest, NextResponse } from "next/server";
import { runSkill } from "@/lib/ai-skills/runner";
import { isValidBearer } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // some skills (weekly-review on Opus) can take ~60s

function authorize(req: NextRequest): { ok: boolean; reason?: string } {
  if (isValidBearer(req)) return { ok: true };
  return { ok: false, reason: "missing or invalid bearer token" };
}

export async function POST(request: NextRequest) {
  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });
  }

  let body: {
    skill?: string;
    triggeredBy?: "cron" | "manual" | "signal";
    args?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.skill || typeof body.skill !== "string") {
    return NextResponse.json(
      { ok: false, error: "missing required field: skill" },
      { status: 400 },
    );
  }
  const triggeredBy = body.triggeredBy ?? "manual";
  if (!["cron", "manual", "signal"].includes(triggeredBy)) {
    return NextResponse.json(
      { ok: false, error: "triggeredBy must be cron|manual|signal" },
      { status: 400 },
    );
  }

  const result = await runSkill({
    skill: body.skill,
    triggeredBy,
    args: body.args || {},
  });

  // Always 200 — caller distinguishes success/failure via ok field.
  return NextResponse.json(result);
}

// Vercel cron passes GET when it fires. We translate ?skill=NAME
// into the same POST shape and run it.
export async function GET(request: NextRequest) {
  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });
  }

  const skill = request.nextUrl.searchParams.get("skill");
  if (!skill) {
    return NextResponse.json(
      { ok: false, error: "missing ?skill query param" },
      { status: 400 },
    );
  }

  const result = await runSkill({
    skill,
    triggeredBy: "cron",
    args: {},
  });
  return NextResponse.json(result);
}
