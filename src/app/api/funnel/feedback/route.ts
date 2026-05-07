import { NextRequest, NextResponse } from "next/server";
import { sendOwnerAlert, sendOwnerEmail } from "@/lib/alerts";

/**
 * POST /api/funnel/feedback
 *
 * The owner-facing Funnels tab (FunnelVisualModal — used by the per-client
 * portal at /clients/[slug]/portal AND by future BlueJays admin surfaces)
 * lets the customer click any step to inline-edit it (label / day / channel)
 * AND attach a free-form note to the funnel as a whole. Clicking "Send to
 * BlueJays" POSTs the structured diff here.
 *
 * We don't mutate the live funnel directly — every owner-driven funnel
 * change is human-in-the-loop (Ben implements the change in code + redeploys
 * after eyeballing the diff). This endpoint is the routing layer that
 * delivers the change request to Ben via SMS + email.
 *
 * Request body shape:
 *   {
 *     slug: string | null,                    // client slug (or null for BlueJays-internal demos)
 *     items: Array<
 *       | { kind: "step_edit", funnelSegment, funnelTitle, stepIndex,
 *           original: { day, channel, label }, proposed: { day, channel, label } }
 *       | { kind: "note", funnelSegment, funnelTitle, note }
 *     >
 *   }
 *
 * Response: { ok: true } on success — the form expects this shape to flip
 * its "Sent to BlueJays — Ben will reply within one business day" success
 * state. On validation failure: 400 with { ok: false, error }.
 *
 * Per Rule 35 + the AI Package Playbook, this endpoint is mock-mode safe:
 * if SENDGRID_API_KEY / TWILIO creds aren't set, sendOwnerAlert console.logs
 * the alert payload and returns ok anyway so dev + demo flows work.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StepEdit = {
  kind: "step_edit";
  funnelSegment: string;
  funnelTitle: string;
  stepIndex: number;
  original: { day: number; channel: string; label: string };
  proposed: { day: number; channel: string; label: string };
};

type Note = {
  kind: "note";
  funnelSegment: string;
  funnelTitle: string;
  note: string;
};

type Item = StepEdit | Note;

function isStepEdit(item: unknown): item is StepEdit {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  return (
    o.kind === "step_edit" &&
    typeof o.funnelSegment === "string" &&
    typeof o.funnelTitle === "string" &&
    typeof o.stepIndex === "number" &&
    typeof o.original === "object" &&
    typeof o.proposed === "object"
  );
}

function isNote(item: unknown): item is Note {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  return (
    o.kind === "note" &&
    typeof o.funnelSegment === "string" &&
    typeof o.funnelTitle === "string" &&
    typeof o.note === "string" &&
    o.note.trim().length > 0
  );
}

function describeChange(o: { day: number; channel: string; label: string }, p: { day: number; channel: string; label: string }): string[] {
  const lines: string[] = [];
  if (o.day !== p.day) lines.push(`  · day: D${o.day} → D${p.day}`);
  if (o.channel !== p.channel) lines.push(`  · channel: ${o.channel} → ${p.channel}`);
  if (o.label !== p.label) {
    lines.push(`  · label was: ${o.label}`);
    lines.push(`  · label now: ${p.label}`);
  }
  return lines;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const o = (body as Record<string, unknown>) ?? {};
  const slug = typeof o.slug === "string" && o.slug.length > 0 ? o.slug : null;
  const itemsRaw = Array.isArray(o.items) ? o.items : null;
  if (!itemsRaw || itemsRaw.length === 0) {
    return NextResponse.json(
      { ok: false, error: "items[] required and must be non-empty" },
      { status: 400 },
    );
  }

  const items: Item[] = [];
  for (const it of itemsRaw) {
    if (isStepEdit(it)) items.push(it);
    else if (isNote(it)) items.push(it);
  }
  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No valid items in request" },
      { status: 400 },
    );
  }

  // Group items by funnel segment for readable email + SMS.
  const bySegment = new Map<string, { title: string; items: Item[] }>();
  for (const it of items) {
    const k = it.funnelSegment;
    if (!bySegment.has(k)) bySegment.set(k, { title: it.funnelTitle, items: [] });
    bySegment.get(k)!.items.push(it);
  }

  const slugLabel = slug ?? "(internal-demo)";
  const totalEdits = items.filter((i) => i.kind === "step_edit").length;
  const totalNotes = items.filter((i) => i.kind === "note").length;

  // SMS preview — short, scannable. Ben should see it on lock screen
  // and know exactly which client + funnel needs attention.
  const smsParts: string[] = [`Funnel feedback · ${slugLabel}`];
  for (const [, g] of bySegment) {
    smsParts.push(`· ${g.title}`);
  }
  if (totalEdits) smsParts.push(`${totalEdits} step edit${totalEdits === 1 ? "" : "s"}`);
  if (totalNotes) smsParts.push(`${totalNotes} note${totalNotes === 1 ? "" : "s"}`);
  const smsBody = smsParts.join(" ");

  // Email body — structured diff so Ben can apply changes from the inbox.
  const emailLines: string[] = [];
  emailLines.push(`Client: ${slugLabel}`);
  emailLines.push(`Edits: ${totalEdits}`);
  emailLines.push(`Notes: ${totalNotes}`);
  emailLines.push("");
  for (const [segment, g] of bySegment) {
    emailLines.push(`────────────────────────────────────────`);
    emailLines.push(`Funnel: ${g.title}  (segment: ${segment})`);
    emailLines.push("");
    for (const it of g.items) {
      if (it.kind === "step_edit") {
        emailLines.push(`Step ${it.stepIndex + 1} edit:`);
        const diff = describeChange(it.original, it.proposed);
        if (diff.length === 0) {
          emailLines.push(`  · (no field changed)`);
        } else {
          emailLines.push(...diff);
        }
        emailLines.push("");
      } else {
        emailLines.push(`Note from owner:`);
        emailLines.push(`  ${it.note.split("\n").join("\n  ")}`);
        emailLines.push("");
      }
    }
  }
  emailLines.push("");
  emailLines.push("— Submitted from the owner-portal Funnels tab.");
  const emailBody = emailLines.join("\n");

  const subject = `🎯 Funnel feedback · ${slugLabel} · ${totalEdits + totalNotes} item${
    totalEdits + totalNotes === 1 ? "" : "s"
  }`;

  // Mock-safe — sendOwnerAlert console.logs when env is missing.
  try {
    await Promise.all([
      sendOwnerAlert(smsBody, slug ? { clientSlug: slug } : undefined),
      sendOwnerEmail({
        subject,
        body: emailBody,
        ...(slug ? { clientSlug: slug } : {}),
      }),
    ]);
  } catch (err) {
    // Don't fail the response — the owner saw their edits captured client-side.
    // Log for postmortem; Ben can see the structured payload in server logs.
    console.error("[funnel/feedback] alert dispatch failed:", err);
  }

  return NextResponse.json({ ok: true, items: items.length });
}
