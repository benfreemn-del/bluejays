import { NextRequest, NextResponse } from "next/server";
import { createClientTask } from "@/lib/client-tasks";

/**
 * POST /api/clients/[slug]/ads/request-change
 *
 * Owner-portal endpoint. Owners click ⏸ Pause / 💰 Budget / ✏ Copy /
 * 🖼 Image / 🗑 Delete on a creative row → modal opens → submits here.
 * We persist the request as a `client_tasks` row (no new schema —
 * the task list is already the operator-actionable queue per
 * bluejays/CLAUDE.md "To-Do Scoping Rules").
 *
 * Per Q2=A locked 2026-05-08: this is the "request changes" model.
 * Owner requests, Ben reviews, Ben pushes manually to Meta / Google.
 * No live API push from here. Daily digest cron summarizes the queue
 * to Ben (deferred to next sprint).
 *
 * Per the operator-discipline Ship Gate (Rule 21): every change
 * request is logged + auditable. Ben sees the full provenance.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_KINDS = new Set([
  "pause",
  "budget",
  "copy",
  "image",
  "delete",
]);

type Body = {
  variant_label?: string;
  ad_set?: string;
  platform?: string;
  audience?: string;
  kind?: string;
  details?: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  // Basic input validation — fail fast before DB call (per
  // Owner-Portal Rule 4a: no user-reachable path returns 500 with raw
  // Postgres errors).
  if (
    !body.variant_label ||
    typeof body.variant_label !== "string" ||
    body.variant_label.length > 200
  ) {
    return NextResponse.json(
      { ok: false, error: "variant_label required" },
      { status: 400 },
    );
  }
  if (!body.kind || typeof body.kind !== "string" || !VALID_KINDS.has(body.kind)) {
    return NextResponse.json(
      { ok: false, error: "Invalid kind. Must be pause | budget | copy | image | delete" },
      { status: 400 },
    );
  }
  // Defense-in-depth — UUID regex on the slug parameter so a malformed
  // path doesn't burn a DB query (per Owner Portal Rule 4a). Slug is
  // not a UUID but we apply the same fail-fast principle: alphanumeric
  // + hyphen only, length 1-60.
  if (!/^[a-z0-9-]{1,60}$/i.test(slug)) {
    return NextResponse.json(
      { ok: false, error: "Invalid client slug" },
      { status: 400 },
    );
  }
  void UUID_RE; // marker — pattern reserved for future inputs

  const details = (body.details || "").toString().slice(0, 2000);
  const platform = (body.platform || "—").toString().slice(0, 60);
  const audience = (body.audience || "—").toString().slice(0, 60);
  const adSet = (body.ad_set || "—").toString().slice(0, 200);

  // Title: short + scannable in the all-tasks board + per-client
  // queue. Description: structured payload Ben can parse when pushing
  // the change manually.
  const KIND_LABELS = {
    pause: "Pause",
    budget: "Change budget",
    copy: "Update copy",
    image: "Replace image",
    delete: "Delete",
  } as const;
  const kindLabel =
    KIND_LABELS[body.kind as keyof typeof KIND_LABELS] ?? body.kind;

  const title = `Ad change request — ${kindLabel} — ${body.variant_label}`;
  const description =
    `Owner-requested change · pending Ben push to platform.\n\n` +
    `• Variant: ${body.variant_label}\n` +
    `• Ad set: ${adSet}\n` +
    `• Audience: ${audience}\n` +
    `• Platform: ${platform}\n` +
    `• Change kind: ${kindLabel}\n` +
    (details ? `• Owner notes: ${details}\n` : "") +
    `\nReview, validate against the paid_ads_iteration skill rules, ` +
    `push to platform, then mark this task done.`;

  try {
    const task = await createClientTask({
      client_slug: slug,
      title,
      description,
      status: "pending",
      priority: body.kind === "delete" ? "high" : "medium",
      category: "client-action",
      owner: "ben",
    });
    return NextResponse.json({ ok: true, taskId: task.id });
  } catch (err) {
    console.error("[ads/request-change] insert failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to record change request. Please try again.",
      },
      { status: 500 },
    );
  }
}
